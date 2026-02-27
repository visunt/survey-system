# Development Guide

## Development Setup

### 1. Clone and Install

```bash
cd survey-system

# Install all dependencies
npm run install:all

# Or install individually
npm run install:backend
npm run install:admin
npm run install:h5
npm run install:uni
```

### 2. Database Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
vim .env

# Run migrations
npm run prisma:migrate

# Seed data
npm run prisma:seed
```

### 3. Start Development Servers

```bash
# Start all services
dev

# Or start individually
cd backend && npm run dev           # Port 3001
cd frontend-admin && npm run dev    # Port 3000
cd frontend-h5 && npm run dev       # Port 3002
cd frontend-uni && npm run dev:h5  # Port 3003
```

## Code Structure

### Backend
```
backend/src/
├── controllers/    # Request handlers
│   ├── auth.controller.ts
│   ├── survey.controller.ts
│   └── response.controller.ts
├── services/       # Business logic
├── routes/         # API routes
├── middleware/     # Middleware (auth, error, i18n)
├── locales/        # Translation files
├── utils/          # Utility functions
├── lib/            # Prisma client
└── app.ts         # Application entry
```

### Frontend Admin
```
frontend-admin/src/
├── views/          # Page components
│   ├── Login.vue
│   ├── surveys/
│   │   ├── List.vue
│   │   └── Edit.vue
│   └── responses/
│       ├── List.vue
│       └── Stats.vue
├── components/     # Reusable components
├── stores/         # Pinia stores (with locale state)
├── locales/         # Translation files
├── api/            # API calls
├── router/         # Vue Router config
└── main.ts         # Entry point
```

### H5 Frontend
```
frontend-h5/src/
├── views/          # Page components
│   ├── SurveyFill.vue
│   ├── SurveyResult.vue
│   └── NotFound.vue
├── locales/         # Translation files
├── api/            # API calls
└── main.ts         # Entry point
```

### Uni-app Mini-program
```
frontend-uni/src/
├── pages/          # Mini-program pages
│   ├── survey/index.vue
│   ├── result/index.vue
│   └── notfound/index.vue
├── components/     # Reusable components
├── locales/         # Translation files
├── utils/          # Utilities (with locale helpers)
└── main.ts         # Entry point
```

## Coding Conventions

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use type inference where possible

### Vue 3
- Use Composition API with `<script setup>`
- Define props with `defineProps<T>()`
- Emit events with `defineEmits<T>()`
- Use reactive/ref for reactive state

### API Design
- RESTful conventions
- Consistent response format:
  ```json
  {
    "success": true,
    "data": {...},
    "message": "Optional message"
  }
  ```
- Use appropriate HTTP methods
- Include validation for all endpoints

## Database Operations

### Using Prisma

```typescript
import { prisma } from '@/lib/prisma';

// Read
const survey = await prisma.survey.findUnique({
  where: { id },
  include: { questions: true },
});

// Create
const newSurvey = await prisma.survey.create({
  data: { title, description, userId },
});

// Update
const updated = await prisma.survey.update({
  where: { id },
  data: { title: newTitle },
});

// Delete
await prisma.survey.delete({
  where: { id },
});
```

### Running Migrations

```bash
# Create migration
cd backend
npx prisma migrate dev --name add_new_field

# Reset database (development only)
npx prisma migrate reset

# Generate client
npm run prisma:generate
```

## Internationalization (i18n)

### Backend

The backend supports language negotiation through:
- Query parameter: `?lang=zh` or `?lang=en`
- Cookie: `lang=zh` or `lang=en`
- Accept-Language header: `zh-CN` or `en-US`

**Usage in endpoints:**
```typescript
// Using i18n middleware
import { I18nRequest } from '../middleware/i18n';

