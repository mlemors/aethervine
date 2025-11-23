# Architecture Documentation

**Projekt:** Aethervine  
**Version:** 1.0  
**Datum:** 23. November 2025

---

## 🏗️ High-Level Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Desktop                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐      ┌─────────────────────────┐  │
│  │   React Layer    │◄────►│    Phaser Layer         │  │
│  │                  │      │                         │  │
│  │  • UI Components │      │  • Game Rendering       │  │
│  │  • Zustand Store │      │  • Scene Management     │  │
│  │  • React Hooks   │      │  • Animation System     │  │
│  └────────┬─────────┘      └──────────┬──────────────┘  │
│           │                           │                  │
│           └────────┬──────────────────┘                  │
│                    │                                     │
│           ┌────────▼─────────┐                           │
│           │   Core Engine    │                           │
│           │                  │                           │
│           │  • GameEngine    │                           │
│           │  • TimeManager   │                           │
│           │  • SaveManager   │                           │
│           │  • EventBus      │                           │
│           └────────┬─────────┘                           │
│                    │                                     │
│           ┌────────▼─────────┐                           │
│           │  Game Systems    │                           │
│           │                  │                           │
│           │  • CombatSystem  │                           │
│           │  • QuestSystem   │                           │
│           │  • LootSystem    │                           │
│           │  • ProgressionSys│                           │
│           └────────┬─────────┘                           │
│                    │                                     │
│           ┌────────▼─────────┐                           │
│           │   Data Layer     │                           │
│           │                  │                           │
│           │  • Classes       │                           │
│           │  • Quests        │                           │
│           │  • Items         │                           │
│           │  • Zones         │                           │
│           └──────────────────┘                           │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                    IndexedDB (Browser)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Design-Prinzipien

### 1. **Separation of Concerns**
- **React:** UI-Rendering, User-Input, State-Display
- **Phaser:** Game-Rendering, Animationen, Visual-Effects
- **Core Engine:** Game-Logic, Calculations, Business-Rules
- **Data Layer:** Statische Game-Daten (Klassen, Quests, Items)

### 2. **Unidirectional Data Flow**
```
User Action → Store Update → React Re-render
                 ↓
            Core Engine Update → Phaser Scene Update
```

### 3. **Event-Driven Communication**
```typescript
// React → Core Engine
gameStore.setState({ isPaused: false });

// Core Engine → React
EventBus.emit('character:levelUp', { level: 5 });

// React listens
useEffect(() => {
  const handler = (data) => showNotification(`Level ${data.level}!`);
  EventBus.on('character:levelUp', handler);
  return () => EventBus.off('character:levelUp', handler);
}, []);
```

### 4. **Type-Safety First**
- Alle Daten-Strukturen haben TypeScript-Interfaces
- Keine `any` types (strict mode)
- Runtime-Validierung für User-Input und Save-Data

---

## 📦 Module-Details

### **1. React Layer** (`src/ui/`)

#### **Stores (Zustand)**
```typescript
// characterStore.ts
interface CharacterState {
  // Data
  id: string;
  name: string;
  class: WoWClass;
  race: WoWRace;
  level: number;
  experience: number;
  stats: CharacterStats;
  equipment: Equipment;
  
  // Actions
  gainExperience: (amount: number) => void;
  levelUp: () => void;
  equipItem: (item: Item, slot: EquipmentSlot) => void;
}
```

#### **Hooks Pattern**
```typescript
// useCharacter.ts
export const useCharacter = () => {
  const character = useCharacterStore();
  const gameEngine = useGameEngine();
  
  const startQuest = useCallback((questId: string) => {
    gameEngine.questSystem.startQuest(character, questId);
  }, [character, gameEngine]);
  
  return {
    character,
    startQuest,
    isInCombat: character.activeJob?.type === 'combat'
  };
};
```

#### **Component Structure**
```tsx
// CharacterSheet.tsx
export const CharacterSheet = () => {
  const { character } = useCharacter();
  const stats = useComputedStats(character);
  
  return (
    <div className="character-sheet">
      <Portrait class={character.class} />
      <StatsPanel stats={stats} />
      <EquipmentSlots equipment={character.equipment} />
    </div>
  );
};
```

---

