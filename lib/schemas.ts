import { z } from "zod";

export const TitleSchema = z.object({
  title: z.string().describe("Catchy Bollywood movie title — dramatic, over-the-top"),
  tagline: z.string().describe("Dramatic one-liner tagline, e.g., 'Some loves are written in the stars... and some are thrown at each other'"),
  genre: z.string().describe("Bollywood genre, e.g., Action Drama, Romantic Comedy, Family Melodrama"),
  mood: z.string().describe("Overall mood, e.g., intense, comedic, emotional, romantic"),
});

export const CastSchema = z.object({
  characters: z.array(
    z.object({
      name: z.string().describe("Character name — Hindi or English"),
      role: z.string().describe("e.g., Hero, Heroine, Villain, Comic Relief, Mother, Sidekick"),
      description: z.string().describe("Dramatic character description with flair"),
      quirk: z.string().describe("Signature quirk, catchphrase, or recurring mannerism"),
    })
  ).describe("Array of 3-5 characters in the script"),
});

export const BollywoodScriptSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  genre: z.string(),
  mood: z.string(),
  cast: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      description: z.string(),
      quirk: z.string(),
    })
  ),
  scenes: z.array(
    z.object({
      sceneNumber: z.number(),
      title: z.string().describe("Scene title, e.g., 'The Grand Entry', 'Rain of Emotions'"),
      setting: z.string().describe("Location and atmosphere, e.g., 'A bustling Mumbai street during monsoon'"),
      stageCue: z.string().describe("Opening stage direction, e.g., '[Rain starts pouring as HERO makes his entry]'"),
      dialogues: z.array(
        z.object({
          character: z.string(),
          line: z.string(),
          direction: z.string().describe("Acting direction in parentheses, e.g., '(whispers dramatically)'"),
          backgroundAudio: z.string().describe("Cinematic audio cue in brackets, e.g., '[Violin crescendo]'. Use empty string if no audio."),
        })
      ),
    })
  ),
});

export type TitleData = z.infer<typeof TitleSchema>;
export type CastData = z.infer<typeof CastSchema>;
export type BollywoodScriptData = z.infer<typeof BollywoodScriptSchema>;
