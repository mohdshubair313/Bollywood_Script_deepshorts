import type { Emotion } from "./emotion-analyzer"
import type { TropeId } from "@/lib/trope-catalog"

export type SynthHandle = { stop: () => void }

function createEnvelope(
  ctx: AudioContext,
  gain: GainNode,
  attack: number,
  sustain: number,
  release: number,
  peakLevel = 1,
  sustainLevel = 0.6
) {
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peakLevel, now + attack)
  gain.gain.setValueAtTime(peakLevel, now + attack + 0.05)
  gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + 0.15)
  gain.gain.setValueAtTime(sustainLevel, now + attack + sustain)
  gain.gain.linearRampToValueAtTime(0, now + attack + sustain + release)
}

function warmPad(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.08
  masterGain.connect(ctx.destination)

  const oscillators: OscillatorNode[] = []
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    const baseFreq = 110 + i * 55
    osc.frequency.value = baseFreq
    osc.detune.value = (i - 1.5) * 3

    const gain = ctx.createGain()
    createEnvelope(ctx, gain, 0.4, duration - 1.2, 0.8, 0.25, 0.12)
    gain.connect(masterGain)
    osc.connect(gain)
    osc.start()
    if (!loop) osc.stop(ctx.currentTime + duration)
    oscillators.push(osc)
  }

  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.value = 0.3
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 8
  lfo.connect(lfoGain)
  lfoGain.connect(oscillators[0].frequency)
  lfoGain.connect(oscillators[2].frequency)
  lfo.start()
  if (!loop) lfo.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      for (const o of oscillators) try { o.stop() } catch {}
      try { lfo.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function tensionPad(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.06
  masterGain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.value = 55
  osc.detune.value = -5

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 300
  filter.Q.value = 1

  const gain = ctx.createGain()
  createEnvelope(ctx, gain, 0.5, duration - 1, 0.5, 0.35, 0.2)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  osc.start()
  if (!loop) osc.stop(ctx.currentTime + duration)

  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.value = 0.6
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 25
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()
  if (!loop) lfo.stop(ctx.currentTime + duration)

  const pulse = ctx.createOscillator()
  pulse.type = "sine"
  pulse.frequency.value = 2.5
  const pulseGain = ctx.createGain()
  pulseGain.gain.value = 15
  pulse.connect(pulseGain)
  pulseGain.connect(filter.frequency)
  pulse.start()
  if (!loop) pulse.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      try { osc.stop() } catch {}
      try { lfo.stop() } catch {}
      try { pulse.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function happyRhythm(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.07
  masterGain.connect(ctx.destination)

  const baseFreq = 330
  const oscs: OscillatorNode[] = []

  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    osc.type = "triangle"
    const freq = baseFreq * (1 + i * 0.25)
    osc.frequency.value = freq
    osc.detune.value = (i - 1) * 2

    const g = ctx.createGain()
    g.gain.value = 0.15
    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    if (!loop) osc.stop(ctx.currentTime + duration)
    oscs.push(osc)
  }

  const rhythmLfo = ctx.createOscillator()
  rhythmLfo.type = "square"
  rhythmLfo.frequency.value = 2.0
  const rhythmGain = ctx.createGain()
  rhythmGain.gain.value = 0.08
  rhythmLfo.connect(rhythmGain)
  rhythmGain.connect(masterGain.gain)
  rhythmLfo.start()
  if (!loop) rhythmLfo.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      for (const o of oscs) try { o.stop() } catch {}
      try { rhythmLfo.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function sadPad(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.06
  masterGain.connect(ctx.destination)

  const oscs: OscillatorNode[] = []
  const freqs = [196, 233, 277, 311]

  for (const freq of freqs) {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq

    const g = ctx.createGain()
    createEnvelope(ctx, g, 0.3, duration - 0.8, 0.5, 0.12, 0.06)

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 800

    osc.connect(filter)
    filter.connect(g)
    g.connect(masterGain)
    osc.start()
    if (!loop) osc.stop(ctx.currentTime + duration)
    oscs.push(osc)
  }

  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.value = 0.4
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 6
  lfo.connect(lfoGain)
  lfoGain.connect(oscs[0].frequency)
  lfoGain.connect(oscs[2].frequency)
  lfo.start()
  if (!loop) lfo.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      for (const o of oscs) try { o.stop() } catch {}
      try { lfo.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function romanticPad(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.07
  masterGain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = "sine"
  osc.frequency.value = 262

  const gain = ctx.createGain()
  createEnvelope(ctx, gain, 0.2, duration - 0.5, 0.3, 0.2, 0.1)

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 1000

  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.value = 2.5
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 8
  lfo.connect(lfoGain)
  lfoGain.connect(osc.frequency)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  osc.start()
  lfo.start()
  if (!loop) {
    osc.stop(ctx.currentTime + duration)
    lfo.stop(ctx.currentTime + duration)
  }

  return {
    stop: () => {
      try { osc.stop() } catch {}
      try { lfo.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function intensePulse(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.09
  masterGain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.value = 65

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 250

  const gain = ctx.createGain()
  createEnvelope(ctx, gain, 0.1, duration - 0.3, 0.2, 0.4, 0.25)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  osc.start()
  if (!loop) osc.stop(ctx.currentTime + duration)

  const pulseOsc = ctx.createOscillator()
  pulseOsc.type = "sine"
  pulseOsc.frequency.value = 4
  const pulseGain = ctx.createGain()
  pulseGain.gain.value = 0.06
  pulseOsc.connect(pulseGain)
  pulseGain.connect(masterGain.gain)
  pulseOsc.start()
  if (!loop) pulseOsc.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      try { osc.stop() } catch {}
      try { pulseOsc.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function mysteriousDrone(ctx: AudioContext, duration: number, loop: boolean): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.05
  masterGain.connect(ctx.destination)

  const oscs: OscillatorNode[] = []
  for (const freq of [110, 165, 220]) {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * 4

    const g = ctx.createGain()
    createEnvelope(ctx, g, 0.5, duration - 1, 0.5, 0.12, 0.06)
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.value = freq * 3
    filter.Q.value = 2

    osc.connect(filter)
    filter.connect(g)
    g.connect(masterGain)
    osc.start()
    if (!loop) osc.stop(ctx.currentTime + duration)
    oscs.push(osc)
  }

  const modOsc = ctx.createOscillator()
  modOsc.type = "sine"
  modOsc.frequency.value = 0.2
  const modGain = ctx.createGain()
  modGain.gain.value = 0.02
  modOsc.connect(modGain)
  modGain.connect(masterGain.gain)
  modOsc.start()
  if (!loop) modOsc.stop(ctx.currentTime + duration)

  return {
    stop: () => {
      for (const o of oscs) try { o.stop() } catch {}
      try { modOsc.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

// ─── Trope-specific audio layers ────────────────────────────────────

function rainNoiseLayer(ctx: AudioContext, duration: number): SynthHandle {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * Math.min(duration, 8)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(2000, ctx.currentTime)
  filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.8)

  const filterMod = ctx.createOscillator()
  filterMod.type = "sine"
  filterMod.frequency.value = 3
  const filterModGain = ctx.createGain()
  filterModGain.gain.value = 600
  filterMod.connect(filterModGain)
  filterModGain.connect(filter.frequency)
  filterMod.start()

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5)
  gain.gain.setValueAtTime(0.05, ctx.currentTime + duration - 0.5)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start()

  return {
    stop: () => {
      try { source.stop() } catch {}
      try { filterMod.stop() } catch {}
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    },
  }
}

function sunflowerDholLayer(ctx: AudioContext, duration: number): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.07
  masterGain.connect(ctx.destination)

  const bpm = 130
  const beatDuration = 60 / bpm
  const totalBeats = Math.floor(duration / beatDuration)

  const stopHandles: (() => void)[] = []

  for (let i = 0; i < totalBeats && i < 80; i++) {
    const t = ctx.currentTime + i * beatDuration

    const kick = ctx.createOscillator()
    kick.type = "sine"
    kick.frequency.setValueAtTime(140, t)
    kick.frequency.exponentialRampToValueAtTime(50, t + 0.1)

    const kickGain = ctx.createGain()
    kickGain.gain.setValueAtTime(1, t)
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    kick.connect(kickGain)
    kickGain.connect(masterGain)
    kick.start(t)
    kick.stop(t + 0.12)

    if (i % 2 === 0) {
      const clap = ctx.createOscillator()
      clap.type = "square"
      clap.frequency.setValueAtTime(800, t)
      const clapGain = ctx.createGain()
      clapGain.gain.setValueAtTime(0.06, t)
      clapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      clap.connect(clapGain)
      clapGain.connect(masterGain)
      clap.start(t)
      clap.stop(t + 0.05)
    }

    if (i % 4 === 2) {
      const open = ctx.createOscillator()
      open.type = "triangle"
      open.frequency.value = 1200
      const openGain = ctx.createGain()
      openGain.gain.setValueAtTime(0.04, t)
      openGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      open.connect(openGain)
      openGain.connect(masterGain)
      open.start(t)
      open.stop(t + 0.08)
    }

    stopHandles.push(() => { try { kick.stop() } catch {} })
  }

  return {
    stop: () => {
      for (const h of stopHandles) h()
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    },
  }
}

function heroRiserLayer(ctx: AudioContext, duration: number): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.08
  masterGain.connect(ctx.destination)

  const osc = ctx.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(80, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + Math.min(duration, 3))
  osc.frequency.setValueAtTime(1200, ctx.currentTime + Math.min(duration, 3))
  osc.frequency.setValueAtTime(1200, ctx.currentTime + duration - 0.5)

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.setValueAtTime(200, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + Math.min(duration, 3))

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.2)
  gain.gain.setValueAtTime(1, ctx.currentTime + Math.min(duration, 3) - 0.3)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + Math.min(duration, 3))
  gain.gain.setValueAtTime(0, ctx.currentTime + Math.min(duration, 3))

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  osc.start()

  const subOsc = ctx.createOscillator()
  subOsc.type = "sine"
  subOsc.frequency.setValueAtTime(60, ctx.currentTime)
  subOsc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + Math.min(duration, 2.5))
  const subGain = ctx.createGain()
  subGain.gain.setValueAtTime(0.2, ctx.currentTime)
  subGain.gain.linearRampToValueAtTime(0, ctx.currentTime + Math.min(duration, 2.5))
  subOsc.connect(subGain)
  subGain.connect(masterGain)
  subOsc.start()

  return {
    stop: () => {
      try { osc.stop() } catch {}
      try { subOsc.stop() } catch {}
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    },
  }
}

function tensionClinkLayer(ctx: AudioContext, duration: number): SynthHandle {
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.03
  masterGain.connect(ctx.destination)

  const intervalId = setInterval(() => {
    const t = ctx.currentTime + 0.05
    const clink = ctx.createOscillator()
    clink.type = "sine"
    clink.frequency.value = 2000 + Math.random() * 1000

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
    clink.connect(g)
    g.connect(masterGain)
    clink.start(t)
    clink.stop(t + 0.05)
  }, 1200 + Math.random() * 800) as unknown as number

  return {
    stop: () => {
      clearInterval(intervalId)
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    },
  }
}

// ─── Trope layer dispatcher ─────────────────────────────────────────

export function getTropeSynthLayer(
  tropeId: TropeId
): ((ctx: AudioContext, duration: number) => SynthHandle) | null {
  const map: Record<string, (ctx: AudioContext, duration: number) => SynthHandle> = {
    rain_heartbreak: rainNoiseLayer,
    sunflower_dance: sunflowerDholLayer,
    hero_entry: heroRiserLayer,
    tea_stall_faceoff: tensionClinkLayer,
    dramatic_death: rainNoiseLayer,
    emotional_reunion: heroRiserLayer,
  }
  return map[tropeId] ?? null
}

// ─── Emotion base map ───────────────────────────────────────────────

const EMOTION_SYNTH_MAP: Record<Emotion, (ctx: AudioContext, dur: number, loop: boolean) => SynthHandle> = {
  neutral: warmPad,
  happy: happyRhythm,
  sad: sadPad,
  tense: tensionPad,
  romantic: romanticPad,
  intense: intensePulse,
  mysterious: mysteriousDrone,
}

export function getSynthForEmotion(emotion: Emotion) {
  return EMOTION_SYNTH_MAP[emotion] ?? warmPad
}
