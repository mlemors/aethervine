/**
 * Character Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, WoWClass, WoWRace } from '../../types/character';

interface CharacterStore {
  character: Character | null;
  
  // Actions
  createCharacter: (name: string, wowClass: WoWClass, race: WoWRace) => void;
  gainExperience: (amount: number) => void;
  levelUp: () => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => void;
  updateStats: (stats: Partial<Character['stats']>) => void;
}

const generateId = () => `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: null,

  createCharacter: (name, wowClass, race) => {
    const faction = ['Human', 'Dwarf', 'Night Elf', 'Gnome'].includes(race)
      ? 'Alliance'
      : 'Horde';

    set({
      character: {
        id: generateId(),
        name,
        class: wowClass,
        race,
        faction,
        level: 1,
        experience: 0,
        experienceToNext: 400, // Classic XP for level 2
        stats: {
          strength: 20,
          agility: 15,
          stamina: 18,
          intellect: 10,
          spirit: 12,
          health: 100,
          healthMax: 100,
          mana: 50,
          manaMax: 50,
          armor: 10,
          attackPower: 20,
          spellPower: 0,
          critChance: 5,
          hitChance: 95,
        },
        gold: 0,
        position: {
          zone: 'Elwynn Forest',
          x: 0,
          y: 0,
        },
        createdAt: Date.now(),
        lastPlayed: Date.now(),
      },
    });
  },

  gainExperience: (amount) =>
    set((state) => {
      if (!state.character) return state;
      
      const newXp = state.character.experience + amount;
      const shouldLevelUp = newXp >= state.character.experienceToNext;

      if (shouldLevelUp) {
        // Will be handled by levelUp() separately
        return state;
      }

      return {
        character: {
          ...state.character,
          experience: newXp,
        },
      };
    }),

  levelUp: () =>
    set((state) => {
      if (!state.character) return state;

      const newLevel = state.character.level + 1;
      // Simplified XP formula for now
      const xpToNext = Math.floor(400 * Math.pow(1.1, newLevel - 1));

      return {
        character: {
          ...state.character,
          level: newLevel,
          experience: 0,
          experienceToNext: xpToNext,
          stats: {
            ...state.character.stats,
            // Simple stat increases per level
            strength: state.character.stats.strength + 2,
            stamina: state.character.stats.stamina + 2,
            healthMax: state.character.stats.healthMax + 10,
            health: state.character.stats.healthMax + 10,
          },
        },
      };
    }),

  addGold: (amount) =>
    set((state) => {
      if (!state.character) return state;
      return {
        character: {
          ...state.character,
          gold: state.character.gold + amount,
        },
      };
    }),

  removeGold: (amount) =>
    set((state) => {
      if (!state.character) return state;
      return {
        character: {
          ...state.character,
          gold: Math.max(0, state.character.gold - amount),
        },
      };
    }),

  updateStats: (stats) =>
    set((state) => {
      if (!state.character) return state;
      return {
        character: {
          ...state.character,
          stats: {
            ...state.character.stats,
            ...stats,
          },
        },
      };
    }),
}),
    {
      name: 'aethervine-character',
    }
  )
);