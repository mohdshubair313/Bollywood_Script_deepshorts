"use client"

import { useState, useCallback } from "react"
import { useAudioEngine, type PlaybackState } from "@/app/hooks/use-audio-engine"
import { getEmotionLabel, getEmotionIcon } from "@/lib/audio/emotion-analyzer"
import { getTropeById } from "@/lib/trope-catalog"

interface AudioPlayerProps {
  script: Record<string, any> | null
}

const PLAYBACK_LABELS: Record<PlaybackState, string> = {
  idle: "▶ Play Script",
  loading: "Preparing Audio…",
  playing: "⏸ Pause",
  paused: "▶ Resume",
  done: "🔄 Replay Script",
}

const PLAYBACK_CLASSES: Record<PlaybackState, string> = {
  idle: "bg-cinema-gold/15 text-cinema-gold-light border-cinema-gold/25 hover:bg-cinema-gold/25",
  loading: "bg-cinema-gold/10 text-cinema-gold-light/70 border-cinema-gold/15 cursor-wait",
  playing: "bg-cinema-gold/20 text-cinema-gold-light border-cinema-gold/30 hover:bg-cinema-gold/30",
  paused: "bg-cinema-gold/20 text-cinema-gold-light border-cinema-gold/30 hover:bg-cinema-gold/30",
  done: "bg-cinema-gold/15 text-cinema-gold-light border-cinema-gold/25 hover:bg-cinema-gold/25",
}

const TROPE_DISPLAY: Record<string, { icon: string; label: string; animation: string }> = {
  rain_heartbreak: {
    icon: "🌧️",
    label: "Mandatory slow-motion rain sequence during heartbreak",
    animation: "animate-rain-drop",
  },
  sunflower_dance: {
    icon: "🌻",
    label: "Random dance number in a field of sunflowers",
    animation: "animate-sunflower-spin",
  },
  hero_entry: {
    icon: "💨",
    label: "Over-dramatic hero entry with flying cars/dust",
    animation: "animate-hero-rise",
  },
  tea_stall_faceoff: {
    icon: "🍵",
    label: "Tense tea-stall face-off",
    animation: "animate-pulse-glow",
  },
  dramatic_death: {
    icon: "💔",
    label: "Extended death scene with flashbacks",
    animation: "animate-fade-in",
  },
  emotional_reunion: {
    icon: "🤗",
    label: "Slow-motion airport/train station reunion",
    animation: "animate-slide-up",
  },
}

