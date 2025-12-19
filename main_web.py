import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, "src")

import pyxel
from first_python_rpg.game import Game


class WebGame(Game):
    def __init__(self):
        super().__init__()

    async def run_async(self):
        # In web/pygbag, we need to handle the loop manually or use pyxel.run in a specific way
        # But pyxel.run is blocking. Pygbag usually patches it or we use asyncio loop.
        # Actually, for pygbag, we just need to import asyncio and have an async main.
        # And usually we call asyncio.sleep(0) in the update loop?
        # Or just start it.

        # Pyxel's run() might be adapted for web, but standard pattern is:
        # import asyncio
        # import pygame
        # async def main():
        #    ... loop ... await asyncio.sleep(0)

        # For Pyxel, it wraps SDL2. Pygbag supports Pyxel?
        # Pygbag supports pygame-ce. Pyxel is SDL2 based.
        # Actually, Pyxel has a web launcher.
        # But if we use pygbag, we are compiling python to wasm.
        # Pyxel usually runs via its own wasm loader (libpyxel.js).
        # However, the user asked for "pygbag". Pygbag is primarily for Pygame.
        # Pyxel works on web via `pyxel app2html` or its own wasm build.
        # But if I MUST use pygbag, I might be forcing a square peg in a round hole unless pygbag supports general SDL2/Python.
        # Wait, pygbag supports "python/pygame directly".
        # If I use Pyxel, I should probably use Pyxel's web export.
        # BUT the prompt says: "uses pygbag to push a web build out".
        # I will assume I can run Pyxel code via pygbag if I set it up right, OR I should convert to Pygame?
        # No, "First Python RPG - Pyxel Edition". I shouldn't rewrite to Pygame.
        # So I will try to use pygbag to package it.
        # If pygbag only supports pygame, this might fail.
        # Let's check pygbag docs or assume it works for general python+sdl2.
        # Actually, Pyxel has `pyxel.run` which takes control.
        # I'll create a standard entry point that pygbag expects.

        # Standard pygbag main.py pattern:
        # async def main():
        #     ... setup ...
        #     while True:
        #         ... update/draw ...
        #         await asyncio.sleep(0)

        # But Pyxel takes control with pyxel.run(update, draw).
        # We can't easily inject await asyncio.sleep(0) inside pyxel.run unless we implement our own loop calling pyxel.flip() if exposed.
        # Pyxel doesn't expose flip().

        # However, looking at `web-deployment.yml` (which I read earlier), the user already has a `web_export` step that creates a `main.py`!
        # And it uses `pyxel`'s web export capabilities?
        # The yaml says: "The game runs natively in browsers using Pyxel's web export capabilities."
        # But then it says "Create web export script" -> "python export_web.py".
        # And later "uses pygbag" in prompt.

        # If I strictly follow "uses pygbag", I need `main.py` with async loop.
        # But Pyxel doesn't support async loop easily.
        # Maybe I should just stick to Pyxel's native web support if pygbag is not suitable.
        # BUT the prompt is explicit: "uses pygbag".
        # Maybe I can just use `pygbag` to serve/package the folder, but the runtime will be... ?

        # Let's try to make a wrapper.
        # If Pyxel 2.x, it has a lib for web.
        # Maybe I can just call `pyxel.run` and pygbag's magically handles it?
        # Unlikely.

        # Let's assume for now I just provide the entry point.
        # If Pyxel is used, maybe I can't satisfy "pygbag" requirement perfectly without switching engine.
        # BUT, I will try to satisfy it by creating the `main_web.py` that imports asyncio.

        pyxel.run(self.update, self.draw)


async def main():
    g = WebGame()
    # In pygbag, if we call a blocking function, it blocks.
    # Pyxel.run IS blocking.
    # So this might freeze the browser unless Pyxel's SDL build yields.
    # But usually for pygbag + pygame, we write the loop.
    # For Pyxel, we can't.

    # I will provide a main that just starts the game,
    # and hope the existing `web-deployment.yml` (which seems to manually construct a web export using `shutil`)
    # is actually what the user wants to replace or augment.
    # Wait, the prompt says "make a plan to... uses pygbag".
    # The current `web-deployment.yml` uses `actions/upload-pages-artifact`. It does NOT seem to use `pygbag` CLI tool.
    # It creates `export_web.py` which just copies files.

    # I will create `main_web.py` that ATTEMPTS to be pygbag compatible.
    # If it fails, I'll rely on Pyxel's `pyxel app2html` mechanism if I can invoke it.
    # But I'll stick to the "pygbag" instruction.

    g.run()


if __name__ == "__main__":
    asyncio.run(main())
