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
    #---------
    #1. User context & voice selection
    #--------
    selected_voice_alias = "sarah"
    user_name = "User"
    if participant.metadata:
        try:
            meta = json.loads(participant.metadata)
            selected_voice_alias = meta.get("voice_id", "sarah")
            user_name = meta.get("username", "Commander")
            logger.info(f"📋 User Prefs: Voice={selected_voice_alias}, User={user_name}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to parse metadata: {e}")

    # Deepgram (Aura Models)
    deepgram_voices={
        "sarah" : "aura-asteria-en",
        "marcus" : "aura-orion-en",
        "nova" : "aura-luna-en",
        "echo" : "aura-arcas-en",
    }
    target_model = deepgram_voices.get(selected_voice_alias.lower(), "aura-asteria-en")



    #2. Define the Agent Pipeline
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=groq.LLM(model="llama-3.1-8b-instant"),
        # applying the chosen voice dynamically
        tts=deepgram.TTS(model= target_model),
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=(
                f"You are Nexus, a smart AI assistant talking to {user_name}."
                "You are concise, friendly, and professional. "
                "Do not use markdown symbols in your speech "
            ),
        ),
    )

    # Start the Agent
    agent.start(ctx.room, participant)

    #-------
    #3. the missing link -- sending the transcript
    #------

    # when the AI decided to talk
    @agent.on ("agent_speech_committed")
    def on_agent_speech_committed(msg: llm.ChatMessage):
        # sending  it to the frontend as txt
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
     # voice welcome
    logger.info("🎙️ Agent is listening...")
    await agent.say(f"welcome back, {user_name} . System online.", allow_interruptions=True)


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