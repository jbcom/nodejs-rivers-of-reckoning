# GitHub Issues for Rivers of Reckoning Port

These issues should be created in the `jbcom/nodejs-rivers-of-reckoning` repository to track the remaining work for porting all pygame logic to Strata.

---

## Issue 1: Port Enemy AI System

**Title:** `feat: Port enemy AI system from pygame`

**Labels:** `enhancement`, `port`, `priority:high`

**Description:**
Port the enemy AI system from `src/first_python_rpg/systems.py` AIProcessor.

### Current Python Implementation
- Enemy states: idle, wandering, chasing, attacking, fleeing
- Detection range and attack range
- Wander timer for idle behavior
- Chase player when in detection range
- Attack when in attack range

### Tasks
- [ ] Create `EnemyController` component
- [ ] Implement state machine for enemy behavior
- [ ] Add pathfinding for chase state
- [ ] Integrate with Strata's physics system
- [ ] Add enemy spawning based on biome spawn rates
- [ ] Test enemy interactions

---

## Issue 2: Port Combat System

**Title:** `feat: Port combat system from pygame`

**Labels:** `enhancement`, `port`, `priority:high`

**Description:**
Port the combat system from `src/first_python_rpg/systems.py` CombatProcessor.

### Python Implementation
- Attack damage and armor
- Dodge chance
- Attack cooldown
- Damage calculation

### Tasks
- [ ] Create `CombatSystem` component
- [ ] Implement attack animations with Strata
- [ ] Add damage numbers/effects
- [ ] Implement player attack controls
- [ ] Add enemy attack patterns
- [ ] Sound effects for combat

---

## Issue 3: Port Procedural Event System

**Title:** `feat: Port procedural event system from pygame`

**Labels:** `enhancement`, `port`, `priority:medium`

**Description:**
Port the random event system from `src/first_python_rpg/game.py` and `map_data.py`.

### Python Implementation
- Random events based on biome
- Event messages with effects
- Event timer display

### Tasks
- [ ] Create `EventSystem` component
- [ ] Port EVENT_TYPES from map_data.py
- [ ] Implement event triggers based on movement
- [ ] Add event notification UI
- [ ] Biome-specific events

---

## Issue 4: Port Shop System

**Title:** `feat: Port shop system from pygame`

**Labels:** `enhancement`, `port`, `priority:medium`

**Description:**
Port the shop system from `src/first_python_rpg/shop.py`.

### Tasks
- [ ] Create shop UI component with MUI
- [ ] Port item catalog
- [ ] Implement buy/sell mechanics
- [ ] Add item effects
- [ ] Integrate with player inventory

---

## Issue 5: Port Boss Encounters

**Title:** `feat: Port boss system from pygame`

**Labels:** `enhancement`, `port`, `priority:medium`

**Description:**
Port the boss system from `src/first_python_rpg/boss.py`.

### Tasks
- [ ] Create boss entity type
- [ ] Implement boss AI (different from regular enemies)
- [ ] Add boss health bar UI
- [ ] Create boss spawn conditions
- [ ] Add boss defeat rewards

---

## Issue 6: Add Player Movement Controls

**Title:** `feat: Implement WASD player movement`

**Labels:** `enhancement`, `priority:high`

**Description:**
Add proper keyboard and touch controls for player movement.

### Tasks
- [ ] WASD keyboard movement
- [ ] Virtual joystick for mobile
- [ ] Collision detection with terrain
- [ ] Stamina consumption for running
- [ ] Camera follow player

---

## Issue 7: Add Sound System

**Title:** `feat: Add sound and music system`

**Labels:** `enhancement`, `priority:low`

**Description:**
Add ambient sounds and music.

### Tasks
- [ ] Background music per biome
- [ ] Weather ambient sounds
- [ ] Combat sound effects
- [ ] UI sound effects
- [ ] Volume controls in settings

---

## Issue 8: Add Save/Load System

**Title:** `feat: Add save/load with localStorage`

**Labels:** `enhancement`, `priority:medium`

**Description:**
Implement game state persistence.

### Tasks
- [ ] Save player stats on pause/quit
- [ ] Load on game start
- [ ] Multiple save slots
- [ ] Auto-save every N seconds
- [ ] Cloud sync (optional)

---

## Issue 9: Add Settings Menu

**Title:** `feat: Add settings menu`

**Labels:** `enhancement`, `priority:low`

**Description:**
Add configurable game settings.

### Tasks
- [ ] Graphics quality settings
- [ ] Sound volume controls
- [ ] Control customization
- [ ] Accessibility options
- [ ] Persist settings to localStorage

---

## Issue 10: Mobile Optimization

**Title:** `chore: Optimize for mobile devices`

**Labels:** `optimization`, `priority:medium`

**Description:**
Ensure smooth performance on mobile.

### Tasks
- [ ] Reduce polygon count for mobile
- [ ] Lower texture resolutions
- [ ] Optimize vegetation instancing
- [ ] Test on various devices
- [ ] Battery usage optimization

---

## Issue 11: Add Minimap

**Title:** `feat: Add minimap to HUD`

**Labels:** `enhancement`, `priority:low`

**Description:**
Add a minimap showing explored areas.

### Tasks
- [ ] Create minimap component
- [ ] Track explored areas
- [ ] Show player position
- [ ] Show enemy positions
- [ ] Biome colors on minimap

---

## Issue 12: CI/CD Setup

**Title:** `chore: Set up GitHub Actions CI/CD`

**Labels:** `infrastructure`, `priority:high`

**Description:**
Set up automated testing and deployment.

### Tasks
- [ ] Lint on PR
- [ ] Run E2E tests on PR
- [ ] Build and deploy to GitHub Pages
- [ ] Capacitor builds for mobile
- [ ] Release automation
