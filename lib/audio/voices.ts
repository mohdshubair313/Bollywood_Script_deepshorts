export interface VoiceConfig {
  openai: string
  label: string
  pitch: number
  rate: number
  lang: string
}

const ROLE_VOICE_MAP: Record<string, VoiceConfig> = {
  Hero: {
    openai: "onyx",
    label: "Deep & Authoritative",
    pitch: 0.9,
    rate: 0.85,
    lang: "en-IN",
  },
  Heroine: {
    openai: "nova",
    label: "Warm & Expressive",
    pitch: 1.1,
    rate: 0.9,
    lang: "en-IN",
  },
  Villain: {
    openai: "echo",
    label: "Deep & Menacing",
    pitch: 0.7,
    rate: 0.8,
    lang: "en-IN",
  },
  "Comic Relief": {
    openai: "fable",
    label: "Light & Playful",
    pitch: 1.3,
    rate: 1.05,
    lang: "en-IN",
  },
  Sidekick: {
    openai: "alloy",
    label: "Neutral & Loyal",
    pitch: 1.0,
    rate: 0.95,
    lang: "en-IN",
  },
  Mother: {
    openai: "nova",
    label: "Warm & Nurturing",
    pitch: 1.15,
    rate: 0.85,
    lang: "en-IN",
  },
  Father: {
    openai: "onyx",
    label: "Authoritative & Warm",
    pitch: 0.85,
    rate: 0.85,
    lang: "en-IN",
  },
}

const DEFAULT_VOICE: VoiceConfig = {
  openai: "alloy",
  label: "Neutral",
  pitch: 1.0,
  rate: 0.9,
  lang: "en-IN",
}

export function getVoiceForRole(role: string): VoiceConfig {
  const normalizedRole = role.trim().toLowerCase()
  for (const [key, config] of Object.entries(ROLE_VOICE_MAP)) {
    if (normalizedRole.includes(key.toLowerCase())) {
      return config
    }
  }
  return DEFAULT_VOICE
}

function hasHindiChars(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

function hasHinglishWords(text: string): boolean {
  const hinglishWords = [
    "yaar", "kya", "hai", "nahi", "mujhe", "tujhe", "hum", "tum", "aap",
    "bola", "bolo", "bolti", "baat", "acha", "accha", "theek", "thik",
    "arre", "arey", "oye", "chalo", "chal", "jao", "ja", "aao", "aa",
    "dekh", "dekho", "sun", "suno", "kyon", "kyun", "kaise", "kya",
    "mera", "tera", "apna", "kaun", "kisko", "kisne", "bahut", "bada",
    "chota", "acchi", "khatam", "shuru", "ho gaya", "ho gya",
  ]
  const lower = text.toLowerCase()
  return hinglishWords.some((w) => lower.includes(w))
}

export function detectTextLanguage(text: string): "hi" | "en-IN" | "en" {
  if (hasHindiChars(text)) return "hi"
  if (hasHinglishWords(text)) return "en-IN"
  return "en-IN"
}

export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  text: string,
  config: VoiceConfig
): { voice: SpeechSynthesisVoice | null; lang: string } {
  const language = detectTextLanguage(text)
  const prefLang = language === "hi" ? "hi-IN" : config.lang

  const exact = voices.find((v) => v.lang === prefLang && !v.name.includes("Mobile"))
  if (exact) return { voice: exact, lang: prefLang }

  const anyIndian = voices.find((v) => v.lang.startsWith("en-IN"))
  if (anyIndian) return { voice: anyIndian, lang: "en-IN" }

  const anyHindi = voices.find((v) => v.lang.startsWith("hi"))
  if (anyHindi) return { voice: anyHindi, lang: "hi-IN" }

  const enGB = voices.find((v) => v.lang.startsWith("en-GB"))
  if (enGB) return { voice: enGB, lang: "en-GB" }

  const enAU = voices.find((v) => v.lang.startsWith("en-AU"))
  if (enAU) return { voice: enAU, lang: "en-AU" }

  const enUS = voices.find((v) => v.lang === "en-US" && !v.name.includes("Mobile"))
  if (enUS) return { voice: enUS, lang: "en-US" }

  const anyEn = voices.find((v) => v.lang.startsWith("en"))
  return { voice: anyEn ?? null, lang: anyEn?.lang ?? "en-US" }
}

export type SelectedVoice = { name: string; lang: string }

export function getAllVoiceOptions(voices: SpeechSynthesisVoice[]): SelectedVoice[] {
  return voices
    .filter((v) => v.lang.startsWith("en") || v.lang.startsWith("hi"))
    .map((v) => ({ name: v.name, lang: v.lang }))
}

export function getDefaultVoiceLabel(lang: string): string {
  if (lang.startsWith("hi")) return "Hindi"
  if (lang === "en-IN") return "Indian English"
  if (lang === "en-GB") return "British English"
  if (lang === "en-AU") return "Australian English"
  if (lang === "en-US") return "American English"
  return lang
}
