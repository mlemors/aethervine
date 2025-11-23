/**
 * Database singleton wrapper for web and node compatibility
 */

import { GameDatabase as WebDatabase, getDatabase as getWebDatabase } from './sqlite_loader_browser';

let cachedDB: WebDatabase | null = null;
let initPromise: Promise<WebDatabase> | null = null;

/**
 * Initialize and get database instance (async for web)
 */
export async function initDatabase(): Promise<WebDatabase> {
  if (cachedDB) return cachedDB;
  if (initPromise) return initPromise;

  initPromise = getWebDatabase();
  cachedDB = await initPromise;
  return cachedDB;
}

/**
 * Get database instance (throws if not initialized)
 */
export function getDatabase(): WebDatabase {
  if (!cachedDB) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return cachedDB;
}

/**
 * Check if database is ready
 */
export function isDatabaseReady(): boolean {
  return cachedDB !== null;
}

// Re-export types and GameDatabase class
export type { Quest, CreatureSpawn, CreatureTemplate, Item, LootEntry, QuestRelation, PlayerCreateInfo, XPForLevel } from './sqlite_loader_browser';
export type { GameDatabase } from './sqlite_loader_browser';
