// ============================================================
// OpeningCinematic.ts — HTML video-based opening cinematic
// ============================================================

export interface CinematicOptions {
  onComplete: () => void;
}

export class OpeningCinematic {
  private video:      HTMLVideoElement;
  private skipBtn:    HTMLElement;
  private _onComplete: () => void;
  private _handlers:  Array<[EventTarget, string, EventListenerOrEventListenerObject]> = [];

  constructor(opts: CinematicOptions) {
    this._onComplete = opts.onComplete;

    const vid = document.getElementById('cinematic-video') as HTMLVideoElement | null;
    const skip = document.getElementById('cinematic-skip');
    if (!vid || !skip) throw new Error('Cinematic elements missing from DOM');

    this.video   = vid;
    this.skipBtn = skip;
  }

  private _on(
    target: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject,
    opts?: AddEventListenerOptions,
  ): void {
    target.addEventListener(event, handler, opts);
    this._handlers.push([target, event, handler]);
  }

  play(): void {
    const onEnd = () => this._finish();
    const onErr = () => {
      console.warn('[Cinematic] Video failed — skipping.');
      this._finish();
    };
    const onSkip = () => this._finish();

    this._on(this.video,   'ended',   onEnd);
    this._on(this.video,   'error',   onErr);
    this._on(this.skipBtn, 'click',   onSkip);

    // Keyboard skip
    const onKey = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.code === 'Space' || ke.code === 'Enter' || ke.code === 'Escape') {
        this._finish();
      }
    };
    this._on(window, 'keydown', onKey);

    // Attempt autoplay
    this.video.muted = false;
    this.video.play().catch(() => {
      // Autoplay blocked — mute and retry
      this.video.muted = true;
      this.video.play().catch(() => {
        // Still blocked — show skip button prominently and proceed
        this.skipBtn.textContent = 'Click to Start ▶';
        this.skipBtn.style.fontSize = '1.4rem';
      });
    });
  }

  private _finish(): void {
    this.video.pause();
    this._cleanup();
    this._onComplete();
  }

  private _cleanup(): void {
    this._handlers.forEach(([t, e, h]) => t.removeEventListener(e, h));
    this._handlers = [];
  }

  dispose(): void {
    this._cleanup();
    this.video.src = '';
    this.video.load();
  }
}
