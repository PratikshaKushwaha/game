---
name: blender-asset-generation
description: "Guidelines, pipelines, and automated Python scripting standards for generating optimized 3D game assets and props using Blender headless CLI (`blender --background --python`) for WebGL and Three.js."
risk: low
source: workspace
date_added: "2026-10-23"
---

# Blender 3D Asset Generation Pipeline

This skill provides an automated workflow to generate 3D models and props using Blender's Python API (`bpy`) running in headless/background mode, exporting directly to glTF 2.0 (`.glb`) for web 3D engines.

---

## 1. Headless Execution Command

Run scripts without opening the Blender UI:

```bash
# Windows
blender --background --python scripts/blender/generate_game_assets.py

# With custom arguments
blender --background --python scripts/blender/generate_game_assets.py -- --out public/assets/models/
```

---

## 2. Python Script Template (`bpy`)

```python
import bpy
import os

def clear_scene():
    """Removes all default objects, lights, and cameras."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_pbr_material(name, base_color=(0.1, 0.1, 0.1, 1.0), roughness=0.5, metallic=0.0, emissive=(0, 0, 0, 1.0), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emissive
            bsdf.inputs['Emission Strength'].default_value = emissive_strength
    return mat

def export_glb(filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
```

---

## 3. WebGL / Three.js Asset Optimization Standards

When generating assets for web games:
1. **Scale & Units**: Metric, 1 unit = 1 meter in Three.js.
2. **Origin & Pivot**: Place the pivot point at the base of props ($Z=0$ or $Y=0$ depending on up-axis) for simple floor snapping.
3. **PBR Materials**: Use standard Principled BSDF inputs. Avoid complex procedural node graphs that glTF cannot export.
4. **Normals & Smoothing**: Call `bpy.ops.object.shade_smooth()` with auto-smooth enabled for clean curvature without polygon bloat.
5. **Polycount Budgets**:
   - Small props / clues / keys: 200 – 1,000 tris
   - Furniture / terminal stations: 800 – 3,500 tris
   - Environmental rooms: 5,000 – 15,000 tris
