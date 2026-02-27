# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker 20+
- Docker Compose 2+

### Quick Deploy

1. Start all services:
```bash
deploy:docker
```

This will:
- Build Docker images
- Start MySQL, Backend, Admin, H5, and Nginx
- Run database migrations
- Seed initial data

### Manual Docker Deployment

1. Build images:
```bash
docker-compose build
```

2. Start containers:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
docker-compose exec backend npx prisma migrate deploy
```

4. Seed database:
```bash
docker-compose exec backend npm run prisma:seed
```

## Production Deployment

### Environment Variables

Create `.env` file in `backend/`:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL="mysql://user:password@mysql:3306/survey_db"

# JWT
JWT_SECRET=your-very-secret-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Nginx Configuration

The project includes an Nginx reverse proxy configuration.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Admin panel
    location / {
        root /usr/share/nginx/html/admin;
        try_files $uri $uri/ /index.html;
    }

    # H5 survey form
    location /h5/ {
        alias /usr/share/nginx/html/h5/;
        try_files $uri $uri/ /h5/index.html;
    }

    # API backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS Setup

For HTTPS, use Certbot with Nginx:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

## Cloud Deployment

### VPS Deployment (e.g., DigitalOcean, Linode)

1. Set up a VPS with Ubuntu 22.04
2. Install Docker and Docker Compose
3. Clone the repository
4. Configure environment variables
5. Run `deploy:docker`
6. Set up SSL with Certbot

### Cloud Functions / Serverless

For serverless deployment, consider:

- Backend: Vercel, Netlify Functions, AWS Lambda
- Frontend: Vercel, Netlify
- Database: PlanetScale (MySQL), Neon (PostgreSQL), Supabase

### Kubernetes

For Kubernetes deployment, create manifests for:
- Deployment (MySQL, Backend, Frontends)
- Service (ClusterIP, LoadBalancer)
- Ingress (Nginx)
- ConfigMap (Environment variables)
- Secret (Passwords, API keys)

## Database Backup

Automated backup:

```bash
# Manual backup
deploy:backup

# Schedule with cron
0 2 * * * cd /path/to/project && deploy:backup
```

## Monitoring

### Application Monitoring

Consider adding:
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring

### Log Management

- Centralized logging (ELK stack, Graylog)
- Log rotation
- Retention policy

## Scaling

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use load balancer (Nginx, HAProxy)
3. Configure session storage (Redis)

### Database Scaling

1. Read replicas for read-heavy workloads
2. Connection pooling
3. Query optimization
4. Indexing strategy

## Security Checklist

- [ ] Use strong, unique passwords
- [ ] Change JWT secret
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention (Prisma handles this)
