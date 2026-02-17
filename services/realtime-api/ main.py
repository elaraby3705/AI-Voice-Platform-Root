# manage.py 
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis  # Use the async redis client
import json
import os
import asyncio

app = FastAPI(title="Nexus Real-Time Service")

# 1. CORS Configuration (Allow Frontend to communicate with Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Redis Configuration
# Retrieve connection details from environment variables
REDIS_URL = f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', 6379)}"


class ConnectionManager:
    """
    Connection Manager: Handles storing all currently connected WebSocket clients.
    """

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 New Client Connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"🔌 Client Disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"❌ Error sending message: {e}")


manager = ConnectionManager()


# 3. Redis Listener Function (Runs in the background)
async def redis_listener():
    """
    Acts as a permanent 'radar'.
    Listens to the Redis channel 'events:projects' and distributes messages
    to all connected WebSocket clients.
    """
    print("🎧 Redis Listener Started...")
    try:
        # Establish async connection to Redis
        r = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        async with r.pubsub() as pubsub:
            await pubsub.subscribe("events:projects")

            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    print(f"📨 Received from Redis: {data}")
                    # Send the message immediately to the frontend
                    await manager.broadcast(data)
    except Exception as e:
        print(f"❌ Redis Connection Error: {e}")


# 4. Start the listener on application startup
@app.on_event("startup")
async def startup_event():
    # Run the listener as a background task
    asyncio.create_task(redis_listener())


# 5. Main WebSocket Endpoint
@app.websocket("/ws/projects")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection open (Heartbeat)
            # This waits for messages from the client, keeping the socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)