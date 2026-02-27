#!/usr/bin/env node
/**
 * Skill: build
 * Description: Build all projects for production
 * Usage: build
 */

import { execSync } from 'child_process';
import path from 'path';

const dirs = [
  { name: 'Backend', path: './backend', cmd: 'npm run build' },
  { name: 'Admin Frontend', path: './frontend-admin', cmd: 'npm run build' },
  { name: 'H5 Frontend', path: './frontend-h5', cmd: 'npm run build' },
  { name: 'Uni-app WeChat', path: './frontend-uni', cmd: 'npm run build:mp-weixin' },
];

console.log('🔨 Building all projects...\n');

for (const dir of dirs) {
  console.log(`Building ${dir.name}...`);
  try {
    execSync(dir.cmd, { cwd: dir.path, stdio: 'inherit' });
    console.log(`✅ ${dir.name} built successfully\n`);
  } catch (error) {
    console.error(`❌ ${dir.name} build failed\n`);
    process.exit(1);
  }
}

console.log('🎉 All projects built successfully!');
