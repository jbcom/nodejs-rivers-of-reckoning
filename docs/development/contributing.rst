Contributing Guide
==================

Thank you for your interest in contributing to **Rivers of Reckoning**! This 
document provides an overview of the project's modular architecture and 
guidelines for developers.

Architecture Overview
=====================

The game is built with a modular, decoupled architecture designed for 
extensibility and performance in a web environment.

Engine Abstraction Layer
------------------------

All interaction with the underlying game engine (Pygame-ce) is handled through 
the ``Engine`` class in ``src/first_python_rpg/engine.py``. 

- **Responsive Scaling**: Uses ``pygame.SCALED`` to handle different screen sizes.
- **Async Loop**: Implements an ``asyncio``-based game loop for Pygbag 
  compatibility.
- **Input Mapping**: Provides ``btn()`` and ``btnp()`` methods to check key states 
  independently of the frame rate.

Entity Component System (ECS)
-----------------------------

We use the **esper** library to implement an ECS pattern. This allows us to 
separate data (Components) from logic (Systems).

- **Components**: Simple data classes located in ``src/first_python_rpg/types.py``.
- **Systems**: Logic processors found in ``src/first_python_rpg/systems.py``.
- **World**: The ``ecs_world`` orchestrates the processing of all systems.

Procedural Generation
---------------------

The world is generated using **OpenSimplex noise**.

- **FBM (Fractal Brownian Motion)**: Used to create layered, natural-looking 
  noise for terrain.
- **Biomes**: A multi-dimensional biome system based on temperature and moisture 
  noise maps.
- **Adaptive Spawning**: Enemies and objects are placed according to the 
  characteristics of the current biome.

Development Workflow
====================

Coding Standards
----------------

- **TypeScript-like Python**: Use type hints wherever possible to maintain 
  clarity.
- **Modular Imports**: Avoid circular dependencies by keeping business logic 
  separated from the engine.
- **Web-Safe**: Avoid using synchronous blocking calls or file system operations 
  that aren't supported in WASM.

Testing
-------

We use **pytest** for unit and integration tests.

.. code-block:: bash

   pytest tests/

Continuous Integration
----------------------

GitHub Actions are configured to run linting and tests on every pull request. 
Ensure your changes pass all checks before submitting.

Project Structure
=================

.. code-block:: text

   /
   ├── main.py                 # Entry point
   ├── src/
   │   └── first_python_rpg/
   │       ├── engine.py       # Engine abstraction
   │       ├── game.py         # Main game orchestration
   │       ├── map.py          # Procedural map logic
   │       ├── systems.py      # ECS systems
   │       └── world_gen.py    # Noise and biome logic
   ├── docs/                   # Documentation (Sphinx)
   └── tests/                  # Test suite