### **2. Phaser Layer** (`src/game/`)

#### **Scene Architecture**
```typescript
// MainScene.ts
export class MainScene extends Phaser.Scene {
  private characterSprite!: Phaser.GameObjects.Sprite;
  private enemySprite?: Phaser.GameObjects.Sprite;
  
  create() {
    this.setupBackground();
    this.createCharacterSprite();
    this.listenToGameEvents();
  }
  
  update(time: number, delta: number) {
    this.updateAnimations(delta);
    this.updateCombatEffects();
  }
  
  private listenToGameEvents() {
    EventBus.on('combat:started', this.onCombatStarted.bind(this));
    EventBus.on('combat:hit', this.onCombatHit.bind(this));
    EventBus.on('combat:ended', this.onCombatEnded.bind(this));
  }
}
```

#### **Entity Management**
```typescript
// Character.ts (Phaser Entity)
export class Character extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.setupAnimations();
  }
  
  playAttackAnimation() {
    this.play('attack');
  }
  
  playIdleAnimation() {
    this.play('idle');
  }
}
```

---

### **3. Core Engine** (`src/core/`)

#### **GameEngine (Singleton)**
```typescript
export class GameEngine {
  private static instance: GameEngine;
  
  public timeManager: TimeManager;
  public combatSystem: CombatSystem;
  public questSystem: QuestSystem;
  public saveManager: SaveManager;
  
  private constructor() {
    this.timeManager = new TimeManager();
    this.combatSystem = new CombatSystem();
    this.questSystem = new QuestSystem();
    this.saveManager = new SaveManager();
    
    this.setupGameLoop();
  }
  
  private setupGameLoop() {
    this.timeManager.onTick(() => {
      this.processCombat();
      this.processQuests();
      this.processTravel();
      this.autoSave();
    });
  }
  
  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }
}
```

#### **TimeManager (Tick System)**
```typescript
export class TimeManager {
  private tickInterval = 1000; // 1 second
  private tickCallbacks: Array<() => void> = [];
  private intervalId?: number;
  
  start() {
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }
  
  private tick() {
    const gameState = useGameStore.getState();
    if (gameState.isPaused) return;
    
    this.tickCallbacks.forEach(cb => cb());
    EventBus.emit('game:tick', { timestamp: Date.now() });
  }
  
  onTick(callback: () => void) {
    this.tickCallbacks.push(callback);
  }
}
```

#### **EventBus (Pub/Sub)**
```typescript
type EventHandler = (data: any) => void;

export class EventBus {
  private static events: Map<string, EventHandler[]> = new Map();
  
  static emit(event: string, data?: any) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  static on(event: string, handler: EventHandler) {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }
  
  static off(event: string, handler: EventHandler) {
    const handlers = this.events.get(event) || [];
    const filtered = handlers.filter(h => h !== handler);
    this.events.set(event, filtered);
  }
}
```

---

### **4. Game Systems** (`src/game/systems/`)

#### **CombatSystem**
```typescript
export class CombatSystem {
  startCombat(character: Character, enemy: Enemy) {
    const combat: Combat = {
      id: generateId(),
      character,
      enemy,
      startTime: Date.now(),
      log: []
    };
    
    EventBus.emit('combat:started', { enemy: enemy.name });
    this.processCombat(combat);
  }
  
  private processCombat(combat: Combat) {
    // Calculate hit chance
    const hitChance = this.calculateHitChance(
      combat.character, 
      combat.enemy
    );
    
    // Roll for hit
    if (Math.random() < hitChance) {
      const damage = this.calculateDamage(combat.character);
      combat.enemy.health -= damage;
      
      EventBus.emit('combat:hit', { damage, target: 'enemy' });
      combat.log.push({ type: 'hit', damage, timestamp: Date.now() });
    } else {
      EventBus.emit('combat:miss', { attacker: 'player' });
      combat.log.push({ type: 'miss', timestamp: Date.now() });
    }
    
    // Check if enemy dead
    if (combat.enemy.health <= 0) {
      this.endCombat(combat, 'victory');
    }
  }
  
  private calculateHitChance(attacker: Character, defender: Enemy): number {
    const levelDiff = defender.level - attacker.level;
    const baseHitChance = 0.95; // 95% base
    const penaltyPerLevel = 0.02; // -2% per level above
    
    return Math.max(0.1, baseHitChance - (levelDiff * penaltyPerLevel));
  }
  
  private calculateDamage(character: Character): number {
    const { strength, weaponDamage } = character.stats;
    const baseDamage = weaponDamage || 10;
    const strBonus = strength * 0.5;
    const variance = 0.85 + Math.random() * 0.3; // 85-115%
    
    return Math.floor((baseDamage + strBonus) * variance);
  }
}
```

