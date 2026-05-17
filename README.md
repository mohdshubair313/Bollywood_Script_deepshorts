# 🎬 BollyScript — AI Bollywood Script Generator

Turn mundane real-life situations into over-the-top Bollywood movie scripts. Enter any situation — *"Two friends fighting over a coffee cup"* — and watch three AI agents collaboratively generate a full dramatic screenplay with title, cast, scenes, dialogues, stage cues, and background audio.

---

## Architecture

### Multi-Agent Pipeline

```
                         ┌─────────────────────────────────────────────────────┐
                         │                   USER INPUT                        │
                         │         "Two friends fighting over a coffee cup"    │
                         └─────────────────────┬───────────────────────────────┘
                                               │ POST /api/generate
                                               ▼
                    ┌──────────────────────────────────────────────────────────┐
                    │                    ROUTE HANDLER                         │
                    │              app/api/generate/route.ts                   │
                    │                                                          │
                    │  1. Parse & validate request body                        │
                    │  2. Check min length (≥3 chars)                         │
                    │  3. Orchestrate sequential agent pipeline               │
                    │  4. Return Response.json(fullScript)                     │
                    └──────────────────────────────────────────────────────────┘
                                               │
              ┌────────────────────────────────┼────────────────────────────────┐
              ▼                                ▼                                ▼
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────────┐
│    AGENT 1              │    │    AGENT 2              │    │    AGENT 3                  │
│    Title Architect      │───▶│    Casting Director     │───▶│    Screenplay Writer        │
│                         │    │                         │    │                             │
│  generateText()         │    │  generateText()         │    │  generateText()             │
│  Output.object()        │    │  Output.object()        │    │  Output.object()            │
│  schema: TitleSchema    │    │  schema: CastSchema     │    │  schema: BollywoodScript    │
│                         │    │                         │    │                             │
│  Outputs:               │    │  Outputs:               │    │  Outputs:                   │
│  • title                │    │  • characters[]         │    │  • title + tagline          │
│  • tagline              │    │    - name               │    │  • genre + mood             │
│  • genre                │    │    - role               │    │  • cast[]                   │
│  • mood                 │    │    - description        │    │  • scenes[]                 │
│                         │    │    - quirk              │    │    - sceneNumber            │
│                         │    │                         │    │    - title + setting        │
│                         │    │                         │    │    - stageCue               │
│                         │    │                         │    │    - dialogues[]            │
│                         │    │                         │    │      - character + line    │
│                         │    │                         │    │      - direction           │
│                         │    │                         │    │      - backgroundAudio     │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────────┘
                                               │
                                               ▼
                    ┌──────────────────────────────────────────────────────────┐
                    │                   CLIENT (useObject)                     │
                    │              app/components/script-generator.tsx         │
                    │                                                          │
                    │  1. Submit situation → POST /api/generate                │
                    │  2. Show phase-aware loading (title→cast→screenplay)     │
                    │  3. Receive complete JSON response                       │
                    │  4. Render components with fade-in/slide-up animations   │
                    └──────────────────────────────────────────────────────────┘
```

### Agent Communication Flow

```
Agent 1 (Title)                Agent 2 (Cast)                 Agent 3 (Screenplay)
     │                              │                              │
     │  ┌────────────────────┐      │                              │
     │  │ TitleData          │      │                              │
     │  │ {                  │      │                              │
     │  │   title: string,   │      │                              │
     │  │   tagline: string, │      │                              │
     │  │   genre: string,   │      │                              │
     │  │   mood: string     │──────┼──────────────────────────────┤
     │  │ }                  │      │   Injected into prompt as    │
     │  └────────────────────┘      │   CONTEXT — Movie Concept    │
     │                              │                              │
     │                              │  ┌────────────────────┐      │
     │                              │  │ CastData           │      │
     │                              │  │ {                  │      │
     │                              │  │   characters: [    │      │
     │                              │  │     { name, role,  │      │
     │                              │  │       description, │      │
     │                              │  │       quirk }      │──────┤
     │                              │  │   ]                │      │
     │                              │  │ }                  │      │
     │                              │  └────────────────────┘      │
     │                              │   Injected into prompt as    │
     │                              │   CONTEXT — Cast of Characters│
     │                              │                              │
     │                              │                              │  ┌──────────────────────┐
     │                              │                              │  │ BollywoodScriptData  │
     │                              │                              │  │ {                    │
     │                              │                              │  │   title, tagline,    │
     │                              │                              │  │   genre, mood,       │
     │                              │                              │  │   cast: [...],       │
     │                              │                              │  │   scenes: [{         │
     │                              │                              │  │     sceneNumber,     │
     │                              │                              │  │     title, setting,  │
     │                              │                              │  │     stageCue,        │
     │                              │                              │  │     dialogues: [{    │
     │                              │                              │  │       character,     │
     │                              │                              │  │       line,          │
     │                              │                              │  │       direction,     │
     │                              │                              │  │       backgroundAudio│
     │                              │                              │  │     }]              │
     │                              │                              │  │   }]                │
     │                              │                              │  │ }                   │
     │                              │                              │  └──────────────────────┘
```

