import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple possible paths for the database
function findDatabasePath(): string {
  const possiblePaths = [
    path.join(__dirname, 'db/classicdb.sqlite'),
    path.join(__dirname, '../data/db/classicdb.sqlite'),
    path.join(__dirname, '../../src/data/db/classicdb.sqlite'),
    path.join(process.cwd(), 'src/data/db/classicdb.sqlite'),
    path.join(process.cwd(), 'dist/data/db/classicdb.sqlite'),
  ];

  for (const dbPath of possiblePaths) {
    if (fs.existsSync(dbPath)) {
      console.log(`✅ Found database at: ${dbPath}`);
      return dbPath;
    }
  }

  throw new Error(`Database not found. Tried paths: ${possiblePaths.join(', ')}`);
}

const DB_PATH = findDatabasePath();

export interface Quest {
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
  [key: string]: any;
}

export interface CreatureSpawn {
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

export interface CreatureTemplate {
  entry: number;
  Name: string;
  SubName?: string;
  MinLevel: number;
  MaxLevel: number;
  Faction: number;
  NpcFlags: number;
  UnitFlags: number;
  CreatureTypeFlags: number;
  [key: string]: any;
}

export interface Item {
  entry: number;
  name: string;
  Quality: number;
  ItemLevel: number;
  RequiredLevel: number;
  class: number;
  subclass: number;
  [key: string]: any;
}

export interface LootEntry {
  entry: number;
  item: number;
  ChanceOrQuestChance: number;
  groupid: number;
  mincountOrRef: number;
  maxcount: number;
}

export interface QuestRelation {
  id: number;
  quest: number;
}

export interface PlayerCreateInfo {
  race: number;
  class: number;
  map: number;
  zone: number;
  position_x: number;
  position_y: number;
  position_z: number;
  orientation: number;
}

export interface XPForLevel {
  lvl: number;
  xp_for_next_level: number;
}

/**
 * SQLite Datenbank Loader für WoW Classic Daten
 */
export class GameDatabase {
  private db: Database.Database;

  constructor(dbPath: string = DB_PATH) {
    this.db = new Database(dbPath, { readonly: true });
    this.db.pragma('journal_mode = WAL');
  }

  /**
   * Hole Quest Details
   */
  getQuest(questId: number): Quest | null {
    const stmt = this.db.prepare(`
      SELECT * FROM quest_template WHERE entry = ?
    `);
    return stmt.get(questId) as Quest | null;
  }

  /**
   * Hole alle Quests für ein Level-Range
   */
  getQuestsByLevel(minLevel: number, maxLevel: number): Quest[] {
    const stmt = this.db.prepare(`
      SELECT * FROM quest_template
      WHERE MinLevel >= ? AND MinLevel <= ?
      ORDER BY MinLevel, entry
    `);
    return stmt.all(minLevel, maxLevel) as Quest[];
  }

  /**
   * Hole alle Spawn-Positionen eines NPCs
   */
  getCreatureSpawns(creatureId: number): CreatureSpawn[] {
    const stmt = this.db.prepare(`
      SELECT * FROM creature WHERE id = ?
    `);
    return stmt.all(creatureId) as CreatureSpawn[];
  }

  /**
   * Hole nächsten NPC Spawn zu einer Position
   */
  getNearestCreature(creatureId: number, x: number, y: number, map: number = 1): CreatureSpawn | null {
    const stmt = this.db.prepare(`
      SELECT *, 
        ((position_x - ?) * (position_x - ?) + (position_y - ?) * (position_y - ?)) as dist
      FROM creature
      WHERE id = ? AND map = ?
      ORDER BY dist
      LIMIT 1
    `);
    return stmt.get(x, x, y, y, creatureId, map) as CreatureSpawn | null;
  }

  /**
   * Hole NPC Template (Stats, Name, etc.)
   */
  getCreatureTemplate(creatureId: number): CreatureTemplate | null {
    const stmt = this.db.prepare(`
      SELECT * FROM creature_template WHERE entry = ?
    `);
    return stmt.get(creatureId) as CreatureTemplate | null;
  }

