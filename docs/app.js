// AI Study Planner Client Logic

const STORAGE_KEY_API = "gemini_study_planner_key";
const STORAGE_KEY_PLANS = "saved_study_plans";

// Default seed plan from data/plans.json
const DEFAULT_PLANS = [
    {
        "goal": "Learn Python in 1 Month (2 hours/day)",
        "plan": `### 1-Month Python Study Plan (2 Hours / Day)

#### **Week 1: Fundamentals & Control Flow**
*Daily commitment: 1 hr theory/concepts + 1 hr hands-on coding*
- **Day 1:** Introduction to Python, setup (VS Code / Python 3), variables, and basic data types.
- **Day 2:** Basic operators and string manipulation with f-strings.
- **Day 3:** Conditional statements (\`if\`, \`elif\`, \`else\`) and logical expressions.
- **Day 4:** Loops (\`for\`, \`while\`, \`range()\`).
- **Day 5:** Loop control statements (\`break\`, \`continue\`) and nested loops.
- **Day 6:** Practice Project: Build a Number Guessing Game & Calculator.
- **Day 7:** Rest / Review & Debugging.

---

#### **Week 2: Data Structures & Functions**
- **Day 8:** Lists & Tuples: slicing, indexing, list methods.
- **Day 9:** Dictionaries & Sets: key-value lookups, uniqueness, set theory.
- **Day 10:** List and Dictionary Comprehensions.
- **Day 11:** Functions: definition, positional & keyword parameters, return values.
- **Day 12:** Advanced Functions: \`*args\`, \`**kwargs\`, lambda functions, scope.
- **Day 13:** Project: Build a Contact Book / Flashcard Quiz.
- **Day 14:** Rest / Review.

---

#### **Week 3: OOP, File Handling & Modules**
- **Day 15:** File I/O: Reading and writing text & JSON files with context managers (\`with\`).
- **Day 16:** Error Handling: \`try\`, \`except\`, \`finally\`, custom exceptions.
- **Day 17:** OOP Basics: Classes, Objects, \`__init__\`, attributes.
- **Day 18:** OOP Advanced: Inheritance, polymorphism, method overriding.
- **Day 19:** Standard Library: \`math\`, \`random\`, \`datetime\`, \`pathlib\`.
- **Day 20:** Project: Bank Account Management System.
- **Day 21:** Code review & refactoring.

---

#### **Week 4: Practical Tools & Capstone Project**
- **Day 22:** Virtual environments (\`venv\`) & Package management (\`pip\`).
- **Day 23:** Consuming APIs using the \`requests\` library.
- **Day 24:** Capstone Project Setup: Architecture & CLI interface.
- **Day 25:** Capstone Core Logic & Data Persistence.
- **Day 26:** Polish UI & Edge Cases.
- **Day 27:** Documentation: README, docstrings, git commit history.
- **Day 28:** Final Review & Next Steps (FastAPI / Web Development).`
    }
];

// State
let currentPlan = null;

// DOM Elements
const planForm = document.getElementById("plan-form");
const topicInput = document.getElementById("topic-input");
const durationSelect = document.getElementById("duration-select");
const hoursSelect = document.getElementById("hours-select");
const levelSelect = document.getElementById("level-select");
const notesInput = document.getElementById("notes-input");
const generateBtn = document.getElementById("generate-btn");

const resultsSection = document.getElementById("results-section");
const planTitle = document.getElementById("plan-title");
const planContent = document.getElementById("plan-content");
const copyPlanBtn = document.getElementById("copy-plan-btn");
const downloadPlanBtn = document.getElementById("download-plan-btn");
const saveLocalBtn = document.getElementById("save-local-btn");

const savedPlansList = document.getElementById("saved-plans-list");
const refreshLibraryBtn = document.getElementById("refresh-library-btn");

