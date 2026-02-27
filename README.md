# Survey System

A full-stack survey system supporting PC admin panel, H5 web form, and uni-app mini-program.

## Features

- **Multi-platform Support**: PC admin panel, H5 web form, WeChat mini-program
- **Survey Management**: Create, edit, delete surveys with drag-and-drop question builder
- **Question Types**: Single choice, multiple choice, text input, rating
- **Response Collection**: Collect and manage survey responses
- **Data Statistics**: Visual statistics and charts
- **Data Export**: Export responses to CSV
- **Authentication**: Basic role-based access control (Admin/User)

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- MySQL Database
- JWT Authentication

### Frontend Admin
- Vue 3 + TypeScript
- Vite
- Pinia (State Management)
- Element Plus (UI Components)
- ECharts (Data Visualization)

### H5 Frontend
- Vue 3 + TypeScript
- Vite
- Vue Router

### Mini-program
- uni-app (Vue 3)
- WeChat Mini-program

## Project Structure

```
survey-system/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema
├── frontend-admin/         # Vue 3 admin panel
│   └── src/
│       ├── views/          # Page components
│       ├── components/     # Reusable components
│       ├── stores/         # Pinia stores
│       └── api/            # API calls
├── frontend-h5/            # H5 survey form
│   └── src/
│       ├── views/          # Page components
│       └── api/            # API calls
├── frontend-uni/           # uni-app mini-program
│   └── src/
│       ├── pages/          # Mini-program pages
│       └── api/            # API calls
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
cd survey-system
```

2. Install dependencies:
```bash
# Backend
cd backend && npm install

# Admin frontend
cd ../frontend-admin && npm install

# H5 frontend
cd ../frontend-h5 && npm install

# Mini-program
cd ../frontend-uni && npm install
```

3. Configure environment:
```bash
# Copy and edit backend environment file
cd ../backend
cp .env.example .env
# Edit .env with your database configuration
```

4. Initialize database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

### Development

Start all development servers:
```bash
dev
```

Or start individually:
```bash
# Backend (port 3001)
cd backend && npm run dev

# Admin (port 3000)
cd frontend-admin && npm run dev

# H5 (port 3002)
cd frontend-h5 && npm run dev

# Uni-app H5 (port 3003)
cd frontend-uni && npm run dev:h5
```

### Build for Production

```bash
build
```

## Skills

Available CLI commands (skills):

### Project Management
- `dev` - Start all development servers
- `build` - Build all projects for production
- `test` - Run tests
- `clean` - Clean node_modules and build artifacts

### Code Generation
- `gen:model` - Generate Prisma client from schema
- `gen-api <name>` - Generate API endpoint files (controller, service, routes)
- `gen-component <name> [--admin|--h5|--uni]` - Generate Vue component
- `gen-page <name> [--admin|--h5|--uni]` - Generate Vue page

### Deployment
- `deploy:docker` - Deploy using Docker
- `deploy:db` - Run database migrations
- `deploy:backup` - Backup database
- `doc` - Generate/update documentation

## API Documentation

See [docs/api.md](./docs/api.md) for detailed API documentation.

## Default Credentials

```
Username: admin
Password: admin123
```

## Deployment

See [docs/deployment.md](./docs/deployment.md) for deployment instructions.

## License

MIT
