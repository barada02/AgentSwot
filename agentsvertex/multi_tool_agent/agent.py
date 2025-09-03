from random import random
from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search # Or other search tools
import os
import uuid

from multi_tool_agent import prompts

from dotenv import load_dotenv
load_dotenv()



# --- 3. Create Your Simple Agent ---
# The Agent class orchestrates the model and tools.
# Provide clear instructions to guide the agent's behavior.
root_agent = Agent(
    model="gemini-2.0-flash-001",
    name="multi_tool_agent",
    instruction= prompts.root_agent_instruction_v3,
    tools=[
        google_search
    ]
)
