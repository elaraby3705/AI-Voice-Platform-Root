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
    turn_detector, # 1. ✅ Added turn_detector import
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
# ---------------------------------------------------------
vad_model = None
try:
    logger.info("⚙️ Pre-loading Silero VAD model...")
    vad_model = silero.VAD.load()
    logger.info("✅ VAD model loaded successfully.")
except Exception as e:
    logger.critical(f"❌ FATAL: Failed to pre-load VAD model: {e}")


# ---------------------------------------------------------
# 2. Helper: Context Manager
# ---------------------------------------------------------
def build_system_prompt(user_name: str, project_context: str = None) -> str:
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
    logger.info(f"✅ CONNECTED to Room: {ctx.room.name} | Job ID: {ctx.job.id}")

    # 1. Connect to LiveKit
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 2. Wait for user
    participant = await ctx.wait_for_participant()

    # 3. Parse Metadata
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

    # 4. Voice Mapping
    deepgram_voices = {
        "sarah": "aura-asteria-en",
        "marcus": "aura-orion-en",
        "nova": "aura-luna-en",
        "echo": "aura-arcas-en",
    }
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # 5. Initialize Agent Pipeline
    agent = VoicePipelineAgent(
        # VAD
        vad=vad_model if vad_model else silero.VAD.load(),

        # STT
        stt=deepgram.STT(model="nova-2-general"),

        # LLM
        llm=groq.LLM(model="llama-3.1-8b-instant"),

        # TTS
        tts=deepgram.TTS(model=target_model),

        # 🚀 2. FIX: Use EOUModel instead of silero.TurnDetector
        turn_detector=turn_detector.EOUModel(
            vad=vad_model if vad_model else silero.VAD.load(),
            min_end_of_speech_duration=0.6
        ),

        # Chat Context
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=build_system_prompt(user_name)
        ),
    )

    agent.start(ctx.room, participant)

    # 7. Event Handlers
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

    @ctx.room.on("disconnected")
    def on_room_disconnected(reason):
        logger.info(f"🚪 Room disconnected: {reason}. Cleaning up agent resources.")

    # 8. Initial Greeting
    logger.info(f"🎙️ Agent active with voice: {target_model}")
    await agent.say(f"Welcome back, {user_name}. Systems online.", allow_interruptions=True)


async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📩 Job Request: {req.room.name}")
    await req.accept()


if __name__ == "__main__":
    # ✅ FIX: No initialization_timeout
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
    ))