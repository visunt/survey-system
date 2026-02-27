#!/usr/bin/env node
/**
 * Skill: deploy:db
 * Description: Run database migrations
 * Usage: deploy:db
 */

import { execSync } from 'child_process';

console.log('🗄️  Running database migrations...\n');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { cwd: './backend', stdio: 'inherit' });

  // Run migrations
  console.log('\nRunning migrations...');
  execSync('npx prisma migrate deploy', { cwd: './backend', stdio: 'inherit' });

  console.log('\n✅ Database migrations completed!');
} catch (error) {
  console.error('\n❌ Migration failed');
  process.exit(1);
}
