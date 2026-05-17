export const TROPE_IDS = [
  "rain_heartbreak",
  "sunflower_dance",
  "hero_entry",
  "tea_stall_faceoff",
  "dramatic_death",
  "emotional_reunion",
] as const

export type TropeId = (typeof TROPE_IDS)[number]

export interface TropeDefinition {
  id: TropeId
  name: string
  category: "entry" | "rain" | "dance" | "faceoff" | "death" | "reunion"
  moods: string[]
  stageCueTemplate: string
  audioTemplate: string
  settingHint: string
}

export const TROPE_CATALOG: Record<TropeId, TropeDefinition> = {
  rain_heartbreak: {
    id: "rain_heartbreak",
    name: "Mandatory slow-motion rain sequence during heartbreak",
    category: "rain",
    moods: ["emotional", "romantic", "tragic", "dramatic", "melodramatic", "sentimental"],
    stageCueTemplate: "[Rain begins to pour as the character looks up at the sky, tears mixing with raindrops. Time slows to a crawl as the camera spins around them.]",
    audioTemplate: "[Violin crescendo mixed with thunderclaps]",
    settingHint: "The scene shifts inexplicably to a rain-soaked rooftop or empty street at midnight",
  },
  sunflower_dance: {
    id: "sunflower_dance",
    name: "Random dance number in a field of sunflowers",
    category: "dance",
    moods: ["joyful", "romantic", "comedic", "humorous", "lighthearted", "celebratory"],
    stageCueTemplate: "[Without warning, the characters break into perfectly choreographed dance moves as the background magically transforms into a vibrant sunflower field under golden sunlight]",
    audioTemplate: "[Upbeat Bollywood dance track with dhol and synthesizers]",
    settingHint: "The location suddenly becomes a picturesque sunflower field or palace courtyard with backup dancers appearing from nowhere",
  },
  hero_entry: {
    id: "hero_entry",
    name: "Over-dramatic hero entry with flying cars/dust",
    category: "entry",
    moods: ["action", "intense", "dramatic", "masala", "epic", "thrilling"],
    stageCueTemplate: "[Dust and debris fly everywhere as the hero makes a jaw-dropping grand entry — stepping out of a cloud of smoke in extreme slow motion, sunglasses on, collar popped]",
    audioTemplate: "[Dhol drumbeats intensify with electric guitar riff and crowd cheering]",
    settingHint: "The location is crowded but parts like the Red Sea as the hero walks through in slow motion",
  },
  tea_stall_faceoff: {
    id: "tea_stall_faceoff",
    name: "Tense tea-stall face-off",
    category: "faceoff",
    moods: ["intense", "dramatic", "action", "comedic", "suspenseful", "masala"],
    stageCueTemplate: "[The clinking of tea glasses echoes dramatically as the characters lock eyes across the crowded stall. A single tea leaf falls. Nobody moves. The stall owner freezes mid-pour.]",
    audioTemplate: "[Tabla rhythms build tension with a rising sitar note]",
    settingHint: "A cramped, steamy tea stall on a crowded Mumbai street where everyone suddenly stops to watch the standoff",
  },
  dramatic_death: {
    id: "dramatic_death",
    name: "Extended death scene with flashbacks",
    category: "death",
    moods: ["emotional", "tragic", "dramatic", "melodramatic", "sentimental"],
    stageCueTemplate: "[The character collapses in slow motion as sepia-toned flashbacks of their entire life play in rapid succession. They reach out a trembling hand towards their loved one before going limp.]",
    audioTemplate: "[Melancholic sitar melody with soft female vocals]",
    settingHint: "The scene is bathed in golden sunset light or white hospital sheets despite the actual location",
  },
  emotional_reunion: {
    id: "emotional_reunion",
    name: "Slow-motion airport/train station reunion",
    category: "reunion",
    moods: ["emotional", "romantic", "joyful", "dramatic", "sentimental", "heartwarming"],
    stageCueTemplate: "[Time stands still as the characters spot each other across the crowded station. They drop their luggage. The crowd parts magically. They run towards each other in extreme slow motion as pigeons take flight.]",
    audioTemplate: "[Sufi-inspired vocal build-up with string orchestra]",
    settingHint: "A busy railway station or airport arrival gate where the crowd somehow vanishes during the hug",
  },
}

export function getTropesForMood(mood: string): TropeDefinition[] {
  const moodLower = mood.toLowerCase()
  const matched: TropeDefinition[] = []
  for (const trope of Object.values(TROPE_CATALOG)) {
    if (trope.moods.some((m) => moodLower.includes(m.toLowerCase()))) {
      matched.push(trope)
    }
  }
  if (matched.length === 0) {
    return [TROPE_CATALOG.tea_stall_faceoff, TROPE_CATALOG.hero_entry]
  }
  return matched
}

export function getTropeById(id: string): TropeDefinition | undefined {
  return TROPE_CATALOG[id as TropeId]
}

export function buildTropePromptSection(mood: string): string {
  const relevant = getTropesForMood(mood)
  if (relevant.length === 0) return ""

  const tropeDescriptions = relevant
    .map(
      (t, i) =>
        `TROPE ${i + 1}: "${t.name}"
   ID: "${t.id}"
   Category: ${t.category}
   When to use: When the mood feels ${t.moods.slice(0, 3).join(", ")}
   Stage cue pattern: ${t.stageCueTemplate}
   Audio pattern: ${t.audioTemplate}
   Setting hint: ${t.settingHint}`
    )
    .join("\n\n")

  return `## BOLIYWOOD TROPE INJECTION SYSTEM

You MUST inject at least 2 of the following over-the-top Bollywood cliches into the screenplay. Each scene should use at least one trope. The tropes should feel organic to the story — as organic as a flying car in a romantic comedy.

Available tropes based on the movie's mood:

${tropeDescriptions}

Rules for tropes:
1. Integrate the trope into the scene's "stageCue", "setting", or character "line" — do NOT add a separate "trope" field in the dialogue
2. The setting may change mid-scene to accommodate the trope (e.g., a coffee shop becomes a sunflower field)
3. The backgroundAudio should match the trope's audioTemplate when a trope is active
4. Multiple tropes can appear across different scenes — the more dramatic, the better`
}

export function buildTropeSchemaPrompt(): string {
  return `## TROPE TRACKING (CRITICAL)

After writing all scenes, you MUST also populate a "tropes" array at the root level of the JSON. Each entry documents which trope was used and where:

\`\`\`
"tropes": [
  {
    "id": "the_trope_id_from_the_catalog_above",
    "sceneNumber": 1,
    "description": "Briefly describe how this trope played out in the scene"
  }
]
\`\`\`

IMPORTANT: Use the EXACT "id" value from the trope catalog above (e.g., "rain_heartbreak", "sunflower_dance", "hero_entry", "tea_stall_faceoff", "dramatic_death", "emotional_reunion"). Do NOT use the display name — use the ID.

This "tropes" array is REQUIRED and must contain at least 2 entries. Make each trope adaptation hilarious and recognizably Bollywood.`
}
