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
# 1. Logging
# ---------------------------------------------------------
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

# ---------------------------------------------------------
# 2. Pre-loading VAD
# ---------------------------------------------------------
vad_model = None
try:
    logger.info("⚙️ Pre-loading Silero VAD model...")
    vad_model = silero.VAD.load()
    logger.info("✅ VAD model loaded successfully.")
except Exception as e:
    logger.critical(f"❌ FATAL: Failed to pre-load VAD model: {e}")


# ---------------------------------------------------------
# 3. Helper: Prompt Builder
# ---------------------------------------------------------
def build_system_prompt(user_name: str, project_context: str = None) -> str:
    base_prompt = (
        f"You are Nexus, an advanced AI assistant talking to {user_name}. "
        "You are concise, professional, and friendly. "
        "Do not use markdown symbols (like * or #) in your speech. "
        "Keep responses under 3 sentences unless asked for details."
    )
    if project_context:
        base_prompt += f"\n\nCONTEXT:\n{project_context}\n"
    return base_prompt


async def entrypoint(ctx: JobContext):
    logger.info(f"✅ CONNECTED to Room: {ctx.room.name} | Job ID: {ctx.job.id}")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()

    # Metadata Parsing
    selected_voice_alias = "sarah"
    user_name = "User"
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
        except Exception:
            pass

    # Voice Mapping
    deepgram_voices = {
        "sarah": "aura-asteria-en",
        "marcus": "aura-orion-en",
        "nova": "aura-luna-en",
        "echo": "aura-arcas-en",
    }
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # Initialize Agent
    agent = VoicePipelineAgent(
        vad=vad_model if vad_model else silero.VAD.load(),

        stt=deepgram.STT(model="nova-2-general"),
        llm=groq.LLM(model="llama-3.1-8b-instant"),
        tts=deepgram.TTS(model=target_model),


        chat_ctx=llm.ChatContext().append(
            role="system",
            text=build_system_prompt(user_name)
        ),
    )

    agent.start(ctx.room, participant)

    # Event Handlers
    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "transcript", "sender": "ai", "text": msg.content}).encode("utf-8"),
            reliable=True
        ))

    @agent.on("user_speech_committed")
    def on_user_speech_committed(msg: llm.ChatMessage):
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "transcript", "sender": "user", "text": msg.content}).encode("utf-8"),
            reliable=True
        ))

    @ctx.room.on("disconnected")
    def on_room_disconnected(reason):
        logger.info(f"🚪 Room disconnected: {reason}")

    logger.info(f"🎙️ Agent active with voice: {target_model}")
    await agent.say(f"Welcome back, {user_name}. Systems online.", allow_interruptions=True)


async def request_fnc(req: JobRequest) -> None:
    await req.accept()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
    ))