router.get('/', (req: I18nRequest, res) => {
  // req.locale contains the current language
  // req.t(key, params) for translation
  res.json({
    message: req.t('auth.loginSuccess')
  });
});
```

### Frontend Admin

The admin panel uses `vue-i18n` for internationalization.

**Language Files:**
- `frontend-admin/src/locales/zh.ts` - Chinese translations
- `frontend-admin/src/locales/en.ts` - English translations

**Usage in components:**
```vue
<template>
  <div>
    {{ $t('common.success') }}
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```

**Language Switching:**
- Click the globe icon in the header to switch language
- Language preference is saved to localStorage
- Element Plus components automatically sync with selected language

### H5 Frontend

The H5 frontend uses `vue-i18n` for internationalization.

**Language Files:**
- `frontend-h5/src/locales/zh.ts` - Chinese translations
- `frontend-h5/src/locales/en.ts` - English translations

**Language Switching:**
- Click language button in the top-right corner (on survey pages)
- Language preference is saved to localStorage

### Uni-app Mini-program

The mini-program uses `vue-i18n` for internationalization.

**Language Files:**
- `frontend-uni/src/locales/zh.ts` - Chinese translations
- `frontend-uni/src/locales/en.ts` - English translations

**Language Switching:**
- Click language button in the top-right corner (on survey pages)
- Language preference is saved to uni-app storage

**Available Languages:**
- `zh` - 简体中文
- `en` - English

## Adding New Translations

### Using Skills

To add new translation keys to all locales:

```bash
# Add a new translation key
node .claude/skills/gen-locale.mjs <key> <zh-value> <en-value>

# Example:
node .claude/skills/gen-locale.mjs new.feature "新功能" "New Feature"
```

To synchronize translation keys across all locales:

```bash
# Check for missing/extra keys
node .claude/skills/sync-locale.mjs
```

### Manual Adding

When adding new translation keys, follow this pattern:

```typescript
// frontend-admin/src/locales/zh.ts
export default {
  // Category
  category: {
    key: '翻译文本',
  },
};

// frontend-admin/src/locales/en.ts
export default {
  // Category
  category: {
    key: 'Translated text',
  },
};
```

## Debugging

### Backend Debugging
Use VS Code debugger or console logs:

```typescript
console.log('Survey:', survey);
console.error('Error:', error);
```

### Frontend Debugging
Use Vue DevTools browser extension.

### Database Debugging
```bash
cd backend
npm run prisma:studio
```

## Adding New Features

### 1. Add API Endpoint

```bash
# Generate API files
gen-api <name>

# Then:
# 1. Add model to prisma/schema.prisma
# 2. Run migration
# 3. Import route in app.ts
```

### 2. Add Frontend Page

```bash
# Generate page
gen-page <name> [--admin|--h5|--uni]

# Then:
# 1. Add route to router config
# 2. Implement page logic
```

### 3. Add Component

```bash
# Generate component
gen-component <name> [--admin|--h5|--uni]

# Then:
# 1. Implement component logic
# 2. Import and use in pages
```

## Common Tasks

### Add New Question Type

1. Update database schema if needed
2. Add type definition in frontend
3. Add component for question type
4. Update form builder
5. Add validation logic

### Change Database Schema

```bash
cd backend
# Modify schema.prisma
vim prisma/schema.prisma

# Create migration
npx prisma migrate dev --name <description>

# Generate client
npx prisma generate
```

### Add Authentication to Endpoint

```typescript
import { authenticate, authorize } from '@/middleware/auth';

router.get('/protected', authenticate, (req, res) => {
  // Authenticated only
});

router.get('/admin-only', authenticate, authorize(['admin']), (req, res) => {
  // Admin only
});
```

## Performance Optimization

### Backend
- Use database indexes
- Implement pagination
- Cache frequently accessed data
- Optimize queries with Prisma

### Frontend
- Lazy load routes
- Code splitting
- Optimize images
- Use virtual scrolling for lists

## Troubleshooting

### Common Issues

**Database connection error**
- Check DATABASE_URL in .env
- Ensure MySQL is running
- Verify credentials

**CORS errors**
- Check CORS_ORIGIN in .env
- Ensure API proxy is configured

**Build errors**
- Clear node_modules: `clean`
- Reinstall dependencies
- Check TypeScript errors

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/)
- [uni-app Documentation](https://uniapp.dcloud.net.cn/)
- [Element Plus Documentation](https://element-plus.org/)
- [vue-i18n Documentation](https://vue-i18n.intlify.dev/)
