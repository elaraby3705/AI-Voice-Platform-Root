import asyncio
import logging
# Import the Client class we just built
from api_client import NexusAPIClient

# Configure logging to clearly see results in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TEST_LAB")


async def run_deep_test():
    print("\n🧪 --- STARTING DEEP ANALYSIS TEST --- 🧪")

    # 1. Instantiate the Client
    # This verifies if the .env configuration is loaded correctly
    client = NexusAPIClient()
    print(f"🔹 Configuration Loaded: Target -> {client.base_url}")

    # 2. Test Handshake / Authentication
    print("\n🔐 Step 1: Testing Authentication...")
    await client._authenticate()

    if client.token:
        print(f"✅ SUCCESS: Got Token! (Length: {len(client.token)} chars)")
        print("   -> The Bridge is open. Identity Verified.")
    else:
        print("❌ FAILED: Authentication denied.")
        print("   -> Check your .env username/password.")
        await client.close()
        return

    # 3. Test Write Action (Create Project)
    print("\n🛠️ Step 2: Testing Write Action (Create Project)...")
    project_name = "Test-Lab-Project-01"
    result = await client.create_project(
        name=project_name,
        description="This project was created by the manual test script to verify DB connection."
    )
    print(f"   -> AI Response: {result}")

    # 4. Test Read Action (List Projects)
    print("\n📂 Step 3: Testing Read Action (List Projects)...")
    projects_text = await client.get_projects()
    print(f"   -> Data Retrieved: {projects_text}")

    # Final Verification
    if project_name in projects_text:
        print("\n✅ VERIFICATION: The project we created was found in the list.")
        print("   -> Full Cycle (Read/Write) Complete.")
    else:
        print("\n⚠️ WARNING: Project created but not found in list using text search.")

    # Close the connection
    await client.close()
    print("\n🧪 --- TEST FINISHED --- 🧪")


if __name__ == "__main__":
    # Run the async entry point
    asyncio.run(run_deep_test())