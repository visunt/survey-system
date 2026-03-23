import { Response as ExpressResponse, Request } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Response as SurveyResponse, Answer, Question, Survey, QuestionOption } from '../models';
import { AuthRequest } from '../types';

// 导出 Excel
export const exportToExcel = async (req: AuthRequest, res: ExpressResponse) => {
  try {
    const { surveyId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user!.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    // 获取问卷信息
    const survey = await Survey.findByPk(surveyIdStr);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // 权限检查
    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 获取所有问题和回复数据
    const questions = await Question.findAll({
      where: { surveyId: surveyIdStr },
      include: [{ model: QuestionOption, as: 'options' }],
      order: [['orderIndex', 'ASC']],
    });

    // 构建时间筛选条件
    const responseWhere: any = { surveyId: surveyIdStr };
    if (startDate || endDate) {
      const { Op } = await import('sequelize');
      responseWhere.submittedAt = {};
      if (startDate) {
        responseWhere.submittedAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        responseWhere.submittedAt[Op.lte] = endDateTime;
      }
    }

    const responses = await SurveyResponse.findAll({
      where: responseWhere,
      include: [
        {
          model: Answer,
          as: 'answers',
          include: [{ model: Question, as: 'question' }],
        },
      ],
      order: [['submittedAt', 'DESC']],
    });

    // 创建 Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Survey Platform';
    workbook.created = new Date();

    // Sheet 1: 统计汇总
    const summarySheet = workbook.addWorksheet('统计汇总');

    // 问卷信息
    summarySheet.addRow(['问卷统计报告']);
    summarySheet.lastRow!.font = { size: 16, bold: true };
    summarySheet.lastRow!.height = 25;
    summarySheet.addRow([]);

    summarySheet.addRow(['问卷标题', survey.title]);
    if (survey.description) {
      summarySheet.addRow(['问卷描述', survey.description]);
    }
    summarySheet.addRow(['问卷状态', survey.status]);
    summarySheet.addRow(['创建时间', survey.createdAt.toLocaleString('zh-CN')]);
    summarySheet.addRow(['总回复数', responses.length]);
    summarySheet.addRow(['题目数量', questions.length]);
    summarySheet.addRow([]);

    // 题目统计
    summarySheet.addRow(['题目统计']);
    summarySheet.lastRow!.font = { size: 14, bold: true };
    summarySheet.addRow([]);

    // 表头
    summarySheet.addRow(['序号', '题目', '类型', '必填', '回复数']);
    const headerRow = summarySheet.lastRow!;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 遍历题目
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionTypeMap: Record<string, string> = {
        single_choice: '单选题',
        multiple_choice: '多选题',
        text: '文本题',
        textarea: '文本域',
        rating: '评分题',
        date: '日期题',
      };

      const row = summarySheet.addRow([
        i + 1,
        q.title,
        questionTypeMap[q.type] || q.type,
        q.isRequired ? '是' : '否',
        q.answers?.length || 0,
      ]);

      // 如果是选择题，添加选项统计
      if (['single_choice', 'multiple_choice'].includes(q.type)) {
        const options = q.options || [];
        const answers = q.answers || [];

        for (const opt of options) {
          const count = answers.filter((a: any) => a.answer.includes(opt.text)).length;
          const percentage = answers.length > 0 ? ((count / answers.length) * 100).toFixed(1) : '0.0';
          summarySheet.addRow(['', `  - ${opt.text}`, '', '', `${count} (${percentage}%)`]);
        }
      } else if (q.type === 'rating') {
        const ratings = q.answers?.map((a: any) => parseFloat(a.answer)).filter((r: any) => !isNaN(r)) || [];
        const average = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : '0.0';
        summarySheet.addRow(['', `  - 平均评分: ${average}`, '', '', '']);
      }
    }

    // 设置列宽
    summarySheet.getColumn(1).width = 8;
    summarySheet.getColumn(2).width = 40;
    summarySheet.getColumn(3).width = 12;
    summarySheet.getColumn(4).width = 8;
    summarySheet.getColumn(5).width = 15;

    // Sheet 2: 原始数据
    const rawDataSheet = workbook.addWorksheet('原始数据');

    // 表头
    const headers = ['回复ID', '提交时间'];
    questions.forEach((q) => {
      headers.push(`Q${q.orderIndex + 1}: ${q.title.substring(0, 15)}${q.title.length > 15 ? '...' : ''}`);
    });

    rawDataSheet.addRow(headers);
    const dataHeaderRow = rawDataSheet.lastRow!;
    dataHeaderRow.font = { bold: true };
    dataHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 数据行
    for (const response of responses) {
      const rowData: (string | number)[] = [
        response.id,
        response.submittedAt.toLocaleString('zh-CN'),
      ];

      // 为每个问题获取答案
      for (const question of questions) {
        const answer = response.answers?.find((a: any) => a.questionId === question.id);
        if (answer) {
          // 多选题答案可能是数组，需要特殊处理
          try {
            const parsed = JSON.parse(answer.answer);
            if (Array.isArray(parsed)) {
              rowData.push(parsed.join(', '));
            } else {
              rowData.push(answer.answer);
            }
          } catch {
            rowData.push(answer.answer);
          }
        } else {
          rowData.push('');
        }
      }

      rawDataSheet.addRow(rowData);
    }

    // 设置列宽
    rawDataSheet.getColumn(1).width = 10;
    rawDataSheet.getColumn(2).width = 20;
    for (let i = 3; i <= headers.length; i++) {
      rawDataSheet.getColumn(i).width = 25;
    }

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(survey.title)}_统计.xlsx"`
    );

    // 发送文件
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};

