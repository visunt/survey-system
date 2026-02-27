#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Skill: gen-page
 * Description: Generate a Vue page
 * Usage: gen-page <name> [--admin|--h5|--uni]
 *
 * Example:
 *   gen-page Dashboard --admin
 *   gen-page SurveyDetail --h5
 */

const args = process.argv.slice(2);
const name = args[0];
const target = args[1]?.replace('--', '') || 'admin';

if (!name) {
  console.error('Usage: gen-page <name> [--admin|--h5|--uni]');
  process.exit(1);
}

const Name = name.charAt(0).toUpperCase() + name.slice(1);

const template = `<template>
  <div class="${name.toLowerCase()}">
    <el-card v-if="isAdmin">
      <template #header>
        <h3>${Name}</h3>
      </template>
      <!-- Your content here -->
    </el-card>

    <view v-else-if="isUni">
      <text class="title">${Name}</text>
    </view>

    <div v-else>
      <h2>${Name}</h2>
      <!-- Your content here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isAdmin = ${target === 'admin'};
const isUni = ${target === 'uni'};

onMounted(() => {
  // Your initialization code here
});
</script>

<style lang="scss" scoped>
.${name.toLowerCase()} {
  padding: 20px;
}

@media (max-width: 768px) {
  .${name.toLowerCase()} {
    padding: 15px;
  }
}
</style>
`;

let dir = '';
switch (target) {
  case 'admin':
    dir = './frontend-admin/src/views/' + name.toLowerCase();
    break;
  case 'h5':
    dir = './frontend-h5/src/views';
    break;
  case 'uni':
    dir = './frontend-uni/src/pages/' + name.toLowerCase();
    break;
  default:
    dir = './frontend-admin/src/views/' + name.toLowerCase();
}

const filePath = path.join(dir, 'index.vue');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(filePath, template);
console.log(`✓ Created ${filePath}`);
console.log(`\n✅ ${Name} page generated!`);
console.log(`\nNext steps:`);
console.log(`1. Add route to router configuration`);
console.log(`2. Implement your component logic`);
