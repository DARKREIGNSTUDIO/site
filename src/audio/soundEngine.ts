export type SectionAudioId = 'home' | 'about' | 'skills' | 'corridor' | 'projects' | 'end';

export function clampUnit(value: number, min = -1, max = 1): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}

export function computeGlidePitch(speedPx: number): number {
  const safe = Number.isFinite(speedPx) ? Math.max(0, speedPx) : 0;
  return 0.85 + Math.min(0.45, safe / 120);
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbReturn: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private muted = false;
  private musicActive = false;
  private musicNodes: AudioNode[] = [];
  private musicTimerId: number | null = null;
  private lastGlideAt = 0;
  private lastSectionAt = 0;
  private lastSectionId: SectionAudioId | null = null;
  private lastCorridorStingAt = 0;
  private onStateChangeListeners = new Set<() => void>();

  private notify() {
    this.onStateChangeListeners.forEach((fn) => fn());
  }

  subscribe(listener: () => void): () => void {
    this.onStateChangeListeners.add(listener);
    return () => {
      this.onStateChangeListeners.delete(listener);
    };
  }

  isMuted(): boolean {
    return this.muted;
  }

  isUnlocked(): boolean {
    return this.ctx?.state === 'running';
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();

      // Clean safety limiter so heavy sub-bass and reverb never distort
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -10;
      compressor.knee.value = 14;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.2;
      compressor.connect(this.ctx.destination);

      const master = this.ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.96;
      master.connect(compressor);
      this.masterGain = master;

      const sfx = this.ctx.createGain();
      sfx.gain.value = 0.48;
      sfx.connect(master);
      this.sfxGain = sfx;

      const music = this.ctx.createGain();
      music.gain.value = 0.26;
      music.connect(master);
      this.musicGain = music;

      // Algorithmic heavy dark hall reverb (2.8s stereo tail with lowpass warmth)
      const reverb = this.ctx.createConvolver();
      reverb.buffer = this.buildImpulseResponse(this.ctx, 2.8, 2.4);
      const reverbFilter = this.ctx.createBiquadFilter();
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.value = 2100;

      const reverbReturn = this.ctx.createGain();
      reverbReturn.gain.value = 0.88;

      reverb.connect(reverbFilter);
      reverbFilter.connect(reverbReturn);
      reverbReturn.connect(master);

      this.reverbNode = reverb;
      this.reverbReturn = reverbReturn;
      this.noiseBuffer = this.buildNoiseBuffer(this.ctx, 2.2);
    }

    return this.ctx;
  }

  private buildImpulseResponse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        const env = Math.pow(1 - t, decay) * (1 - Math.exp(-i / (rate * 0.015)));
        const white = Math.random() * 2 - 1;
        prev = prev * 0.55 + white * 0.45;
        data[i] = prev * env;
      }
    }
    return buffer;
  }

  private buildNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.16;
    }
    return buffer;
  }

  async unlock(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    if (!this.musicActive && !this.muted && ctx.state === 'running') {
      this.startAmbientScore();
    }
    this.notify();
    return ctx.state === 'running';
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    const ctx = this.ensureContext();
    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.96, now, 0.08);
    }
    if (!this.muted) {
      void this.unlock();
    }
    this.notify();
    return this.muted;
  }

  private routeToSfx(node: AudioNode, wetAmount = 0.8, pan = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.sfxGain || !this.reverbNode) return;

    const panner = ctx.createStereoPanner();
    panner.pan.value = clampUnit(pan);
    node.connect(panner);

    panner.connect(this.sfxGain);

    if (wetAmount > 0) {
      const wet = ctx.createGain();
      wet.gain.value = wetAmount * 0.45;
      panner.connect(wet);
      wet.connect(this.reverbNode);
    }
  }

  startAmbientScore() {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain || !this.reverbNode || this.musicActive) return;
    if (ctx.state !== 'running') return;

    this.musicActive = true;
    const now = ctx.currentTime;

    const darkFilter = ctx.createBiquadFilter();
    darkFilter.type = 'lowpass';
    darkFilter.frequency.value = 390;
    darkFilter.Q.value = 2.6;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.075;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 170;
    lfo.connect(lfoGain);
    lfoGain.connect(darkFilter.frequency);
    lfo.start(now);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, now);
    padGain.gain.exponentialRampToValueAtTime(0.75, now + 2.2);

    darkFilter.connect(padGain);
    padGain.connect(this.musicGain);

    const wetSend = ctx.createGain();
    wetSend.gain.value = 0.42;
    padGain.connect(wetSend);
    wetSend.connect(this.reverbNode);

    // Heavy dark D-minor / Phrygian sub voices (D1 36.7Hz, A1 55Hz, D2 73.4Hz, F2 87.3Hz)
    const freqs: Array<{ f: number; type: OscillatorType; detune: number; vol: number }> = [
      { f: 36.71, type: 'sine', detune: 0, vol: 0.52 },
      { f: 55.0, type: 'triangle', detune: -5, vol: 0.32 },
      { f: 73.42, type: 'sawtooth', detune: 6, vol: 0.18 },
      { f: 87.31, type: 'sawtooth', detune: -7, vol: 0.12 },
    ];

    this.musicNodes.push(lfo, lfoGain, darkFilter, padGain, wetSend);

    freqs.forEach((v) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.value = v.f;
      osc.detune.value = v.detune;
      const g = ctx.createGain();
      g.gain.value = v.vol;
      osc.connect(g);
      g.connect(darkFilter);
      osc.start(now);
      this.musicNodes.push(osc, g);
    });

    // Subtle slow atmospheric pulse (distant sonar/synth echo into heavy reverb)
    const darkNotes = [146.83, 174.61, 164.81, 130.81, 220.0];
    let step = 0;
    const schedulePulse = () => {
      if (!this.ctx || !this.musicActive || this.muted || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;
      const freq = darkNotes[step % darkNotes.length];
      step += 1;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(0.14, t + 0.4);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 4.4);

      const pan = this.ctx.createStereoPanner();
      pan.pan.value = step % 2 === 0 ? -0.35 : 0.35;

      osc.connect(env);
      env.connect(pan);
      if (this.musicGain) pan.connect(this.musicGain);
      if (this.reverbNode) {
        const rev = this.ctx.createGain();
        rev.gain.value = 0.9;
        pan.connect(rev);
        rev.connect(this.reverbNode);
      }

      osc.start(t);
      osc.stop(t + 4.6);
    };

    schedulePulse();
    this.musicTimerId = window.setInterval(schedulePulse, 4800);
  }

  playLoadingSequence() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted) return;
    const now = ctx.currentTime;

    // 1. VHS mechanical deck latch
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 950;
      bp.Q.value = 2.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      n.connect(bp);
      bp.connect(g);
      this.routeToSfx(g, 0.7, -0.2);
      n.start(now);
      n.stop(now + 0.12);
    }

    // 2. Heavy cinematic power-on sub swell
    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(40, now + 0.04);
    sub.frequency.exponentialRampToValueAtTime(73.42, now + 0.95);
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(160, now + 0.04);
    subFilter.frequency.exponentialRampToValueAtTime(620, now + 0.85);
    const subEnv = ctx.createGain();
    subEnv.gain.setValueAtTime(0.001, now + 0.04);
    subEnv.gain.linearRampToValueAtTime(0.62, now + 0.32);
    subEnv.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    sub.connect(subFilter);
    subFilter.connect(subEnv);
    this.routeToSfx(subEnv, 0.95, 0);
    sub.start(now + 0.04);
    sub.stop(now + 2.05);

    // 3. HUD lock-in harmonic chord
    [293.66, 440.0, 587.33].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const env = ctx.createGain();
      const start = now + 0.45 + i * 0.1;
      env.gain.setValueAtTime(0.001, start);
      env.gain.linearRampToValueAtTime(0.18, start + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, start + 1.4);
      osc.connect(env);
      this.routeToSfx(env, 1.0, (i - 1) * 0.35);
      osc.start(start);
      osc.stop(start + 1.45);
    });
  }

  playHorrorCorridorSting() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted) return;

    const nowMs = performance.now();
    if (nowMs - this.lastCorridorStingAt < 3800) return;
    this.lastCorridorStingAt = nowMs;

    const now = ctx.currentTime;

    // 1. Deep cinematic bass drop
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(92, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 1.4);
    const subEnv = ctx.createGain();
    subEnv.gain.setValueAtTime(0.001, now);
    subEnv.gain.linearRampToValueAtTime(0.55, now + 0.06);
    subEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    sub.connect(subEnv);
    this.routeToSfx(subEnv, 0.9, 0);
    sub.start(now);
    sub.stop(now + 1.65);

    // 2. Dissonant metallic horror scrape / tension interval (tritone shimmer)
    [220.0, 233.08, 311.13].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + 0.04);
      osc.frequency.linearRampToValueAtTime(freq * 0.94, now + 1.8);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(680, now);
      bp.frequency.exponentialRampToValueAtTime(280, now + 1.6);
      bp.Q.value = 3.5;

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, now + 0.04);
      env.gain.linearRampToValueAtTime(0.11, now + 0.25);
      env.gain.exponentialRampToValueAtTime(0.0008, now + 2.1);

      osc.connect(bp);
      bp.connect(env);
      this.routeToSfx(env, 1.0, (i - 1) * 0.45);
      osc.start(now + 0.04);
      osc.stop(now + 2.15);
    });

    // 3. Eerie corridor breath noise tail
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(420, now);
      bp.frequency.exponentialRampToValueAtTime(980, now + 0.8);
      bp.Q.value = 4.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      n.connect(bp);
      bp.connect(g);
      this.routeToSfx(g, 1.0, 0);
      n.start(now);
      n.stop(now + 1.55);
    }
  }

  playTrackingGlitch() {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1450, now);
    bp.frequency.exponentialRampToValueAtTime(360, now + 0.26);
    bp.Q.value = 1.8;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.28, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    src.connect(bp);
    bp.connect(g);
    this.routeToSfx(g, 0.9, 0);
    src.start(now);
    src.stop(now + 0.3);
  }

  playPhotoHoverGlide(panNormalized = 0, speedPx = 18) {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted || !this.noiseBuffer) return;

    const nowMs = performance.now();
    if (nowMs - this.lastGlideAt < 130) return;
    this.lastGlideAt = nowMs;

    const now = ctx.currentTime;
    const pitchFactor = computeGlidePitch(speedPx);

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = pitchFactor;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(520 * pitchFactor, now);
    bp.frequency.exponentialRampToValueAtTime(1250 * pitchFactor, now + 0.18);
    bp.Q.value = 3.0;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.22, now + 0.045);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    src.connect(bp);
    bp.connect(env);
    this.routeToSfx(env, 0.95, clampUnit(panNormalized));
    src.start(now);
    src.stop(now + 0.34);

    const tone = ctx.createOscillator();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(330 * pitchFactor, now);
    tone.frequency.exponentialRampToValueAtTime(440 * pitchFactor, now + 0.2);
    const toneEnv = ctx.createGain();
    toneEnv.gain.setValueAtTime(0.001, now);
    toneEnv.gain.linearRampToValueAtTime(0.065, now + 0.04);
    toneEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    tone.connect(toneEnv);
    this.routeToSfx(toneEnv, 1.0, clampUnit(panNormalized));
    tone.start(now);
    tone.stop(now + 0.28);
  }

  playCardSlide(direction: 'next' | 'prev' = 'next') {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted) return;
    const now = ctx.currentTime;
    const pan = direction === 'next' ? 0.35 : -0.35;

    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(direction === 'next' ? 68 : 98, now);
    sub.frequency.exponentialRampToValueAtTime(direction === 'next' ? 120 : 62, now + 0.19);
    const subEnv = ctx.createGain();
    subEnv.gain.setValueAtTime(0.001, now);
    subEnv.gain.linearRampToValueAtTime(0.36, now + 0.02);
    subEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    sub.connect(subEnv);
    this.routeToSfx(subEnv, 0.85, pan);
    sub.start(now);
    sub.stop(now + 0.28);

    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(480, now);
      bp.frequency.exponentialRampToValueAtTime(1500, now + 0.22);
      bp.Q.value = 2.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.24, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      n.connect(bp);
      bp.connect(g);
      this.routeToSfx(g, 0.95, pan);
      n.start(now);
      n.stop(now + 0.32);
    }
  }

  playSectionAmbience(sectionId: SectionAudioId) {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted) return;

    if (sectionId === 'corridor') {
      this.playHorrorCorridorSting();
      return;
    }

    const nowMs = performance.now();
    if (this.lastSectionId === sectionId && nowMs - this.lastSectionAt < 1800) {
      return;
    }
    this.lastSectionId = sectionId;
    this.lastSectionAt = nowMs;

    const now = ctx.currentTime;

    const configs: Record<
      Exclude<SectionAudioId, 'corridor'>,
      { notes: number[]; type: OscillatorType; cutoff: number; decay: number }
    > = {
      home: { notes: [73.42, 146.83], type: 'triangle', cutoff: 580, decay: 1.9 },
      about: { notes: [110.0, 164.81], type: 'sine', cutoff: 760, decay: 2.0 },
      skills: { notes: [220.0, 293.66, 329.63], type: 'triangle', cutoff: 1250, decay: 1.6 },
      projects: { notes: [55.0, 110.0, 130.81], type: 'sawtooth', cutoff: 460, decay: 2.2 },
      end: { notes: [146.83, 220.0, 261.63], type: 'sine', cutoff: 860, decay: 2.4 },
    };

    const cfg = configs[sectionId];
    cfg.notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = cfg.type;
      osc.frequency.value = freq;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cfg.cutoff;

      const env = ctx.createGain();
      const start = now + idx * 0.09;
      env.gain.setValueAtTime(0.001, start);
      env.gain.linearRampToValueAtTime(idx === 0 ? 0.24 : 0.14, start + 0.08);
      env.gain.exponentialRampToValueAtTime(0.0005, start + cfg.decay);

      osc.connect(filter);
      filter.connect(env);
      this.routeToSfx(env, 1.0, (idx - 1) * 0.35);

      osc.start(start);
      osc.stop(start + cfg.decay + 0.05);
    });
  }

  playUiTick(kind: 'hover' | 'click' = 'click') {
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running' || this.muted) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'click' ? 520 : 680, now);
    osc.frequency.exponentialRampToValueAtTime(kind === 'click' ? 240 : 420, now + 0.045);

    const env = ctx.createGain();
    env.gain.setValueAtTime(kind === 'click' ? 0.19 : 0.08, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(env);
    this.routeToSfx(env, kind === 'click' ? 0.7 : 0.45, 0);
    osc.start(now);
    osc.stop(now + 0.065);
  }
}

export const soundEngine = new SoundEngine();
