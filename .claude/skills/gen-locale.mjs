#!/usr/bin/env node
/**
 * Skill: gen-locale
 * Description: Add new translation key to all locale files
 * Usage: gen-locale <key> <zh-value> <en-value>
 *
 * Example:
 *   gen-locale survey.title "问卷标题" "Survey Title"
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: gen-locale <key> <zh-value> <en-value>');
  console.error('');
  console.error('Examples:');
  console.error('  gen-locale survey.title "问卷标题" "Survey Title"');
  console.error('  gen-locale nav.surveys "问卷管理" "Surveys"');
  process.exit(1);
}

const key = args[0];
const zhValue = args[1];
const enValue = args[2];

const locales = ['zh', 'en'];

locales.forEach(locale => {
  const localePath = path.join(process.cwd(), `frontend-${locale}/src/locales/${locale}.ts`);
  const content = fs.readFileSync(localePath, 'utf8');

  // Find the position to insert (before closing brace)
  const insertPosition = content.lastIndexOf('\n};');
  if (insertPosition === -1) {
    console.error(`Could not find valid locale structure in ${localePath}`);
    process.exit(1);
  }

  // Generate the new line
  const newLine = `  ${key}: '${locale === 'zh' ? zhValue : enValue}',`;

  // Insert the new key
  const newContent = content.slice(0, insertPosition) + newLine + content.slice(insertPosition);

  fs.writeFileSync(localePath, newContent);
  console.log(`✓ Added "${key}" to ${locale}/locales/${locale}.ts`);
});

console.log('\n✅ Translation key added to all locales');
