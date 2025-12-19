import random
from .map_data import MAP_SIZE

# Pyxel color palette mapping for terrain (keys are Pyxel color indices for now, reused in Engine)
TILE_COLORS = {
    ".": 4,  # dirt (brown)
    "~": 10,  # sand (light green - closest to sand)
    "#": 5,  # stone (dark gray)
    "^": 3,  # grass (green)
    "o": 12,  # water (blue)
    "T": 11,  # tree (light green)
    "R": 6,  # rock (light gray)
}


class Map:
    def __init__(self, procedural=False):
        self.size = MAP_SIZE
        self.procedural = procedural
        self.grid = self.generate_map(procedural)
        self.tile_size = 256 // MAP_SIZE  # Calculate tile size based on screen size

    def generate_map(self, procedural=False):
        """Generate the game map.

        Args:
            procedural: If True, generates a random procedural map.
                       If False, generates a balanced fixed map.

        Returns:
            A 2D grid of tile characters.
        """
        if procedural:
            return self._generate_procedural_map()
        else:
            return self._generate_fixed_map()

    def _generate_procedural_map(self):
        """Generate a random procedural map with varied terrain."""
        grid = []
        tile_types = [".", "~", "#", "^", "o", "T", "R"]
        weights = [30, 10, 10, 20, 10, 10, 10]

        for y in range(self.size):
            row = []
            for x in range(self.size):
                # Border is always rock
                if x == 0 or y == 0 or x == self.size - 1 or y == self.size - 1:
                    tile = "R"
                else:
                    tile = random.choices(tile_types, weights=weights, k=1)[0]
                row.append(tile)
            grid.append(row)

        # Ensure player spawn point is walkable
        center = self.size // 2
        grid[center][center] = "."

        return grid

    def _generate_fixed_map(self):
        """Generate a designed, balanced fixed map for consistent gameplay.

        This map is hand-crafted for fair exploration with:
        - Clear paths for navigation
        - Strategic obstacle placement
        - Balanced resource distribution
        """
        # Fixed 11x11 map design
        # Legend: . = dirt, ^ = grass, ~ = sand, o = water, T = tree, R = rock, # = stone
        fixed_layout = [
            "RRRRRRRRRRR",  # Row 0: Border
            "R.^^.T.^^.R",  # Row 1: Grass clearing with tree
            "R^..~..~^.R",  # Row 2: Mixed terrain
            "R.~oo~oo~.R",  # Row 3: Water pond
            "RT.~..~.T.R",  # Row 4: Trees and path
            "R...^.^...R",  # Row 5: Center - player spawn area
            "R.T.^.^.T.R",  # Row 6: Trees flanking path
            "R.~oo~oo~.R",  # Row 7: Another water feature
            "R^..~..~^.R",  # Row 8: Mixed terrain
            "R.^^.T.^^.R",  # Row 9: Grass clearing with tree
            "RRRRRRRRRRR",  # Row 10: Border
        ]

        grid = []
        for row_str in fixed_layout:
            row = list(row_str)
            # Pad or trim to match map size
            while len(row) < self.size:
                row.append("R")
            row = row[: self.size]
            grid.append(row)

        # Pad rows if needed
        while len(grid) < self.size:
            grid.append(["R"] * self.size)
        grid = grid[: self.size]

        return grid

    def is_walkable(self, x, y):
        """Check if a position is walkable"""
        if 0 <= x < self.size and 0 <= y < self.size:
            return self.grid[y][x] not in ("o", "#", "T", "R")
        return False

    def draw(self, engine):
        """Draw the map using Engine"""
        # from .map_data import SPRITES

        for y in range(self.size):
            for x in range(self.size):
                tile = self.grid[y][x]
                color = TILE_COLORS.get(tile, 0)

                # Calculate pixel position
                px = x * self.tile_size
                py = y * self.tile_size + 20  # Offset for HUD

                # Draw base tile
                engine.rect(px, py, self.tile_size, self.tile_size, color)

                # Procedural sprites replacement (simple rectangles for now to satisfy Pygame conversion)
                # In Pyxel version, it called SPRITES functions which used pyxel directly.
                # Since we replaced Pyxel with Engine, we should call engine methods.
                # However, SPRITES functions in map_data.py still import pyxel.
                # We need to refactor map_data.py or just draw simple shapes here for now.

                # Simple visual indicators
                if tile == "T":  # Tree
                    # Green circle/rect
                    engine.rect(px + 2, py + 2, self.tile_size - 4, self.tile_size - 4, 11)
                elif tile == "R":  # Rock
                    # Gray rect
                    engine.rect(px + 2, py + 2, self.tile_size - 4, self.tile_size - 4, 13)
                elif tile == "o":  # Water
                    engine.rect(px + 4, py + 4, 2, 2, 12)
                elif tile == "#":  # Stone
                    engine.rect(px + 4, py + 4, 2, 2, 5)

    def move_player(self, player, dx, dy):
        """Move player with map constraints"""
        if player.confused > 0 and random.random() < 0.5:
            dx, dy = random.choice([(0, 1), (0, -1), (1, 0), (-1, 0)])

        new_x = (player.x + dx) % self.size
        new_y = (player.y + dy) % self.size

        if self.is_walkable(new_x, new_y):
            player.x = new_x
            player.y = new_y

        if player.confused > 0:
            player.confused -= 1
