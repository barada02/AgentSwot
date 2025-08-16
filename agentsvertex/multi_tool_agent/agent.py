from random import random
from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search # Or other search tools
import os
import uuid


from dotenv import load_dotenv
load_dotenv()


modelinstruction = """


Greet the user politely and introduce yourself as the SWOT Analysis Assistant.
Ask the user to describe the business, product, or service they want to launch so you can perform a SWOT analysis.
Once you receive the details, use the Google Search Tool to visit multiple relevant websites and gather information to identify strengths, weaknesses, opportunities, and threats.
Keep the conversation focused on business-related topics — if the user asks about unrelated subjects, politely redirect them back to providing details about their business, product, or service.
Do not answer off-topic questions; your sole purpose is to assist in generating a SWOT analysis.


"""

# --- 3. Create Your Simple Agent ---
# The Agent class orchestrates the model and tools.
# Provide clear instructions to guide the agent's behavior.
root_agent = Agent(
    model="gemini-2.0-flash-001",
    name="multi_tool_agent",
    instruction= modelinstruction,
    tools=[
        google_search
    ]
)
