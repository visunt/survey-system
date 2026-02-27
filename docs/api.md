# API Documentation

Base URL: `http://localhost:3001/api`

All endpoints require JSON format for request/response bodies.

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "role": "admin"  // optional, defaults to "user"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

## Surveys

### List Surveys
```http
GET /surveys?page=1&pageSize=10&status=published
Authorization: Bearer {token}
```

### Get Survey
```http
GET /surveys/{id}
Authorization: Bearer {token}
```

### Create Survey
```http
POST /surveys
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Customer Survey",
  "description": "Survey description",
  "status": "draft"
}
```

### Update Survey
```http
PUT /surveys/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "published"
}
```

### Delete Survey
```http
DELETE /surveys/{id}
Authorization: Bearer {token}
```

## Questions

### Add Question
```http
POST /surveys/{surveyId}/questions
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "single",
  "title": "How satisfied are you?",
  "description": "Select one option",
  "required": true,
  "options": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"],
  "order": 0
}
```

Question types: `single`, `multiple`, `text`, `rating`

For rating questions:
```json
{
  "type": "rating",
  "title": "Rate our service",
  "required": true,
  "minRating": 1,
  "maxRating": 5,
  "order": 0
}
```

### Update Question
```http
PUT /surveys/questions/{questionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated question"
}
```

### Delete Question
```http
DELETE /surveys/questions/{questionId}
Authorization: Bearer {token}
```

## Responses

### List Responses
```http
GET /responses/survey/{surveyId}?page=1&pageSize=10
Authorization: Bearer {token}
```

### Get Response
```http
GET /responses/{id}
Authorization: Bearer {token}
```

### Submit Response
```http
POST /responses
Content-Type: application/json

{
  "surveyId": 1,
  "answers": [
    {
      "questionId": 1,
      "value": "Very satisfied"
    },
    {
      "questionId": 2,
      "value": ["Feature A", "Feature B"]
    },
    {
      "questionId": 3,
      "value": "Great service overall"
    },
    {
      "questionId": 4,
      "value": 5
    }
  ]
}
```

### Get Statistics
```http
GET /responses/survey/{surveyId}/stats
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": {
    "surveyId": 1,
    "totalResponses": 100,
    "questionStats": [
      {
        "question": "How satisfied are you?",
        "type": "single",
        "optionCounts": [
          { "option": "Very satisfied", "count": 60 },
          { "option": "Satisfied", "count": 25 },
          { "option": "Neutral", "count": 10 },
          { "option": "Dissatisfied", "count": 5 }
        ]
      }
    ]
  }
}
```

### Export Responses
```http
GET /responses/survey/{surveyId}/export?format=csv
Authorization: Bearer {token}
```

Formats: `csv`, `excel`

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]  // validation errors, if applicable
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
