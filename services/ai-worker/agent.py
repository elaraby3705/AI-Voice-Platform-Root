import logging
import asyncio
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero

# 1. Load environment variables (API Keys)
load_dotenv()

# 2. Configure Logging (So we can see what's happening in Docker logs)
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)

async def entrypoint(ctx: JobContext):
    """
    This function runs every time a user joins the room.
    It initializes the AI Agent for that specific user.
    """
    logger.info(f"🔗 Connecting to room: {ctx.room.name}")

    # 3. Connect to the LiveKit Room (Audio Only)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 4. Wait for a user to join
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User joined: {participant.identity}")

    # 5. Define the AI Agent (The "Brain")
    # We use OpenAI for everything (Listening, Thinking, Speaking) to keep it simple.
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),                  # Voice Activity Detection (Knows when you stop talking)
        stt=openai.STT(),                       # Speech-to-Text (Ears)
        llm=openai.LLM(),                       # Language Model (Brain - GPT-4o)
        tts=openai.TTS(),                       # Text-to-Speech (Mouth)
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are a helpful voice assistant for the 'Project Nexus' platform. "
                "You are concise, friendly, and professional. "
                "Keep your responses short (under 2 sentences) unless asked to elaborate."
            ),
        ),
    )

    # 6. Start the Agent
    agent.start(ctx.room, participant)

    # 7. Greeting
    logger.info("🤖 Agent starting...")
    await agent.say("Hello! I am connected and ready. How can I help you today?", allow_interruptions=True)


if __name__ == "__main__":
    # This runs the worker listener
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))