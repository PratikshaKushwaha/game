#!/usr/bin/env python3
"""
generate_game_assets.py — Procedural 3D Asset Generator for The Way Out
Uses Blender Python API (bpy) in background mode:
    blender --background --python scripts/blender/generate_game_assets.py
"""

import sys
import os

try:
    import bpy
    IN_BLENDER = True
except ImportError:
    IN_BLENDER = False


def clear_scene():
    """Clear all objects, meshes, and materials from the Blender workspace."""
    bpy.ops.wm.read_factory_settings(use_empty=True)


def create_material(name, color=(0.1, 0.1, 0.1, 1.0), roughness=0.5, metallic=0.0,
                    emissive=(0.0, 0.0, 0.0, 1.0), emissive_strength=0.0):
    """Create a standard PBR Principled BSDF material compatible with glTF export."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emissive
            bsdf.inputs["Emission Strength"].default_value = emissive_strength
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = emissive
    return mat


def export_model(filepath):
    """Export current scene to glTF binary (.glb)."""
    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True
    )
    print(f"[Blender] Exported model to {filepath}")


# ─── Asset 1: Digital Keypad Terminal ────────────────────────
def build_keypad_terminal(out_dir):
    clear_scene()

    # Base backplate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    backplate = bpy.context.active_object
    backplate.scale = (0.35, 0.08, 0.55)
    mat_metal = create_material("TerminalDarkMetal", color=(0.05, 0.06, 0.09, 1.0), roughness=0.4, metallic=0.85)
    backplate.data.materials.append(mat_metal)

    # Screen display
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.045, 0.16))
    screen = bpy.context.active_object
    screen.scale = (0.28, 0.02, 0.14)
    mat_screen = create_material("TerminalScreen", color=(0.0, 0.1, 0.15, 1.0), roughness=0.1,
                                 emissive=(0.0, 0.9, 1.0, 1.0), emissive_strength=2.0)
    screen.data.materials.append(mat_screen)

    # 3x4 Keypad buttons
    mat_btn = create_material("TerminalKey", color=(0.15, 0.18, 0.22, 1.0), roughness=0.6, metallic=0.3)
    for row in range(4):
        for col in range(3):
            x = -0.09 + col * 0.09
            z = 0.04 - row * 0.08
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, 0.045, z))
            btn = bpy.context.active_object
            btn.scale = (0.06, 0.02, 0.05)
            btn.data.materials.append(mat_btn)

    export_model(os.path.join(out_dir, "terminal_keypad.glb"))


# ─── Asset 2: Developer Containment Pod ───────────────────────
def build_containment_pod(out_dir):
    clear_scene()

    # Pedestal base
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=0.4, vertices=24, location=(0, 0, 0.2))
    base = bpy.context.active_object
    mat_metal = create_material("PodMetal", color=(0.08, 0.10, 0.14, 1.0), roughness=0.3, metallic=0.9)
    base.data.materials.append(mat_metal)

    # Top emitter ring
    bpy.ops.mesh.primitive_cylinder_add(radius=1.2, depth=0.3, vertices=24, location=(0, 0, 3.2))
    top = bpy.context.active_object
    top.data.materials.append(mat_metal)

    # Glowing vertical energy pillars (4x)
    mat_pillar = create_material("PodPillar", color=(0.05, 0.07, 0.1, 1.0), roughness=0.4, metallic=0.7)
    for angle_deg in [45, 135, 225, 315]:
        import math
        rad = math.radians(angle_deg)
        x = math.cos(rad) * 1.05
        y = math.sin(rad) * 1.05
        bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=2.8, vertices=12, location=(x, y, 1.7))
        pillar = bpy.context.active_object
        pillar.data.materials.append(mat_pillar)

    # Containment energy core
    bpy.ops.mesh.primitive_cylinder_add(radius=0.65, depth=2.4, vertices=24, location=(0, 0, 1.7))
    core = bpy.context.active_object
    mat_core = create_material("PodEnergyCore", color=(0.0, 0.7, 0.9, 0.6), roughness=0.1,
                               emissive=(0.0, 0.9, 1.0, 1.0), emissive_strength=3.5)
    core.data.materials.append(mat_core)

    export_model(os.path.join(out_dir, "containment_pod.glb"))


# ─── Asset 3: Glitch Core Relic ──────────────────────────────
def build_glitch_core(out_dir):
    clear_scene()

    # Central fragmented core (octahedron)
    bpy.ops.mesh.primitive_cube_add(size=0.8, location=(0, 0, 1.2))
    core = bpy.context.active_object
    core.rotation_euler = (0.785, 0.615, 0.35)
    mat_core = create_material("GlitchCoreMaterial", color=(0.0, 0.8, 1.0, 1.0), roughness=0.15,
                               emissive=(0.0, 0.9, 1.0, 1.0), emissive_strength=4.0)
    core.data.materials.append(mat_core)

    # Outer floating cyber ring
    bpy.ops.mesh.primitive_torus_add(major_radius=0.9, minor_radius=0.06, major_segments=24,
                                     minor_segments=8, location=(0, 0, 1.2))
    ring1 = bpy.context.active_object
    ring1.rotation_euler = (1.2, 0.4, 0.0)
    mat_metal = create_material("DarkAlloy", color=(0.06, 0.08, 0.12, 1.0), roughness=0.3, metallic=0.95)
    ring1.data.materials.append(mat_metal)

    export_model(os.path.join(out_dir, "glitch_core.glb"))


# ─── Asset 4: Ancient Script Pedestal ────────────────────────
def build_script_pedestal(out_dir):
    clear_scene()

    # Base steps
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.15))
    step1 = bpy.context.active_object
    step1.scale = (0.8, 0.8, 0.15)
    mat_stone = create_material("AncientStone", color=(0.18, 0.20, 0.24, 1.0), roughness=0.85, metallic=0.05)
    step1.data.materials.append(mat_stone)

    # Column shaft
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.0, vertices=16, location=(0, 0, 0.7))
    shaft = bpy.context.active_object
    shaft.data.materials.append(mat_stone)

    # Angled book rest
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.3))
    rest = bpy.context.active_object
    rest.scale = (0.55, 0.45, 0.08)
    rest.rotation_euler = (0.35, 0, 0)
    rest.data.materials.append(mat_stone)

    # Inlaid glowing rune groove
    bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.04, vertices=16, location=(0, 0, 0.7))
    rune_ring = bpy.context.active_object
    mat_rune = create_material("GlowingRune", color=(0.0, 0.8, 1.0, 1.0),
                               emissive=(0.0, 0.9, 1.0, 1.0), emissive_strength=2.5)
    rune_ring.data.materials.append(mat_rune)

    export_model(os.path.join(out_dir, "script_pedestal.glb"))


def main():
    if not IN_BLENDER:
        print("[!] This script is meant to be executed inside Blender's Python runtime.")
        print("Usage:")
        print("    blender --background --python scripts/blender/generate_game_assets.py")
        sys.exit(1)

    target_dir = os.path.join("public", "assets", "models")
    print(f"=== Generating The Way Out 3D Assets into {target_dir} ===")
    build_keypad_terminal(target_dir)
    build_containment_pod(target_dir)
    build_glitch_core(target_dir)
    build_script_pedestal(target_dir)
    print("=== Asset Generation Complete ===")


if __name__ == "__main__":
    main()
