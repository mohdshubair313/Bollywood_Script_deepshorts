You are an expert Full-Stack AI Engineer. Your task is to build a complete "AI Bollywood Script Generator" web application using Next.js (App Router), Vercel AI SDK, and Groq API. 

The application must take a mundane, real-world situation from the user and transform it into an over-the-top, dramatic Bollywood script split into scenes.

Here are the strict architectural guidelines, tech stack, and functional requirements you must follow.

---

### 1. Tech Stack Requirements
- **Frontend & Backend:** Next.js (App Router with Server Actions or API Routes).
- **Styling:** Tailwind CSS (Modern, dark/cinematic theme, clean UI).
- **AI Framework:** Vercel AI SDK (`ai` and `@ai-sdk/groq`).
- **LLM Provider:** Groq (Use fast and highly capable models like `llama-3.3-70b-versatile`).
- **Validation:** Zod for type-safe structured JSON schemas.

---

### 2. Core Feature & UI/UX Requirements
The frontend must look highly professional and responsive:
- **Situation Input:** A clean, centered text area where the user inputs a simple situation (e.g., "Two friends fighting over a coffee cup").
- **Loading State:** A dynamic, witty loader while streaming (e.g., "Assembling background dancers...", "Tuning the dramatic violins...").
- **Scene-Level Output:** Absolutely NO large walls of plain text. The output must be rendered dynamically using components:
  - **Movie Poster Card:** Displays the generated Title and a quirky Tagline.
  - **Cast/Characters Card:** Lists characters with specific dramatic descriptions.
  - **Dialogue Scenes:** Each scene must be cleanly separated (Scene 1, Scene 2, Scene 3) with explicit character names, dialogue text, background audio/cue descriptions (e.g., *[Loud Thunder Sounds]*, *[Slow Motion Walk]*).

---

### 3. AI Architecture: Multi-Agent System & Tools
You must implement a Multi-Agent architecture using Vercel AI SDK. Choose the best architectural pattern or combine them:

#### A. Multi-Agent Design & Communication
Design a set of specialized agents that collaborate sequentially to build the final production script. You must decide the optimal number of agents (e.g., Title/Hook Architect, Casting Director, Melodrama Screenplay Writer). 
- **Communication Protocol:** Implement **Functional Orchestration**. The output of Agent 1 must be strictly validated via a structured format and passed into the context/prompt of Agent 2, which then flows into Agent 3 to generate the final integrated master script.

#### B. Tool-Based Loop (First-Class Agents)
For individual agents requiring autonomous reasoning, use Vercel AI SDK's `tools` parameter inside `streamText` or `generateText`. 
- Define precise tools (functions) that an agent can execute.
- Enable autonomous execution loops by setting the `maxSteps` parameter (e.g., `maxSteps: 5`), allowing the agent to call tools sequentially, evaluate outputs, and reason iteratively until it fulfills its specific objective.

---

### 4. Technical Implementation & Streaming Guidelines
- **Structured Output Data Guarantee:** To prevent the frontend from crashing, you must use `streamObject` or `useObject` from the Vercel AI SDK. Bind the LLM output strictly to a **Zod Schema**.
- **The Zod Schema must contain:**
  - `title`: string (Catchy Bollywood title)
  - `tagline`: string (Hilarious dramatic tagline)
  - `cast`: array of objects containing `name` and `characterDescription`
  - `scenes`: array of objects containing `sceneNumber`, `settingDescription`, and `dialogues` (array of objects with `character` and `line`).
- **Real-Time Streaming:** The UI must parse and render the incoming JSON object in real-time as tokens stream from Groq, creating an instant component-populating effect.

---

### Step-by-Step Generation Plan
1. Create the Zod validation schemas for data exchange between agents and the final UI representation.
2. Build the backend Next.js Route Handler / Server Action implementing the Multi-Agent setup using the Groq provider.
3. Build the responsive Tailwind frontend UI featuring the custom inputs, loaders, and real-time structured streaming rendering cards.

Provide complete, clean, and production-ready code with proper separation of concerns. Do not omit code or use placeholders.