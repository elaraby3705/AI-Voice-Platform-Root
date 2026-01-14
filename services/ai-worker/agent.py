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
# We use INFO level to keep logs clean but visible for debugging connection events.
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

# ---------------------------------------------------------
# 🚀 PERFORMANCE OPTIMIZATION: Global Model Pre-loading
# We load heavy models (like VAD) once when the container starts.
# This prevents the "initialization timed out" loop when users join.
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
    Because we now use unique Room IDs in Django, this runs fresh
    every time a user switches voices or re-enters the studio.
    """
    logger.info(f"✅ CONNECTED to room: {ctx.room.name}")

    # 1. Connect to LiveKit
    # We subscribe to audio only to save bandwidth.
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 2. Wait for user identification
    # This ensures we don't start speaking until a human is actually present.
    participant = await ctx.wait_for_participant()

    # ---------------------------------------------------------
    # 3. Parse User Preferences (Metadata Injection)
    # This reads the JSON payload sent from Django containing
    # the specific Voice ID and Username.
    # ---------------------------------------------------------
    selected_voice_alias = "sarah"
    user_name = "User"

    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
            logger.info(f"📋 User Configuration: Voice='{selected_voice_alias}', User='{user_name}'")
        except Exception as e:
            logger.warning(f"⚠️ Metadata parse error: {e}")

    # ---------------------------------------------------------
    # 4. Voice Model Mapping
    # Maps the UI names (Sarah, Marcus) to specific Deepgram Aura models.
    # ---------------------------------------------------------
    deepgram_voices = {
        "sarah": "aura-asteria-en",  # Default Female
        "marcus": "aura-orion-en",   # Deep Male
        "nova": "aura-luna-en",      # Soft Female
        "echo": "aura-arcas-en",     # Calm Male
    }

    # ROBUSTNESS: .strip() and .lower() ensure we match "Marcus" even if
    # the URL had accidental spaces or casing differences.
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # ---------------------------------------------------------
    # 5. Define Agent Pipeline
    # ---------------------------------------------------------
    agent = VoicePipelineAgent(
        # Use the globally pre-loaded VAD (Critical for startup speed)
        vad=vad_model if vad_model else silero.VAD.load(),

        # Use Nova-2 model for faster, lower-latency STT
        stt=deepgram.STT(model="nova-2-general"),

        llm=groq.LLM(model="llama-3.1-8b-instant"),

        # Apply the dynamic voice model chosen above
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

    # Start the assistant inside the room
    agent.start(ctx.room, participant)

    # ---------------------------------------------------------
    # 6. Real-time Transcript Broadcasting
    # This sends JSON packets to the Frontend for the Chat UI.
    # ---------------------------------------------------------

    # Handler: When the AI generates text
    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        # Construct JSON payload
        payload = json.dumps({
            "type": "transcript",
            "sender": "ai",
            "text": msg.content,
            "timestamp": 0
        })

        # Send via LiveKit Data Channel (Reliable delivery)
        asyncio.create_task(ctx.room.local_participant.publish_data(
            payload.encode("utf-8"),
            reliable=True
        ))
        logger.debug(f"📤 AI Transcript sent: {msg.content[:30]}...")

    # Handler: When the User finishes speaking (Optional, for UI mirroring)
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

    # 7. Initial Greeting
    # The agent introduces itself using the selected voice.
    logger.info("🎙️ Agent is online and listening...")
    await agent.say(f"Welcome back, {user_name}. Systems online.", allow_interruptions=True)


# ---------------------------------------------------------
# 8. Job Dispatch Handler
# ---------------------------------------------------------
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📩 Incoming Job Request for room: {req.room.name}")
    # Accept the job immediately to spawn the worker
    await req.accept()


if __name__ == "__main__":
    # Start the Worker
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
    ))