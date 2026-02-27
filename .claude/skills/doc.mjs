#!/usr/bin/env node
/**
 * Skill: doc
 * Description: Generate/update project documentation
 * Usage: doc [api|arch|all]
 */

import { execSync } from 'child_process';
import fs from 'fs';

const arg = process.argv[2] || 'all';

console.log('📚 Generating documentation...\n');

switch (arg) {
  case 'api':
    generateApiDocs();
    break;
  case 'arch':
    console.log('Architecture documentation is in docs/architecture.md');
    break;
  case 'all':
    generateApiDocs();
    console.log('\nAll documentation files are in the docs/ directory');
    break;
  default:
    console.log('Usage: doc [api|arch|all]');
}

function generateApiDocs() {
  console.log('Generating API documentation...');

  try {
    // Read backend routes
    const routesDir = './backend/src/routes';
    const routesFiles = fs.readdirSync(routesDir);

    let apiContent = '# API Documentation\n\n';
    apiContent += 'Base URL: `http://localhost:3001/api`\n\n';

    routesFiles.forEach(file => {
      const filePath = `${routesDir}/${file}`;
      const content = fs.readFileSync(filePath, 'utf8');

      apiContent += `## ${file.replace('.ts', '')}\n\n`;
      apiContent += '```\n' + content + '\n```\n\n';
    });

    fs.writeFileSync('./docs/api.md', apiContent);
    console.log('✅ API documentation updated: docs/api.md');
  } catch (error) {
    console.error('❌ Failed to generate API docs');
  }
}
