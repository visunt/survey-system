#!/usr/bin/env node
/**
 * Skill: dev
 * Description: Start development servers for backend and all frontends
 * Usage: dev
 */

import { spawn } from 'child_process';

const processes = [];

console.log('🚀 Starting development servers...\n');

// Backend
console.log('Starting backend...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true,
});
processes.push(backend);

// Admin Frontend
console.log('Starting admin frontend...');
const admin = spawn('npm', ['run', 'dev'], {
  cwd: './frontend-admin',
  stdio: 'inherit',
  shell: true,
});
processes.push(admin);

// H5 Frontend
console.log('Starting H5 frontend...');
const h5 = spawn('npm', ['run', 'dev'], {
  cwd: './frontend-h5',
  stdio: 'inherit',
  shell: true,
});
processes.push(h5);

// Uni-app (optional)
console.log('Starting uni-app (H5 mode)...');
const uni = spawn('npm', ['run', 'dev:h5'], {
  cwd: './frontend-uni',
  stdio: 'inherit',
  shell: true,
});
processes.push(uni);

console.log('\n✅ All servers started!');
console.log('Backend:   http://localhost:3001');
console.log('Admin:     http://localhost:3000');
console.log('H5:        http://localhost:3002');
console.log('Uni-app:   http://localhost:3003\n');

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping all servers...');
  processes.forEach(p => p.kill());
  process.exit();
});
