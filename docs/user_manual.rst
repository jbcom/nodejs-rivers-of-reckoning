User Manual
===========

Introduction
============

**Rivers of Reckoning** is an immersive, procedurally generated 3D roguelike RPG 
built for instant web play. Explore an infinite, ever-changing world of marshes, 
forests, deserts, and tundra. Every playthrough is unique, generated from a seed 
that creates coherent biomes, dynamic weather, and challenging encounters.

Getting Started
===============

Launching the Game
------------------

Launch the game using the following command:

.. code-block:: bash

   python main.py

The game uses a "Web-First" architecture, meaning it's designed to run at a logical 
resolution of 256x256 and automatically scales to fit your window size.

Controls
========

The game features a tactile feedback system with responsive controls.

Desktop
-------

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Key
     - Action
   * - **Arrow Keys**
     - Move your character through the world
   * - **Enter / Space**
     - Start game / Confirm selection
   * - **Escape**
     - Pause game / Return to title screen
   * - **A**
     - Attack (Boss Battles)
   * - **S**
     - Cast Spell (Boss Battles)
   * - **Q**
     - Quit to menu (when paused)

Mobile & Touch
--------------

When playing in a browser on a mobile device, the game utilizes **pygbag's 
integrated virtual gamepad**. 

* **On-screen D-pad**: Use the virtual directional pad on the left to move.
* **On-screen Buttons**: Use the 'A' and 'B' buttons on the right for interaction 
  and combat.
* **Responsive Scaling**: The game will automatically rotate and scale to fit 
  your device's orientation.

Game Features
=============

Procedural World Generation
---------------------------

The world of Rivers of Reckoning is generated entirely from noise functions:

- **Infinite Exploration**: The world expands as you move.
- **Dynamic Biomes**: Transition between Marshes, Forests, Deserts, and Tundra.
- **Seeded Worlds**: Every world is unique but reproducible using a seed.

Weather & Environment
---------------------

- **Dynamic Weather**: Experience rain, storms, and clear skies that affect 
  visibility and atmosphere.
- **Day/Night Cycle**: The environment changes as time passes in the game world.

Combat & Progression
====================

- **Enemy Spawning**: Enemies spawn procedurally based on the current biome and 
  your distance from the start.
- **Combat Mechanics**: Use a combination of melee attacks and spells to defeat 
  foes.
- **Experience (XP)**: Gain XP by exploring and defeating enemies to level up 
  your character.

Tips for Survival
=================

1. **Watch the Biome**: Different biomes have different enemy types and spawn rates.
2. **Keep Moving**: Exploration is the key to finding better loot and gaining XP.
3. **Use Spells Wisely**: Mana is a limited resource; save your spells for 
  tougher encounters.

Credits
=======

Rivers of Reckoning is built with **pygame-ce** and deployed for the web 
using **pygbag**.

Enjoy your adventure!
