# Aethervine - Implementierungsplan

**Version:** 1.0  
**Datum:** 23. November 2025  
**Projekt:** WoW Classic Idle RPG (TypeScript)

## 🎯 Projektziel

Ein Idle RPG im World of Warcraft Classic Setting als Standalone Web-/Desktop-Anwendung. Fokus auf Auto-Questing, Auto-Battling, Charakterprogression und authentischem WoW Classic Feeling.

---

## 🛠️ Tech Stack

### Core Framework
- **Build Tool:** Vite 5.x (ESM-first, ultraschnell)
- **Sprache:** TypeScript 5.x (strict mode)
- **Package Manager:** npm/pnpm

### UI Layer
- **Framework:** React 18.x (mit Hooks)
- **State Management:** Zustand (lightweight, TypeScript-friendly)
- **Styling:** CSS Modules + Tailwind CSS (für schnelles Prototyping)
- **UI Components:** Headless UI oder Radix UI (für Modals, Tabs, etc.)

### Game Engine Layer
- **Engine:** Phaser 3.x (Canvas/WebGL Rendering)
- **Scene Management:** Phaser Scene System
- **Asset Loading:** Phaser Loader + Vite Asset Pipeline

### Persistence
- **Browser:** IndexedDB (via idb wrapper)
- **Backup/Export:** JSON Export/Import
- **Zukunft:** Optional SQLite via Tauri/Electron

### Desktop (Phase 2)
- **Target:** Tauri (Rust-based, kleiner als Electron)
- **Alternative:** Electron (falls Tauri-Limitationen)

---

## 📁 Projektstruktur

```
aethervine/
├── public/                    # Static Assets
│   ├── assets/               # Phaser Assets
│   │   ├── sprites/         # Character sprites, icons
│   │   ├── backgrounds/     # Zone backgrounds
│   │   ├── audio/           # Sound effects, music
│   │   └── ui/              # UI elements
│   └── favicon.ico
│
├── src/
│   ├── main.tsx              # React Entry Point
│   ├── App.tsx               # Root React Component
│   │
│   ├── game/                 # Phaser Game Logic
│   │   ├── PhaserGame.ts    # Phaser Game Instance
│   │   ├── config.ts        # Phaser Configuration
│   │   │
│   │   ├── scenes/          # Phaser Scenes
│   │   │   ├── BootScene.ts
│   │   │   ├── MainScene.ts
│   │   │   ├── CombatScene.ts
│   │   │   └── TravelScene.ts
│   │   │
│   │   ├── entities/        # Game Entities
│   │   │   ├── Character.ts
│   │   │   ├── Enemy.ts
│   │   │   └── NPC.ts
│   │   │
│   │   └── systems/         # Game Systems
│   │       ├── CombatSystem.ts
│   │       ├── QuestSystem.ts
│   │       ├── LootSystem.ts
│   │       └── ProgressionSystem.ts
│   │
│   ├── ui/                   # React UI Layer
│   │   ├── components/      # UI Components
│   │   │   ├── CharacterSheet/
│   │   │   ├── Inventory/
│   │   │   ├── QuestLog/
│   │   │   ├── ActionBar/
│   │   │   └── SettingsPanel/
│   │   │
│   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── useGameState.ts
│   │   │   ├── useCharacter.ts
│   │   │   └── useQuests.ts
│   │   │
│   │   └── stores/          # Zustand Stores
│   │       ├── characterStore.ts
│   │       ├── questStore.ts
│   │       ├── inventoryStore.ts
│   │       └── gameStore.ts
│   │
│   ├── core/                 # Core Game Engine
│   │   ├── GameEngine.ts    # Main Game Loop
│   │   ├── TimeManager.ts   # Time & Tick System
│   │   ├── SaveManager.ts   # Save/Load Logic
│   │   ├── EventBus.ts      # Event System
│   │   └── Logger.ts        # Debug Logging
│   │
│   ├── data/                 # Game Data (WoW Classic)
│   │   ├── classes/         # Class Definitions
│   │   │   ├── warrior.ts
│   │   │   ├── mage.ts
│   │   │   └── ...
│   │   │
│   │   ├── quests/          # Quest Data
│   │   │   ├── elwynn-forest.ts
│   │   │   ├── durotar.ts
│   │   │   └── ...
│   │   │
│   │   ├── items/           # Item Database
│   │   │   ├── weapons.ts
│   │   │   ├── armor.ts
│   │   │   └── consumables.ts
│   │   │
│   │   ├── zones/           # Zone/Map Data
│   │   │   └── azeroth.ts
│   │   │
│   │   └── constants/       # Game Constants
│   │       ├── stats.ts
│   │       ├── formulas.ts
│   │       └── config.ts
│   │
│   ├── types/                # TypeScript Types
│   │   ├── character.ts
│   │   ├── quest.ts
│   │   ├── item.ts
│   │   ├── combat.ts
│   │   └── game.ts
│   │
│   └── utils/                # Utility Functions
│       ├── random.ts
│       ├── formatters.ts
│       └── validators.ts
│
├── tests/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                      # Dokumentation
│   ├── ARCHITECTURE.md
│   ├── DATA_SOURCES.md
│   └── GAME_DESIGN.md
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🎮 Architektur-Entscheidungen

### 1. **Rendering-Strategie: Hybrid Approach**

**Phaser (Canvas/WebGL):**
- Hauptspiel-View (Charakter, Combat-Animationen)
- Partikel-Effekte
- Zone-Hintergründe
- Smooth Animationen

**React (DOM):**
- Alle UI Overlays (HUD)
- Charakter-Sheet, Inventar, Quest-Log
- Menüs und Modals
- Settings

**Kommunikation:**
```typescript
// Phaser → React: EventBus
EventBus.emit('combat:started', { enemy: 'Wolf' });

