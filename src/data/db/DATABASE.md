# CMaNGOS Classic-DB Datenbank

## Übersicht

Wir verwenden eine **SQLite-Kopie** der kompletten CMaNGOS Classic WoW Datenbank (Version 1.12.1).

- **Quelle:** CMaNGOS classic-db Submodule
- **Format:** SQLite 3 (71.86 MB)
- **Pfad:** `src/data/cache/classicdb.sqlite`
- **Tabellen:** 193 (1:1 Kopie der MySQL Datenbank)
- **Datensätze:** 870,660

## Installation & Setup

Die Datenbank wurde bereits exportiert und liegt fertig vor. Falls sie neu erstellt werden muss:

```bash
# 1. MySQL installieren (temporär)
brew install mysql
brew services start mysql

# 2. SQL Dump in MySQL importieren
mysql -u root -e "CREATE DATABASE classicmangos"
mysql -u root classicmangos < src/data/classic-db/Full_DB/ClassicDB_1_12_1_z2815.sql

# 3. Updates anwenden
cd src/data/classic-db/Updates
for file in *.sql; do mysql -u root classicmangos < "$file"; done

# 4. Nach SQLite exportieren
npm install mysql2
npx ts-node scripts/export_mysql_to_sqlite.ts

# 5. MySQL wieder deinstallieren
brew services stop mysql
brew uninstall mysql
```

**Dauer:** Ca. 2-3 Minuten

## Verwendung

### TypeScript/JavaScript

```typescript
import { GameDatabase } from './src/data/sqlite_loader';

const db = new GameDatabase();

// Quest abfragen
const quest = db.getQuest(62);
console.log(quest.Title); // "The Fargodeep Mine"

// Quest Giver finden
const givers = db.getQuestGivers(62);
console.log(givers[0].Name); // "Marshal Dughan"

// NPC Position finden
const spawns = db.getCreatureSpawns(240);
console.log(spawns[0].position_x, spawns[0].position_y);

// Datenbankverbindung schließen
db.close();
```

### Singleton Pattern (empfohlen)

```typescript
import { getDatabase, closeDatabase } from './src/data/sqlite_loader';

const db = getDatabase(); // Erstellt nur eine Instanz
const quest = db.getQuest(62);

// Am Ende
closeDatabase();
```

## Verfügbare Methoden

### Quests

```typescript
// Quest Details
getQuest(questId: number): Quest | null

// Alle Quests für Level-Range
getQuestsByLevel(minLevel: number, maxLevel: number): Quest[]

// Prüfe ob Quest existiert
questExists(questId: number): boolean
```

### Quest-Giver & Ender

```typescript
// Welche NPCs geben diese Quest?
getQuestGivers(questId: number): Array<{ id: number; Name: string }>

// Bei welchen NPCs wird Quest abgegeben?
getQuestEnders(questId: number): Array<{ id: number; Name: string }>

// Welche Quests gibt dieser NPC?
getQuestsFromNPC(npcId: number): number[]

// Welche GameObjects sind mit Quest verknüpft?
getQuestGameObjects(questId: number): Array<{ id: number; name: string }>
```

### NPCs & Creatures

```typescript
// NPC Template (Stats, Name, Level, etc.)
getCreatureTemplate(creatureId: number): CreatureTemplate | null

// Alle Spawn-Positionen eines NPCs
getCreatureSpawns(creatureId: number): CreatureSpawn[]

// Nächster Spawn zu einer Position
getNearestCreature(
  creatureId: number, 
  x: number, 
  y: number, 
  map?: number
): CreatureSpawn | null
```

### Items & Loot

```typescript
// Item Details
getItem(itemId: number): Item | null

// Loot Table eines Mobs
getLootTable(creatureId: number): LootEntry[]
```

### GameObjects

```typescript
// Alle Spawns eines GameObjects (Kisten, Quest-Objekte, etc.)
getGameObjectSpawns(gameObjectId: number): Array<{
  guid: number;
  id: number;
  map: number;
  position_x: number;
  position_y: number;
  position_z: number;
  orientation: number;
}>
```

