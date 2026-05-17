import { generateText, Output } from "ai";
import { groq, type GroqLanguageModelOptions } from "@ai-sdk/groq";
import {
  BollywoodScriptSchema,
  type TitleData,
  type CastData,
} from "@/lib/schemas";
import { SCREENPLAY_AGENT_PROMPT } from "@/lib/prompts";

export async function generateScreenplay(
  situation: string,
  titleData: TitleData,
  castData: CastData
) {
  const titleContext = `Title: ${titleData.title}
Tagline: ${titleData.tagline}
Genre: ${titleData.genre}
Mood: ${titleData.mood}`;

  const castContext = castData.characters
    .map(
      (c) =>
        `- ${c.name} (${c.role}): ${c.description}. Quirk: "${c.quirk}"`
    )
    .join("\n");

  const systemPrompt = SCREENPLAY_AGENT_PROMPT.replace(
    "{titleContext}",
    titleContext
  )
    .replace("{castContext}", castContext)
    .replace("{situation}", situation);

  const { output } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    output: Output.object({ schema: BollywoodScriptSchema }),
    providerOptions: {
      groq: { structuredOutputs: false } satisfies GroqLanguageModelOptions,
    },
    system: systemPrompt,
    prompt:
      "Generate the complete Bollywood screenplay in JSON format. Output ONLY valid JSON matching the schema. No explanation, no markdown, no code blocks.",
  });

  return output;
}
