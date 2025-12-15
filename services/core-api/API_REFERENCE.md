# 🎧 Voice Project API – Reference Documentation

This document provides a full reference for all public API endpoints in the Voice Project backend.
It is intended for **frontend developers**, **mobile developers**, and **external integrators**.

---

## 🚀 Overview

The system manages:
- **Projects** created by authenticated users.
- **Voice Sessions** inside each project (start/finish recording).
- Secure CRUD operations with project ownership validation.

All endpoints follow REST standards and return JSON responses.

---

# 🔐 Authentication

### **Auth Method:**  
`Bearer Token` (JWT)

### **Header Example**
`Authorization: Bearer <your_token>
Content-Type: application/json
`

---

# 📁 Projects API

## 1️⃣ Get All Projects
**GET** `/api/v1/projects/`

Returns a list of projects owned by the authenticated user.

### Response Example
```json
[
  {
    "id": 1,
    "name": "Podcast Season 1",
    "description": "Main episodes",
    "created_at": "2025-01-03T12:00:00Z"
  }
]
```
---

## 2️⃣ Create Project:-
- POST `/api/v1/projects/` 
### Body: 

```json
{
  "name": "My Project",
  "description": "Voice sessions for testing"
}

```
### Response:
```json
{
  "id": 5,
  "name": "My Project",
  "description": "Voice sessions for testing",
  "owner": 3
}
```
## 3️⃣ Retrieve Project:-
- GET `/api/v1/projects/<id>/ `

---
## 4️⃣ Update Project:-
- PATCH `/ PUT /api/v1/projects/<id>/`
- ➡️ Requires ownership (IsProjectOwner)
### Unauthorized Example: 
```json 
{
  "detail": "You do not have permission to perform this action."
}

```
---

##  5️⃣ Delete Project
- DELETE `/api/v1/projects/<id>/`
- ➡️ Only the owner can delete.
- Returns 204 No Content.

---
# 🎙 Voice Sessions API
- 1️⃣ Get All Sessions for a Project
- GET `/api/v1/sessions/?project_id=<id> `

### Response Example:
```json 
[
  {
    "id": 14,
    "project": 5,
    "started_at": "2025-01-05T14:22:00Z",
    "finished_at": "2025-01-05T14:26:00Z",
    "duration_seconds": 240
  }
]
```
--- 
## 2️⃣ Start New Session
- POST `/api/v1/sessions/start/ `
### Body: 
```json 
{
  "project_id": 5
}

```
### Response:
```json
{
  "id": 55,
  "project": 5,
  "started_at": "2025-01-07T11:31:00Z",
  "status": "started"
}
```
--- 
## 3️⃣ Finish Session
- POST ` /api/v1/sessions/finish/ `
### Body: 
```json 
{
  "session_id": 55
}
```
### Response: 
```json 
{
  "id": 55,
  "project": 5,
  "started_at": "2025-01-07T11:31:00Z",
  "finished_at": "2025-01-07T11:36:00Z",
  "duration_seconds": 300,
  "status": "finished"
}

```
--- 
## Error Handling ❌

### Common Errors

| Meaning | HTTP Code | Error |
| :--- | :---: | :--- |
| **Missing token** | 401 | `.Authentication credentials were not provided` |
| **Auth failed** | 401 | `.Invalid token` |
| **Not owner** | 403 | `You do not have permission` |
| **Wrong ID** | 404 | `.Not found` |
| **Wrong body** | 400 | `Bad Request` |

--- 
## Permission Rules Summary 🔐

---
| Rule | Action |
| :---: | ---: |
| Auth required | Create Project |
| Owner only | Update/Delete Project |
| Must own project | Create Session |
| Must own session | Finish Session |
| Must own project | List Sessions |


--- 
## Testing Notes 🧪

**Use these tools for API testing:**
* Postman
* Thunder Client (VS Code)
* curl

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
    [https://yourapi.com/api/v1/projects/](https://yourapi.com/api/v1/projects/)