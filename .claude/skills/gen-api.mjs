#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Skill: gen-api
 * Description: Generate API endpoint files from template
 * Usage: gen-api <name>
 *
 * Example:
 *   gen-api user
 *   gen-api product
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: gen-api <name>');
  process.exit(1);
}

const name = args[0];
const Name = name.charAt(0).toUpperCase() + name.slice(1);

// Backend files
const backendDir = './backend/src';

// Controller template
const controllerTemplate = `import { Request, Response } from 'express';
import { ${Name}Service } from '../services/${name}.service';

export class ${Name}Controller {
  private service: ${Name}Service;

  constructor() {
    this.service = new ${Name}Service();
  }

  async list(req: Request, res: Response) {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await this.service.list(Number(page), Number(pageSize));
    res.json({ success: true, data: result });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.getById(Number(id));
    res.json({ success: true, data: result });
  }

  async create(req: Request, res: Response) {
    const result = await this.service.create(req.body);
    res.status(201).json({ success: true, data: result });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.update(Number(id), req.body);
    res.json({ success: true, data: result });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await this.service.delete(Number(id));
    res.json({ success: true, message: '${Name} deleted' });
  }
}
`;

// Service template
const serviceTemplate = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ${Name}Service {
  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.${name}.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      prisma.${name}.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: number) {
    return prisma.${name}.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.${name}.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.${name}.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.${name}.delete({ where: { id } });
  }
}
`;

// Route template
const routeTemplate = `import express, { Router } from 'express';
import { ${Name}Controller } from '../controllers/${name}.controller';

const router: Router = express.Router();
const controller = new ${Name}Controller();

router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
`;

// Frontend API template
const apiTemplate = `import request from './index';

export interface ${Name} {
  id: number;
  // Add your fields here
}

export const ${name}Api = {
  list: (params: { page?: number; pageSize?: number }) =>
    request.get('/${name}s', { params }),

  get: (id: number) => request.get(\`/${name}s/\${id}\`),

  create: (data: Partial<${Name}>) =>
    request.post('/${name}s', data),

  update: (id: number, data: Partial<${Name}>) =>
    request.put(\`/${name}s/\${id}\`, data),

  delete: (id: number) =>
    request.delete(\`/${name}s/\${id}\`),
};
`;

// Write files
const files = [
  { path: `${backendDir}/controllers/${name}.controller.ts`, content: controllerTemplate },
  { path: `${backendDir}/services/${name}.service.ts`, content: serviceTemplate },
  { path: `${backendDir}/routes/${name}.ts`, content: routeTemplate },
  { path: './frontend-admin/src/api/' + name + '.ts', content: apiTemplate },
];

for (const file of files) {
  const dir = path.dirname(file.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file.path, file.content);
  console.log(`✓ Created ${file.path}`);
}

console.log(`\n✅ ${Name} API files generated!`);
console.log(`\nNext steps:`);
console.log(`1. Add model to prisma/schema.prisma`);
console.log(`2. Import route in backend/src/app.ts`);
console.log(`3. Add frontend types and components`);