// Key Modal Elements
const keyModal = document.getElementById("key-modal");
const toggleKeyBtn = document.getElementById("toggle-key-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");
const clearKeyBtn = document.getElementById("clear-key-btn");
const keyStatusText = document.getElementById("key-status-text");

// Initialize
function init() {
    updateKeyBadge();
    loadLibrary();

    // Event listeners
    planForm.addEventListener("submit", handleFormSubmit);
    toggleKeyBtn.addEventListener("click", () => keyModal.classList.remove("hidden"));
    closeModalBtn.addEventListener("click", () => keyModal.classList.add("hidden"));
    saveKeyBtn.addEventListener("click", saveApiKey);
    clearKeyBtn.addEventListener("click", clearApiKey);
    refreshLibraryBtn.addEventListener("click", loadLibrary);

    copyPlanBtn.addEventListener("click", copyCurrentPlan);
    downloadPlanBtn.addEventListener("click", downloadCurrentPlan);
    saveLocalBtn.addEventListener("click", saveCurrentPlanToLibrary);

    // Close modal on outside click
    window.addEventListener("click", (e) => {
        if (e.target === keyModal) keyModal.classList.add("hidden");
    });
}

function getApiKey() {
    return localStorage.getItem(STORAGE_KEY_API) || "";
}

function updateKeyBadge() {
    const key = getApiKey();
    if (key) {
        keyStatusText.textContent = "API Key Configured";
        toggleKeyBtn.style.borderColor = "#238636";
    } else {
        keyStatusText.textContent = "Set API Key";
        toggleKeyBtn.style.borderColor = "var(--border-color)";
    }
}

function saveApiKey() {
    const val = apiKeyInput.value.trim();
    if (val) {
        localStorage.setItem(STORAGE_KEY_API, val);
        updateKeyBadge();
        keyModal.classList.add("hidden");
        apiKeyInput.value = "";
    }
}

function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY_API);
    updateKeyBadge();
    keyModal.classList.add("hidden");
    apiKeyInput.value = "";
}

