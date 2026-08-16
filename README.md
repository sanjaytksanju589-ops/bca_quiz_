# BCA Quiz Arena

A responsive, cinematic three-level BCA quiz hackathon prototype built with HTML, CSS and vanilla JavaScript.

## Features

- Student registration and login
- Admin demo login
- Password eye-toggle
- 3 progressive levels
- 30 questions per level (90 total)
- 20-second timer per question
- 75% pass rule (23/30 required)
- Automatic level unlocking
- Student dashboard and attempt history
- Admin results dashboard with filters
- Cinematic animated background
- localStorage demo persistence
- Mobile responsive UI

## Run locally

No build tools are required.

1. Extract/open the project folder.
2. Open `index.html` in a modern browser.

For best local development, use a simple static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Demo admin

Username: `admin`

Password: `Admin@123`

These credentials are intentionally in the frontend for a hackathon demo only. Do not deploy this authentication model to production.

## Student testing

1. Open Student Login.
2. Click Create Student Account.
3. Register.
4. Start Level 1.
5. Select answers or wait for the 20-second timer.
6. Finish all 30 questions.
7. Score at least 23 correct to unlock Level 2.

## Production security

This project uses localStorage so it can run without a backend. For production:

- Move authentication to a server.
- Hash passwords with a strong password hashing algorithm.
- Use secure, HTTP-only sessions or appropriately protected tokens.
- Validate quiz attempts and authorization server-side.
- Store users/results in a database.
- Do not expose admin credentials in JavaScript.
- Consider server timestamps and signed attempt state if exam integrity matters.

## Project structure

- `index.html` — application shell
- `css/styles.css` — responsive cinematic UI
- `js/questions.js` — 90 quiz questions
- `js/app.js` — authentication, progression, timer, results and admin logic
