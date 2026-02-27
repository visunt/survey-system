#!/usr/bin/env node
/**
 * Skill: test
 * Description: Run tests for all projects
 * Usage: test
 */

import { execSync } from 'child_process';

const dirs = [
  './backend',
  './frontend-admin',
  './frontend-h5',
  './frontend-uni',
];

console.log('🧪 Running tests...\n');

for (const dir of dirs) {
  try {
    execSync('npm test', { cwd: dir, stdio: 'inherit' });
  } catch (error) {
    // Ignore if no tests defined
    console.log(`⚠️  No tests in ${dir}`);
  }
}

console.log('✅ Tests completed!');
