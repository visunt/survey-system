import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin);

  // Create sample survey
  const survey = await prisma.survey.create({
    data: {
      title: 'Customer Satisfaction Survey',
      description: 'Please help us improve our services by answering this survey.',
      status: 'published',
      userId: admin.id,
      questions: {
        create: [
          {
            type: 'single',
            title: 'How would you rate our service?',
            required: true,
            order: 0,
            options: ['Excellent', 'Good', 'Average', 'Poor'],
          },
          {
            type: 'multiple',
            title: 'Which features do you use most?',
            required: false,
            order: 1,
            options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
          },
          {
            type: 'text',
            title: 'Any suggestions for improvement?',
            required: false,
            order: 2,
          },
          {
            type: 'rating',
            title: 'Overall satisfaction',
            required: true,
            order: 3,
            minRating: 1,
            maxRating: 5,
          },
        ],
      },
    },
  });
  console.log('Created sample survey:', survey.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
