"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { getVoiceForRole, findBestVoice, type SelectedVoice } from "@/lib/audio/voices"
import { detectSceneEmotion, findTropeForScene, type Emotion, type TropeState } from "@/lib/audio/emotion-analyzer"
import { getSynthForEmotion, getTropeSynthLayer } from "@/lib/audio/background-synthesizer"
import { getTropeById } from "@/lib/trope-catalog"

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "done"

interface QueuedDialogue {
  character: string
  role: string
  line: string
  direction: string
  backgroundAudio: string
  sceneNumber: number
}

interface SceneQueue {
  sceneNumber: number
  emotion: Emotion
  emotionLabel: string
  trope: TropeState | null
  dialogues: QueuedDialogue[]
}

export function useAudioEngine(script: Record<string, any> | null) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle")
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(-1)
  const [currentSceneEmotion, setCurrentSceneEmotion] = useState<Emotion>("neutral")
  const [currentTrope, setCurrentTrope] = useState<TropeState | null>(null)
  const [totalDialogues, setTotalDialogues] = useState(0)
  const [progress, setProgress] = useState(0)
  const [availableVoices, setAvailableVoices] = useState<SelectedVoice[]>([])
  const [selectedVoiceOverride, setSelectedVoiceOverride] = useState<SelectedVoice | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const currentBgHandleRef = useRef<{ stop: () => void } | null>(null)
  const currentTropeHandleRef = useRef<{ stop: () => void } | null>(null)
  const speechSynthRef = useRef<SpeechSynthesis | null>(null)
  const isCancelledRef = useRef(false)
  const cachedVoicesRef = useRef<SpeechSynthesisVoice[]>([])

  const scenesRef = useRef<SceneQueue[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthRef.current = window.speechSynthesis

      const loadVoices = () => {
        const allVoices = speechSynthRef.current?.getVoices() ?? []
        cachedVoicesRef.current = allVoices
        import("@/lib/audio/voices").then(({ getAllVoiceOptions }) => {
          setAvailableVoices(getAllVoiceOptions(allVoices))
        })
      }
      loadVoices()
      window.speechSynthesis?.addEventListener("voiceschanged", loadVoices)
      return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  useEffect(() => {
    if (!script) {
      setPlaybackState("idle")
      setCurrentDialogueIndex(-1)
      setProgress(0)
      setCurrentTrope(null)
      scenesRef.current = []
      return
    }

    const scriptTropes = script.tropes ?? []

    const scenes: SceneQueue[] = []
    for (const scene of script.scenes ?? []) {
      const dialogues: QueuedDialogue[] = []
      for (const d of scene.dialogues ?? []) {
        const character = d.character ?? ""
        const characterData = (script.cast ?? []).find(
          (c: { name?: string }) => (c.name ?? "").toLowerCase() === character.toLowerCase()
        )
        dialogues.push({
          character,
          role: characterData?.role ?? "Sidekick",
          line: d.line ?? "",
          direction: d.direction ?? "",
          backgroundAudio: d.backgroundAudio ?? "",
          sceneNumber: scene.sceneNumber ?? 0,
        })
      }
      const emotion = detectSceneEmotion(scene.title ?? "", scene.setting ?? "", dialogues)
      const trope = findTropeForScene(scene.sceneNumber ?? scenes.length + 1, scriptTropes)
      scenes.push({
        sceneNumber: scene.sceneNumber ?? scenes.length + 1,
        emotion,
        emotionLabel: "",
        trope,
        dialogues,
      })
    }
    scenesRef.current = scenes
    setTotalDialogues(scenes.reduce((sum, s) => sum + s.dialogues.length, 0))
  }, [script])

  const stopAudio = useCallback(() => {
    isCancelledRef.current = true
    if (speechSynthRef.current) speechSynthRef.current.cancel()

    if (currentBgHandleRef.current) {
      currentBgHandleRef.current.stop()
      currentBgHandleRef.current = null
    }
    if (currentTropeHandleRef.current) {
      currentTropeHandleRef.current.stop()
      currentTropeHandleRef.current = null
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  const speakWithBrowserTTS = useCallback(
    (text: string, role: string): Promise<void> => {
      return new Promise((resolve) => {
        const synth = speechSynthRef.current
        if (!synth) { resolve(); return }

        const utterance = new SpeechSynthesisUtterance(text)
        const config = getVoiceForRole(role)

        if (selectedVoiceOverride) {
          const match = cachedVoicesRef.current.find(
            (v) => v.name === selectedVoiceOverride.name
          )
          if (match) {
            utterance.voice = match
            utterance.lang = match.lang
          } else {
            const best = findBestVoice(cachedVoicesRef.current, text, config)
            utterance.voice = best.voice
            utterance.lang = best.lang
          }
        } else {
          const best = findBestVoice(cachedVoicesRef.current, text, config)
          utterance.voice = best.voice
          utterance.lang = best.lang
        }

        utterance.pitch = config.pitch
        utterance.rate = config.rate
        utterance.volume = 1

        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()

        synth.speak(utterance)
      })
    },
    [selectedVoiceOverride]
  )

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }, [])

  const startSceneAudio = useCallback(
    (emotion: Emotion, trope: TropeState | null) => {
      if (currentBgHandleRef.current) {
        currentBgHandleRef.current.stop()
        currentBgHandleRef.current = null
      }
      if (currentTropeHandleRef.current) {
        currentTropeHandleRef.current.stop()
        currentTropeHandleRef.current = null
      }

      try {
        const ctx = ensureAudioContext()
        const baseSynth = getSynthForEmotion(emotion)
        currentBgHandleRef.current = baseSynth(ctx, 30, true)

        if (trope) {
          const tropeSynth = getTropeSynthLayer(trope.id)
          if (tropeSynth) {
            currentTropeHandleRef.current = tropeSynth(ctx, 30)
          }
        }
      } catch (e) {
        console.warn("Scene audio failed:", e)
      }
    },
    [ensureAudioContext]
  )

  const stopBackground = useCallback(() => {
    if (currentBgHandleRef.current) {
      currentBgHandleRef.current.stop()
      currentBgHandleRef.current = null
    }
    if (currentTropeHandleRef.current) {
      currentTropeHandleRef.current.stop()
      currentTropeHandleRef.current = null
    }
  }, [])

  const play = useCallback(async () => {
    const scenes = scenesRef.current
    if (scenes.length === 0) return

    isCancelledRef.current = false
    setPlaybackState("loading")

    const synth = speechSynthRef.current
    if (!synth) { setPlaybackState("done"); return }

    if (cachedVoicesRef.current.length === 0) {
      await new Promise<void>((resolve) => {
        const handler = () => {
          cachedVoicesRef.current = synth.getVoices()
          resolve()
        }
        synth.addEventListener("voiceschanged", handler, { once: true })
        setTimeout(resolve, 2000)
      })
    }

    setPlaybackState("playing")

    let globalIndex = 0
    for (const scene of scenes) {
      if (isCancelledRef.current) break

      setCurrentSceneEmotion(scene.emotion)
      setCurrentTrope(scene.trope)
      startSceneAudio(scene.emotion, scene.trope)

      for (const d of scene.dialogues) {
        if (isCancelledRef.current) break
        setCurrentDialogueIndex(globalIndex)
        setProgress(Math.round(((globalIndex + 1) / totalDialogues) * 100))

        const displayLine = d.direction
          ? `${d.character} says: ${d.direction} ${d.line}`
          : `${d.character} says: ${d.line}`

        await speakWithBrowserTTS(displayLine, d.role)
        globalIndex++
      }
    }

    stopBackground()
    if (!isCancelledRef.current) {
      setPlaybackState("done")
      setProgress(100)
      setCurrentSceneEmotion("neutral")
      setCurrentTrope(null)
    }
  }, [speakWithBrowserTTS, startSceneAudio, stopBackground, totalDialogues])

  const pause = useCallback(() => {
    if (speechSynthRef.current) speechSynthRef.current.pause()
    setPlaybackState("paused")
  }, [])

  const resume = useCallback(() => {
    if (speechSynthRef.current) speechSynthRef.current.resume()
    setPlaybackState("playing")
  }, [])

  const stop = useCallback(() => {
    stopAudio()
    setPlaybackState("idle")
    setCurrentDialogueIndex(-1)
    setCurrentSceneEmotion("neutral")
    setCurrentTrope(null)
    setProgress(0)
  }, [stopAudio])

  useEffect(() => {
    return () => { stopAudio() }
  }, [stopAudio])

  return {
    playbackState,
    currentDialogueIndex,
    currentSceneEmotion,
    currentTrope,
    totalDialogues,
    progress,
    availableVoices,
    selectedVoiceOverride,
    setSelectedVoiceOverride,
    play,
    pause,
    resume,
    stop,
  }
}
