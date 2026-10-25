
import asyncio
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")
api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "your_new_google_api_key":
    raise ValueError(
        "Gemini API key is missing. Check your .env file."
    )
ai = genai.Client(api_key=api_key)
server = StdioServerParameters(
    command=sys.executable,
    args=[str(BASE_DIR / "mcp_server.py")],
    env=os.environ.copy()
)
def clean_schema(schema):
    """Remove unnecessary JSON Schema metadata."""
    if isinstance(schema, dict):
        return {
            key: clean_schema(value)
            for key, value in schema.items()
            if key not in ("$schema", "title")
        }
    if isinstance(schema, list):
        return [clean_schema(item) for item in schema]
    return schema
async def main():
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            mcp_tools = await session.list_tools()
            declarations = []
            for tool in mcp_tools.tools:
                declarations.append(
                    types.FunctionDeclaration(
                        name=tool.name,
                        description=tool.description or tool.name,
                        parameters_json_schema=clean_schema(
                            tool.inputSchema
                        )
                    )
                )
            gemini_tools = [
                types.Tool(function_declarations=declarations)
            ]
            print("Welcome to AI Study Planner!")
            print("Type 'exit' to close the application.")
            while True:
                try:
                    question = input("\nYou: ").strip()
                except EOFError:
                    print("\nGoodbye!")
                    break
                if not question:
                    continue
                if question.lower() == "exit":
                    break
                history = [
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=question)]
                    )
                ]
                try:
                    for _ in range(5):
                        response = ai.models.generate_content(
                            model="gemini-3.8-flash",
                            contents=history,
                            config=types.GenerateContentConfig(
                                system_instruction=(
                                    "You are a friendly AI Study Planner. "
                                    "Create practical study plans. "
                                    "When the user asks for a new study plan, "
                                    "create the plan and call save_plan to "
                                    "save it. When asked for saved plans, "
                                    "call view_plans. Explain results clearly."
                                ),
                                tools=gemini_tools
                            )
                        )
                        candidate = response.candidates[0]
                        history.append(candidate.content)
                        calls = [
                            part.function_call
                            for part in candidate.content.parts
                            if part.function_call
                        ]
                        if not calls:
                            print("\nAgent:", response.text or
                                  "I couldn't generate a response.")
                            break
                        for call in calls:
                            result = await session.call_tool(
                                call.name,
                                arguments=dict(call.args or {})
                            )
                            output = "\n".join(
                                item.text
                                for item in result.content
                                if hasattr(item, "text")
                            )
                            history.append(
                                types.Content(
                                    role="user",
                                    parts=[
                                        types.Part.from_function_response(
                                            name=call.name,
                                            response={"result": output}
                                        )
                                    ]
                                )
                            )
                    else:
                        print(
                            "\nAgent: I reached the tool-call limit. "
                            "Please try your request again."
                        )
                except Exception as error:
                    print(f"\nError: {error}")
                    print(
                        "Check your API key, model access, "
                        "internet connection, and API quota."
                    )
if __name__ == "__main__":
    asyncio.run(main())
