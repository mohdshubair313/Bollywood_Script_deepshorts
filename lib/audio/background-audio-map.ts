import type { Emotion } from "./emotion-analyzer"

export interface BackgroundSceneAudio {
  emotion: Emotion
  label: string
  icon: string
}

export function getSceneBackground(emotion: Emotion): BackgroundSceneAudio {
  const sceneMap: Record<Emotion, BackgroundSceneAudio> = {
    neutral: { emotion: "neutral", label: "Calm Scene", icon: "😌" },
    happy: { emotion: "happy", label: "Joyful Moment", icon: "😄" },
    sad: { emotion: "sad", label: "Emotional Scene", icon: "😢" },
    tense: { emotion: "tense", label: "Tense Standoff", icon: "😬" },
    romantic: { emotion: "romantic", label: "Romantic Moment", icon: "💕" },
    intense: { emotion: "intense", label: "Action Scene", icon: "💥" },
    mysterious: { emotion: "mysterious", label: "Mysterious Vibe", icon: "🤔" },
  }
  return sceneMap[emotion] ?? sceneMap.neutral
}
