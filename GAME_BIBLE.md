# 📖 The Game Bible: Rivers of Reckoning

## 🌊 Core Vision: The Saga of Rivers
**Rivers of Reckoning** is a character-driven, 2.5D hostile survival roguelike. It follows the legend of **Rivers**, a hero navigating an infinite, procedurally generated world that actively resists his presence. The game is a standalone Python experience, honoring its roots as a logic-teaching tool by prioritizing clear gameplay mechanics and tactical depth over complex geometry.

---

## 🎭 The Core Message: "The Toll of the Journey"
Every step forward has a price. The world is not a static backdrop; it is a living antagonist that reacts to Rivers' progress. The core loop revolves around balancing exploration and growth against the inevitable escalation of **The Reckoning**.

---

## 🎨 Branding & Aesthetic
### "Grim Legend" Style
- **Perspective**: Strictly **2.5D**. Grid-based logic with visual height offsets and dynamic shadows to create depth.
- **Palette**: Branded 16-color "Rivers" palette.
    - **Deep Void (0)**: Backgrounds, shadows, the unknown.
    - **Reckoning Red (8)**: Rivers (hero), damage, danger.
    - **Sulfur (10)**: Eyes, items, magical light.
    - **Poison Ivy (11)**: Hostile nature, corruption.
- **Juice & Feedback**: 
    - Violent screen shake for heavy impacts.
    - Pulse animations for HUD elements.
    - Flow particles representing environmental forces.

---

## ⚔️ Gameplay Mechanics
### 1. The Destiny Meter (The Reckoning)
- A global danger level that increases over time and distance traveled.
- **Destiny Surges**: Major environmental events triggered at milestones. They shake the world and inflict immediate trials (damage or status effects).
- **Difficulty Scaling**: Enemy strength and spawn frequency scale directly with Destiny.

### 2. The Flow of Fate
- Procedural "flow fields" derived from moisture noise.
- Unlike static terrain, the "Flow" physically pushes Rivers when he enters certain tiles.
- **Tactical Navigation**: Players must "surf" the flow to move faster or fight against it to reach secrets, adding a physical layer to grid movement.

### 3. 2.5D Spatial Logic
- Logic remains 2D (grid-based) for accessibility and clarity.
- Rendering uses height offsets (Y-sorting) to allow objects to "tower" over the grid.
- Shadows are essential for grounding 2.5D objects.

### 4. Perma-death Saga
- Every run is a unique legend.
- Progress is measured by the "Legacy" (distance + enemies + secrets).

---

## 🌍 The World: Procedural Trials
Biomes are not just geographic; they are thematic trials in the hero's saga.

| Biome | Legacy Name | Characteristics |
|-------|-------------|-----------------|
| Marsh | **The Forsaken Path** | Heavy Flow, high enemy variety, low visibility. |
| Forest | **The Iron Woods** | Dense obstacles, high stamina drain, hidden traps. |
| Desert | **Blistering Wastes** | Open space, high movement cost, heat exhaustion. |
| Tundra | **The Frozen Veil** | Slippery flow, slow movement, brittle obstacles. |
| Caves | **The Depths** | Pitch black, high danger, rare sulfur deposits. |

---

## 🕹️ Player Experience & UX
### "Tactile Survival"
- **High Impact**: Players should feel the weight of their choices. Movement isn't free; combat isn't trivial.
- **Approachable Logic**: The code and mechanics should be easy to understand but difficult to master (Saga-style).
- **Responsive HUD**: The **RIVERS** (Health) and **DESTINY** (Threat) bars are central to the screen, providing constant feedback on survival status.

---

## 🛠 Technical Manifesto
- **Language**: Pure Python 3.10+.
- **Engine**: `pygame-ce` (performance and accessibility).
- **Deployment**: `pygbag` (instant web play via WASM).
- **Architecture**: Lightweight ECS (`esper`) to keep data and logic separated for learners.
- **Resolution**: 256x256 logical pixels, auto-scaled to fill any viewport.

---

**"Your legacy is defined by the depth of your Reckoning."**
