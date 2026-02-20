from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as aioredis  
import redis  
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

# 🛠️ IMPROVED CORS: Allow multiple origins or use wildcard for Docker Dev
# Using "*" is safer during local development with Port Forwarding
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if FRONTEND_URL == "*" else FRONTEND_URL.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. WebSocket Connection Manager
# ==========================================
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"🔌 Client Tunnel Established. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"🔌 Client Disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Broadcasts a message to all currently connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Silently handle stale connections
                pass

manager = ConnectionManager()

# ==========================================
# 3. Redis Listener (Background Task)
# ==========================================
async def redis_listener():
    """
    Acts as a 'Radar': Listens to Redis channel 'events:projects'
    and pushes data to the UI via WebSockets.
    """
    print("🎧 Listening to Redis Channel: events:projects")
    try:
        r = aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
        async with r.pubsub() as pubsub:
            await pubsub.subscribe("events:projects")
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    print(f"📨 Syncing Data to UI: {data}")
                    await manager.broadcast(data)
    except Exception as e:
        print(f"❌ Redis Pub/Sub Error: {e}")
        await asyncio.sleep(5) # Retry after 5 seconds
        asyncio.create_task(redis_listener())

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_listener())

# ==========================================
# 4. API Endpoints (Handshaking)
# ==========================================

# 🛑 PATH FIX: Added trailing slash to match Vite Proxy 'rewrite' logic
@app.websocket("/ws/projects/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection & listen for potential client heartbeats
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"⚠️ Socket Loop Exception: {e}")
        manager.disconnect(websocket)

@app.get("/health")
async def health_check():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_connect_timeout=1)
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception as e:
        return {"status": "error", "redis": str(e)}

@app.get("/")
async def root():
    return {"message": "Nexus Real-Time API is running 🚀"}