// 导出 PDF
export const exportToPdf = async (req: AuthRequest, res: ExpressResponse) => {
  try {
    const { surveyId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user!.id;
    const surveyIdStr = Array.isArray(surveyId) ? surveyId[0] : surveyId;

    // 获取问卷信息
    const survey = await Survey.findByPk(surveyIdStr);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // 权限检查
    if (survey.creatorId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 获取所有问题和回复数据
    const questions = await Question.findAll({
      where: { surveyId: surveyIdStr },
      include: [
        {
          model: Answer,
          as: 'answers',
        },
        { model: QuestionOption, as: 'options' },
      ],
      order: [['orderIndex', 'ASC']],
    });

    // 构建时间筛选条件
    const responseWhere: any = { surveyId: surveyIdStr };
    if (startDate || endDate) {
      const { Op } = await import('sequelize');
      responseWhere.submittedAt = {};
      if (startDate) {
        responseWhere.submittedAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999);
        responseWhere.submittedAt[Op.lte] = endDateTime;
      }
    }

    const totalResponses = await SurveyResponse.count({ where: responseWhere });

    // 创建 PDF
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      size: 'A4',
    });

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(survey.title)}_统计.pdf"`
    );

    // 将 PDF 流式传输到响应
    doc.pipe(res);

    // 标题
    doc.fontSize(24).font('Helvetica-Bold').text('问卷统计报告', { align: 'center' });
    doc.moveDown();

    // 分割线
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // 问卷信息
    doc.fontSize(14).font('Helvetica-Bold').text('问卷信息');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica');
    const infoText = [
      `标题: ${survey.title}`,
      `状态: ${survey.status}`,
      `创建时间: ${survey.createdAt.toLocaleString('zh-CN')}`,
      `总回复数: ${totalResponses}`,
      `题目数量: ${questions.length}`,
    ];

    if (survey.description) {
      infoText.splice(1, 0, `描述: ${survey.description}`);
    }

    for (const text of infoText) {
      doc.text(text, { continued: false });
    }

    doc.moveDown();

    // 题目统计
    doc.fontSize(14).font('Helvetica-Bold').text('题目统计');
    doc.moveDown(0.5);

    const questionTypeMap: Record<string, string> = {
      single_choice: '单选题',
      multiple_choice: '多选题',
      text: '文本题',
      textarea: '文本域',
      rating: '评分题',
      date: '日期题',
    };

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // 检查页面是否需要换页
      if (doc.y > 700) {
        doc.addPage();
      }

      // 题目标题
      doc.fontSize(12).font('Helvetica-Bold').text(`Q${i + 1}. ${q.title}`);
      doc.fontSize(10).font('Helvetica').text(
        `类型: ${questionTypeMap[q.type] || q.type} | ${q.isRequired ? '必填' : '选填'} | 回复: ${q.answers?.length || 0}`
      );
      doc.moveDown(0.5);

      // 选择题统计
      if (['single_choice', 'multiple_choice'].includes(q.type)) {
        const options = q.options || [];
        const answers = q.answers || [];

        for (const opt of options) {
          const count = answers.filter((a: any) => a.answer.includes(opt.text)).length;
          const percentage = answers.length > 0 ? ((count / answers.length) * 100).toFixed(1) : '0.0';

          // 绘制进度条
          const barWidth = 200 * (count / Math.max(answers.length, 1));
          doc.rect(60, doc.y, barWidth, 6).fillAndStroke('#667eea', '#667eea');
          doc.rect(60 + barWidth, doc.y, 200 - barWidth, 6).stroke('#ddd');
          doc.y += 10;

          doc.text(`${opt.text}: ${count} (${percentage}%)`, { continued: false });
        }
      } else if (q.type === 'rating') {
        const ratings = q.answers?.map((a: any) => parseFloat(a.answer)).filter((r: any) => !isNaN(r)) || [];
        const average = ratings.length > 0
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
          : '0.0';
        doc.text(`平均评分: ${average}`, { continued: false });

        // 评分分布
        const distribution: Record<number, number> = {};
        ratings.forEach((r: number) => {
          distribution[r] = (distribution[r] || 0) + 1;
        });

        for (let star = 5; star >= 1; star--) {
          const count = distribution[star] || 0;
          const percentage = ratings.length > 0 ? ((count / ratings.length) * 100).toFixed(1) : '0.0';
          doc.text(`  ${star} 星: ${count} (${percentage}%)`, { continued: false });
        }
      } else {
        // 文本题显示前5条答案
        const answers = q.answers?.slice(0, 5) || [];
        if (answers.length > 0) {
          doc.fontSize(9).text('回复摘要 (显示前5条):');
          for (const ans of answers) {
            const text = ans.answer.substring(0, 60) + (ans.answer.length > 60 ? '...' : '');
            doc.text(`  ${text}`);
          }
          if (q.answers!.length > 5) {
            doc.text(`  ... 还有 ${q.answers!.length - 5} 条回复`);
          }
        } else {
          doc.fontSize(9).text('暂无回复');
        }
      }

      doc.moveDown();
    }

    // 页脚
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `生成时间: ${new Date().toLocaleString('zh-CN')} - 第 ${i + 1} 页`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Server error', details: (error as Error).message });
  }
};
