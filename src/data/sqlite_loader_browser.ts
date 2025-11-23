/**
 * Web-based SQLite Loader using sql.js (WebAssembly)
 * Replaces better-sqlite3 for browser compatibility
 */

type SqlJsDatabase = any; // sql.js Database type

export interface Quest {
  entry: number;
  Title: string;
  QuestDescription?: string;
  Objectives?: string;
  QuestLevel: number;
  MinLevel: number;
  Type?: number;
  RequiredRaces?: number;
  RequiredClasses?: number;
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
}

export interface CreatureTemplate {
  entry: number;
  Name: string;
  MinLevel: number;
  MaxLevel: number;
  Rank: number;
  FactionAlliance: number;
  FactionHorde: number;
  [key: string]: any;
}

export interface Item {
  entry: number;
  name: string;
  Quality: number;
  InventoryType: number;
  RequiredLevel: number;
  ItemLevel: number;
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
 * SQLite Database Loader for Browser (sql.js)
 */
export class GameDatabase {
  private db: SqlJsDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Database will be loaded asynchronously
  }

  /**
   * Initialize the database (must be called before any queries)
   */
  async initialize(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('🔄 Loading sql.js from CDN...');
        
        // Load sql.js from CDN using script tag approach
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js';
        
        const loadPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        
        document.head.appendChild(script);
        await loadPromise;
        
        console.log('🔄 Script loaded, initializing SQL...');
        
        // @ts-ignore - global initSqlJs from CDN
        const initSqlJs = window.initSqlJs;
        
        if (!initSqlJs) {
          throw new Error('initSqlJs not found on window object');
        }
        
        const SQL = await initSqlJs({
          locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm',
        });

        console.log('🔄 Loading database file...');
        const response = await fetch('/data/classicdb.sqlite');
        if (!response.ok) {
          throw new Error(`Failed to load database: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        this.db = new SQL.Database(new Uint8Array(buffer));
        
        console.log('✅ Database loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load database:', error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Get Quest Details
   */
  getQuest(questId: number): Quest | null {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');
    
    const result = this.db.exec(
      'SELECT * FROM quest_template WHERE entry = ?',
      [questId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0].columns, result[0].values[0]) as Quest;
  }

  /**
   * Get Quests by Level Range
   */
  getQuestsByLevel(minLevel: number, maxLevel: number): Quest[] {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM quest_template WHERE MinLevel >= ? AND MinLevel <= ? ORDER BY MinLevel, entry',
      [minLevel, maxLevel]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) => 
      this.rowToObject(result[0].columns, row) as Quest
    );
  }

  /**
   * Get Creature Spawns
   */
  getCreatureSpawns(creatureId: number): CreatureSpawn[] {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM creature WHERE id = ?',
      [creatureId]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row) as CreatureSpawn
    );
  }

  /**
   * Get Nearest Creature
   */
  getNearestCreature(creatureId: number, x: number, y: number, map: number = 1): CreatureSpawn | null {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      `SELECT *, 
        ((position_x - ?) * (position_x - ?) + (position_y - ?) * (position_y - ?)) as dist
       FROM creature
       WHERE id = ? AND map = ?
       ORDER BY dist
       LIMIT 1`,
      [x, x, y, y, creatureId, map]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0].columns, result[0].values[0]) as CreatureSpawn;
  }

  /**
   * Get Creature Template
   */
  getCreatureTemplate(creatureId: number): CreatureTemplate | null {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM creature_template WHERE entry = ?',
      [creatureId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0].columns, result[0].values[0]) as CreatureTemplate;
  }

  /**
   * Get Quest Givers
   */
  getQuestGivers(questId: number): Array<{ id: number; Name: string }> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      `SELECT ct.entry as id, ct.Name
       FROM creature_questrelation cq
       JOIN creature_template ct ON cq.id = ct.entry
       WHERE cq.quest = ?`,
      [questId]
    );

    if (result.length === 0) return [];
    return result[0].values.map(row =>
      this.rowToObject(result[0].columns, row) as { id: number; Name: string }
    );
  }

  /**
   * Get Quest Enders
   */
  getQuestEnders(questId: number): Array<{ id: number; Name: string }> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      `SELECT ct.entry as id, ct.Name
       FROM creature_involvedrelation ci
       JOIN creature_template ct ON ci.id = ct.entry
       WHERE ci.quest = ?`,
      [questId]
    );

    if (result.length === 0) return [];
    return result[0].values.map(row =>
      this.rowToObject(result[0].columns, row) as { id: number; Name: string }
    );
  }

  /**
   * Get Item Details
   */
  getItem(itemId: number): Item | null {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM item_template WHERE entry = ?',
      [itemId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0].columns, result[0].values[0]) as Item;
  }

  /**
   * Get Loot Table
   */
  getLootTable(creatureId: number): LootEntry[] {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM creature_loot_template WHERE entry = ?',
      [creatureId]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row) as LootEntry
    );
  }

  /**
   * Get Reference Loot Table
   */
  getReferenceLootTable(referenceId: number): LootEntry[] {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM reference_loot_template WHERE entry = ?',
      [referenceId]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row) as LootEntry
    );
  }

  /**
   * Get Start Position
   */
  getStartPosition(race: number, classId: number): PlayerCreateInfo | null {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM playercreateinfo WHERE race = ? AND class = ?',
      [race, classId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    return this.rowToObject(result[0].columns, result[0].values[0]) as PlayerCreateInfo;
  }

  /**
   * Get XP Requirements
   */
  getPlayerXPForLevel(): XPForLevel[] {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT lvl, xp_for_next_level FROM player_xp_for_level ORDER BY lvl'
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row) as XPForLevel
    );
  }

  /**
   * Check if Quest Exists
   */
  questExists(questId: number): boolean {
    return this.getQuest(questId) !== null;
  }

  /**
   * Get GameObject Spawns
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
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      `SELECT guid, id, map, position_x, position_y, position_z, orientation
       FROM gameobject
       WHERE id = ?`,
      [gameObjectId]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row)
    ) as any[];
  }

  /**
   * Get Quest GameObjects
   */
  getQuestGameObjects(questId: number): Array<{ id: number; name: string }> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      `SELECT got.entry as id, got.name
       FROM gameobject_questrelation gq
       JOIN gameobject_template got ON gq.id = got.entry
       WHERE gq.quest = ?`,
      [questId]
    );

    if (result.length === 0) return [];
    return result[0].values.map((row: any) =>
      this.rowToObject(result[0].columns, row) as { id: number; name: string }
    );
  }

  /**
   * Helper: Convert SQL row to object
   */
  private rowToObject(columns: string[], values: any[]): Record<string, any> {
    const obj: Record<string, any> = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton Instance
let dbInstance: GameDatabase | null = null;

export async function getDatabase(): Promise<GameDatabase> {
  if (!dbInstance) {
    dbInstance = new GameDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
