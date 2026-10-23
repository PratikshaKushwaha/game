// ============================================================
// AudioSystem.ts — Simple Web Audio wrapper for game sounds
// ============================================================

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceSource: AudioBufferSourceNode | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private _muted = false;

  /** Must be called from a user gesture to unlock AudioContext. */
  unlock(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.7;
    this.masterGain.connect(this.ctx.destination);
  }

  async loadBuffer(key: string, url: string): Promise<void> {
    if (!this.ctx) return;
    if (this.buffers.has(key)) return;
    try {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(key, decoded);
    } catch {
      // Audio file absent or decode failed — silently ignore
    }
  }

  playOneShot(key: string, volume = 1.0): void {
    if (!this.ctx || !this.masterGain || this._muted) return;
    const buf = this.buffers.get(key);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(this.masterGain);
    src.start();
  }

  playAmbience(key: string, volume = 0.3): void {
    if (!this.ctx || !this.masterGain || this._muted) return;
    this.stopAmbience();
    const buf = this.buffers.get(key);
    if (!buf) return;
    this.ambienceSource = this.ctx.createBufferSource();
    this.ambienceSource.buffer = buf;
    this.ambienceSource.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    this.ambienceSource.connect(gain);
    gain.connect(this.masterGain);
    this.ambienceSource.start();
  }

  stopAmbience(): void {
    if (this.ambienceSource) {
      try { this.ambienceSource.stop(); } catch { /* already stopped */ }
      this.ambienceSource = null;
    }
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.7;
    }
    if (muted) this.stopAmbience();
  }

  dispose(): void {
    this.stopAmbience();
    this.buffers.clear();
    this.ctx?.close();
    this.ctx = null;
  }
}
