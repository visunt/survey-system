#!/usr/bin/env node
/**
 * Skill: gen-model
 * Description: Generate Prisma client and models from schema
 * Usage: gen-model
 */

import { execSync } from 'child_process';

console.log('📦 Generating Prisma client...\n');

try {
  execSync('npx prisma generate', {
    cwd: './backend',
    stdio: 'inherit',
  });
  console.log('\n✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Failed to generate Prisma client');
  process.exit(1);
}