### Client-Side State Machine

```
         ┌──────────┐
         │   IDLE   │
         └────┬─────┘
              │ User clicks "Generate Script"
              ▼
      ┌───────────────┐      object.title arrives      ┌──────────────┐      !isLoading        ┌──────┐
      │  GENERATING   │ ──────────────────────────────▶ │  STREAMING   │ ────────────────────▶ │ DONE │
      │               │                                 │              │                       │      │
      │ Show phase     │                                 │ Render Movie │                       │ All  │
      │ loader with    │                                 │ Poster, Cast,│                       │ data │
      │ agent progress │                                 │ Scenes as    │                       │ shown│
      │ bars           │                                 │ they arrive  │                       │      │
      └───────────────┘                                 └──────────────┘                       └──────┘
              │                                                  │
              │ error                                            │ error
              ▼                                                  ▼
         ┌──────────┐
         │  ERROR   │
         │          │
         │ Show     │
         │ Bollywood│
         │ themed   │
         │ retry    │
         └──────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 (CSS-first) |
| AI SDK | `ai` + `@ai-sdk/groq` + `@ai-sdk/react` | Latest |
| Schema Validation | Zod | ^4.4.3 |
| LLM Provider | Groq (`llama-3.3-70b-versatile`) | Cloud API |
| Package Manager | pnpm | 10.x |
| Deployment | Vercel (Node.js Serverless) | — |

---

## File Structure

```
bolly_script/
│
├── app/
│   ├── api/generate/route.ts      # POST handler — multi-agent pipeline orchestrator
│   ├── components/
│   │   ├── script-generator.tsx    # Client — useObject hook, form, state machine
│   │   ├── loading-state.tsx       # 3-phase agent progress indicator
│   │   ├── movie-poster-card.tsx   # Glass card with gradient text title + badges
│   │   ├── cast-card.tsx           # Responsive grid of character cards
│   │   ├── scene-card.tsx          # Individual scene with stage cue badge
│   │   ├── dialogue-bubble.tsx     # Asymmetric chat bubble + audio cue badge
│   │   └── error-boundary.tsx      # Bollywood-themed retry card
│   ├── globals.css                 # Tailwind v4 @theme + glass/shimmer utilities
│   ├── layout.tsx                  # Root layout — Outfit + Inter fonts, metadata
│   └── page.tsx                    # Landing page with hero header
│
├── lib/
│   ├── agents/
│   │   ├── title-agent.ts          # Agent 1: generateText → TitleSchema
│   │   ├── casting-agent.ts        # Agent 2: generateText → CastSchema
│   │   └── screenplay-agent.ts     # Agent 3: generateText → BollywoodScriptSchema
│   ├── prompts.ts                  # System prompts for all 3 agents
│   └── schemas.ts                  # Zod schemas + inferred TypeScript types
│
├── .env.local                      # GROQ_API_KEY (gitignored)
├── package.json
├── next.config.ts
├── postcss.config.mjs              # @tailwindcss/postcss plugin
└── tsconfig.json                   # Path alias @/ → ./
```

---

## Setup

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- Groq API key (get one at [console.groq.com](https://console.groq.com))

### Installation

```bash
git clone <repo-url>
cd bolly_script
pnpm install
```

### Environment Variables

Create `.env.local` (already created — replace the placeholder):

```env
GROQ_API_KEY=gsk_your_api_key_here
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```

---

## API Reference

### `POST /api/generate`

Generates a complete Bollywood script from a situation description.

#### Request Body

```json
{
  "situation": "Two friends fighting over a coffee cup"
}
```

#### Success Response (200)

```json
{
  "title": "Dil Ka Coffee Cup",
  "tagline": "Some friendships are brewed in blood... and caffeine",
  "genre": "Comedy Drama",
  "mood": "Humorous",
  "cast": [
    {
      "name": "Raj Whiskers",
      "role": "Hero",
      "description": "A coffee-obsessed barista with a heart of gold",
      "quirk": "Says 'Mool, let's milk this moment!' before every pour"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "The Grand Entry",
      "setting": "A bustling Mumbai café during morning rush",
      "stageCue": "[Rain starts pouring as Raj makes his dramatic entry]",
      "dialogues": [
        {
          "character": "Raj",
          "line": "Yeh coffee nahi hai... yeh emotion hai!",
          "direction": "(clutches the coffee cup to his chest)",
          "backgroundAudio": "[Violin crescendo]"
        }
      ]
    }
  ]
}
```

#### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid JSON body or situation < 3 characters |
| 500 | Groq API failure, schema validation failure, or internal error |

---

## Zod Schemas

### `TitleSchema` — Agent 1 Output

```ts
z.object({
  title:       z.string(),  // Catchy Bollywood movie title
  tagline:     z.string(),  // Dramatic one-liner tagline
  genre:       z.string(),  // e.g., Action Drama, Romantic Comedy
  mood:        z.string(),  // e.g., intense, comedic, emotional
})
```

### `CastSchema` — Agent 2 Output

```ts
z.object({
  characters: z.array(z.object({
    name:        z.string(),  // Character name (Hindi/English)
    role:        z.string(),  // Hero, Villain, Comic Relief, etc.
    description: z.string(),  // Dramatic character description
    quirk:       z.string(),  // Signature catchphrase/mannerism
  })),
})
```

### `BollywoodScriptSchema` — Agent 3 Output / UI Contract

```ts
z.object({
  title:    z.string(),
  tagline:  z.string(),
  genre:    z.string(),
  mood:     z.string(),
  cast: z.array(z.object({
    name:        z.string(),
    role:        z.string(),
    description: z.string(),
    quirk:       z.string(),
  })),
  scenes: z.array(z.object({
    sceneNumber: z.number(),
    title:       z.string(),  // e.g., "The Grand Entry"
    setting:     z.string(),  // Location + atmosphere
    stageCue:    z.string(),  // e.g., "[Rain starts pouring]"
    dialogues: z.array(z.object({
      character:       z.string(),
      line:            z.string(),  // The spoken dialogue text
      direction:       z.string(),  // Acting direction in parentheses
      backgroundAudio: z.string(),  // Audio cue in brackets
    })),
  })),
})
```

---

## Agent System Prompts

### Agent 1 — Title Architect (`lib/prompts.ts`)

System prompt that instructs the LLM to generate a Bollywood movie concept from a mundane situation. Emphasizes masala movie tropes, dramatic titles, and Hinglish wordplay. Includes examples like *"Dil Ka Coffee Cup"* and *"Ek Dam Return"*.

### Agent 2 — Casting Director (`lib/prompts.ts`)

System prompt that guides the LLM to create 3-5 larger-than-life characters. Uses Bollywood archetypes (Hero, Villain, Comic Relief, Mother, Sidekick) with dramatic descriptions and signature quirks.

### Agent 3 — Screenplay Writer (`lib/prompts.ts`)

System prompt with injected context from Agents 1 & 2. Contains:
- **Exact JSON template** showing camelCase key names (`stageCue`, `backgroundAudio`, `sceneNumber`, `line`, `direction`)
- Scene generation rules (2-4 scenes, 3-6 dialogues per scene)
- Bollywood dialogue conventions (Hinglish, dramatic pauses, emotional outbursts)
- Setting/Stage direction tropes (crowded markets, rainy streets, slow-motion walks)

---

## CSS Theme (Tailwind v4 `@theme`)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-background` | `#08080f` | Page background (deep dark) |
| `text-foreground` | `#f0ece4` | Body text (warm off-white) |
| `text-cinema-gold` | `#d4a843` | Primary accent — gold |
| `text-cinema-gold-light` | `#f0d078` | Hover/bright gold |
| `text-cinema-crimson` | `#b91c1c` | Error/danger |
| `text-cinema-crimson-light` | `#dc2626` | Bright error |
| `text-cinema-purple` | `#4a0e4e` | Deep purple |
| `text-cinema-purple-light` | `#7c3aed` | Bright purple — alternate dialogue |
| `text-cinema-cyan` | `#0891b2` | Audio cue badges |
| `text-cinema-muted` | `#6b7280` | Secondary text |
| `font-display` | `Outfit` | Headings/title |
| `font-sans` | `Inter` | Body text |
| `animate-shimmer` | 2.5s shimmer | Loading skeleton effect |
| `animate-fade-in` | 0.6s fade | Component entrance |
| `animate-slide-up` | 0.5s slide | Card entrance |
| `animate-pulse-glow` | 2s pulse | Stage cue / audio badges |

