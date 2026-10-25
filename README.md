# 🎓 AI Study Planner

An intelligent, autonomous study planning agent powered by **Google Gemini 3.8 Flash** and the **Model Context Protocol (MCP)**. It dynamically designs structured, practical study roadmaps based on your learning goals, time constraints, and preferences, and persists them using a FastMCP tool server.

---

## 🌟 Features

- **Gemini 3.8 Flash AI Engine**: Generates comprehensive, day-by-day or week-by-week study curricula tailored to your schedule.
- **Model Context Protocol (MCP) Integration**: Communicates seamlessly with tool servers using standardized stdio protocol:
  - `save_plan`: Automatically saves generated roadmaps to disk.
  - `view_plans`: Retrieves and reviews previously created study plans.
- **Interactive Web App & GitHub Pages Deployment**: Interactive web dashboard deployed directly on GitHub Pages to browse, generate, and export study plans.
- **1-Click GitHub Codespaces**: Run the full Python MCP server and CLI directly in your browser without local setup.

---

## 📁 Project Structure

```plaintext
AI_Study_Planner/
├── .devcontainer/             # GitHub Codespaces configuration
│   └── devcontainer.json
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for GitHub Pages
├── data/
│   └── plans.json            # Persistent JSON store for saved plans
├── docs/                      # Static web app deployed to GitHub Pages
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example              # Template for environment configuration
├── .gitignore                # Protects sensitive keys & virtual environments
├── main.py                   # Main interactive Gemini + MCP client
├── mcp_server.py             # FastMCP server with study planning tools
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Sriharan06/AI_Study_Planner.git
cd AI_Study_Planner
```

### 2. Create and Activate a Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Your Gemini API Key
Create a `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```
Open `.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> [!TIP]
> You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 5. Run the AI Study Planner
```bash
python main.py
```

---

## 🌐 GitHub Deployment

### GitHub Pages (Live Web UI)
This repository includes an interactive web dashboard in `docs/` that deploys automatically to **GitHub Pages** via GitHub Actions:
1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions** (or deploy from branch `main` folder `/docs`).
3. Your web app will be live at:
   `https://Sriharan06.github.io/AI_Study_Planner/`

### GitHub Codespaces (In-Browser CLI)
To run the full Python terminal application directly inside GitHub:
1. Click the green **Code** button on the GitHub repository page.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Once loaded, add your `GEMINI_API_KEY` to `.env` and execute:
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
MIT License. Open source and free for educational use.
