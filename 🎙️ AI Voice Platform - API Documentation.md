# 🎙️ AI Voice Platform - API Documentation

This documentation covers the **API structure**, **testing procedures**, and **troubleshooting** for the **AI Voice Platform**.

---

# 1. Overview

The platform uses a **microservices architecture**:

| Component | Technology |
|-----------|------------|
| Frontend | Vite + React |
| Backend | Django + Django REST Framework |
| Realtime API | FastAPI + Uvicorn |
| Database | PostgreSQL |
| Proxy / Gateway | Nginx |

---

# 2. Authentication API

**Base Path**

```
/api/v1/auth/
```

## POST /login/

**Description**

Log in to receive a **JWT Token**.

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**

```
200 OK
```

Returns:

- Access Token
- Refresh Token

---

## POST /register/

**Description**

Register a new user.

**Required Fields**

- email
- password
- username

---

# 3. Projects API

**Base Path**

```
/api/v1/projects/
```

## GET /

**Description**

Retrieve **all projects for the current user**.

**Headers**

```
Authorization: Bearer <TOKEN>
```

---

## POST /

**Description**

Create a **new project**.

**Request Body**

```json
{
  "name": "string",
  "description": "string"
}
```

---

# 4. Voice Sessions API

**Base Path**

```
/api/v1/voice_sessions/
```

## POST /start/

**Description**

Start a **voice session** and link it to **LiveKit**.

**Response**

```json
{
  "token": "livekit_token",
  "session_id": "uuid"
}
```

---

# 5. Testing and Troubleshooting Guide

## Testing Endpoints

Use `curl` from within the server to ensure the request reaches the backend.

```bash
curl -v -H "Host: flosakk.com" https://flosakk.com/api/v1/auth/login/
```

---

## Checking Container Logs

If you encounter a **502 Bad Gateway error**, run:

```bash
docker compose logs -f backend
```

---

# 6. Clean Rebuild Procedures

In case of **migration conflicts** or **database issues**, follow these steps.

## 1. Clean Shutdown

```bash
docker compose down -v
```

---

## 2. Remove Old Migration Files

```bash
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
```

---

## 3. Rebuild Containers

```bash
docker compose build --no-cache
```

---

## 4. Generate and Apply New Migrations

```bash
docker exec -it ai_voice_backend python manage.py makemigrations
docker exec -it ai_voice_backend python manage.py migrate
```

---

# 7. Security Requirements (SSL & HTTPS)

To fix **getUserMedia errors** *(microphone/camera not working)*:

- The site **must run over HTTPS**
- Ensure **Cloudflare SSL/TLS** is set to **Full mode**
- Ensure your domain is included in `vite.config.js` under:

```
allowedHosts
```

---

# 📌 Notes

- All authenticated endpoints require a **JWT Bearer Token**
- Make sure **Docker containers are running**
- Verify **Nginx proxy routing** if APIs are not reachable
- Always rebuild containers after **migration changes**

---

# 🚀 AI Voice Platform

A **Voice-First AI system** built with modern microservices architecture.