### Custom CSS Classes

- `.glass` — Semi-transparent card with backdrop blur
- `.glass-strong` — Stronger glassmorphism
- `.gradient-text` — Gold gradient on text
- `.gradient-border` — Gold gradient border via `::before`
- `.shimmer-bg` — Animated shimmer background

---

## UI Components

### `ScriptGenerator`
Top-level client component. Manages the 4-state machine (`idle → generating → streaming → done`). Uses `experimental_useObject` from `@ai-sdk/react` to POST to `/api/generate` and receive the BollywoodScript. Tracks elapsed time to update the agent phase indicator (title → cast → screenplay).

### `LoadingState`
Receives a `phase` prop (`"title" | "cast" | "screenplay"`) and renders:
- 3-segment progress bar (gold / purple/cyan / cyan→gold)
- Agent rows with icon, label, and status (⏳/🔄/✅)
- Active agent highlighted with border glow

### `MoviePosterCard`
Glassmorphism card with `gradient-border` and `shimmer-bg` overlay. Displays:
- Title in `font-display` with `gradient-text`
- Tagline in italic
- Genre badge (gold border) + Mood badge (purple border)

### `CastCard`
Responsive 1/2/3-column grid. Each character card shows:
- Name + Role badge (gold chip)
- Description in muted foreground
- Quirk in cyan italic with top divider
- Hover glow effect (`hover:shadow-[0_0_15px_rgba(212,168,67,0.15)]`)

