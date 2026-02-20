import os
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("api_client")


class NexusAPIClient:
    def __init__(self):
        self.base_url = os.getenv("API_BASE_URL")
        self.email = os.getenv("NEXUS_API_USERNAME")
        self.password = os.getenv("NEXUS_API_PASSWORD")
        self.client = httpx.AsyncClient(timeout=10.0)
        self.token = None

    async def _authenticate(self):
        auth_url = f"{self.base_url}/auth/login/"
        response = await self.client.post(auth_url, json={"email": self.email, "password": self.password})
        data = response.json()
        self.token = data.get("access")

    async def create_project(self, name: str, description: str, user_id: str = None) -> str:
        if not self.token:
            await self._authenticate()

        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {"name": name, "description": description}

        # Include owner_id so the backend knows who the project belongs to
        if user_id:
            payload["owner_id"] = user_id

        try:
            response = await self.client.post(f"{self.base_url}/projects/", json=payload, headers=headers)
            response.raise_for_status()
            return f"Project '{name}' created successfully for you."
        except Exception as e:
            logger.error(f"API Error: {e}")
            return "Failed to create project."

    async def close(self):
        await self.client.aclose()