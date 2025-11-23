/**
 * Combat System Types
 */

import type { Character } from './character';

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  healthMax: number;
  armor: number;
  minDamage: number;
  maxDamage: number;
  attackSpeed: number;
  experienceReward: number;
  lootTableId?: string;
}

export interface CombatLog {
  timestamp: number;
  type: 'hit' | 'miss' | 'crit' | 'death';
  attacker: 'player' | 'enemy';
  target: 'player' | 'enemy';
  damage?: number;
  message: string;
}

export interface Combat {
  id: string;
  character: Character;
  enemy: Enemy;
  startTime: number;
  endTime?: number;
  result?: 'victory' | 'defeat' | 'fled';
  log: CombatLog[];
}

export interface CombatResult {
  victory: boolean;
  experienceGained: number;
  goldGained: number;
  itemsLooted: string[]; // Item IDs
  damageDealt: number;
  damageTaken: number;
  duration: number;
}
