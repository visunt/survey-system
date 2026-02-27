#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Skill: gen-component
 * Description: Generate a Vue component
 * Usage: gen-component <name> [--admin|--h5|--uni]
 *
 * Example:
 *   gen-component Button
 *   gen-component SurveyCard --admin
 */

const args = process.argv.slice(2);
const name = args[0];
const target = args[1]?.replace('--', '') || 'admin';

if (!name) {
  console.error('Usage: gen-component <name> [--admin|--h5|--uni]');
  process.exit(1);
}

const Name = name.charAt(0).toUpperCase() + name.slice(1);

const baseTemplate = `<template>
  <div class="${name.toLowerCase()}">
    <!-- Your content here -->
  </div>
</template>

<script setup lang="ts">
// ${Name} component
</script>

<style lang="scss" scoped>
.${name.toLowerCase()} {
  // Your styles here
}
</style>
`;

let dir = '';
switch (target) {
  case 'admin':
    dir = './frontend-admin/src/components';
    break;
  case 'h5':
    dir = './frontend-h5/src/components';
    break;
  case 'uni':
    dir = './frontend-uni/src/components';
    break;
  default:
    dir = './frontend-admin/src/components';
}

const filePath = path.join(dir, `${Name}.vue`);

if (fs.existsSync(filePath)) {
  console.error(`Component ${Name}.vue already exists!`);
  process.exit(1);
}

fs.writeFileSync(filePath, baseTemplate);
console.log(`✓ Created ${filePath}`);
console.log(`\n✅ ${Name} component generated!`);