// Plan Generation
async function handleFormSubmit(e) {
    e.preventDefault();
    const topic = topicInput.value.trim();
    const duration = durationSelect.value;
    const hours = hoursSelect.value;
    const level = levelSelect.value;
    const notes = notesInput.value.trim();

    if (!topic) return;

    generateBtn.disabled = true;
    generateBtn.innerHTML = `<span class="icon">⏳</span> Generating study curriculum...`;

    try {
        const apiKey = getApiKey();
        let planMarkdown = "";

        if (apiKey) {
            planMarkdown = await generateWithGemini(apiKey, topic, duration, hours, level, notes);
        } else {
            planMarkdown = generateSmartFallback(topic, duration, hours, level, notes);
        }

        currentPlan = {
            goal: `${topic} (${duration}, ${hours}/day)`,
            plan: planMarkdown,
            timestamp: new Date().toLocaleDateString()
        };

        displayPlan(currentPlan);
    } catch (err) {
        alert("Error generating plan: " + err.message);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<span class="icon">✨</span> Generate Study Plan`;
    }
}

// Gemini direct client-side generation
async function generateWithGemini(apiKey, topic, duration, hours, level, notes) {
    const prompt = `You are an expert AI Study Planner and curriculum architect.
Create a comprehensive, practical, day-by-day or week-by-week study plan for:
- Subject / Goal: ${topic}
- Timeline Duration: ${duration}
- Daily Study Time: ${hours}
- Current Skill Level: ${level}
${notes ? `- Specific Focus: ${notes}` : ""}

Structure requirements:
1. Executive Summary & Recommended Prerequisites
2. Phase/Week breakdown with specific daily actionable topics and practice exercises
3. Mini projects or milestone checkpoints
4. Curated learning resources (official docs, top tutorials, hands-on practice ideas)
Use clean, beautiful Markdown formatting with clear headers, bullet points, and code/text blocks.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to call Gemini API");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Fallback generator when API key is not yet set
function generateSmartFallback(topic, duration, hours, level, notes) {
    return `### 📅 Structured Study Plan: ${topic}
> **Note:** Running in offline preview mode. Add your Gemini API key in the top right to generate dynamic, live AI roadmaps!

- **Target Goal:** ${topic}
- **Duration:** ${duration}
- **Time Commitment:** ${hours}
- **Skill Level:** ${level}
${notes ? `- **Notes:** ${notes}` : ""}

---

#### 📌 Phase 1: Core Fundamentals & Theory (Days 1–7)
- **Daily Rhythm:** 50% reading & concept learning, 50% interactive exercises.
- **Key Concepts:** Syntax, terminology, core architecture, essential mental models.
- **Checkpoint Project:** Build a small "Hello World" or terminal-based prototype demonstrating basic mechanics.

---

#### 📌 Phase 2: Practical Application & Best Practices (Days 8–18)
- **Deep-Dive:** Design patterns, data manipulation, idiomatic techniques, tooling ecosystem.
- **Hands-on Labs:** Solve 2-3 focused practice exercises per session.
- **Milestone Project:** Develop a functional tool or module with persistent storage and error handling.

---

#### 📌 Phase 3: Advanced Concepts & Real-World Integration (Days 19–25)
- **Topics:** Optimization, security, testing, integration with external APIs and services.
- **Debugging & Profiling:** Learn diagnostic techniques and standard library inspection.

---

#### 📌 Phase 4: Capstone Project & Portfolio (Days 26–${duration === "2 Weeks" ? "14" : "30"})
- **Capstone Deliverable:** Design, develop, document, and publish an end-to-end project on GitHub.
- **Final Checklist:** Clean code, README documentation, testing, and deployment.`;
}

function displayPlan(planObj) {
    resultsSection.classList.remove("hidden");
    planTitle.textContent = planObj.goal;
    planContent.innerHTML = marked.parse(planObj.plan);
    resultsSection.scrollIntoView({ behavior: "smooth" });
}

function copyCurrentPlan() {
    if (!currentPlan) return;
    navigator.clipboard.writeText(currentPlan.plan).then(() => {
        const originalText = copyPlanBtn.textContent;
        copyPlanBtn.textContent = "✅ Copied!";
        setTimeout(() => copyPlanBtn.textContent = originalText, 2000);
    });
}

function downloadCurrentPlan() {
    if (!currentPlan) return;
    const blob = new Blob([currentPlan.plan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentPlan.goal.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

function getStoredPlans() {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(DEFAULT_PLANS));
        return DEFAULT_PLANS;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return DEFAULT_PLANS;
    }
}

function saveCurrentPlanToLibrary() {
    if (!currentPlan) return;
    const plans = getStoredPlans();
    plans.unshift({
        goal: currentPlan.goal,
        plan: currentPlan.plan,
        timestamp: new Date().toLocaleDateString()
    });
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
    loadLibrary();
    saveLocalBtn.textContent = "✅ Saved!";
    setTimeout(() => saveLocalBtn.textContent = "⭐ Save Plan", 2000);
}

function loadLibrary() {
    const plans = getStoredPlans();
    savedPlansList.innerHTML = "";

    if (!plans || plans.length === 0) {
        savedPlansList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No saved plans yet. Generate one above!</p>`;
        return;
    }

    plans.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "plan-card-item";
        card.innerHTML = `
            <div>
                <h4>${item.goal}</h4>
                <p>${item.plan.replace(/#/g, "").slice(0, 160)}...</p>
            </div>
            <div class="plan-card-meta">
                <span>${item.timestamp || "Saved"}</span>
                <span style="color: var(--accent); font-weight: 600;">View →</span>
            </div>
        `;
        card.addEventListener("click", () => {
            currentPlan = item;
            displayPlan(item);
        });
        savedPlansList.appendChild(card);
    });
}

// Start app
document.addEventListener("DOMContentLoaded", init);
