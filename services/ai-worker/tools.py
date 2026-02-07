import logging
from typing import Annotated
from livekit.agents import llm
from api_client import NexusAPIClient

logger = logging.getLogger("tools")


class ProjectManagerTools(llm.FunctionContext):
    """
    this class containing tools that AI use 
    """

    def __init__(self):
        super().__init__()
        #createing a copy to talk to backend 
        self.api = NexusAPIClient()

    @llm.ai_callable(description="Create a new project in the database using a name and description.")
    async def create_project(
            self,
            name: Annotated[str, llm.TypeInfo(description="The short name of the project (e.g., 'Website Redesign')")],
            description: Annotated[str, llm.TypeInfo(description="A brief description of the project's goal")]
    ):
        """
        Called when the user explicitly wants to create or start a new project.
        """
        logger.info(f"👷 AI is attempting to create project: {name}")

        result = await self.api.create_project(name, description)

        return result

    @llm.ai_callable(description="List all active projects currently stored in the system.")
    async def list_projects(self):
        """
        Called when the user asks what projects they have, or wants to see a summary of work.
        """
        logger.info("📂 AI is fetching project list...")

        result = await self.api.get_projects()

        return result