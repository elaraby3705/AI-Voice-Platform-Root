# api_client.py

import os
import httpx
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging to monitor AI actions in the terminal
logger = logging.getLogger("api_client")
logger.setLevel(logging.INFO)


class NexusAPIClient:
    """
    This class acts as the 'Voice' and 'Hands' of the AI.
    Responsibility: Communicate with the Django Backend.
    """

    def __init__(self):
        # Load settings from .env file
        self.base_url = os.getenv("API_BASE_URL", "http://backend:8000/api")
        self.username = os.getenv("NEXUS_API_USERNAME", "admin")
        self.password = os.getenv("NEXUS_API_PASSWORD", "admin")
        self.token = None
        # Use AsyncClient for speed and to avoid blocking voice processing
        self.client = httpx.AsyncClient(timeout=10.0)

    async def _authenticate(self):
        """
        Performs login and retrieves the JWT Access Token.
        """
        try:
            payload = {"username": self.username, "password": self.password}
            # Send request to the backend
            response = await self.client.post(f"{self.base_url}/token/", json=payload)
            response.raise_for_status()

            # Save token for subsequent requests
            self.token = response.json().get("access")
            logger.info("🔐 Nexus API: Authentication successful (I am in!)")
        except Exception as e:
            logger.error(f"❌ Nexus API Auth Failed: {e}")
            self.token = None

    async def create_project(self, name: str, description: str):
        """
        Function: Create a Project Entity
        """
        # If no token exists, authenticate first
        if not self.token:
            await self._authenticate()

        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {"name": name, "description": description}

        try:
            response = await self.client.post(
                f"{self.base_url}/projects/",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            logger.info(f"✅ Action Executed: Project '{name}' created.")
            return f"Success! I have created the project '{name}'."
        except httpx.HTTPStatusError as e:
            logger.error(f"❌ API Error: {e.response.text}")
            return "I tried to create the project, but the system refused."
        except Exception as e:
            logger.error(f"❌ Connection Error: {e}")
            return "I cannot reach the database right now."

    async def get_projects(self):
        """
        Function: Retrieve Project Entities
        """
        if not self.token:
            await self._authenticate()

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = await self.client.get(
                f"{self.base_url}/projects/",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            if not data:
                return "You have no active projects."

            # Format data so the AI can read it as a single sentence
            project_list = ", ".join([f"{p['name']}" for p in data])
            return f"Current Projects: {project_list}"
        except Exception as e:
            return "Could not fetch project list."

    async def close(self):
        await self.client.aclose()