// ============================================================
// AudioSystem.ts — Web Audio wrapper with procedural synthesis
// ============================================================

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceSource: AudioBufferSourceNode | null = null;
  private synthAmbienceGain: GainNode | null = null;
  private synthAmbienceOscs: OscillatorNode[] = [];
  private buffers: Map<string, AudioBuffer> = new Map();
  private _muted = false;

  /** Must be called from a user gesture to unlock AudioContext. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
  }

  async loadBuffer(key: string, url: string): Promise<void> {
    if (!this.ctx) return;
    if (this.buffers.has(key)) return;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(key, decoded);
    } catch {
      // Audio file absent or decode failed — synthesized fallback is ready
    }
  }

  playOneShot(key: string, volume = 1.0): void {
    if (!this.ctx || !this.masterGain || this._muted) return;
    const buf = this.buffers.get(key);
    if (buf) {
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      src.connect(gain);
      gain.connect(this.masterGain);
      src.start();
      return;
    }

    // Fallback: Real-time procedural synthesis
    this._synthesizeOneShot(key, volume);
  }

  playAmbience(key: string, volume = 0.3): void {
    if (!this.ctx || !this.masterGain || this._muted) return;
    this.stopAmbience();

    const buf = this.buffers.get(key);
    if (buf) {
      this.ambienceSource = this.ctx.createBufferSource();
      this.ambienceSource.buffer = buf;
      this.ambienceSource.loop = true;
      const gain = this.ctx.createGain();
      gain.gain.value = volume;
      this.ambienceSource.connect(gain);
      gain.connect(this.masterGain);
      this.ambienceSource.start();
      return;
    }

    // Fallback: Synthesized atmospheric drone
    this._startSynthesizedAmbience(volume);
  }

  stopAmbience(): void {
    if (this.ambienceSource) {
      try { this.ambienceSource.stop(); } catch { /* already stopped */ }
      this.ambienceSource = null;
    }
    if (this.synthAmbienceGain) {
      try {
        this.synthAmbienceOscs.forEach(osc => osc.stop());
      } catch { /* ignored */ }
      this.synthAmbienceOscs = [];
      this.synthAmbienceGain.disconnect();
      this.synthAmbienceGain = null;
    }
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.7;
    }
    if (muted) this.stopAmbience();
  }

  // ─── Procedural Synthesis Fallbacks ─────────────────────

  private _synthesizeOneShot(key: string, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (key === 'unlock') {
      // 3-note ascending chime: C5 (523Hz), E5 (659Hz), G5 (784Hz)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.3 * volume, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } else if (key === 'fail') {
      // Harsh low buzzer with downward pitch sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

      gain.gain.setValueAtTime(0.4 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (key === 'interact') {
      // Crisp click / paper interaction ping
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      gain.gain.setValueAtTime(0.25 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (key === 'glitch') {
      // Glitch burst — rapid frequency modulating oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      osc.frequency.setValueAtTime(110, now + 0.08);
      osc.frequency.setValueAtTime(1760, now + 0.12);

      gain.gain.setValueAtTime(0.2 * volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  }

  private _startSynthesizedAmbience(volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const ambientGain = this.ctx.createGain();
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(volume * 0.35, now + 2.0);
    ambientGain.connect(this.masterGain);
    this.synthAmbienceGain = ambientGain;

    // Filter for muffled low hum
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.connect(ambientGain);

    // Two detuned sub-sine oscillators for atmospheric rumble
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, now); // A1
    osc1.connect(filter);
    osc1.start(now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(58.5, now); // detuned beating
    osc2.connect(filter);
    osc2.start(now);

    this.synthAmbienceOscs = [osc1, osc2];
  }

  dispose(): void {
    this.stopAmbience();
    this.buffers.clear();
    this.ctx?.close();
    this.ctx = null;
  }
}
