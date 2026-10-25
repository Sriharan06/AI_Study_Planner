# 🎓 AI Study Planner Application

An autonomous AI Study Planning console application powered by **Google Gemini 3.8 Flash** and the **Model Context Protocol (MCP)**. It dynamically designs structured, practical study roadmaps based on your learning goals, time constraints, and preferences, and persists them using a FastMCP tool server.

---

## 🌟 Application Features

- **Gemini 3.8 Flash AI Engine**: Generates comprehensive, day-by-day or week-by-week study curricula tailored to your schedule.
- **Model Context Protocol (MCP) Integration**: Communicates seamlessly with tool servers using standardized stdio protocol:
  - `save_plan`: Automatically saves generated roadmaps to disk.
  - `view_plans`: Retrieves and reviews previously created study plans.
- **1-Click Application Launcher**: Double-click `run_app.bat` on Windows to immediately launch the application.
- **In-Browser GitHub Cloud Execution**: Run the application in the cloud directly via GitHub Codespaces without any local setup.

---

## 📁 Project Structure

```plaintext
AI_Study_Planner/
├── data/
│   └── plans.json            # Persistent JSON store for saved plans
├── .env.example              # Template for environment configuration
├── .gitignore                # Protects sensitive keys & virtual environments
├── main.py                   # Main interactive Gemini + MCP client
├── mcp_server.py             # FastMCP server with study planning tools
├── requirements.txt          # Python dependencies
├── run_app.bat               # 1-Click Windows Application launcher
└── README.md
```

---

## 🚀 How to Run the Application

### Option 1: 1-Click Launch (Windows)
Double-click [`run_app.bat`](run_app.bat) to launch the AI Study Planner console application.

---

### Option 2: Terminal / Manual Run

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Sriharan06/AI_Study_Planner.git
   cd AI_Study_Planner
   ```

2. **Activate Virtual Environment & Install Requirements**:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Your Gemini API Key**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key in `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the Application**:
   ```bash
   python main.py
   ```

---

## ☁️ Run Directly in GitHub (Codespaces)

To run this application directly in your browser on GitHub without installing anything locally:
1. Navigate to the [GitHub Repository](https://github.com/Sriharan06/AI_Study_Planner).
2. Click the green **Code** button > **Codespaces** tab > **Create codespace on main**.
3. In the terminal, add your `GEMINI_API_KEY` to `.env` and run:
   ```bash
   python main.py
   ```

---

## 🛠️ MCP Tools Overview

The application utilizes FastMCP (`mcp_server.py`) to expose tools to the Gemini model:

| Tool | Parameters | Description |
| :--- | :--- | :--- |
| `save_plan` | `goal` (str), `plan` (str) | Appends a structured study plan to `data/plans.json`. |
| `view_plans`| *none* | Reads and returns all saved plans from `data/plans.json`. |

---

## 📄 License
MIT License. Open source for educational use.
