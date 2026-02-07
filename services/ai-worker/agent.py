import logging
import json
import asyncio
from dotenv import load_dotenv
import context
# 👇 NEW: Import the Tools module ("The Hands")
from tools import ProjectManagerTools 

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
# 3. Helper: Prompt Builder (Updated for Nexus Brain 🧠 + Hands 🛠️)
# ---------------------------------------------------------
def build_system_prompt(user_name: str, project_context: str = None) -> str:
    # 1. Get the Core Personality from context.py
    nexus_core = context.get_system_prompt()

    # 2. Add Voice-Specific Constraints (Dynamic)
    voice_constraints = (
        f"\n\nSESSION CONTEXT:\n"
        f"You are currently speaking with {user_name}.\n"
        "Since this is a voice conversation:\n"
        "- Keep responses concise (under 3 sentences) unless asked for details.\n"
        "- Do NOT use markdown symbols (like * or #) as they are not spoken.\n"
        "- Be friendly but maintain the professional persona defined above.\n"
        # 👇 NEW: Explicit instruction to use tools
        "- You have REAL-TIME access to the database. If the user asks to create or list projects, "
        "use the available tools immediately. Don't just talk about it, do it."
    )

    # 3. Combine everything
    final_prompt = nexus_core + voice_constraints

    if project_context:
        final_prompt += f"\n\nACTIVE PROJECT CONTEXT:\n{project_context}\n"

    return final_prompt


async def entrypoint(ctx: JobContext):
    logger.info(f"✅ CONNECTED to Room: {ctx.room.name} | Job ID: {ctx.job.id}")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()

    # Metadata Parsing (Preserved)
    selected_voice_alias = "sarah"
    user_name = "User"
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
        except Exception:
            pass

    # Voice Mapping (Preserved)
    deepgram_voices = {
        "sarah": "aura-asteria-en",
        "marcus": "aura-orion-en",
        "nova": "aura-luna-en",
        "echo": "aura-arcas-en",
    }
    target_model = deepgram_voices.get(selected_voice_alias.lower().strip(), "aura-asteria-en")

    # 👇 NEW: Initialize the Tools (The Hands)
    # This creates the API client and prepares the functions for the agent
    project_tools = ProjectManagerTools()

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

        # 👇 NEW: Inject the tools into the agent context
        # This allows the LLM to "see" and "call" the functions in tools.py
        fnc_ctx=project_tools,
    )

    agent.start(ctx.room, participant)

    # Event Handlers (Preserved - Crucial for Frontend Transcripts)
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
        # 👇 NEW: Clean up API client connection when room closes
        # This prevents "unclosed connection" warnings in logs
        if hasattr(project_tools, 'api'):
             asyncio.create_task(project_tools.api.close())

    logger.info(f"🎙️ Agent active with voice: {target_model}")
    await agent.say(f"Welcome back, {user_name}. Nexus systems online. I am ready to manage your projects.", allow_interruptions=True)


async def request_fnc(req: JobRequest) -> None:
    await req.accept()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,
    ))