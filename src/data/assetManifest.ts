// ============================================================
// assetManifest.ts — Declare all loadable assets
// ============================================================

import type { AssetManifest } from '../systems/AssetManager';

export const ASSET_MANIFEST: AssetManifest = {
  // Textures — optional; game falls back to solid colours if absent
  // 'concrete-diffuse': { type: 'texture', url: '/textures/concrete_diffuse.jpg' },
  // 'wood-diffuse':     { type: 'texture', url: '/textures/wood_diffuse.jpg'     },

  // Models — optional
  // 'door-model': { type: 'gltf', url: '/models/door.glb' },

  // Audio keys are loaded by AudioSystem separately
};

// Audio files that AudioSystem will attempt to load
export const AUDIO_FILES: Record<string, string> = {
  'ambience': '/audio/ambience.ogg',
  'unlock':   '/audio/unlock.ogg',
  'fail':     '/audio/fail.ogg',
  'interact': '/audio/interact.ogg',
  'glitch':   '/audio/glitch.ogg',
};
