import logging
import asyncio
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
# 1. UPDATED IMPORTS: Added deepgram
from livekit.plugins import openai, silero, deepgram

# 2. Load environment variables (API Keys)
load_dotenv()

# 3. Configure Logging
logger = logging.getLogger("ai-agent")
logger.setLevel(logging.INFO)


async def entrypoint(ctx: JobContext):
    """
    This function runs every time a user joins the room.
    It initializes the AI Agent for that specific user.
    """
    logger.info(f"🔗 Connecting to room: {ctx.room.name}")

    # 4. Connect to the LiveKit Room (Audio Only)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 5. Wait for a user to join
    participant = await ctx.wait_for_participant()
    logger.info(f"👤 User joined: {participant.identity}")

    # 6. Define the AI Agent (The "Brain")
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),  # Voice Activity Detection

        # ✅ CHANGED: Using Deepgram for Hearing (STT)
        # This fixes the "Quota Exceeded" error on the listening part.
        stt=deepgram.STT(),

        # ⚠️ NOTE: Still using OpenAI for Thinking and Speaking.
        # If the crash persists during "Thinking...", we will need to swap LLM/TTS too.
        llm=openai.LLM(),
        tts=openai.TTS(),

        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                "You are a helpful voice assistant for the 'Project Nexus' platform. "
                "You are concise, friendly, and professional. "
                "Keep your responses short (under 2 sentences) unless asked to elaborate."
            ),
        ),
    )

    # 7. Start the Agent
    agent.start(ctx.room, participant)

    # 8. Greeting
    logger.info("🤖 Agent starting...")
    await agent.say("Hello! I am connected and ready. How can I help you today?", allow_interruptions=True)


if __name__ == "__main__":
    # This runs the worker listener
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))