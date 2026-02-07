import os
import httpx
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging to monitor AI actions in the console
logger = logging.getLogger("api_client")
logger.setLevel(logging.INFO)


class NexusAPIClient:
    """
    The 'Hands' of the AI Agent.
    Responsibility: Handle authentication and CRUD operations with the Django Backend (v1 API).
    """

    def __init__(self):
        # 1. Load configuration strictly from environment variables
        # We do NOT use hardcoded defaults for security reasons.
        self.base_url = os.getenv("API_BASE_URL")
        self.email = os.getenv("NEXUS_API_USERNAME")
        self.password = os.getenv("NEXUS_API_PASSWORD")

        # 2. Validate configuration (Fail Fast)
        if not self.base_url:
            raise ValueError("❌ CRITICAL: API_BASE_URL is missing in .env file.")

        if not self.email or not self.password:
            raise ValueError("❌ CRITICAL: NEXUS_API_USERNAME or PASSWORD missing in .env file.")

        self.token = None

        # 3. Initialize Async Client
        # We use asynchronous HTTP requests to prevent blocking the voice processing pipeline.
        self.client = httpx.AsyncClient(timeout=10.0)

    async def _authenticate(self):
        """
        Internal method to log in and retrieve the JWT Access Token.
        Endpoint: /auth/login/
        """
        try:
            # Prepare the login payload (Using Email as identifier)
            payload = {"email": self.email, "password": self.password}

            # Construct the full URL
            # Example: http://backend:8000/api/v1/auth/login/
            auth_url = f"{self.base_url}/auth/login/"

            logger.info(f"🔄 Nexus API: Authenticating as {self.email}...")

            response = await self.client.post(auth_url, json=payload)
            response.raise_for_status()

            data = response.json()

            # Try to find the token in the response (Compatible with SimpleJWT and DRF Auth)
            self.token = data.get("access") or data.get("token") or data.get("key")

            if self.token:
                logger.info("🔐 Nexus API: Authentication successful (Token Acquired).")
            else:
                logger.error(f"❌ Auth Failed: Token not found in response keys: {data.keys()}")

        except httpx.HTTPStatusError as e:
            logger.error(f"❌ API Auth Error: {e.response.status_code} - {e.response.text}")
            self.token = None
        except Exception as e:
            logger.error(f"❌ Connection Error during Auth: {e}")
            self.token = None

    async def create_project(self, name: str, description: str) -> str:
        """
        Tool: Create a new project in the database.
        Endpoint: POST /projects/
        """
        # Ensure we are authenticated
        if not self.token:
            await self._authenticate()

        if not self.token:
            return "I am unable to authenticate with the database system."

        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {"name": name, "description": description}

        try:
            logger.info(f"🛠️ Attempting to create project: '{name}'...")

            response = await self.client.post(
                f"{self.base_url}/projects/",
                json=payload,
                headers=headers
            )
            response.raise_for_status()

            logger.info(f"✅ Success: Project '{name}' created in database.")
            return f"Done. I have successfully created the project '{name}'."

        except httpx.HTTPStatusError as e:
            logger.error(f"❌ API Error: {e.response.text}")
            return "I tried to create the project, but the system refused the request."
        except Exception as e:
            logger.error(f"❌ Network Error: {e}")
            return "I cannot reach the project database at the moment."

    async def get_projects(self) -> str:
        """
        Tool: Retrieve a list of active projects.
        Endpoint: GET /projects/
        """
        if not self.token:
            await self._authenticate()

        if not self.token:
            return "Authentication failed."

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = await self.client.get(
                f"{self.base_url}/projects/",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            # Handle Pagination (if Django Rest Framework returns { "results": [...] })
            # If 'results' exists, use it; otherwise assume data is the list.
            projects = data.get("results", data) if isinstance(data, dict) else data

            if not projects:
                return "You have no active projects listed."

            # Extract names to create a spoken list
            # We use 'name' or 'title' just in case the model field varies
            names = [p.get('name') or p.get('title', 'Untitled') for p in projects]

            # Join the names with commas for natural speech
            project_list_str = ", ".join(names)
            return f"I found the following projects: {project_list_str}."

        except Exception as e:
            logger.error(f"❌ Read Error: {e}")
            return "I was unable to retrieve the project list."

    async def close(self):
        """
        Closes the network client to free up resources.
        """
        await self.client.aclose()