#### **QuestSystem**
```typescript
export class QuestSystem {
  private activeQuests: Map<string, QuestProgress> = new Map();
  
  startQuest(character: Character, questId: string) {
    const quest = QUEST_DATABASE[questId];
    if (!quest) throw new Error(`Quest ${questId} not found`);
    
    const progress: QuestProgress = {
      questId,
      objectives: quest.objectives.map(obj => ({
        ...obj,
        current: 0
      })),
      startTime: Date.now()
    };
    
    this.activeQuests.set(questId, progress);
    EventBus.emit('quest:started', { quest });
  }
  
  updateObjective(questId: string, objectiveId: string, amount: number) {
    const progress = this.activeQuests.get(questId);
    if (!progress) return;
    
    const objective = progress.objectives.find(o => o.id === objectiveId);
    if (!objective) return;
    
    objective.current = Math.min(objective.current + amount, objective.required);
    
    EventBus.emit('quest:progress', { questId, objective });
    
    // Check completion
    if (this.isQuestComplete(progress)) {
      this.completeQuest(questId);
    }
  }
  
  private completeQuest(questId: string) {
    const quest = QUEST_DATABASE[questId];
    const character = useCharacterStore.getState();
    
    // Award rewards
    character.gainExperience(quest.rewards.experience);
    character.addGold(quest.rewards.gold);
    
    this.activeQuests.delete(questId);
    EventBus.emit('quest:completed', { quest });
  }
}
```

#### **LootSystem**
```typescript
export class LootSystem {
  generateLoot(enemy: Enemy): Item[] {
    const loot: Item[] = [];
    const lootTable = LOOT_TABLES[enemy.lootTableId];
    
    lootTable.forEach(entry => {
      if (Math.random() < entry.dropChance) {
        const item = this.createItem(entry.itemId);
        loot.push(item);
      }
    });
    
    // Always drop gold
    const goldAmount = this.calculateGoldDrop(enemy.level);
    loot.push({ type: 'currency', amount: goldAmount });
    
    return loot;
  }
  
  private calculateGoldDrop(level: number): number {
    const baseGold = level * 2;
    const variance = 0.5 + Math.random(); // 50-150%
    return Math.floor(baseGold * variance) / 100; // Convert copper to gold
  }
}
```

---

### **5. Data Layer** (`src/data/`)

#### **Type-Safe Definitions**
```typescript
// types/character.ts
export interface CharacterStats {
  // Primary Stats
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;
  
  // Derived Stats (computed)
  health: number;
  mana: number;
  armor: number;
  attackPower: number;
  spellPower: number;
  critChance: number;
}

export interface ClassDefinition {
  id: string;
  name: string;
  baseStats: CharacterStats;
  statGrowthPerLevel: CharacterStats;
  abilities: Ability[];
  startingEquipment: Item[];
}
```

#### **Quest Definitions**
```typescript
// data/quests/elwynn-forest.ts
export const ELWYNN_QUESTS: Quest[] = [
  {
    id: 'elwynn_001',
    name: 'Kobold Candles',
    description: 'Kobolds have been stealing candles from the Fargodeep Mine...',
    zone: 'Elwynn Forest',
    level: 5,
    faction: 'Alliance',
    questGiver: 'Marshal Dughan',
    objectives: [
      { 
        id: 'kill_kobolds',
        type: 'kill', 
        target: 'Kobold Worker', 
        required: 10 
      },
      { 
        id: 'collect_candles',
        type: 'collect', 
        item: 'Kobold Candle', 
        required: 8 
      }
    ],
    rewards: {
      experience: 250,
      gold: 0.12,
      items: ['worn_shortsword'],
      reputation: { faction: 'Stormwind', amount: 25 }
    }
  }
];
```

