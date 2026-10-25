import json
from pathlib import Path
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("Study Planner")
folder = Path(__file__).parent / "data"
folder.mkdir(exist_ok=True)
file = folder / "plans.json"
def load_plans():
    if file.exists():
        return json.loads(file.read_text(encoding="utf-8"))
    return []
@mcp.tool()
def save_plan(goal: str, plan: str) -> str:
    """Save a student's study plan."""
    plans = load_plans()
    plans.append({
        "goal": goal,
        "plan": plan
    })
    file.write_text(
        json.dumps(plans, indent=4),
        encoding="utf-8"
    )
    return "Study plan saved successfully!"
@mcp.tool()
def view_plans() -> str:
    """Show previously saved study plans."""
    plans = load_plans()
    if not plans:
        return "No saved plans yet."
    return json.dumps(plans, indent=2)
if __name__ == "__main__":
    mcp.run()