### Spieler-Start

```typescript
// Start-Position für Race/Class Kombination
getStartPosition(race: number, classId: number): PlayerCreateInfo | null
```

## Wichtige Tabellen

### Quests (4,245)
- `quest_template` - Quest-Daten (Titel, Beschreibung, Belohnungen)
- `quest_poi` - Quest-Markierungen auf der Map (18,486)
- `quest_poi_points` - Genaue Quest-Gebiete (56,425)
- `creature_questrelation` - Quest Giver (3,827)
- `creature_involvedrelation` - Quest Ender (3,951)
- `gameobject_questrelation` - GameObject Quest Giver (257)

### NPCs (66,363 Spawns)
- `creature` - NPC Spawn-Positionen mit Koordinaten
- `creature_template` - NPC Stats, Namen, Level (10,384)
- `creature_movement` - Patrol-Routen (52,439)
- `npc_vendor` - Was verkaufen NPCs? (11,701)
- `npc_trainer` - Welche Skills/Spells kann man lernen? (27,309)
- `npc_text` - Dialog-Texte (2,446)
- `gossip_menu` - Dialog-Menüs (3,905)

### Loot (168,306 Einträge)
- `creature_loot_template` - Mob Loot (151,791)
- `gameobject_loot_template` - Kisten/Nodes (12,547)
- `item_loot_template` - Items öffnen (3,966)
- `pickpocketing_loot_template` - Taschendiebstahl (6,994)
- `fishing_loot_template` - Angel-Loot (155)
- `skinning_loot_template` - Kürschner (2,802)

### Items & Spells
- `item_template` - Item Daten (17,718)
- `spell_template` - Spell Daten (22,374)

### World & Navigation
- `gameobject` - GameObject Spawns (47,653)
- `waypoint_path` - Waypoint Pfade (7,469)
- `pool_template` - Spawn Pools (4,206)
- `world_safe_locs` - Sichere Teleport-Punkte (122)

## Beispiele

### Quest-Kette verfolgen

```typescript
const db = getDatabase();

// 1. Quest holen
const quest = db.getQuest(783); // "A Threat Within"
console.log(`Quest: ${quest.Title}`);

// 2. Quest Giver finden
const givers = db.getQuestGivers(783);
const giver = givers[0];
console.log(`Quest Giver: ${giver.Name} (${giver.id})`);

// 3. NPC Position finden
const spawns = db.getCreatureSpawns(giver.id);
const spawn = spawns[0];
console.log(`Position: ${spawn.position_x}, ${spawn.position_y}`);

// 4. Quest Ender finden
const enders = db.getQuestEnders(783);
console.log(`Quest Ender: ${enders[0].Name}`);
```

### Alle Quests eines NPCs

```typescript
const db = getDatabase();

// Marshal McBride (NPC 823)
const questIds = db.getQuestsFromNPC(823);
console.log(`${questIds.length} Quests gefunden`);

questIds.forEach(qId => {
  const q = db.getQuest(qId);
  console.log(`- [${qId}] ${q.Title} (Level ${q.QuestLevel})`);
});
```

### Level-basierte Quests finden

```typescript
const db = getDatabase();

// Alle Quests für Level 1-5
const quests = db.getQuestsByLevel(1, 5);
console.log(`${quests.length} Quests für Anfänger`);

quests.forEach(q => {
  console.log(`${q.Title} (Level ${q.QuestLevel})`);
});
```

### Start-Position für Night Elf Druid

```typescript
const db = getDatabase();

// Race: 4 (Night Elf), Class: 11 (Druid)
const startPos = db.getStartPosition(4, 11);
console.log(`Start Position:`);
console.log(`  Map: ${startPos.map}`);
console.log(`  Zone: ${startPos.zone}`);
console.log(`  X: ${startPos.position_x}`);
console.log(`  Y: ${startPos.position_y}`);
console.log(`  Z: ${startPos.position_z}`);
```

### Loot eines Mobs checken

