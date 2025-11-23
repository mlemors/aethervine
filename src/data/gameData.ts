/**
 * WoW Classic Game Data
 */

import type { WoWClass, WoWRace, WoWFaction } from '../types/character';

export interface RaceData {
  name: WoWRace;
  faction: WoWFaction;
  icon: string;
  startZone: string;
  allowedClasses: WoWClass[];
  racialTraits: string[];
}

export const RACES: Record<WoWRace, RaceData> = {
  Human: {
    name: 'Human',
    faction: 'Alliance',
    icon: '👤',
    startZone: 'Elwynn Forest',
    allowedClasses: ['Warrior', 'Paladin', 'Rogue', 'Priest', 'Mage', 'Warlock'],
    racialTraits: ['Sword Specialization', 'Mace Specialization', 'Perception', 'The Human Spirit', 'Diplomacy'],
  },
  Dwarf: {
    name: 'Dwarf',
    faction: 'Alliance',
    icon: '🧔',
    startZone: 'Dun Morogh',
    allowedClasses: ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest'],
    racialTraits: ['Stoneform', 'Gun Specialization', 'Frost Resistance', 'Find Treasure'],
  },
  'Night Elf': {
    name: 'Night Elf',
    faction: 'Alliance',
    icon: '🧝',
    startZone: 'Teldrassil',
    allowedClasses: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Druid'],
    racialTraits: ['Shadowmeld', 'Quickness', 'Wisp Spirit', 'Nature Resistance'],
  },
  Gnome: {
    name: 'Gnome',
    faction: 'Alliance',
    icon: '👨‍🔧',
    startZone: 'Dun Morogh',
    allowedClasses: ['Warrior', 'Rogue', 'Mage', 'Warlock'],
    racialTraits: ['Escape Artist', 'Expansive Mind', 'Arcane Resistance', 'Engineering Specialist'],
  },
  Orc: {
    name: 'Orc',
    faction: 'Horde',
    icon: '👹',
    startZone: 'Durotar',
    allowedClasses: ['Warrior', 'Hunter', 'Rogue', 'Shaman', 'Warlock'],
    racialTraits: ['Blood Fury', 'Hardiness', 'Axe Specialization', 'Command'],
  },
  Undead: {
    name: 'Undead',
    faction: 'Horde',
    icon: '💀',
    startZone: 'Tirisfal Glades',
    allowedClasses: ['Warrior', 'Rogue', 'Priest', 'Mage', 'Warlock'],
    racialTraits: ['Will of the Forsaken', 'Cannibalize', 'Underwater Breathing', 'Shadow Resistance'],
  },
  Tauren: {
    name: 'Tauren',
    faction: 'Horde',
    icon: '🐂',
    startZone: 'Mulgore',
    allowedClasses: ['Warrior', 'Hunter', 'Shaman', 'Druid'],
    racialTraits: ['War Stomp', 'Endurance', 'Cultivation', 'Nature Resistance'],
  },
  Troll: {
    name: 'Troll',
    faction: 'Horde',
    icon: '🧟',
    startZone: 'Durotar',
    allowedClasses: ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage'],
    racialTraits: ['Berserking', 'Regeneration', 'Beast Slaying', 'Bow Specialization'],
  },
};

export const CLASS_COLORS: Record<WoWClass, string> = {
  Warrior: '#C79C6E',
  Paladin: '#F58CBA',
  Hunter: '#ABD473',
  Rogue: '#FFF569',
  Priest: '#FFFFFF',
  Shaman: '#0070DE',
  Mage: '#69CCF0',
  Warlock: '#9482C9',
  Druid: '#FF7D0A',
};

export const NAME_GENERATOR = {
  prefixes: {
    Human: ['Arn', 'Thal', 'Mar', 'Gar', 'Bren', 'Var', 'Ced', 'Lor'],
    Dwarf: ['Bram', 'Thor', 'Mag', 'Grim', 'Dun', 'Brog', 'Kaz'],
    'Night Elf': ['Ilid', 'Tyr', 'Mal', 'Shan', 'Dorn', 'Elun', 'Tal'],
    Gnome: ['Fiz', 'Giz', 'Wiz', 'Niz', 'Tink', 'Spark', 'Cog'],
    Orc: ['Grom', 'Thrall', 'Gar', 'Mog', 'Drok', 'Karg', 'Zug'],
    Undead: ['Mort', 'Grim', 'Nec', 'Shade', 'Dark', 'Bone', 'Gore'],
    Tauren: ['Baine', 'Mok', 'Tahu', 'Mah', 'Kah', 'Horn', 'Bull'],
    Troll: ['Vol', 'Zul', 'Jin', 'Rak', 'Taz', 'Voo', 'Drak'],
  },
  suffixes: {
    Human: ['old', 'ric', 'wald', 'mar', 'ius', 'en', 'ron'],
    Dwarf: ['fist', 'beard', 'hammer', 'stone', 'iron', 'forge'],
    'Night Elf': ['ande', 'strasza', 'dorei', 'furion', 'theron', 'ion'],
    Gnome: ['sprocket', 'wick', 'blast', 'bolt', 'zap', 'fizz'],
    Orc: ['osh', 'mash', 'tar', 'gar', 'krul', 'thok'],
    Undead: ['us', 'is', 'ius', 'rim', 'mor', 'death'],
    Tauren: ['hoof', 'mane', 'horn', 'wind', 'fury', 'storm'],
    Troll: ['jin', 'zar', 'rak', 'mon', 'jin', 'dar'],
  },
};

export function generateRandomName(race: WoWRace): string {
  const prefixes = NAME_GENERATOR.prefixes[race];
  const suffixes = NAME_GENERATOR.suffixes[race];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return prefix + suffix;
}

export function getAllianceRaces(): WoWRace[] {
  // TEMPORARILY: Only Humans enabled (other races not yet tested)
  return ['Human'];
  
  // return Object.values(RACES)
  //   .filter((r) => r.faction === 'Alliance')
  //   .map((r) => r.name);
}

export function getHordeRaces(): WoWRace[] {
  // TEMPORARILY: No Horde races enabled (not yet tested)
  return [];
  
  // return Object.values(RACES)
  //   .filter((r) => r.faction === 'Horde')
  //   .map((r) => r.name);
}
