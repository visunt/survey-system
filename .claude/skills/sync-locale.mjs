#!/usr/bin/env node
/**
 * Skill: sync-locale
 * Description: Synchronize translation keys across all locale files
 * Usage: sync-locale
 */

import fs from 'fs';
import path from 'path';

// Read all locale files and collect keys
function readLocaleKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys: string[] = [];

  // Extract all keys using regex
  const keyRegex = /(\w+):/g;
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    if (!keys.includes(match[1])) {
      keys.push(match[1]);
    }
  }

  return keys.sort();
}

const locales = [
  { name: 'zh', path: 'frontend-zh/src/locales/zh.ts' },
  { name: 'en', path: 'frontend-en/src/locales/en.ts' },
];

// Collect all keys from all locales
const allKeys: Set<string> = new Set();
const localeKeys: Record<string, Set<string>> = {};

locales.forEach(({ name, path }) => {
  // Adjust path for actual structure
  const actualPath = path.join(process.cwd(), path.replace('frontend-', 'frontend-').replace(name, name));

  const keys = readLocaleKeys(actualPath);
  keys.forEach(key => allKeys.add(key));
  localeKeys[name] = new Set(keys);
});

// Find missing keys in each locale
console.log('🔍 Checking locale files...\n');

locales.forEach(({ name }) => {
  const keys = localeKeys[name];
  const missingKeys = [...allKeys].filter(key => !keys.has(key));

  if (missingKeys.length > 0) {
    console.warn(`⚠️  ${name} is missing ${missingKeys.length} keys:`);
    missingKeys.slice(0, 10).forEach(key => console.warn(`   - ${key}`));
    if (missingKeys.length > 10) {
      console.warn(`   ... and ${missingKeys.length - 10} more`);
    }
  } else {
    console.log(`✅ ${name} - All keys present`);
  }
});

console.log(`\n📊 Total unique keys: ${allKeys.size}`);
console.log('\n💡 Run "gen-locale <key> <zh-value> <en-value>" to add missing keys');
