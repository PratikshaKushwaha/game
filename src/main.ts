// ============================================================
// main.ts — Entry point
// ============================================================

import { Game } from './game/Game';

const game = new Game();
game.start().catch(err => {
  console.error('[The Way Out] Fatal startup error:', err);
});

// Expose game instance for dev-console debugging
(window as unknown as Record<string, unknown>)['__game'] = game;
