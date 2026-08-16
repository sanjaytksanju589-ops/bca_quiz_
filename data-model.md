# Data model used by the demo

## Student
```json
{
  "id": "uuid",
  "name": "Student Name",
  "email": "student@example.com",
  "password": "DEMO ONLY - plaintext localStorage"
}
```

## Attempt
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userName": "Student Name",
  "email": "student@example.com",
  "level": 1,
  "correct": 23,
  "wrong": 6,
  "unanswered": 1,
  "percentage": 76.6667,
  "passed": true,
  "timeUsed": 512,
  "date": "ISO-8601 timestamp"
}
```

For production, replace this with a real database and never store plaintext passwords.
