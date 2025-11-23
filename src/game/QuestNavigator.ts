/**
 * Quest Navigator - Kombiniert Guide + Database für intelligente Quest-Navigation
 */

import { getGuideLoader } from './GuideLoader';
import { getDatabase } from '../data/database';
import { calculateTravelTime, formatTravelTime, MOVEMENT_SPEEDS, type Position, type TravelInfo } from './MovementSystem';
import type { WoWRace } from '../types/character';

export interface QuestDestination {
  type: 'quest-giver' | 'quest-ender' | 'travel' | 'grind-spot';
  questId?: number;
  npcId?: number;
  npcName?: string;
  coords: Position;
  zone: string;
  description: string;
}

export interface NavigationStep {
  destination: QuestDestination;
  travelInfo: TravelInfo;
  estimatedArrival: string;
}

/**
 * Quest Navigator - Findet nächsten Zielort und berechnet Route
 */
export class QuestNavigator {
  private guideLoader = getGuideLoader();
  private db = getDatabase();

  /**
   * Hole Start-Position für Race/Class
   */
  getStartPosition(race: WoWRace, classId: number): Position | null {
    // Race IDs in WoW Classic
    const raceIdMap: Record<WoWRace, number> = {
      'Human': 1,
      'Dwarf': 3,
      'Night Elf': 4,
      'Gnome': 7,
      'Orc': 2,
      'Undead': 5,
      'Tauren': 6,
      'Troll': 8,
    };

    // Class IDs in WoW Classic
    const classIdMap: Record<string, number> = {
      'Warrior': 1,
      'Paladin': 2,
      'Hunter': 3,
      'Rogue': 4,
      'Priest': 5,
      'Shaman': 7,
      'Mage': 8,
      'Warlock': 9,
      'Druid': 11,
    };

    const raceId = raceIdMap[race];
    if (!raceId) return null;

    const startInfo = this.db.getStartPosition(raceId, classId);
    if (!startInfo) return null;

    return {
      x: startInfo.position_x,
      y: startInfo.position_y,
      z: startInfo.position_z,
      map: startInfo.map,
    };
  }

  /**
   * Finde nächstes Ziel basierend auf Guide
   */
  getNextDestination(
    race: WoWRace,
    currentLevel: number,
    currentZone: string
  ): QuestDestination | null {
    const nextStep = this.guideLoader.getNextStep(race, currentLevel, currentZone);
    
    // Fallback für Level 1: Nutze Starter-Quests direkt aus DB
    if (!nextStep && currentLevel === 1) {
      return this.getStarterQuest(race);
    }
    
    if (!nextStep) return null;

    // Check if step has objectives with quest data
    if (nextStep.objectives && nextStep.objectives.length > 0) {
      const firstObjective = nextStep.objectives[0];
      
      // Check if objective has location and questId
      if ('questId' in firstObjective && 'location' in firstObjective) {
        const obj = firstObjective as any;
        
        return {
          type: obj.type === 'acceptQuest' ? 'quest-giver' : 'quest-ender',
          questId: obj.questId,
          npcId: obj.npcId,
          npcName: obj.npcName,
          coords: {
            x: obj.location.x,
            y: obj.location.y,
            z: obj.location.z,
            map: obj.location.map,
          },
          zone: nextStep.zone,
          description: obj.questName || nextStep.description,
        };
      }
    }

    // Fallback: Wenn Step eine Quest ID hat (alte Struktur)
    if (nextStep.questId) {
      const quest = this.db.getQuest(nextStep.questId);
      if (!quest) return null;

      // Hole Quest Giver
      const givers = this.db.getQuestGivers(nextStep.questId);
      if (givers.length === 0) return null;

      const giver = givers[0];
      
      // Hole NPC Spawn-Position
      const spawns = this.db.getCreatureSpawns(giver.id);
      if (spawns.length === 0) return null;

      const spawn = spawns[0];

      return {
        type: 'quest-giver',
        questId: nextStep.questId,
        npcId: giver.id,
        npcName: giver.Name,
        coords: {
          x: spawn.position_x,
          y: spawn.position_y,
          z: spawn.position_z,
          map: spawn.map,
        },
        zone: nextStep.zone,
        description: `Accept quest: ${quest.Title}`,
      };
    }

    return null;
  }

  /**
   * Hole erste Starter-Quest für Race (Level 1)
   */
  private getStarterQuest(race: WoWRace): QuestDestination | null {
    // Starter Quest IDs per Race
    const starterQuests: Record<WoWRace, number> = {
      'Human': 7,        // Kobold Camp Cleanup (Marshal McBride)
      'Dwarf': 179,      // Dwarven Outfitters
      'Night Elf': 456,  // (TODO)
      'Gnome': 234,      // (TODO)
      'Orc': 4641,       // (TODO)
      'Undead': 363,     // (TODO)
      'Tauren': 747,     // (TODO)
      'Troll': 4641,     // (TODO)
    };

    const questId = starterQuests[race];
    if (!questId) return null;

    const quest = this.db.getQuest(questId);
    if (!quest) return null;

    const givers = this.db.getQuestGivers(questId);
    if (givers.length === 0) return null;

    const giver = givers[0];
    const spawns = this.db.getCreatureSpawns(giver.id);
    if (spawns.length === 0) return null;

    const spawn = spawns[0];

    return {
      type: 'quest-giver',
      questId,
      npcId: giver.id,
      npcName: giver.Name,
      coords: {
        x: spawn.position_x,
        y: spawn.position_y,
        z: spawn.position_z,
        map: spawn.map,
      },
      zone: quest.Title,
      description: `Accept quest: ${quest.Title}`,
    };
  }

  /**
   * Berechne kompletten Navigation Step
   */
  calculateNavigationStep(
    currentPosition: Position,
    destination: QuestDestination,
    speed: number = MOVEMENT_SPEEDS.RUN
  ): NavigationStep {
    const travelInfo = calculateTravelTime(currentPosition, destination.coords, speed);

    return {
      destination,
      travelInfo,
      estimatedArrival: formatTravelTime(travelInfo.travelTimeSeconds),
    };
  }

  /**
   * Kompletter Workflow: Finde nächstes Ziel und berechne Route
   */
  planNextMove(
    race: WoWRace,
    currentLevel: number,
    currentZone: string,
    currentPosition: Position
  ): NavigationStep | null {
    const destination = this.getNextDestination(race, currentLevel, currentZone);
    if (!destination) return null;

    return this.calculateNavigationStep(currentPosition, destination);
  }
}

/**
 * Singleton Instance
 */
let navigatorInstance: QuestNavigator | null = null;

export function getQuestNavigator(): QuestNavigator {
  if (!navigatorInstance) {
    navigatorInstance = new QuestNavigator();
  }
  return navigatorInstance;
}
