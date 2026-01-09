import logging
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

# 1. Enable DEBUG logs to see hidden errors
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.DEBUG)


async def entrypoint(ctx: JobContext):
    """
    Main logic: executed when the Agent successfully joins a room.
    """
    logger.info(f"✅ CONNECTED to room: {ctx.room.name}")
    logger.info(f"🔗 Room ID: {ctx.room.sid}")

    # Connect to LiveKit
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for the user to speak/join
    logger.info("⏳ Waiting for user...")
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User found: {participant.identity}")

    # Define the Agent Pipeline
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=groq.LLM(model="llama-3.3-70b-versatile"),
        tts=deepgram.TTS(),
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are Nexus, a smart AI assistant. "
                "You are concise, friendly, and professional. "
            ),
        ),
    )

    # Start the Agent
    agent.start(ctx.room, participant)

    logger.info("🎙️ Agent is listening...")
    await agent.say("System online. I am listening.", allow_interruptions=True)


# 2. THE FIX: Explicitly accept job requests without arguments
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📩 JOB REQUEST RECEIVED for room: {req.room.name}")

    # FIXED: Removed 'entrypoint' argument.
    # accept() should be called empty in this version.
    await req.accept()


if __name__ == "__main__":
    # 3. Register the request_fnc
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        request_fnc=request_fnc,  # <--- This ensures we capture the dispatch
    ))