#### **Item Database**
```typescript
// data/items/weapons.ts
export const WEAPONS: Record<string, Item> = {
  worn_shortsword: {
    id: 'worn_shortsword',
    name: 'Worn Shortsword',
    type: 'weapon',
    subtype: 'sword',
    slot: 'main-hand',
    rarity: 'common',
    level: 1,
    stats: {
      minDamage: 3,
      maxDamage: 6,
      speed: 1.8
    },
    requirements: {
      level: 1,
      class: ['Warrior', 'Paladin', 'Rogue']
    },
    vendor: {
      buy: 0.05,
      sell: 0.01
    }
  }
};
```

---

### **6. Save System** (`src/core/SaveManager.ts`)

#### **Save Data Structure**
```typescript
interface SaveData {
  version: string;
  timestamp: number;
  character: {
    id: string;
    name: string;
    class: WoWClass;
    race: WoWRace;
    level: number;
    experience: number;
    stats: CharacterStats;
    equipment: Equipment;
    inventory: Item[];
    position: Position;
  };
  quests: {
    completed: string[];
    active: QuestProgress[];
  };
  progression: {
    achievements: string[];
    statistics: Record<string, number>;
  };
  settings: GameSettings;
}
```

#### **SaveManager Implementation**
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AethervineDB extends DBSchema {
  saves: {
    key: string;
    value: SaveData;
  };
}

export class SaveManager {
  private db?: IDBPDatabase<AethervineDB>;
  private autoSaveInterval = 60000; // 1 minute
  
  async initialize() {
    this.db = await openDB<AethervineDB>('aethervine', 1, {
      upgrade(db) {
        db.createObjectStore('saves');
      }
    });
    
    this.setupAutoSave();
  }
  
  async save(slot: string = 'current'): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const saveData: SaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      character: useCharacterStore.getState(),
      quests: useQuestStore.getState(),
      progression: useProgressionStore.getState(),
      settings: useSettingsStore.getState()
    };
    
    await this.db.put('saves', saveData, slot);
    EventBus.emit('game:saved', { slot, timestamp: saveData.timestamp });
  }
  
  async load(slot: string = 'current'): Promise<SaveData | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const saveData = await this.db.get('saves', slot);
    if (!saveData) return null;
    
    // Validate version
    if (saveData.version !== '1.0.0') {
      console.warn('Save data version mismatch, migration needed');
    }
    
    // Restore stores
    useCharacterStore.setState(saveData.character);
    useQuestStore.setState(saveData.quests);
    useProgressionStore.setState(saveData.progression);
    useSettingsStore.setState(saveData.settings);
    
    EventBus.emit('game:loaded', { slot });
    return saveData;
  }
  
  async exportSave(slot: string = 'current'): Promise<string> {
    const saveData = await this.db?.get('saves', slot);
    if (!saveData) throw new Error('No save data found');
    
    return JSON.stringify(saveData, null, 2);
  }
  
  async importSave(jsonString: string, slot: string = 'imported') {
    const saveData = JSON.parse(jsonString) as SaveData;
    await this.db?.put('saves', saveData, slot);
  }
  
  private setupAutoSave() {
    setInterval(() => {
      const gameState = useGameStore.getState();
      if (!gameState.isPaused) {
        this.save().catch(console.error);
      }
    }, this.autoSaveInterval);
  }
}
```

---

## 🔄 Data Flow Examples

### **Example 1: Starting a Quest**
```
1. User clicks "Accept Quest" in UI
   ↓
2. CharacterSheet.tsx → calls useCharacter().startQuest(questId)
   ↓
3. useCharacter hook → calls gameEngine.questSystem.startQuest()
   ↓
4. QuestSystem → updates activeQuests, emits 'quest:started'
   ↓
5. EventBus → notifies all listeners
   ↓
6. React components → re-render with new quest data
   ↓
7. Phaser Scene → shows quest indicator animation
```

### **Example 2: Combat Resolution**
```
1. TimeManager → ticks every 1 second
   ↓
2. GameEngine → calls processCombat()
   ↓
3. CombatSystem → calculates damage, applies to enemy
   ↓
4. EventBus → emits 'combat:hit' with damage data
   ↓
