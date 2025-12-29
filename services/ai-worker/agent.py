import logging
import asyncio
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, deepgram, groq

load_dotenv()

logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

async def entrypoint(ctx: JobContext):
    """
    Entrypoint for the Project Nexus AI Voice Agent.
    Stack: LiveKit (WebRTC) + Deepgram (STT/TTS) + Groq (LLM).
    """
    logger.info(f"🔗 Connecting to room: {ctx.room.name}")

    # Connect to LiveKit
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User joined: {participant.identity}")

    # Define the Agent Pipeline
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),                  # Voice Activity Detection
        stt=deepgram.STT(),                     # Ears: Deepgram Nova-2
        llm=groq.LLM(model="llama-3.3-70b-versatile"), # Brain: Groq LPU (Llama 3.3)
        tts=deepgram.TTS(),                     # Mouth: Deepgram Aura
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are a helpful voice assistant for Project Nexus. "
                "You are concise, friendly, and professional. "
                "Keep your responses short (under 2 sentences) unless asked to elaborate."
            ),
        ),
    )

    # Start the Agent
    agent.start(ctx.room, participant)

    logger.info("🤖 Agent starting... (Stack: Deepgram + Groq Llama 3.3)")
    await agent.say("Hello! I am fully operational on the new zero-latency stack. How can I help?", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
    