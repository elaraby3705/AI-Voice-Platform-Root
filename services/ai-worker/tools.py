import logging
from typing import Annotated
from livekit.agents import llm
from api_client import NexusAPIClient

# Configure logger for tool operations
logger = logging.getLogger("tools")

class ProjectManagerTools(llm.FunctionContext):
    """
    Function context for the AI Agent to interact with the Project Management system.
    This class acts as the 'hands' of the agent, allowing it to perform database actions.
    """

    def __init__(self, user_id: str = None):
        """
        Initializes the tools with an optional user_id to ensure
        actions are performed on behalf of the correct user.
        """
        super().__init__()
        self.user_id = user_id
        # Initialize the API client to communicate with the Django backend
        self.api = NexusAPIClient()

    @llm.ai_callable(description="Create a new project in the database using a name and description.")
    async def create_project(
            self,
            name: Annotated[str, llm.TypeInfo(description="The short name of the project (e.g., 'Website Redesign')")],
            description: Annotated[str, llm.TypeInfo(description="A brief description of the project's goal")]
    ):
        """
        Invoked when the user requests to start or create a new project.
        Passes the user_id to the API client to maintain correct ownership in the database.
        """
        logger.info(f"👷 AI is attempting to create project: '{name}' for User ID: {self.user_id}")

        # Forward the request to the API client with the identified user_id
        result = await self.api.create_project(name, description, user_id=self.user_id)

        return result

    @llm.ai_callable(description="List all active projects currently stored in the system.")
    async def list_projects(self):
        """
        Invoked when the user asks for a summary of their existing projects.
        Retrieves data filtered by the authenticated session context.
        """
        logger.info(f"📂 AI is fetching project list for User ID: {self.user_id}...")

        # Request the list of projects from the backend
        result = await self.api.get_projects()

        return result