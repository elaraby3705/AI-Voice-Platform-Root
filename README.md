# 🧬 Nexus — The AI‑Powered Project Manager Agent

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![Django](https://img.shields.io/badge/Django-REST%20API-092E20)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

> **"Don't just chat with your AI. Hire it."**

Nexus is a **Voice‑First AI Project Manager Agent** capable of **executing real backend operations through natural conversation**.

Unlike traditional chatbots that only provide suggestions, Nexus can:

• create projects
• manage tasks
• query databases
• update application state
• visualize actions instantly on a dashboard

All through **real‑time voice interaction**.

---

# 🎬 Demo

*(Add screenshots or demo GIFs here once available)*

Example interaction:

> "Nexus, create a project called Mars Colony with description Terraforming phase one."

The AI:

1. Understands the intent
2. Calls backend tools
3. Creates database records
4. Pushes updates via WebSocket
5. Updates the dashboard instantly

---

# 🧠 Core Concept

Nexus transforms an LLM from a **passive advisor** into an **active operational agent**.

Instead of answering questions, the AI **takes actions**.

```
Traditional AI
User → Question → AI → Answer

Nexus AI
User → Voice Command → AI → Tool Execution → Database → UI Update
```

---

# 🏗️ System Architecture

## High‑Level Architecture

```
            ┌──────────────┐
            │    Browser   │
            │ React + Vite │
            └──────┬───────┘
                   │ WebRTC
                   ▼
             ┌───────────┐
             │  LiveKit  │
             │ Voice RTP │
             └────┬──────┘
                  │
                  ▼
        ┌───────────────────┐
        │   AI Voice Agent  │
        │  (LiveKit Worker) │
        └─────┬─────┬───────┘
              │     │
              │     └────► Deepgram (Speech Recognition)
              │
              └────► Groq + Llama‑3 (Reasoning)
                       │
                       ▼
                Tool Invocation
                       │
                       ▼
               Django REST API
                       │
                       ▼
                 PostgreSQL DB
                       │
                       ▼
              Redis Event Broker
                       │
                       ▼
               FastAPI WebSocket
                       │
                       ▼
                React Dashboard
```

---

# 🧱 Microservices Architecture

Nexus uses a **decoupled containerized architecture**.

| Service     | Container         | Responsibility             |
| ----------- | ----------------- | -------------------------- |
| API Gateway | ai_voice_gateway  | Nginx reverse proxy        |
| Frontend    | ai_voice_frontend | React dashboard            |
| Backend     | ai_voice_backend  | Django REST API            |
| Realtime    | ai_voice_realtime | FastAPI WebSocket server   |
| AI Worker   | ai_voice_agent    | Voice + reasoning pipeline |
| Database    | ai_voice_db_psql  | PostgreSQL data layer      |
| Cache       | redis             | pub/sub messaging          |

---

# 🎙️ Voice Processing Pipeline

```
User Speech
      │
      ▼
LiveKit WebRTC Stream
      │
      ▼
Deepgram Speech‑to‑Text
      │
      ▼
Llama‑3 via Groq
      │
      ▼
Intent Understanding
      │
      ▼
Tool Selection
      │
      ▼
Django API Call
      │
      ▼
Database Update
      │
      ▼
Redis Event
      │
      ▼
FastAPI WebSocket
      │
      ▼
React Dashboard Update
      │
      ▼
Deepgram Text‑to‑Speech
```

---

# 🔄 Event Flow

```
Voice Command
      │
      ▼
AI Agent
      │
      ▼
API Request
      │
      ▼
Database Update
      │
      ▼
Redis Pub/Sub
      │
      ▼
WebSocket Broadcast
      │
      ▼
Frontend Update
```

---

# 🗄️ Database Model (Simplified ERD)

```
User
 │
 ├── Projects
 │      │
 │      ├── Tasks
 │      │      └── Status
 │      │
 │      └── Activity Logs
```

Future extension may include:

• sprint planning
• AI meeting notes
• automated reporting

---

# 🛠️ Tech Stack

## Core

Python 3.11
JavaScript ES6+

## Backend

Django
Django REST Framework
FastAPI
PostgreSQL
Redis

## Frontend

React
Vite
TailwindCSS
Shadcn UI
Axios

## AI & Voice

LiveKit
Deepgram
Groq
Llama‑3

## DevOps

Docker
Docker Compose
Nginx

---

# 🚀 Quick Start

## 1 Clone Repository

```
git clone https://github.com/YOUR_USERNAME/Nexus-AI-Manager.git
cd Nexus-AI-Manager
```

---

## 2 Environment Variables

```
cp .env.example .env
```

Fill in:

```
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_SECRET=

DEEPGRAM_API_KEY=

GROQ_API_KEY=
```

---

## 3 Start Containers

```
docker compose up --build -d
```

Wait until all containers are healthy.

---

## 4 Create Django Superuser

```
docker exec -it ai_voice_backend python manage.py createsuperuser
```

---

# 🎤 Usage

Open:

```
http://localhost
```

Login and start voice session.

Example command:

> "Nexus create project Mars Colony"

Dashboard updates immediately.

---

# 📂 Project Structure

```
Nexus-AI-Manager

ai_voice_gateway/
    nginx.conf

backend/
    django_project

realtime_api/
    websocket server

frontend/
    react dashboard

services/
    ai-worker/
        agent.py
        tools.py

postgres/
redis/

docker-compose.yml
README.md
```

---

# 🗺️ Development Roadmap

| Version | Status      | Description             |
| ------- | ----------- | ----------------------- |
| v0.4    | Completed   | Core platform           |
| v0.5    | Completed   | API Gateway security    |
| v0.6    | Completed   | AI tool execution       |
| v0.7    | In progress | Celery async processing |
| v0.8    | Planned     | AI memory layer         |
| v1.0    | Planned     | Production deployment   |

---

# ☁️ Future Improvements

Planned features:

• Celery distributed workers
• vector database memory
• GitHub integration
• Slack integration
• automated sprint planning
• AI meeting summaries

---

# 🧪 Production Deployment (Planned)

Future deployment target:

```
Cloud Infrastructure

AWS / GCP
      │
Kubernetes Cluster
      │
Ingress Controller
      │
Microservices Pods
      │
Managed PostgreSQL
```

CI/CD pipeline will include:

• GitHub Actions
• Docker image builds
• automated deployment

---

# 🤝 Contributing

1 Fork repository

2 Create branch

```
git checkout -b feature/my-feature
```

3 Commit

```
git commit -m "feat: add capability"
```

4 Push

```
git push origin feature/my-feature
```

5 Open Pull Request

---

# 👨‍💻 Author

**Hammad Ibrahim**

Backend & AI Engineer
Project Nexus Lead

---

# ⭐ Support

If you find this project useful:

⭐ Star the repository

or contribute to help improve Nexus.