### `SceneCard`
Numbered section with gold gradient divider. Contains:
- Scene number (`SCENE 1`) in mono font
- Title + setting description
- Stage cue as a glass badge with 🎬 icon and `pulse-glow` animation
- List of `DialogueBubble` components

### `DialogueBubble`
Asymmetric chat layout — even indices left-aligned, odd right-aligned. Each bubble:
- Character name in gold/purple (alternating)
- Direction as muted italic parenthetical
- Line in full opacity
- Background audio as a glass badge with 🎵 icon and `pulse-glow` animation
- Alternate bubbles use `bg-cinema-purple/10` tint

### `ErrorBoundary`
Centered glass card with:
- Random Bollywood error heading (e.g., *"The film reel got tangled!"*)
- Error message in muted text
- Retry button (gold style)

---

## Package Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/groq": "^3.0.39",    // Groq provider for Vercel AI SDK
    "@ai-sdk/react": "^3.0.186",  // React hooks (useObject)
    "ai": "^6.0.184",             // Vercel AI SDK core
    "next": "16.2.6",             // Next.js framework
    "react": "19.2.4",            // React library
    "react-dom": "19.2.4",
    "zod": "^4.4.3"               // Schema validation
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "16.2.6"
  }
}
```

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import project in [Vercel](https://vercel.com/new).
3. Add environment variable: `GROQ_API_KEY`
4. Deploy — the `next build` command is handled automatically.

No Edge Runtime config needed — uses standard Node.js Serverless functions.

---

## Troubleshooting

### "responseFormat is not supported" warning

Expected when `structuredOutputs: false`. The AI SDK is informing that the Zod schema is validated client-side, not server-enforced by Groq. Can be silenced with:

```env
AI_SDK_LOG_WARNINGS=false
```

### Groq 400 errors

- Ensure `GROQ_API_KEY` is valid
- If using paid models, verify your Groq account has access
- Check rate limits (`POST /api/generate` with 3 sequential calls uses 3 tokens)

### Zod validation failures

The `generateText` + `Output.object()` pattern validates the LLM output against the Zod schema. If the LLM outputs incorrect keys (snake_case instead of camelCase), the error propagates as a 500 response. The SCREENPLAY_AGENT_PROMPT includes an explicit JSON template and a critical key-names section to prevent this.

---

## License

MIT
