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

- **gen-api** - Generate API endpoint files
  ```bash
  node gen-api.mjs <name>
  ```

- **gen-component** - Generate Vue component
  ```bash
  node gen-component.mjs <name> [--admin|--h5|--uni]
  ```

- **gen-page** - Generate Vue page
  ```bash
  node gen-page.mjs <name> [--admin|--h5|--uni]
  ```

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