export function AudioPlayer({ script }: AudioPlayerProps) {
  const [showVoices, setShowVoices] = useState(false)

  const {
    playbackState,
    currentDialogueIndex,
    currentSceneEmotion,
    currentTrope,
    totalDialogues,
    progress,
    availableVoices,
    setSelectedVoiceOverride,
    play,
    pause,
    resume,
    stop,
  } = useAudioEngine(script)

  const handlePlayPause = useCallback(() => {
    if (playbackState === "idle" || playbackState === "done") play()
    else if (playbackState === "playing") pause()
    else if (playbackState === "paused") resume()
  }, [playbackState, play, pause, resume])

  const dialogues = script?.scenes?.flatMap((s: Record<string, any>) => s.dialogues ?? []) ?? []
  const currentDialogue = dialogues[currentDialogueIndex]

  const isIndeterminate = playbackState === "loading"
  const tropeDisplay = currentTrope ? TROPE_DISPLAY[currentTrope.id] : null
  const tropeDef = currentTrope ? getTropeById(currentTrope.id) : null

  const voiceGroups = [
    {
      label: "Indian English",
      voices: availableVoices.filter((v) => v.lang === "en-IN"),
    },
    {
      label: "Hindi",
      voices: availableVoices.filter((v) => v.lang.startsWith("hi")),
    },
    {
      label: "British English",
      voices: availableVoices.filter((v) => v.lang === "en-GB"),
    },
    {
      label: "American English",
      voices: availableVoices.filter((v) => v.lang === "en-US"),
    },
    {
      label: "Other English",
      voices: availableVoices.filter(
        (v) => v.lang.startsWith("en") && !["en-IN", "en-GB", "en-US"].includes(v.lang)
      ),
    },
  ].filter((g) => g.voices.length > 0)

  const sceneEmotionIcon = getEmotionIcon(currentSceneEmotion)
  const sceneEmotionLabel = getEmotionLabel(currentSceneEmotion)

  return (
    <div className="glass rounded-2xl p-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label="sound">🔊</span>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Audio Playback
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice selector */}
          {availableVoices.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowVoices(!showVoices)}
                className="px-3 py-2 rounded-xl bg-cinema-card border border-cinema-card-border text-xs text-cinema-muted hover:text-cinema-gold-light hover:border-cinema-gold/25 transition-all"
                title="Change narrator voice"
              >
                🎙 Voice
              </button>
              {showVoices && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowVoices(false)} />
                  <div className="absolute bottom-full right-0 mb-2 z-20 w-64 max-h-72 overflow-y-auto glass-strong rounded-xl border border-cinema-card-border shadow-xl">
                    <div className="p-2">
                      <button
                        onClick={() => { setSelectedVoiceOverride(null); setShowVoices(false) }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-cinema-gold-light hover:bg-cinema-gold/10 transition-all"
                      >
                        ✦ Auto (best match)
                      </button>
                      <div className="h-px bg-cinema-card-border my-1" />
                      {voiceGroups.map((group) => (
                        <div key={group.label}>
                          <div className="px-3 py-1.5 text-[10px] text-cinema-muted uppercase tracking-wider font-semibold">
                            {group.label}
                          </div>
                          {group.voices.map((v) => (
                            <button
                              key={v.name}
                              onClick={() => { setSelectedVoiceOverride(v); setShowVoices(false) }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs text-foreground/80 hover:bg-cinema-gold/10 hover:text-cinema-gold-light transition-all truncate"
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stop button */}
          {(playbackState === "playing" || playbackState === "paused") && (
            <button
              onClick={stop}
              className="px-3 py-2 rounded-xl bg-cinema-crimson/15 text-cinema-crimson-light border border-cinema-crimson/25 hover:bg-cinema-crimson/25 transition-all text-sm"
              title="Stop playback"
            >
              ⏹
            </button>
          )}

          {/* Play/Pause/Replay button */}
          <button
            onClick={handlePlayPause}
            disabled={!script || totalDialogues === 0 || playbackState === "loading"}
            className={`px-5 py-2 rounded-xl border transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed ${PLAYBACK_CLASSES[playbackState]}`}
          >
            {PLAYBACK_LABELS[playbackState]}
          </button>
        </div>
      </div>

      {/* Scene emotion + Trope indicator */}
      {playbackState !== "idle" && playbackState !== "done" && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="text-cinema-muted">Now playing:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cinema-purple/10 border border-cinema-purple/15 text-cinema-purple-light">
            {sceneEmotionIcon} {sceneEmotionLabel}
          </span>

          {/* Trope Triggered Badge */}
          {currentTrope && tropeDisplay && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cinema-gold/20 via-cinema-gold/10 to-cinema-gold/20 border border-cinema-gold/30 text-cinema-gold-light font-medium ${tropeDisplay.animation}`}
              title={tropeDisplay.label}
            >
              <span className="text-base">{tropeDisplay.icon}</span>
              <span>Bollywood Cliché Triggered!</span>
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-cinema-card-border overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: isIndeterminate ? "40%" : `${progress}%`,
            background: "linear-gradient(90deg, #d4a843, #f0d078, #d4a843)",
            animation: isIndeterminate ? "shimmer 1.5s ease-in-out infinite" : "none",
            backgroundSize: isIndeterminate ? "200% 100%" : undefined,
          }}
        />
      </div>

      {/* Dialogue counter */}
      {playbackState !== "idle" && playbackState !== "done" && (
        <div className="flex items-center justify-between text-xs text-cinema-muted mb-3">
          <span>
            Dialogue {Math.min(currentDialogueIndex + 1, totalDialogues)} of {totalDialogues}
          </span>
          <span>{progress}% complete</span>
        </div>
      )}

      {/* Loading */}
      {playbackState === "loading" && (
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="text-xs text-cinema-muted">Loading voices...</span>
        </div>
      )}

      {/* Completion */}
      {playbackState === "done" && (
        <p className="text-xs text-cinema-gold/70 text-center">✦ Playback complete!</p>
      )}

      {/* Trope description tooltip */}
      {currentTrope && tropeDef && playbackState !== "idle" && playbackState !== "done" && playbackState !== "loading" && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-cinema-gold/5 via-cinema-purple/5 to-cinema-gold/5 border border-cinema-gold/10 animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">{tropeDisplay?.icon}</span>
            <div>
              <p className="text-xs font-semibold text-cinema-gold-light mb-0.5">
                {tropeDef.name}
              </p>
              <p className="text-[11px] text-foreground/60 italic leading-relaxed">
                {currentTrope.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Currently speaking dialogue */}
      {currentDialogue && playbackState !== "idle" && playbackState !== "done" && playbackState !== "loading" && (
        <div className="mt-1 p-3 rounded-xl bg-cinema-card border border-cinema-card-border animate-fade-in speaking-pulse">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cinema-gold animate-pulse" />
            <span className="text-xs font-semibold text-cinema-gold-light">
              {currentDialogue.character}
            </span>
            <span className="text-[10px] text-cinema-muted">now speaking</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {currentDialogue.line}
          </p>
        </div>
      )}
    </div>
  )
}