5. Phaser MainScene → plays hit animation, damage numbers
   ↓
6. React CombatLog → adds log entry to UI
   ↓
7. If enemy dies → emit 'combat:ended'
   ↓
8. LootSystem → generates loot, emits 'loot:received'
   ↓
9. InventoryStore → updates with new items
   ↓
10. UI → shows loot notification
```

---

## 🧪 Testing Strategy

### **Unit Tests**
```typescript
// tests/unit/combat.test.ts
import { describe, it, expect } from 'vitest';
import { CombatSystem } from '@/game/systems/CombatSystem';

describe('CombatSystem', () => {
  it('calculates hit chance correctly for same level', () => {
    const combat = new CombatSystem();
    const character = createMockCharacter({ level: 5 });
    const enemy = createMockEnemy({ level: 5 });
    
    const hitChance = combat.calculateHitChance(character, enemy);
    expect(hitChance).toBeCloseTo(0.95);
  });
  
  it('reduces hit chance for higher level enemies', () => {
    const combat = new CombatSystem();
    const character = createMockCharacter({ level: 5 });
    const enemy = createMockEnemy({ level: 8 }); // +3 levels
    
    const hitChance = combat.calculateHitChance(character, enemy);
    expect(hitChance).toBeCloseTo(0.89); // 95% - (3 * 2%) = 89%
  });
});
```

### **Integration Tests**
```typescript
// tests/integration/quest-flow.test.ts
it('completes quest from start to finish', async () => {
  const engine = GameEngine.getInstance();
  const character = createTestCharacter();
  const quest = ELWYNN_QUESTS[0]; // Kobold Candles
  
  // Start quest
  engine.questSystem.startQuest(character, quest.id);
  expect(engine.questSystem.getActiveQuests()).toHaveLength(1);
  
  // Simulate 10 kobold kills
  for (let i = 0; i < 10; i++) {
    await engine.combatSystem.startCombat(character, createEnemy('Kobold Worker'));
  }
  
  // Check quest completion
  expect(character.experience).toBe(250);
  expect(character.inventory).toContainItem('worn_shortsword');
});
```

---

## 🚀 Performance Optimizations

### **1. Asset Loading**
- Lazy-load sprites per zone
- Preload only current + adjacent zones
- Use sprite atlases (reduce HTTP requests)

### **2. React Rendering**
```typescript
// Memoize expensive computations
const computedStats = useMemo(() => {
  return calculateDerivedStats(character, equipment);
}, [character.level, equipment]);

// Virtualize large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={inventory.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{inventory[index].name}</div>
  )}
</FixedSizeList>
```

### **3. Phaser Optimizations**
```typescript
// Limit active sprites
const MAX_PARTICLES = 50;
const particleEmitter = scene.add.particles(x, y, 'spark', {
  lifespan: 1000,
  maxParticles: MAX_PARTICLES
});

// Use object pooling for frequently created/destroyed objects
class EnemyPool {
  private pool: Enemy[] = [];
  
  acquire(): Enemy {
    return this.pool.pop() || new Enemy();
  }
  
  release(enemy: Enemy) {
    enemy.reset();
    this.pool.push(enemy);
  }
}
```

---

## 📊 Metrics & Monitoring

### **Dev Mode Metrics**
```typescript
interface GameMetrics {
  fps: number;
  tickRate: number;
  memoryUsage: number;
  activeCombats: number;
  activeQuests: number;
  renderTime: number;
}

// Display in debug overlay
const DebugOverlay = () => {
  const metrics = useGameMetrics();
  
  return (
    <div className="debug-overlay">
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Tick Rate: {metrics.tickRate}ms</div>
    </div>
  );
};
```

---

## 🔐 Security Considerations

### **Client-Side Game**
- Keine Server-Validierung (Single-Player)
- Save-Data kann manipuliert werden (akzeptabel für Offline-Spiel)
- Keine sensiblen Daten (nur Spielstand)

### **Future: Multiplayer/Leaderboards**
- Server-side Validierung aller Actions
- Anti-Cheat-Maßnahmen
- Encrypted Save-Data

---

**Status:** ✅ Architecture definiert  
**Nächster Schritt:** Projekt-Setup & erste Implementation