  /**
   * Welche NPCs geben diese Quest?
   */
  getQuestGivers(questId: number): Array<{ id: number; Name: string }> {
    const stmt = this.db.prepare(`
      SELECT cr.id, ct.Name
      FROM creature_questrelation cr
      JOIN creature_template ct ON cr.id = ct.entry
      WHERE cr.quest = ?
    `);
    return stmt.all(questId) as Array<{ id: number; Name: string }>;
  }

  /**
   * Bei welchen NPCs kann die Quest abgegeben werden?
   */
  getQuestEnders(questId: number): Array<{ id: number; Name: string }> {
    const stmt = this.db.prepare(`
      SELECT ci.id, ct.Name
      FROM creature_involvedrelation ci
      JOIN creature_template ct ON ci.id = ct.entry
      WHERE ci.quest = ?
    `);
    return stmt.all(questId) as Array<{ id: number; Name: string }>;
  }

  /**
   * Welche Quests gibt dieser NPC?
   */
  getQuestsFromNPC(npcId: number): number[] {
    const stmt = this.db.prepare(`
      SELECT quest FROM creature_questrelation WHERE id = ?
    `);
    return (stmt.all(npcId) as any[]).map(r => r.quest);
  }

  /**
   * Hole Loot Table eines Mobs
   */
  getLootTable(creatureId: number): LootEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM creature_loot_template WHERE entry = ?
    `);
    return stmt.all(creatureId) as LootEntry[];
  }

  /**
   * Hole Reference Loot Table (für gemeinsame Loot-Pools)
   */
  getReferenceLootTable(referenceId: number): LootEntry[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reference_loot_template WHERE entry = ?
    `);
    return stmt.all(referenceId) as LootEntry[];
  }

  /**
   * Hole Item Details
   */
  getItem(itemId: number): Item | null {
    const stmt = this.db.prepare(`
      SELECT * FROM item_template WHERE entry = ?
    `);
    return stmt.get(itemId) as Item | null;
  }

  /**
   * Hole Start-Position für Race/Class Kombination
   */
  getStartPosition(race: number, classId: number): PlayerCreateInfo | null {
    const stmt = this.db.prepare(`
      SELECT * FROM playercreateinfo WHERE race = ? AND class = ?
    `);
    return stmt.get(race, classId) as PlayerCreateInfo | null;
  }

  /**
   * Hole alle Gameobjects (für Quest-Items, Chests, etc.)
   */
  getGameObjectSpawns(gameObjectId: number): Array<{
    guid: number;
    id: number;
    map: number;
    position_x: number;
    position_y: number;
    position_z: number;
    orientation: number;
  }> {
    const stmt = this.db.prepare(`
      SELECT guid, id, map, position_x, position_y, position_z, orientation
      FROM gameobject
      WHERE id = ?
    `);
    return stmt.all(gameObjectId) as any[];
  }

  /**
   * Welche Gameobjects sind mit dieser Quest verknüpft?
   */
  getQuestGameObjects(questId: number): Array<{ id: number; name: string }> {
    const stmt = this.db.prepare(`
      SELECT gr.id, gt.name
      FROM gameobject_questrelation gr
      JOIN gameobject_template gt ON gr.id = gt.entry
      WHERE gr.quest = ?
    `);
    return stmt.all(questId) as any[];
  }

  /**
   * Prüfe ob Quest existiert
   */
  questExists(questId: number): boolean {
    const stmt = this.db.prepare(`SELECT 1 FROM quest_template WHERE entry = ? LIMIT 1`);
    return stmt.get(questId) !== undefined;
  }

  /**
   * Hole XP Requirements für alle Level (1-60)
   */
  getPlayerXPForLevel(): XPForLevel[] {
    const stmt = this.db.prepare(`
      SELECT lvl, xp_for_next_level FROM player_xp_for_level ORDER BY lvl
    `);
    return stmt.all() as XPForLevel[];
  }

  /**
   * Schließe Datenbankverbindung
   */
  close() {
    this.db.close();
  }
}

// Singleton Instance für einfachen Zugriff
let dbInstance: GameDatabase | null = null;

export function getDatabase(): GameDatabase {
  if (!dbInstance) {
    dbInstance = new GameDatabase();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
