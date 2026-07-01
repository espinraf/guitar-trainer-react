let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pluck(freq: number, volume = 0.45, duration = 1.8) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(volume, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + duration);
  master.connect(ctx.destination);

  const bufLen = Math.ceil(ctx.sampleRate / freq);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = freq * 4;

  const delay = ctx.createDelay();
  delay.delayTime.value = 1 / freq;

  const fb = ctx.createGain();
  fb.gain.value = 0.985;

  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = freq * 8;

  noise.connect(lp); lp.connect(delay);
  delay.connect(fb); delay.connect(tone);
  fb.connect(delay); tone.connect(master);

  noise.start(now);
  noise.stop(now + 0.02);
}

export function playMidi(midi: number, volume: number = 0.45): void {
  try { pluck(440 * Math.pow(2, (midi - 69) / 12), volume); } catch {}
}

export function playCorrect() {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    [880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.setValueAtTime(0.07, now + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(now + i * 0.09); osc.stop(now + i * 0.09 + 0.3);
    });
  } catch {}
}

export function playWrong() {
  try {
    const ctx = getCtx(); const now = ctx.currentTime;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 110;
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.2);
  } catch {}
}

export function resumeAudio() { try { getCtx(); } catch {} }

/**
 * Woodblock-style metronome click.
 * accent: true = downbeat (higher pitch), false = regular beat
 */
export function playClick(accent = false) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const freq = accent ? 1200 : 800;

    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.04);
    g.gain.setValueAtTime(accent ? 0.35 : 0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

/** Play a guitar pluck at a given MIDI note — alias with clearer name */
export function playNote(midi: number, volume = 0.45): void {
  playMidi(midi, volume);
}

export function getAudioContext(): AudioContext | null { try { return getCtx(); } catch { return null; } }
