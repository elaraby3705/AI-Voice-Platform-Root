import logging
import asyncio
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
# Imports: Using Deepgram for Audio and Groq for Intelligence
from livekit.plugins import silero, deepgram, groq

# 1. Load environment variables
load_dotenv()

# 2. Configure Logging
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the AI Agent.
    """
    logger.info(f"🔗 Connecting to room: {ctx.room.name}")

    # 3. Connect to LiveKit (Audio Only)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 4. Wait for a user to join the room
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User joined: {participant.identity}")

    # 5. Configure the Agent with Free/Fast Plugins
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),  # Voice Activity Detection

        # EARS: Deepgram STT (Fast & Free Tier)
        stt=deepgram.STT(),

        # BRAIN: Groq LLM (Llama 3 - 8B Model)
        # Note: This is extremely fast and free.
        llm=groq.LLM(model="llama3-8b-8192"),

        # MOUTH: Deepgram Aura TTS
        tts=deepgram.TTS(),

        # CONTEXT: The Agent's Personality
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are a helpful voice assistant for 'Project Nexus'. "
                "You are concise, friendly, and professional. "
                "Keep your responses short (under 2 sentences) unless asked to elaborate."
            ),
        ),
    )

    # 6. Start the Agent
    agent.start(ctx.room, participant)

    # 7. Initial Greeting
    logger.info("🤖 Agent starting...")
    await agent.say("Hello! I am fully operational. How can I help you?", allow_interruptions=True)


if __name__ == "__main__":
    # Start the worker
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))