// React → Phaser: Store Updates
gameStore.setState({ isPaused: true });
```

### 2. **State Management: Zustand**

```typescript
// characterStore.ts
interface CharacterState {
  name: string;
  class: WoWClass;
  level: number;
  experience: number;
  stats: CharacterStats;
  // Actions
  gainExperience: (amount: number) => void;
  levelUp: () => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  // Initial state
  name: '',
  class: 'Warrior',
  level: 1,
  experience: 0,
  stats: DEFAULT_STATS,
  
  // Actions
  gainExperience: (amount) => set((state) => ({
    experience: state.experience + amount
  })),
  
  levelUp: () => set((state) => ({
    level: state.level + 1,
    experience: 0
  }))
}));
```

**Vorteile:**
- ✅ Kein Boilerplate (vs Redux)
- ✅ TypeScript-native
- ✅ Selectors sind einfach
- ✅ DevTools Support

### 3. **Game Loop: Dual-Layer**

**Layer 1: Phaser Game Loop (60 FPS)**
```typescript
// Für Rendering & Animationen
update(time: number, delta: number) {
  this.updateAnimations(delta);
  this.renderEffects();
}
```

**Layer 2: Custom Tick System (1 tick/second)**
```typescript
// Für Game Logic (Combat, Quests, Travel)
class TimeManager {
  private tickInterval = 1000; // 1 second
  
  tick() {
    this.processCombat();
    this.processQuests();
    this.processTravel();
    this.checkLevelUp();
  }
}
```

### 4. **Persistence: IndexedDB**

```typescript
interface SaveData {
  version: string;
  timestamp: number;
  character: CharacterData;
  inventory: ItemData[];
  quests: QuestProgress[];
  settings: GameSettings;
}

class SaveManager {
  async save(): Promise<void> {
    const data = this.serializeGameState();
    await db.put('saves', data, 'current');
  }
  
  async load(): Promise<SaveData | null> {
    return await db.get('saves', 'current');
  }
  
  async export(): Promise<string> {
    const data = await this.load();
    return JSON.stringify(data, null, 2);
  }
}
```

### 5. **WoW Classic Data: Type-Safe Definitions**

```typescript
// types/character.ts
export type WoWClass = 
  | 'Warrior' | 'Paladin' | 'Hunter' 
  | 'Rogue' | 'Priest' | 'Shaman'
  | 'Mage' | 'Warlock' | 'Druid';

export type WoWRace = 
  | 'Human' | 'Dwarf' | 'Night Elf' | 'Gnome'
  | 'Orc' | 'Undead' | 'Tauren' | 'Troll';

export interface CharacterStats {
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;
  // Derived stats
  health: number;
  mana: number;
  armor: number;
  attackPower: number;
  spellPower: number;
}

