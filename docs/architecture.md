# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                          │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│  PC Admin    │     H5       │ Mini-program │   Future APIs   │
│  (Vue 3)     │   (Vue 3)    │  (uni-app)   │                 │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────────────┘
       │              │              │
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                               │
│                    (Express Server)                            │
│                  Port: 3001                                   │
├─────────────────────────────────────────────────────────────────┤
│  - Authentication (JWT)                                        │
│  - Request Validation                                          │
│  - Error Handling                                              │
│  - CORS                                                       │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
│   Auth       │ │   Survey     │ │  Response    │ │   Future    │
│   Module     │ │   Module     │ │   Module     │ │   Modules   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────────────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                              │
│                   (Business Logic)                             │
└──────┬────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                           │
│                    (Prisma ORM)                                │
└──────┬────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MySQL Database                              │
├─────────────────────────────────────────────────────────────────┤
│  - Users                                                       │
│  - Surveys                                                     │
│  - Questions                                                   │
│  - Question Options                                            │
│  - Responses                                                   │
│  - Answers                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Users
- `id` - Primary key
- `username` - Login username (unique)
- `password` - Hashed password
- `role` - User role (admin/user)
- `createdAt`, `updatedAt` - Timestamps

### Surveys
- `id` - Primary key
- `title` - Survey title
- `description` - Survey description
- `status` - Draft/Published/Closed
- `userId` - Creator ID (FK)
- `createdAt`, `updatedAt` - Timestamps

### Questions
- `id` - Primary key
- `surveyId` - Survey ID (FK)
- `type` - single/multiple/text/rating
- `title` - Question text
- `description` - Optional description
- `required` - Whether answer is required
- `options` - JSON array for choice questions
- `minRating`, `maxRating` - Rating range
- `order` - Display order
- `createdAt`, `updatedAt` - Timestamps

### QuestionOptions
- `id` - Primary key
- `questionId` - Question ID (FK)
- `option` - Option text
- `order` - Display order
- `createdAt` - Timestamp

### Responses
- `id` - Primary key
- `surveyId` - Survey ID (FK)
- `submittedAt` - Submission timestamp
- `createdAt` - Timestamp

### Answers
- `id` - Primary key
- `responseId` - Response ID (FK)
- `questionId` - Question ID (FK)
- `questionOptionId` - Selected option (FK, nullable)
- `value` - Answer value (JSON)
- `createdAt` - Timestamp

## Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │ ── Login Request ──►│ Backend  │ ── Query User ──►│ Database │
└─────────┘                    └─────────┘                    └─────────┘
                                   │
                                   │── Verify Password
                                   │
                                   │── Generate JWT Token
                                   │
┌─────────┐ ◄─ Token Response ───┤
│ Client  │
└─────────┘

┌─────────┐                    ┌─────────┐
│ Client  │ ── API Call + Token ─►│ Backend  │
└─────────┘                    └─────────┘
                                   │
                                   │── Verify Token
                                   │
                                   │── Process Request
```

## Request Flow

1. Client makes HTTP request to API
2. API Gateway receives request
3. Middleware validates and authenticates
4. Controller handles request
5. Service executes business logic
6. Prisma accesses/updates database
7. Response flows back through layers

## Security Considerations

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- CORS configured for cross-origin requests
- Input validation with express-validator
- SQL injection prevention via Prisma ORM
- Rate limiting (to be implemented)
- HTTPS in production

## Scalability Considerations

- Stateless API design
- Database connection pooling via Prisma
- Ready for horizontal scaling
- Caching strategy (Redis) can be added
- CDN for static assets
