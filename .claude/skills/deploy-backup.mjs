#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Skill: deploy:backup
 * Description: Backup database
 * Usage: deploy:backup
 */

const backupDir = './backups';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `survey-backup-${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

console.log('💾 Creating database backup...\n');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  // Use docker to run mysqldump
  execSync(
    `docker-compose exec -T mysql mysqldump -uroot -ppassword survey_db > ${filepath}`,
    { stdio: 'inherit' }
  );

  console.log(`✅ Backup created: ${filepath}`);

  // Clean old backups (keep last 10)
  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.sql'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(backupDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 10) {
    const toDelete = files.slice(10);
    toDelete.forEach(f => {
      fs.unlinkSync(path.join(backupDir, f.name));
      console.log(`✓ Deleted old backup: ${f.name}`);
    });
  }

} catch (error) {
  console.error('\n❌ Backup failed');
  console.error('Make sure Docker containers are running');
  process.exit(1);
}
