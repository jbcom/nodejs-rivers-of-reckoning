# Rivers of Reckoning

> **Procedural 3D roguelike RPG built with Strata, React Three Fiber, and TypeScript**

🌊 Explore infinite procedurally generated worlds with dynamic weather, day/night cycles, and challenging combat.

## 🎮 Features

- **Infinite Procedural World** - Every playthrough is unique
- **6 Distinct Biomes** - Marsh, Forest, Desert, Tundra, Caves, Grassland
- **Dynamic Weather System** - Clear, Rain, Fog, Snow, Storm
- **Day/Night Cycle** - Dawn, Day, Dusk, Night phases
- **Real-time Combat** - Enemy AI with multiple states
- **Progressive Difficulty** - The further you go, the harder it gets
- **Cross-Platform** - Web, iOS, Android via Capacitor

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test:e2e

# Build for production
pnpm build
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| 3D Engine | [Strata](https://github.com/jbcom/nodejs-strata) + React Three Fiber |
| UI Framework | Material UI |
| State Management | Zustand |
| Build Tool | Vite |
| Testing | Playwright |
| Mobile | Capacitor |

## 📁 Project Structure

```
src/
├── App.tsx              # Main game component with Strata
├── main.tsx             # React entry point
├── components/          # UI components
│   ├── TitleScreen.tsx  # Start screen
│   ├── GameHUD.tsx      # In-game HUD
│   ├── PauseMenu.tsx    # Pause overlay
│   └── GameOverScreen.tsx
├── store/
│   └── gameStore.ts     # Zustand state management
└── types/
    └── game.ts          # TypeScript types
```

## 🎯 Game Systems

### Biome System
Each biome has unique characteristics:
- Temperature and moisture levels
- Vegetation density
- Enemy spawn rates
- Visibility ranges
- Stamina modifiers

### Weather System
Weather affects gameplay:
- **Storm** - High wind, reduced visibility
- **Rain** - Moderate wind, slippery terrain
- **Fog** - Low visibility
- **Snow** - Cold damage over time
- **Clear** - Normal conditions

### Time System
24-hour cycle with phases:
- **Dawn (5-7)** - Enemies less aggressive
- **Day (7-18)** - Normal gameplay
- **Dusk (18-20)** - Enemies start appearing
- **Night (20-5)** - Dangerous, more enemies

## 📱 Mobile Build

```bash
# Build web assets
pnpm build

# Add platforms
npx cap add android
npx cap add ios

# Sync and open
npx cap sync
npx cap open android
npx cap open ios
```

## 🧪 Testing

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e -- --grep "title screen"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [jbcom](https://github.com/jbcom)

---

**Ported from Python/pygame to TypeScript/Strata** 🔥
