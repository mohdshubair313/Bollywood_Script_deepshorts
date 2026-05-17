import type { TropeId } from "@/lib/trope-catalog"

export type Emotion = "neutral" | "happy" | "sad" | "tense" | "romantic" | "intense" | "mysterious"

export interface TropeState {
  id: TropeId
  description: string
}

const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  neutral: ["normal", "calm", "quiet", "peaceful", "morning", "walk", "sit", "stand", "talk", "speak"],
  happy: ["happy", "joy", "celebrate", "laugh", "smile", "dance", "fun", "romantic", "love", "sunflower", "wedding", "joyful", "upbeat", "comedy", "funny", "humor", "lighthearted", "celebratory"],
  sad: ["sad", "cry", "tears", "heartbreak", "pain", "grief", "mourn", "loss", "emotional", "melancholy", "tragic", "sentimental", "lonely", "miss"],
  tense: ["tension", "face-off", "faceoff", "stall", "stare", "confront", "danger", "suspense", "thriller", "argument", "fight", "conflict", "showdown", "standoff", "intense"],
  romantic: ["romantic", "love", "romance", "couple", "kiss", "date", "passion", "heart", "together", "embrace", "soft"],
  intense: ["action", "dramatic", "epic", "hero", "entry", "entrance", "slow motion", "powerful", "explosion", "chase", "battle", "epic", "grand", "masala"],
  mysterious: ["mysterious", "secret", "suspense", "shadow", "dark", "strange", "unknown", "whisper", "creepy", "mystery", "hidden"],
}

const EMOTION_WEIGHTS: Record<string, Emotion> = {}

for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
  for (const keyword of keywords) {
    EMOTION_WEIGHTS[keyword] = emotion as Emotion
  }
}

export function detectSceneEmotion(
  title: string,
  setting: string,
  dialogues: { direction?: string; line?: string }[]
): Emotion {
  const text = [title, setting, ...dialogues.flatMap((d) => [d.direction ?? "", d.line ?? ""])]
    .join(" ")
    .toLowerCase()

  const scores: Record<string, number> = {
    neutral: 1,
    happy: 0,
    sad: 0,
    tense: 0,
    romantic: 0,
    intense: 0,
    mysterious: 0,
  }

  for (const [keyword, emotion] of Object.entries(EMOTION_WEIGHTS)) {
    if (text.includes(keyword)) {
      const count = (text.match(new RegExp(keyword, "g")) ?? []).length
      scores[emotion] += count * 2
    }
  }

  if (text.includes("!")) scores.intense += 2
  if (text.includes("?")) scores.mysterious += 1
  if (text.includes("...")) scores.sad += 1

  let bestEmotion: Emotion = "neutral"
  let bestScore = 0
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestEmotion = emotion as Emotion
    }
  }

  return bestEmotion
}

export function findTropeForScene(
  sceneNumber: number,
  tropes: { id?: string; sceneNumber?: number; description?: string }[]
): TropeState | null {
  for (const t of tropes ?? []) {
    if (t.sceneNumber === sceneNumber && t.id) {
      return { id: t.id as TropeId, description: t.description ?? "" }
    }
  }
  return null
}

export function getEmotionLabel(emotion: Emotion): string {
  const labels: Record<Emotion, string> = {
    neutral: "Calm Scene",
    happy: "Joyful Moment",
    sad: "Emotional Scene",
    tense: "Tense Standoff",
    romantic: "Romantic Moment",
    intense: "Action Scene",
    mysterious: "Mysterious Vibe",
  }
  return labels[emotion]
}

export function getEmotionIcon(emotion: Emotion): string {
  const icons: Record<Emotion, string> = {
    neutral: "😌",
    happy: "😄",
    sad: "😢",
    tense: "😬",
    romantic: "💕",
    intense: "💥",
    mysterious: "🤔",
  }
  return icons[emotion]
}
