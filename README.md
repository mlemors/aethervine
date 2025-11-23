# Aethervine ⚔️

Ein **Idle RPG** im **World of Warcraft Classic** Setting — gebaut mit **TypeScript, React & Phaser 3**.

> **Hinweis:** Dies ist ein Fan-Projekt für private Nutzung. Alle WoW-bezogenen Namen und Konzepte sind Eigentum von Blizzard Entertainment.

---

## 🎮 Features

### **MVP (Phase 1)**
- ✅ Charaktererstellung mit WoW Classic Klassen
- ✅ Auto-Combat System
- ✅ Quest-System (Kill-Quests, Collection-Quests)
- ✅ XP & Leveling (1-10)
- ✅ Automatisches Speichern (IndexedDB)
- ✅ Basis-UI (Character Sheet, Quest Log)

### **Geplant (Alpha/Beta)**
- 🔲 Alle 9 WoW Classic Klassen
- 🔲 Equipment & Loot System
- 🔲 Talentbäume
- 🔲 Professions (Mining, Herbalism, Skinning)
- 🔲 Classic Zones (Elwynn Forest, Durotar, etc.)
- 🔲 Dungeons (Solo-Mode)
- 🔲 Desktop-Build (Tauri)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Build Tool** | Vite 5.x |
| **Language** | TypeScript 5.x (strict) |
| **UI Framework** | React 18.x |
| **Game Engine** | Phaser 3.x (Canvas/WebGL) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS + CSS Modules |
| **Persistence** | IndexedDB (via idb) |
| **Desktop** | Tauri (geplant) |

---

## 📦 Installation

### **Voraussetzungen**
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** oder **pnpm**

### **Setup**
```bash
# Repository klonen
cd /Users/mlemors/vcs/aethervine

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Der Server läuft auf `http://localhost:5173`

---

## 🚀 Scripts

```bash
# Development (Hot Module Replacement)
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview

# Type-Checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test
```

---

## 📁 Projektstruktur

```
aethervine/
├── public/              # Static Assets (Sprites, Audio, Icons)
├── src/
│   ├── main.tsx        # React Entry Point
│   ├── App.tsx         # Root Component
│   ├── game/           # Phaser Game Logic
│   │   ├── scenes/     # Game Scenes
│   │   ├── entities/   # Character, Enemy, NPC
│   │   └── systems/    # Combat, Quest, Loot
│   ├── ui/             # React UI Components
│   │   ├── components/ # UI Elements
│   │   ├── hooks/      # Custom Hooks
│   │   └── stores/     # Zustand Stores
│   ├── core/           # Game Engine Core
│   │   ├── GameEngine.ts
│   │   ├── SaveManager.ts
│   │   └── TimeManager.ts
│   ├── data/           # WoW Classic Data
│   │   ├── classes/    # Class Definitions
│   │   ├── quests/     # Quest Data
│   │   └── items/      # Item Database
│   └── types/          # TypeScript Types
└── docs/               # Dokumentation
    ├── PLAN.md
    └── ARCHITECTURE.md
```

---

## 🎯 Roadmap

### **Phase 1: MVP** (Woche 1-2)
- [x] Projekt-Setup
- [x] Dokumentation (PLAN.md)
- [ ] Vite + React + Phaser Boilerplate
- [ ] Character Creation UI
- [ ] Basic Combat System
- [ ] Quest Engine
- [ ] Save/Load System

### **Phase 2: Alpha** (Woche 3-4)
- [ ] Alle 9 Klassen
- [ ] Equipment System
- [ ] Talentbäume
- [ ] 3 Starter-Zonen
- [ ] Combat Animationen

### **Phase 3: Beta** (Woche 5-6)
- [ ] Alle Classic Zonen (1-60)
- [ ] Dungeons
- [ ] Professions
- [ ] Achievements

### **Phase 4: Polish** (Woche 7-8)
- [ ] Audio & SFX
- [ ] Settings Panel
- [ ] Performance-Optimierung
- [ ] Desktop-Build (Tauri)

Siehe [PLAN.md](./PLAN.md) für Details.

---

## 🧪 Development

### **Code-Style**
- **TypeScript strict mode** aktiviert
- **ESLint** + **Prettier** für Code-Formatting
- **Conventional Commits** für Git-Messages

### **Testing**
```bash
# Unit Tests (Vitest)
npm run test

# Coverage Report
npm run test:coverage
```

### **Debugging**
- React DevTools (Browser-Extension)
- Zustand DevTools (Browser-Extension)
- Phaser Debug Mode: `config.physics.arcade.debug = true`

---

## 🎨 Design-Prinzipien

### **UI/UX**
- **Classic WoW Interface** Aesthetik
- **Goldene Akzente** auf dunklem Hintergrund
- **Tooltip-System** für alle interaktiven Elemente
- **Keyboard-Navigation** Support

### **Performance**
- **Lazy Loading** für Assets
- **Virtualized Lists** für große Inventare
- **60 FPS** Ziel für Phaser-Rendering
- **1 Tick/Sekunde** für Game-Logic

---

## 📚 Dokumentation

- **[PLAN.md](./PLAN.md)** — Detaillierter Implementierungsplan
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Technische Architektur (coming soon)
- **[DATA_SOURCES.md](./docs/DATA_SOURCES.md)** — WoW Classic Datenquellen (coming soon)

---

## 🤝 Contributing

Da dies ein **privates Lernprojekt** ist, sind externe Contributions nicht vorgesehen.  
Falls du Feedback hast, öffne gerne ein Issue!

---

## ⚖️ Legal / Disclaimer

**Aethervine** ist ein **Fan-Projekt** und nicht mit Blizzard Entertainment verbunden.  

- Alle **World of Warcraft**-Marken, Namen und Konzepte sind Eigentum von **Blizzard Entertainment**.
- Dieses Projekt verwendet **keine offiziellen Assets** (Grafiken, Audio, Code) von Blizzard.
- **Nur für private Nutzung** — keine kommerzielle Verwertung.

---

## 📧 Kontakt

**Entwickler:** mlemors  
**Projekt Start:** November 2025  
**Status:** 🚧 In aktiver Entwicklung (Phase 1)

---

**Happy Questing!** ⚔️🛡️
