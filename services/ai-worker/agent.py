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
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, deepgram, groq

load_dotenv()

# ---------------------------------------------------------
# 1. Advanced Logging Configuration
# ---------------------------------------------------------
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

# ---------------------------------------------------------
# 🚀 PERFORMANCE: Global Model Pre-loading
# Load VAD once at startup to eliminate boot latency.
# ---------------------------------------------------------
vad_model = None
try:
    logger.info("⚙️ Pre-loading Silero VAD model...")
    vad_model = silero.VAD.load()
    logger.info("✅ VAD model loaded successfully.")
except Exception as e:
    logger.critical(f"❌ FATAL: Failed to pre-load VAD model: {e}")


# ---------------------------------------------------------
# 2. Helper: Context Manager (Future-Proofing for PDF)
# ---------------------------------------------------------
def build_system_prompt(user_name: str, project_context: str = None) -> str:
    """
    Constructs the AI persona.
    'project_context' will later hold the extracted PDF text.
    """
    base_prompt = (
        f"You are Nexus, an advanced AI assistant talking to {user_name}. "
        "You are concise, professional, and friendly. "
        "Do not use markdown symbols (like * or #) in your speech, as it is being synthesized to audio. "
        "Keep responses under 3 sentences unless asked for a detailed explanation."
    )

    if project_context:
        base_prompt += f"\n\nCONTEXT FROM USER DOCUMENT:\n{project_context}\n"
        base_prompt += "Use the context above to answer the user's questions."

    return base_prompt


async def entrypoint(ctx: JobContext):
    """
    Main Agent Entrypoint.
    Runs a fresh instance for every unique room session.
    """
    # Log session details for debugging
    logger.info(f"✅ CONNECTED to Room: {ctx.room.name} | Job ID: {ctx.job.id}")

    # 1. Connect to LiveKit (Audio Only)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 2. Wait for a human user
    participant = await ctx.wait_for_participant()

    # 3. Parse Metadata (User Preferences)
    selected_voice_alias = "sarah"
    user_name = "User"
    project_id = "default"

    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
            project_id = meta.get("project_id", "default")
            logger.info(f"📋 Config: Voice='{selected_voice_alias}', User='{user_name}', Project='{project_id}'")
        except Exception as e:
            logger.warning(f"⚠️ Metadata parse warning: {e}")

    # 4. Map Voice Selection to Deepgram Models
    deepgram_voices = {
        "sarah": "aura-asteria-en",  # Default Female
        "marcus": "aura-orion-en",  # Deep Male
        "nova": "aura-luna-en",  # Soft Female
        "echo": "aura-arcas-en",  # Calm Male
    }
    # Robust lookup: strip whitespace, lowercase, fallback to Sarah
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # 5. Configure Conversational Dynamics (Turn Detection)
    # This makes the bot smarter about when to interrupt vs. when to listen.
    turn_options = {
        "min_speech_duration": 0.1,  # Ignore extremely short noises
        "end_of_speech_silence": 0.6,  # Wait 0.6s of silence before replying (Natural pause)
        "interrupt_speech_duration": 0.3  # Allow user to interrupt if they speak for 0.3s
    }

    # 6. Initialize Agent Pipeline
    agent = VoicePipelineAgent(
        # VAD: Use globally pre-loaded model
        vad=vad_model if vad_model else silero.VAD.load(),

        # STT: Nova-2 is the fastest option currently
        stt=deepgram.STT(model="nova-2-general"),

        # LLM: Llama 3.1 Instant via Groq
        llm=groq.LLM(model="llama-3.1-8b-instant"),

        # TTS: Dynamic model based on user selection
        tts=deepgram.TTS(model=target_model),

        # Turn Detector: Applies the natural pause logic
        turn_detector=silero.TurnDetector(**turn_options),

        # Chat Context: Uses our builder function
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=build_system_prompt(user_name)
            # Note: In the next step, we will inject fetched PDF text here.
        ),
    )

    # Start the agent
    agent.start(ctx.room, participant)

    # ---------------------------------------------------------
    # 7. Event Handlers (Transcripts & Cleanup)
    # ---------------------------------------------------------

    # Broadcast AI Response
    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        payload = json.dumps({
            "type": "transcript",
            "sender": "ai",
            "text": msg.content,
            "timestamp": 0
        })
        asyncio.create_task(ctx.room.local_participant.publish_data(
            payload.encode("utf-8"),
            reliable=True
        ))
        logger.debug(f"📤 AI: {msg.content[:30]}...")

    # Broadcast User Speech
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

    # Graceful Disconnect Handler
    @ctx.room.on("disconnected")
    def on_room_disconnected(reason):
        logger.info(f"🚪 Room disconnected: {reason}. Cleaning up agent resources.")
        # Any specific cleanup (like saving chat history to DB) would go here

    # 8. Initial Greeting
    logger.info(f"🎙️ Agent active with voice: {target_model}")
    await agent.say(f"Welcome back, {user_name}. Systems online.", allow_interruptions=True)


# ---------------------------------------------------------
# 9. Job Dispatch & Server Configuration
# ---------------------------------------------------------
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📩 Job Request: {req.room.name}")
    await req.accept()


if __name__ == "__main__":
    # 🚀 CRITICAL FIX: initialization_timeout
    # Increased to 60.0s to prevent 'killing process' errors on slower boots.
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
        initialization_timeout=60.0,
    ))