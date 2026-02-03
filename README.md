
# 🧬 Nexus: The AI-Powered Project Manager Agent

![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)
![Version](https://img.shields.io/badge/Version-0.6_Beta-blue)
![Stack](https://img.shields.io/badge/Stack-Django_|_Next.js_|_Docker-blueviolet)
![AI](https://img.shields.io/badge/AI-Llama3_8b_|_LiveKit-orange)

> **"Don't just chat with your AI. Hire it."**

**Nexus** is a Voice-First AI Agent designed to manage software projects. Unlike passive chatbots that just give advice, Nexus has **"Hands"**—it can autonomously execute backend commands, create database records, and visualize real-time data on a dashboard, all through natural voice conversation.

---

## 🌟 Key Features

* **🗣️ Real-time Voice Interface:** Ultra-low latency voice interaction using **LiveKit** & **Deepgram**. Talk naturally, interrupt anytime.
* **🧠 Intelligent Persona:** Powered by **Llama-3 (via Groq)**, configured as a professional Project Manager who understands context.
* **🛠️ AI Function Calling ("The Hands"):** The agent can connect to the internal API to:
    * Create Projects & Tasks.
    * Query Database Records.
    * Update Statuses.
* **📊 Live Dashboard:** A **Next.js** frontend that visualizes your voice actions in real-time. Say "Create Project," and watch it appear on screen instantly.
* **🐳 Microservices Architecture:** Fully containerized environment using Docker Compose for easy deployment.

---

## 🏗️ System Architecture

Nexus is built on a modern, decoupled architecture consisting of three main services:

| Service | Container Name | Description |
| :--- | :--- | :--- |
| **Frontend** | \`frontend\` | **Next.js 14** application. Handles the UI, WebRTC voice connection, and real-time data visualization. |
| **Backend** | \`backend\` | **Django REST Framework**. The "Source of Truth." Manages the PostgreSQL database, Authentication, and API endpoints. |
| **AI Worker** | \`ai_voice_agent\` | **Python (LiveKit Agents)**. The "Brain & Hands." Receives audio, processes intent with Llama-3, and calls the Backend API via an internal Client. |

---

## 🛠️ Tech Stack

* **Core:** Python 3.11, JavaScript (ES6+)
* **Backend:** Django, Django REST Framework, PostgreSQL, Redis
* **Frontend:** Next.js, React, TailwindCSS, ShadcnUI, Recharts
* **AI & Voice:** LiveKit (WebRTC), Deepgram (STT/TTS), Groq (LLM Inference)
* **DevOps:** Docker, Docker Compose, Nginx

---

## 🚀 Getting Started (Step-by-Step)

Follow these instructions to get Nexus running on your local machine in under 5 minutes.

### 1️⃣ Prerequisites
* **Docker Desktop** installed and running.
* **Git** installed.
* API Keys for:
    * [LiveKit Cloud](https://livekit.io/) (Url, Key, Secret)
    * [Deepgram](https://deepgram.com/) (API Key)
    * [Groq](https://groq.com/) (API Key)

### 2️⃣ Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/YOUR_USERNAME/Nexus-AI-Manager.git
    cd Nexus-AI-Manager
    \`\`\`

2.  **Configure Environment Variables:**
    Create a \`.env\` file in the root directory. You can copy the example:
    \`\`\`bash
    cp .env.example .env
    \`\`\`
    *Open the \`.env\` file and paste your API keys.*

    **Critical Settings for Local Docker:**
    \`\`\`env
    # Internal Networking (How AI talks to Backend)
    API_BASE_URL=http://backend:8000/api
    NEXUS_API_USERNAME=admin
    NEXUS_API_PASSWORD=admin
    \`\`\`

3.  **Build and Run with Docker:**
    \`\`\`bash
    docker-compose up --build
    \`\`\`
    *Wait until you see "System check identified no issues" in the backend logs.*

4.  **Create a Superuser (Important):**
    Open a new terminal window and run:
    \`\`\`bash
    docker exec -it backend python manage.py createsuperuser
    \`\`\`
    *(Use username: \`admin\` and password: \`admin\` to match your .env file).*

### 3️⃣ Usage

1.  **Open the Dashboard:** Go to \`http://localhost:3000\`.
2.  **Connect:** Click the microphone icon to start the voice session.
3.  **Try a Command:**
    > *"Nexus, create a new project called 'Mars Colony' with the description 'Terraforming phase one'."*
4.  **Watch the Magic:** The AI will confirm the action, and the project will appear in the table on your screen immediately.

---

## 🧪 Testing & Verification

To verify that the AI Agent can talk to the Database correctly (without speaking), run the internal connection test:

\`\`\`bash
docker exec -it ai_voice_agent python services/ai-worker/test_connection.py
\`\`\`

**Expected Output:**
> ✅ Auth Success! Token received.
> ✅ Action Executed: Project 'Test-Project' created.
> ✅ Data Retrieved.

---

## 📂 Project Structure

\`\`\`bash
Nexus-AI-Manager/
├── backend/                # Django REST API
│   ├── api/                # Endpoints & Serializers
│   └── nexus_core/         # Settings & Config
├── frontend/               # Next.js Dashboard
│   ├── app/                # React Components & Pages
│   └── lib/                # API Utilities
├── services/
│   └── ai-worker/          # The AI Agent Logic
│       ├── agent.py        # Main Voice Pipeline
│       ├── api_client.py   # Internal API Bridge ("The Hands")
│       └── tools.py        # Function Definitions for Llama-3
├── docker-compose.yml      # Container Orchestration
└── README.md               # You are here
\`\`\`

---

## 🗺️ Roadmap

| Milestone | Status | Description |
| :--- | :--- | :--- |
| **v0.1 - v0.4** | ✅ Done | Core Setup, API, UI, and Passive Voice Chat. |
| **v0.5** | ✅ Done | Context Injection & Persona Engineering. |
| **v0.6** | 🚀 **Current** | **Function Calling ("The Hands") & Real-time Actions.** |
| **v0.7** | ⏳ Pending | Session Memory & Conversation History. |
| **v1.0** | ⏳ Pending | Full MVP Release & Cloud Deployment. |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the repo.
2.  Create a branch: \`git checkout -b feature/CoolFeature\`.
3.  Commit changes: \`git commit -m 'Add CoolFeature'\`.
4.  Push to branch: \`git push origin feature/CoolFeature\`.
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.

---

### 👨‍💻 Author

**Hammad Ibrahim**
* *Backend & AI Engineer*
* *Project Nexus Lead*
