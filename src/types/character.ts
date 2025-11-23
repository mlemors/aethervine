/**
 * WoW Classic Character Types
 */

export type WoWClass =
  | 'Warrior'
  | 'Paladin'
  | 'Hunter'
  | 'Rogue'
  | 'Priest'
  | 'Shaman'
  | 'Mage'
  | 'Warlock'
  | 'Druid';

export type WoWRace =
  | 'Human'
  | 'Dwarf'
  | 'Night Elf'
  | 'Gnome'
  | 'Orc'
  | 'Undead'
  | 'Tauren'
  | 'Troll';

export type WoWFaction = 'Alliance' | 'Horde';

export interface CharacterStats {
  // Primary Stats
  strength: number;
  agility: number;
  stamina: number;
  intellect: number;
  spirit: number;

  // Derived Stats (computed)
  health: number;
  healthMax: number;
  mana: number;
  manaMax: number;
  armor: number;
  attackPower: number;
  spellPower: number;
  critChance: number;
  hitChance: number;
}

export interface Character {
  id: string;
  name: string;
  class: WoWClass;
  race: WoWRace;
  faction: WoWFaction;
  level: number;
  experience: number;
  experienceToNext: number;
  
  stats: CharacterStats;
  
  gold: number;
  
  position: {
    zone: string;
    x: number;
    y: number;
  };
  
  createdAt: number;
  lastPlayed: number;
}

export interface ClassDefinition {
  id: string;
  name: WoWClass;
  description: string;
  baseStats: Omit<CharacterStats, 'health' | 'healthMax' | 'mana' | 'manaMax' | 'armor' | 'attackPower' | 'spellPower' | 'critChance' | 'hitChance'>;
  statGrowthPerLevel: Omit<CharacterStats, 'health' | 'healthMax' | 'mana' | 'manaMax' | 'armor' | 'attackPower' | 'spellPower' | 'critChance' | 'hitChance'>;
  primaryStat: 'strength' | 'agility' | 'intellect';
  allowedRaces: WoWRace[];
}
