# 🎙️ Project Nexus: AI Voice Agent Microservice Documentation

## 1. Executive Summary
This document details the architecture, configuration, and implementation of the **Project Nexus AI Voice Agent**. This microservice is designed to handle real-time, low-latency voice conversations by orchestrating a pipeline of best-in-class AI models.

**Key Achievement:**
Successfully migrated from a standard OpenAI stack to a **High-Performance / Zero-Cost Stack**, achieving sub-500ms latency using Groq LPU inference and Deepgram.

---

## 2. Architecture & Technology Stack

The agent operates as a containerized worker that connects to a LiveKit Room. It functions on a "Listen-Think-Speak" loop.

| Component | Technology | Model / Version | Function |
| :--- | :--- | :--- | :--- |
| **Transport** | **LiveKit** | WebRTC | Manages real-time audio streaming and room connectivity. |
| **STT (Ears)** | **Deepgram** | `nova-2` | **Speech-to-Text:** Converts user audio to text instantly with high accuracy. |
| **LLM (Brain)** | **Groq** | `llama-3.3-70b-versatile` | **Intelligence:** Processes logic on LPUs (Language Processing Units) for extreme speed. |
| **TTS (Mouth)** | **Deepgram** | `aura-asteria-en` | **Text-to-Speech:** Converts AI text response to human-like speech. |
| **VAD** | **Silero** | VAD v4 | **Voice Activity Detection:** Detects when the user starts/stops talking to handle interruptions. |

---

## 3. Configuration

The service relies on environment variables for authentication. These are injected via `docker-compose.yml`.

### Required Environment Variables (`.env`)

```ini
# --- LiveKit Configuration (Connectivity) ---
# The WebSocket URL for your LiveKit Cloud or Self-hosted instance
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxx...
LIVEKIT_API_SECRET=Secretxxxx...

# --- Deepgram Configuration (Hearing & Speaking) ---
DEEPGRAM_API_KEY=dg_xxxx...

# --- Groq Configuration (Thinking) ---
# NOTE: Must use a key starting with 'gsk_', not 'sk-'
GROQ_API_KEY=gsk_xxxx...
```
## 4. Implementation Details
The core logic is encapsulated in `agent.py`. It uses the `livekit-agents` Python SDK to manage the pipeline.Core Code Structure `(agent.py)`

```python 
import logging
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, deepgram, groq

load_dotenv()
logger = logging.getLogger("ai-agent")

async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the AI Worker.
    """
    # 1. Connect to the Room
    logger.info(f"🔗 Connecting to room: {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # 2. Wait for a User to Join
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User joined: {participant.identity}")
    
    # 3. Initialize the Voice Pipeline
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),                          # Voice Activity Detection
        stt=deepgram.STT(),                             # Hearing (Deepgram Nova-2)
        llm=groq.LLM(model="llama-3.3-70b-versatile"), # Brain (Groq LPU)
        tts=deepgram.TTS(),                             # Speaking (Deepgram Aura)
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are a helpful assistant for Project Nexus. "
                "Keep responses concise and friendly."
            ),
        ),
    )

    # 4. Start the Conversation
    agent.start(ctx.room, participant)
    
    # 5. Initial Greeting
    await agent.say("Hello! I am fully operational on the new zero-latency stack.", allow_interruptions=True)

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```
## 5. Docker Integration
The service is fully containerized to ensure consistency between `development` and `production` environments.

### Dockerfile Summary
- **Base Image:** `python:3.11-slim-bookworm`
- **Dependencies:** `build-essential (for compiling C extensions)`.
- **Python Packages:** `livekit-agents`, `livekit-plugins-groq`, `livekit-plugins-deepgram`.

### Deployment Command
To build and start the service alongside the backend:
```bash
docker compose up -d --build ai_worker
```
## 6. Troubleshooting Guide
These are specific issues encountered during development and their resolutions.

### Issue A: The "Ghost Code" (Docker Caching)
- **Symptom:** Logs showed errors related to livekit.plugins.openai even after the code was updated to use groq.
- **Root Cause:** Docker cached an old layer of the image containing the previous agent.py.
- **Resolution:**
```bash
# Force remove container and image
docker rm -f ai_voice_agent
docker rmi -f ai-voice-platform-root-ai_agent

# Prune build cache
docker builder prune -f

# Rebuild
docker compose up --build --force-recreate -d ai_agent
```
### Issue B: "Model Decommissioned" Error
- **Symptom:** `API Error 400 from Groq`: `The model llama3-8b-8192` has been decommissioned.
- **Root Cause:** Groq deprecated the older `Llama 3 model`.
- **Resolution:** Updated `agent.py` to use the latest supported model: `llama-3.3-70b-versatile`.

### Issue C: "Deepgram connection closed unexpectedly"
- **Symptom:** `APIStatusError` appears in logs when the session ends.
- **Root** Cause: A race condition where the Python process terminates the network connection while the Deepgram socket is still open.
- **Resolution:** This is a harmless warning indicating the user disconnected successfully. No action required.

## 7. Verification Steps
To ensure the system is working correctly:
#### 1. Restart the Service:
```bash
docker restart ai_voice_agent
```
#### 2. Monitor Logs:
```Bash
docker logs -f ai_voice_agent
```

#### 3. Expected Output:

- **INFO ai-agent** - 🔗 `Connecting to room...`
- **INFO livekit.agents** - `registered worker...`
- **INFO ai-agent** - 🤖 `Agent starting...`

4. **Functional Test:** Use the Frontend or LiveKit Playground to join the room. The agent should greet you immediately.