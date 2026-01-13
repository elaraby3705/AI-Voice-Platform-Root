import logging
import json
import asyncio
from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobRequest,
    WorkerOptions,
    cli,
    llm
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, deepgram, groq

load_dotenv()

# 1. Setup Logging
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

# ---------------------------------------------------------
# 🚀 PERFORMANCE FIX: Global Model Pre-loading
# We load heavy models (VAD) here once when the server starts.
# This prevents the "initialization timed out" error when users join.
# ---------------------------------------------------------
vad_model = None
try:
    logger.info("⚙️ Pre-loading Silero VAD model...")
    vad_model = silero.VAD.load()
    logger.info("✅ VAD model loaded successfully.")
except Exception as e:
    logger.error(f"❌ Failed to pre-load VAD model: {e}")


async def entrypoint(ctx: JobContext):
    """
    Main logic: Executed for every new user connection.
    """
    logger.info(f"✅ CONNECTED to room: {ctx.room.name}")

    # 1. Connect to LiveKit
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 2. Wait for user identification
    participant = await ctx.wait_for_participant()

    # ---------------------------------------------------------
    # 3. Parse User Preferences (Metadata from Token)
    # ---------------------------------------------------------
    selected_voice_alias = "sarah"
    user_name = "User"

    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            # Extract voice and username
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
            logger.info(f"📋 User Config: Voice={selected_voice_alias}, User={user_name}")
        except Exception as e:
            logger.warning(f"⚠️ Metadata parse error: {e}")

    # Map frontend aliases to Deepgram Aura models
    deepgram_voices = {
        "sarah": "aura-asteria-en",  # Default Female
        "marcus": "aura-orion-en",  # Deep Male
        "nova": "aura-luna-en",  # Soft Female
        "echo": "aura-arcas-en",  # Calm Male
    }

    # ROBUSTNESS FIX: .strip() removes accidental spaces from URL params
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # ---------------------------------------------------------
    # 4. Define Agent Pipeline
    # ---------------------------------------------------------
    agent = VoicePipelineAgent(
        # Use the globally pre-loaded VAD (Critical for speed)
        vad=vad_model if vad_model else silero.VAD.load(),

        # Use Nova-2 model for faster, cheaper STT
        stt=deepgram.STT(model="nova-2-general"),

        llm=groq.LLM(model="llama-3.1-8b-instant"),

        # Apply the dynamic voice model here
        tts=deepgram.TTS(model=target_model),

        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                f"You are Nexus, a smart AI assistant talking to {user_name}. "
                "You are concise, friendly, and professional. "
                "Do not use markdown symbols in your speech."
            ),
        ),
    )

    # Start the assistant
    agent.start(ctx.room, participant)

    # ---------------------------------------------------------
    # 5. Real-time Transcript Broadcasting
    # ---------------------------------------------------------

    # Broadcast AI responses to Frontend
    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        # Create JSON payload
        payload = json.dumps({
            "type": "transcript",
            "sender": "ai",
            "text": msg.content,
            "timestamp": 0
        })

        # Send via Data Channel
        asyncio.create_task(ctx.room.local_participant.publish_data(
            payload.encode("utf-8"),
            reliable=True
        ))
        logger.debug(f"📤 Sent transcript: {msg.content[:20]}...")

    # (Optional) Broadcast User speech
    @agent.on("user_speech_committed")
    def on_user_speech_committed(msg: llm.ChatMessage):
        payload = json.dumps({
            "type": "transcript",
            "sender": "user",
            "text": msg.content
        })
        asyncio.create_task(ctx.room.local_participant.publish_data(
            payload.encode("utf-8"),
            reliable=True
        ))

    # Initial Greeting
    logger.info("🎙️ Agent is listening...")
    await agent.say(f"Welcome back, {user_name}. Systems online.", allow_interruptions=True)


# 6. Job Dispatch Handler
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📩 Accepting job for room: {req.room.name}")
    await req.accept()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
    ))