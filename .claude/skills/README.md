# Skills

This directory contains CLI skills for the survey system.

## Available Skills

### Project Management

- **dev** - Start all development servers
  ```bash
  node dev.mjs
  ```

- **build** - Build all projects for production
  ```bash
  node build.mjs
  ```

- **test** - Run all tests
  ```bash
  node test.mjs
  ```

- **clean** - Clean node_modules and build artifacts
  ```bash
  node clean.mjs
  ```

### Code Generation

- **gen-model** - Generate Prisma client from schema
  ```bash
  node gen-model.mjs
  ```

- **gen-api** - Generate API endpoint files (controller, service, routes)
  ```bash
  node gen-api.mjs <name>
  ```
  Example: `node gen-api.mjs user` creates user API

- **gen-component** - Generate Vue component
  ```bash
  node gen-component.mjs <name> [--admin|--h5|--uni]
  ```
  Examples:
  - `node gen-component.mjs Button --admin` - creates Button.vue in admin
  - `node gen-component.mjs Question --h5` - creates Question.vue in h5

- **gen-page** - Generate Vue page
  ```bash
  node gen-page.mjs <name> [--admin|--h5|--uni]
  ```
  Examples:
  - `node gen-page.mjs Dashboard --admin` - creates Dashboard page in admin
  - `node gen-page.mjs Survey --h5` - creates Survey page in h5

### Deployment

- **deploy:docker** - Deploy using Docker
  ```bash
  node deploy-docker.mjs
  ```

- **deploy:db** - Run database migrations
  ```bash
  node deploy-db.mjs
  ```

- **deploy:backup** - Backup database
  ```bash
  node deploy-backup.mjs
  ```

### Documentation

- **doc** - Generate/update documentation
  ```bash
  node doc.mjs [api|arch|all]
  ```

### New Skills (i18n)

- **gen:locale** - Add new translation keys to all locales
  ```bash
  node gen-locale.mjs <key> <zh-value> <en-value>
  ```
  Example: `node gen-locale.mjs survey.title "问卷标题" "Survey Title"`

- **sync:locale** - Synchronize translation keys across all locales
  ```bash
  node sync-locale.mjs
  ```
  Ensures all locale files have the same keys
