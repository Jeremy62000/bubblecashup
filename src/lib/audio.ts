// ---------------------------------------------------------------------------
// Bubble Up — tiny WebAudio sound synth (no assets, no dependencies).
// The AudioContext is created lazily on the first user gesture; every call is
// guarded so audio can never break the game loop.
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(next: boolean) {
  muted = next;
}

export function isMuted() {
  return muted;
}

/** Must be called from a user gesture (click/tap) to unlock audio. */
export function initAudio() {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(
  freq: number,
  duration: number,
  opts: {
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    slideTo?: number;
  } = {},
) {
  if (muted || !ctx) return;
  try {
    const { type = "sine", gain = 0.15, delay = 0, slideTo } = opts;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {
    /* audio never blocks gameplay */
  }
}

function noiseBurst(duration: number, gain = 0.2, delay = 0) {
  if (muted || !ctx) return;
  try {
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(t0);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  /** Satisfying cash-in: two quick rising notes. */
  cash() {
    tone(660, 0.12, { type: "triangle", gain: 0.14 });
    tone(880, 0.14, { type: "triangle", gain: 0.14, delay: 0.08 });
    tone(1320, 0.18, { type: "sine", gain: 0.1, delay: 0.16 });
  },
  /** Big payout fanfare. */
  jackpot() {
    tone(523, 0.15, { type: "triangle", gain: 0.14 });
    tone(659, 0.15, { type: "triangle", gain: 0.14, delay: 0.1 });
    tone(784, 0.15, { type: "triangle", gain: 0.14, delay: 0.2 });
    tone(1047, 0.3, { type: "triangle", gain: 0.16, delay: 0.3 });
  },
  /** Gem chime for rainbow bubbles. */
  gem() {
    tone(1047, 0.12, { type: "sine", gain: 0.12 });
    tone(1568, 0.2, { type: "sine", gain: 0.12, delay: 0.07 });
  },
  /** Golden bubble fanfare. */
  golden() {
    tone(784, 0.12, { type: "sine", gain: 0.12 });
    tone(988, 0.12, { type: "sine", gain: 0.12, delay: 0.09 });
    tone(1175, 0.22, { type: "sine", gain: 0.13, delay: 0.18 });
  },
  /** Explosion: low thump + noise. */
  pop() {
    tone(220, 0.35, { type: "triangle", gain: 0.3, slideTo: 60 });
    noiseBurst(0.35, 0.25);
    tone(120, 0.4, { type: "sine", gain: 0.3, slideTo: 40, delay: 0.05 });
  },
  /** Soft UI click. */
  click() {
    tone(520, 0.06, { type: "sine", gain: 0.08, slideTo: 700 });
  },
};