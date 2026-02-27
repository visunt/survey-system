#!/usr/bin/env node
/**
 * Skill: clean
 * Description: Clean node_modules and build artifacts
 * Usage: clean
 */

import { execSync, rmSync } from 'fs';
import path from 'path';

console.log('🧹 Cleaning up...\n');

const dirs = [
  './backend',
  './frontend-admin',
  './frontend-h5',
  './frontend-uni',
];

for (const dir of dirs) {
  const distPath = path.join(dir, 'dist');
  const nodeModulesPath = path.join(dir, 'node_modules');

  try {
    rmSync(distPath, { recursive: true, force: true });
    console.log(`✓ Removed ${distPath}`);
  } catch {}

  try {
    rmSync(nodeModulesPath, { recursive: true, force: true });
    console.log(`✓ Removed ${nodeModulesPath}`);
  } catch {}
}

console.log('\n✅ Cleanup complete!');
