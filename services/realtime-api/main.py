from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as aioredis  # Async Redis client for high-performance WebSockets
import redis  # Standard Sync Redis client for simple health checks
import os
import asyncio
import json

app = FastAPI(title="Nexus Real-Time Service")

# ==========================================
# 1. Environment & Connection Configuration
# ==========================================
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}"

# CORS Configuration
# Allows the Frontend to communicate with this Backend
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # In production, replace '*' with your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 2. WebSocket Connection Manager
# ==========================================
class ConnectionManager:
    """
    Manages all active WebSocket connections.
    Handles connecting, disconnecting, and broadcasting messages to clients.
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
        """Broadcasts a message to all currently connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"❌ Error sending message: {e}")


manager = ConnectionManager()


# ==========================================
# 3. Redis Listener (Background Task)
# ==========================================
async def redis_listener():
    """
    Acts as a 'Radar': Listens to the Redis channel 'events:projects'
    and instantly distributes received messages to all connected WebSockets.
    """
    print("🎧 Redis Listener Started...")
    try:
        # Use aioredis for non-blocking async operations
        r = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        async with r.pubsub() as pubsub:
            await pubsub.subscribe("events:projects")

            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    print(f"📨 Received from Redis: {data}")
                    # Broadcast the data to frontend immediately
                    await manager.broadcast(data)
    except Exception as e:
        print(f"❌ Redis Connection Error: {e}")


@app.on_event("startup")
async def startup_event():
    # Start the Redis listener as a background task when the app starts
    asyncio.create_task(redis_listener())


# ==========================================
# 4. API Endpoints (WebSocket + HTTP)
# ==========================================

# Main WebSocket Endpoint
@app.websocket("/ws/projects")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive (Heartbeat)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Health Check Endpoint (Critical for Docker/K8s)
@app.get("/health")
async def health_check():
    """
    Verifies that the service is running and can connect to Redis.
    """
    redis_status = "unknown"
    try:
        # Use standard sync redis client for a quick check
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_connect_timeout=1)
        r.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "service": "nexus-realtime",
        "redis": redis_status
    }


@app.get("/")
async def root():
    return {"message": "Nexus Real-Time API is running 🚀"}