// data/classes/warrior.ts
export const WARRIOR_CLASS: ClassDefinition = {
  id: 'warrior',
  name: 'Warrior',
  baseStats: {
    strength: 20,
    agility: 14,
    stamina: 18,
    intellect: 8,
    spirit: 10
  },
  statGrowth: {
    strength: 3.0,
    agility: 1.5,
    stamina: 2.5,
    intellect: 0.5,
    spirit: 1.0
  },
  abilities: [
    { id: 'heroic_strike', level: 1, name: 'Heroic Strike', manaCost: 0, cooldown: 0 },
    { id: 'charge', level: 4, name: 'Charge', manaCost: 0, cooldown: 15 }
  ]
};
```

---

## 🚀 Meilensteine

### **MVP (Phase 1) - Woche 1-2**

**Ziel:** Spielbarer Kern mit einer Klasse, einer Zone, 5 Quests

**Features:**
- ✅ Projekt-Setup (Vite + React + Phaser)
- ✅ Charaktererstellung (1 Klasse: Warrior)
- ✅ Basis Combat System (Auto-Attack)
- ✅ Einfaches Quest System (Kill X, Collect Y)
- ✅ Basic UI (Character Sheet, Quest Log)
- ✅ XP & Leveling (Level 1-10)
- ✅ Save/Load System
- ✅ Eine Zone (Elwynn Forest / Durotar)

**Tech Tasks:**
1. Vite + React + TypeScript Setup
2. Phaser Integration & Scene-Setup
3. Zustand Stores (character, quest, game)
4. IndexedDB Save-System
5. Basic Combat Formula (DPS, Hit Chance)
6. Quest Engine (Objectives, Rewards)

**Deliverable:** 
Spieler kann Charakter erstellen, 5 Quests abschließen, bis Level 5-7 kommen

---

### **Alpha (Phase 2) - Woche 3-4**

**Ziel:** Alle 9 Klassen, 3 Zonen, erweiterte Mechaniken

**Features:**
- ✅ Alle 9 WoW Classic Klassen
- ✅ Talentbaum-System (vereinfacht)
- ✅ Equipment System (Waffen, Rüstung)
- ✅ Loot System mit Rarity
- ✅ Inventory Management
- ✅ 3 Starter-Zonen (Elwynn, Durotar, Dun Morogh)
- ✅ Travel-System mit Flugpunkten
- ✅ Combat-Animationen (Phaser Sprites)

**Tech Tasks:**
1. Class-System mit Abilities
2. Equipment Stats & Calculation
3. Loot Tables & Drop Rates
4. Inventory UI (React)
5. Zone-Travel mit Zeit-Simulation
6. Sprite Assets für Klassen

**Deliverable:**
Feature-komplett für Leveling 1-20

---

### **Beta (Phase 3) - Woche 5-6**

**Ziel:** Content-Complete für Classic Zones (1-60)

**Features:**
- ✅ Alle Classic Zonen
- ✅ Dungeons (Solo-Mode mit NPC-Groups)
- ✅ Professions (2 Haupt + 3 Secondary)
- ✅ Mailbox & Bank
- ✅ Achievements
- ✅ Statistics Screen

**Tech Tasks:**
1. Quest-Chains
2. Dungeon-System
3. Profession-Skill-System
4. Bank/Mail Storage
5. Achievement Tracker

**Deliverable:**
Kompletter 1-60 Leveling-Path

---

### **Polish (Phase 4) - Woche 7-8**

**Ziel:** UX, Performance, Desktop-Build

**Features:**
- ✅ Sound Effects & Music
- ✅ Settings (Volume, Graphics Quality)
- ✅ Tooltips & Help-System
- ✅ Import/Export Saves
- ✅ Performance-Optimierung
- ✅ Desktop-Build (Tauri)

**Tech Tasks:**
1. Audio-System
2. Settings-Panel
3. Performance-Profiling
4. Tauri Integration
5. Build-Pipeline (GitHub Actions)

**Deliverable:**
Release-Ready Desktop App

---

## 📊 Daten-Strategie

### **WoW Classic Data Sources**

1. **Wowhead Classic DB** (Community-Export)
   - Quests, Items, NPCs
   - Mit Lizenz-Check verwenden

2. **Classic DB CSV** (Community-Projekte)
   - XP Tables
   - Stat Formulas
   - Loot Tables

3. **Manuell kuratiert**
   - Quest-Text
   - Zone-Daten
   - Starter-Sets

### **Data Format**

```typescript
// data/quests/elwynn-forest.ts
export const KOBOLD_QUEST: Quest = {
  id: 'elwynn_kobolds_001',
  name: 'Kobold Candles',
  zone: 'Elwynn Forest',
  level: 5,
  questGiver: 'Marshal Dughan',
  objectives: [
    { type: 'kill', target: 'Kobold Worker', count: 10 },
    { type: 'collect', item: 'Kobold Candle', count: 8 }
  ],
  rewards: {
    experience: 250,
    gold: 0.12,
    items: ['Worn Shortsword']
  },
  description: 'Kobolds have been stealing candles from the mines...'
};
```

---

## 🧪 Testing-Strategie

### **Unit Tests (Vitest)**
```typescript
// tests/unit/combat.test.ts
describe('Combat System', () => {
  it('calculates hit chance correctly', () => {
    const attacker = createCharacter({ level: 5 });
    const defender = createEnemy({ level: 5 });
    const hitChance = calculateHitChance(attacker, defender);
    expect(hitChance).toBeGreaterThan(0.9); // 90%+ vs same level
  });
});
```

### **Integration Tests**
```typescript
// tests/integration/quest-completion.test.ts
it('completes quest and awards XP', async () => {
  const character = createCharacter({ level: 1 });
  const quest = KOBOLD_QUEST;
  
  // Simulate kills
  for (let i = 0; i < 10; i++) {
    await combatSystem.fight(character, 'Kobold Worker');
  }
  
  // Complete quest
  questSystem.completeQuest(character, quest.id);
  
  expect(character.experience).toBe(250);
});
```

---

## 🎨 UI/UX Design-Prinzipien

### **Visual Style**
- **Farbschema:** WoW Classic Palette (Gold, Brown, Dark Blue)
- **Font:** LifeCraft (WoW-ähnlich) oder Google Fonts Alternative
- **Icons:** Custom SVG Icons (Abilities, Items)
- **Layout:** Classic MMO Interface (Actionbars unten, Character-Sheet klassisch)

### **Responsive Design**
- Desktop: 1280x720 minimum
- Tablet: Touch-optimiert
- Mobile: Read-only Dashboard (Phase 5)

### **Accessibility**
- Keyboard-Navigation
- Colorblind Mode
- Text-Scaling Options

---

## 📦 Deployment

### **Development**
```bash
npm run dev
```

### **Production Web-Build**
```bash
npm run build
# Deploy zu GitHub Pages / Vercel / Netlify
```

### **Desktop Build (Tauri)**
```bash
npm run tauri build
# → macOS .app, Windows .exe, Linux .AppImage
```

---

## 🔮 Zukunfts-Features (Post-1.0)

- **PvP Arena** (NPC-Gegner mit anderen Builds)
- **Raid-System** (Molten Core, BWL)
- **Guild-System** (Offline, nur UI)
- **Transmog-System**
- **Pet-System** (Hunter, Warlock)
- **Mount-Collection**
- **Seasonal Events** (Hallow's End, Winterveil)

---

## ⚠️ Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|---------|------------|
| Copyright-Issues (Blizzard) | Mittel | Hoch | Private Use, keine Assets, Fan-Projekt Disclaimer |
| Performance (Phaser + React) | Niedrig | Mittel | Profiling, Canvas-Optimierung |
| Scope Creep | Hoch | Hoch | Strikte MVP-Grenzen, Feature-Freeze nach Phase 3 |
| WoW Data Inkonsistenz | Mittel | Niedrig | Manuelle Validierung, Community-Review |

---

## 📝 Nächste Schritte

1. **Setup Vite + React + Phaser Boilerplate** ✅ (Auto-generiert)
2. **Erstelle Type-Definitionen** (character.ts, quest.ts, item.ts)
3. **Implementiere SaveManager** (IndexedDB Wrapper)
4. **Prototyp Combat-System** (Formeln testen)
5. **Erste Quest implementieren** (End-to-End)

---

**Status:** ✅ Plan genehmigt  
**Nächster Schritt:** Projekt-Setup & Boilerplate-Generierung
