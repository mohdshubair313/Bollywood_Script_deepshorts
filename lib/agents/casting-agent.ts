import { generateText, Output } from "ai";
import { groq, type GroqLanguageModelOptions } from "@ai-sdk/groq";
import { CastSchema, type CastData, type TitleData } from "@/lib/schemas";
import { CASTING_AGENT_PROMPT } from "@/lib/prompts";

export async function generateCast(
  situation: string,
  titleData: TitleData
): Promise<CastData> {
  const context = `Movie Concept:
Title: ${titleData.title}
Tagline: ${titleData.tagline}
Genre: ${titleData.genre}
Mood: ${titleData.mood}

User's Situation: ${situation}`;

  const { output } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    output: Output.object({ schema: CastSchema }),
    providerOptions: {
      groq: { structuredOutputs: false } satisfies GroqLanguageModelOptions,
    },
    system: CASTING_AGENT_PROMPT,
    prompt:
      context +
      "\n\nOutput ONLY valid JSON matching the schema. No explanation, no markdown.",
  });

  return output;
}
