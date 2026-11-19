"""Render the original blue gummy b with Blender 4.3+.

blender -b --python scripts/render-gummy-b.py -- /tmp/gummy-b.png

Resize the transparent master to 360 x 480 and encode as WebP for the site.
"""
import bpy
import math
import os
import sys
from mathutils import Vector


def curve_tube(name, control_points, closed=False):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 32
    curve.bevel_resolution = 8
    curve.bevel_depth = .152
    curve.use_fill_caps = True
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(control_points) - 1)
    for point, (x, y, z, radius) in zip(spline.bezier_points, control_points):
        point.co = (x, y, z)
        point.handle_left_type = point.handle_right_type = 'AUTO'
        point.radius = radius
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return obj


def studio_panel(name, coordinates, energy, size, tint, height=None, aim=(0, 0, 0)):
    light = bpy.data.lights.new(name, type='AREA')
    light.energy = energy
    light.color = tint
    light.shape = 'RECTANGLE' if height else 'DISK'
    light.size = size
    if height:
        light.size_y = height
    obj = bpy.data.objects.new(name, light)
    bpy.context.collection.objects.link(obj)
    obj.location = coordinates
    obj.rotation_euler = (Vector(aim) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    return obj


def reflection_card(name, coordinates, width, height, color, power):
    bpy.ops.mesh.primitive_plane_add(size=1, location=coordinates)
    card = bpy.context.object
    card.name = name
    card.scale = (width, height, 1)
    card.rotation_euler = (-card.location).to_track_quat('Z', 'Y').to_euler()
    card.visible_camera = False
    card.visible_shadow = False
    glow = bpy.data.materials.new(name)
    glow.use_nodes = True
    nodes, links = glow.node_tree.nodes, glow.node_tree.links
    coords = nodes.new('ShaderNodeTexCoord')
    distance = nodes.new('ShaderNodeVectorMath')
    distance.operation = 'DISTANCE'
    distance.inputs[1].default_value = (.5, .5, 0)
    links.new(coords.outputs['UV'], distance.inputs[0])
    falloff = nodes.new('ShaderNodeValToRGB')
    falloff.color_ramp.interpolation = 'EASE'
    falloff.color_ramp.elements[0].position = .04
    falloff.color_ramp.elements[0].color = (1, 1, 1, 1)
    falloff.color_ramp.elements[1].position = .48
    falloff.color_ramp.elements[1].color = (0, 0, 0, 1)
    links.new(distance.outputs['Value'], falloff.inputs[0])
    intensity = nodes.new('ShaderNodeMath')
    intensity.operation = 'MULTIPLY'
    intensity.inputs[1].default_value = power
    links.new(falloff.outputs['Color'], intensity.inputs[0])
    emission = nodes.new('ShaderNodeEmission')
    emission.inputs['Color'].default_value = (*color, 1)
    links.new(intensity.outputs[0], emission.inputs['Strength'])
    links.new(emission.outputs[0], nodes.get('Material Output').inputs['Surface'])
    card.data.materials.append(glow)


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bowl = curve_tube('Gummy bowl', [
    (.087, .022, .005, .95),
    (.300, -.055, .025, 1.02),
    (.371, -.269, .000, 1.08),
    (.305, -.476, -.018, 1.03),
    (.091, -.558, -.018, 1.01),
    (-.111, -.480, .009, 1.00),
    (-.185, -.275, .018, 1.02),
    (-.122, -.060, .010, 1.00),
], closed=True)
stem = curve_tube('Soft ascender', [
    (-.222, -.540, -.018, .18),
    (-.246, -.490, -.022, .77),
    (-.253, -.347, -.013, 1.02),
    (-.267, -.104, .013, 1.09),
    (-.271, .115, .023, 1.08),
    (-.251, .351, .020, 1.03),
    (-.233, .516, .024, .95),
    (-.226, .595, .022, .69),
    (-.224, .627, .021, .16),
])
for obj in (bowl, stem):
    obj.select_set(True)
bpy.context.view_layer.objects.active = stem
bpy.ops.object.join()
stem.name = 'Blue gummy b'
stem.data.remesh_voxel_size = .009
bpy.ops.object.voxel_remesh()
smooth = stem.modifiers.new('Blend the poured candy', 'SMOOTH')
smooth.factor = 1.05
smooth.iterations = 28
bpy.ops.object.modifier_apply(modifier=smooth.name)
for polygon in stem.data.polygons:
    polygon.use_smooth = True
stem.rotation_euler = (math.radians(7), math.radians(-10), math.radians(4))

material = bpy.data.materials.new('Blue translucent sugar')
material.use_nodes = True
nodes = material.node_tree.nodes
links = material.node_tree.links
principled = nodes.get('Principled BSDF')
principled.inputs['Base Color'].default_value = (.065, .43, .67, 1)
principled.inputs['Roughness'].default_value = .235
principled.inputs['IOR'].default_value = 1.46
principled.inputs['Transmission Weight'].default_value = .89
principled.inputs['Coat Weight'].default_value = .27
principled.inputs['Coat Roughness'].default_value = .23
absorption = nodes.new('ShaderNodeVolumeAbsorption')
absorption.inputs['Color'].default_value = (.014, .59, .91, 1)
absorption.inputs['Density'].default_value = 3.4
links.new(absorption.outputs['Volume'], nodes.get('Material Output').inputs['Volume'])
grain = nodes.new('ShaderNodeTexNoise')
grain.inputs['Scale'].default_value = 92
grain.inputs['Detail'].default_value = 2
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = .15
bump.inputs['Distance'].default_value = .0015
links.new(grain.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], principled.inputs['Normal'])
stem.data.materials.clear()
stem.data.materials.append(material)

world = bpy.data.worlds.new('Dark studio surround')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.31, .42, .53, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .43
scene.world = world
reflection_card('Feathered overhead key', (-1.18, 1.05, 3.3), 1.36, 2.78, (1, .98, .95), 15.5)
reflection_card('Soft spot on the ascender', (-.86, .34, 2.55), .85, 1.15, (1, .99, .96), 26.5)
reflection_card('Pin of light on the bowl', (1.06, -.23, 2.27), .72, .50, (.81, .96, 1), 13.0)
reflection_card('Slender cool reflection', (1.65, .80, 1.92), .63, 1.65, (.83, .96, 1), 10.7)
reflection_card('Wide cyan bounce', (-.95, -1.1, -1.05), 3.0, 2.3, (.012, .79, 1), 15.5)
reflection_card('Cool rim toward the counter', (1.11, -.89, -.55), 1.45, 1.72, (.018, .67, .98), 5.8)
studio_panel('Weak front fill', (.75, 1.62, 4.2), 58, 2.6, (.74, .89, 1), 1.8)

camera = bpy.data.cameras.new('Orthographic studio camera')
camera.type = 'ORTHO'
camera.ortho_scale = 1.52
view = bpy.data.objects.new('Studio view', camera)
bpy.context.collection.objects.link(view)
view.location = (.045, -.036, 5)
view.rotation_euler = (0, 0, 0)
scene.camera = view

scene.render.engine = 'CYCLES'
scene.cycles.samples = int(os.environ.get('GUMMY_SAMPLES', '288'))
scene.cycles.use_denoising = False
scene.cycles.max_bounces = 12
scene.cycles.transmission_bounces = 10
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.resolution_x = 360
scene.render.resolution_y = 480
scene.render.resolution_percentage = int(os.environ.get('GUMMY_SIZE', '150'))
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = .19
scene.render.filepath = sys.argv[sys.argv.index('--') + 1]
bpy.ops.render.render(write_still=True)