```typescript
const db = getDatabase();

// Kobold Vermin (Creature 6)
const loot = db.getLootTable(6);
console.log(`${loot.length} Loot-Einträge`);

loot.forEach(l => {
  const item = db.getItem(l.item);
  const chance = l.ChanceOrQuestChance;
  console.log(`${item.name}: ${chance}% (${l.mincountOrRef}-${l.maxcount})`);
});
```

## TypeScript Interfaces

```typescript
interface Quest {
  entry: number;
  Title: string;
  Objectives?: string;
  QuestDescription?: string;
  MinLevel: number;
  QuestLevel: number;
  Type: number;
  RequiredRaces: number;
  RequiredClasses: number;
  RewXP: number;
  RewMoney: number;
  RewChoiceItemId1?: number;
  RewChoiceItemCount1?: number;
  RewItemId1?: number;
  RewItemCount1?: number;
  // ... viele weitere Felder
}

interface CreatureSpawn {
  guid: number;
  id: number;
  map: number;
  position_x: number;
  position_y: number;
  position_z: number;
  orientation: number;
  spawntimesecsmin: number;
  spawntimesecsmax: number;
}

interface CreatureTemplate {
  entry: number;
  Name: string;
  SubName?: string;
  MinLevel: number;
  MaxLevel: number;
  Faction: number;
  NpcFlags: number;
  UnitFlags: number;
  CreatureTypeFlags: number;
}

interface Item {
  entry: number;
  name: string;
  Quality: number;
  ItemLevel: number;
  RequiredLevel: number;
  class: number;
  subclass: number;
}

interface LootEntry {
  entry: number;
  item: number;
  ChanceOrQuestChance: number;
  groupid: number;
  mincountOrRef: number;
  maxcount: number;
}
```

## Direkte SQL-Queries

Falls du spezielle Queries brauchst:

```typescript
import Database from 'better-sqlite3';

const db = new Database('src/data/cache/classicdb.sqlite', { readonly: true });

// Eigene Query
const stmt = db.prepare(`
  SELECT q.entry, q.Title, ct.Name as GiverName
  FROM quest_template q
  JOIN creature_questrelation cq ON q.entry = cq.quest
  JOIN creature_template ct ON cq.id = ct.entry
  WHERE q.QuestLevel <= ?
  LIMIT 10
`);

const results = stmt.all(5);
console.log(results);

db.close();
```

## Performance

- **Dateigröße:** 71.86 MB (komprimiert mit SQLite)
- **Laden:** ~50ms (erste Abfrage)
- **Queries:** ~1-5ms (indiziert)
- **Memory:** ~80-100 MB im Arbeitsspeicher

## Troubleshooting

### Datenbank nicht gefunden

```
Error: SQLITE_CANTOPEN: unable to open database file
```

**Lösung:** Prüfe ob `src/data/cache/classicdb.sqlite` existiert. Falls nicht, neu exportieren mit:

```bash
npx ts-node scripts/export_mysql_to_sqlite.ts
```

### Tabelle existiert nicht

```
Error: no such table: xyz
```

**Lösung:** Prüfe Tabellennamen in der Datenbank:

```bash
sqlite3 src/data/cache/classicdb.sqlite ".tables"
```

### Zu viele offene Verbindungen

**Lösung:** Immer `db.close()` aufrufen oder Singleton Pattern verwenden:

```typescript
import { getDatabase, closeDatabase } from './src/data/sqlite_loader';

const db = getDatabase(); // Wiederverwendbare Instanz
// ... 
closeDatabase(); // Am Ende der Anwendung
```

## Updates

Falls die CMaNGOS classic-db aktualisiert wird:

1. `git submodule update --remote src/data/classic-db`
2. MySQL installieren, Datenbank importieren, Updates anwenden
3. `npx ts-node scripts/export_mysql_to_sqlite.ts`
4. MySQL deinstallieren

## Weitere Ressourcen

- **CMaNGOS Docs:** https://github.com/cmangos/classic-db
- **Classic-Wow-Database:** https://github.com/dkpminus/Classic-Wow-Database (PHP Beispiele)
- **SQLite Browser:** https://sqlitebrowser.org/ (zum Datenbank durchsuchen)
