import { generateText, Output } from "ai";
import { groq, type GroqLanguageModelOptions } from "@ai-sdk/groq";
import { TitleSchema, type TitleData } from "@/lib/schemas";
import { TITLE_AGENT_PROMPT } from "@/lib/prompts";

export async function generateTitle(situation: string): Promise<TitleData> {
  const { output } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    output: Output.object({ schema: TitleSchema }),
    providerOptions: {
      groq: { structuredOutputs: false } satisfies GroqLanguageModelOptions,
    },
    system: TITLE_AGENT_PROMPT,
    prompt:
      situation +
      "\n\nOutput ONLY valid JSON matching the schema. No explanation, no markdown.",
  });

  return output;
}
