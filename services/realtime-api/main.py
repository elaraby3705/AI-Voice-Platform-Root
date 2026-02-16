from fastapi import FastAPI
import redis
import os

app = FastAPI(title="Nexus Real-Time Service")


REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status and Redis connectivity.
    """
    redis_status = "unknown"
    try:
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
