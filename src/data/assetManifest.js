// ============================================================
// assetManifest.ts — Declare all loadable assets
// ============================================================
export const ASSET_MANIFEST = {
    // 3D Environment scan / collider from WorldGen pack
    'world-collider': {
        type: 'gltf',
        url: '/assets/WorldGen/pack/gaussian_splatting/environment_collider.glb',
    },
    // 3D Door and prop models from WorldGen pack
    'prop-door': {
        type: 'gltf',
        url: '/assets/WorldGen/pack/separated_objects/glb/object_0000/model_shaded.glb',
    },
    'prop-structure': {
        type: 'gltf',
        url: '/assets/WorldGen/pack/separated_objects/glb/object_0001/model_shaded.glb',
    },
    // Diffuse textures
    'prop-door-diffuse': {
        type: 'texture',
        url: '/assets/WorldGen/pack/separated_objects/glb/object_0000/model_shaded_diffuse.jpg',
    },
    'prop-structure-diffuse': {
        type: 'texture',
        url: '/assets/WorldGen/pack/separated_objects/glb/object_0001/model_shaded_diffuse.jpg',
    },
};
// Audio files that AudioSystem will attempt to load; synthesized fallbacks are built in
export const AUDIO_FILES = {
    'ambience': '/audio/ambience.ogg',
    'unlock': '/audio/unlock.ogg',
    'fail': '/audio/fail.ogg',
    'interact': '/audio/interact.ogg',
    'glitch': '/audio/glitch.ogg',
};
//# sourceMappingURL=assetManifest.js.map