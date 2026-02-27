#!/usr/bin/env node
/**
 * Skill: deploy:docker
 * Description: Deploy project using Docker
 * Usage: deploy:docker
 */

import { execSync } from 'child_process';

console.log('🐳 Docker Deployment\n');

console.log('Step 1: Building Docker images...');
try {
  execSync('docker-compose build', { stdio: 'inherit' });
  console.log('✅ Images built successfully\n');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

console.log('Step 2: Starting containers...');
try {
  execSync('docker-compose up -d', { stdio: 'inherit' });
  console.log('✅ Containers started successfully\n');
} catch (error) {
  console.error('❌ Failed to start containers');
  process.exit(1);
}

console.log('Step 3: Running database migrations...');
try {
  execSync('docker-compose exec backend npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed\n');
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}

console.log('🎉 Deployment complete!');
console.log('\nServices:');
console.log('  Backend:  http://localhost:3001');
console.log('  Admin:    http://localhost:3000');
console.log('  H5:       http://localhost:3002');
