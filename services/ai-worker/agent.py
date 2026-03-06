import logging
import json
import asyncio
from dotenv import load_dotenv
from tools import ProjectManagerTools
from livekit.agents import AutoSubscribe, JobContext, JobRequest, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import silero, deepgram, groq

load_dotenv()
logger = logging.getLogger("ai-agent")

async def entrypoint(ctx: JobContext):
    logger.info(f"Connected to Room: {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()

    # Extract Identity from Metadata
    user_id = None
    user_name = "User"
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            user_id = meta.get("user_id")
            user_name = meta.get("username", "Commander")
        except Exception as e:
            logger.warning(f"Failed to parse metadata: {e}")

    # Initialize Tools with the current User ID
    project_tools = ProjectManagerTools(user_id=user_id)

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=groq.LLM(),
        tts=deepgram.TTS(),
        chat_ctx=llm.ChatContext().append(role="system", text=f"Identify the user as {user_name}."),
        fnc_ctx=project_tools,
    )

    agent.start(ctx.room, participant)
    await agent.say(f"Hello {user_name}, How am I can I help you today .")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

# Ensure these event handlers are inside the entrypoint function
    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        # This sends the AI's words to the frontend via LiveKit Data Channel
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "transcript", "sender": "ai", "text": msg.content}).encode("utf-8"),
            reliable=True
        ))

    @agent.on("user_speech_committed")
    def on_user_speech_committed(msg: llm.ChatMessage):
        # This sends YOUR words to the frontend
        asyncio.create_task(ctx.room.local_participant.publish_data(
            json.dumps({"type": "transcript", "sender": "user", "text": msg.content}).encode("utf-8"),
            reliable=True
        ))