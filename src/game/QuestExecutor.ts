/**
 * Quest Executor - Automatisiert Quest-Ausführung
 * Flow: Accept Quest -> Find Grind Spots -> Kill Mobs -> Return Quest
 */

import { getDatabase } from '../data/sqlite_loader';
import { calculateDistance, type Position } from './MovementSystem';

export interface QuestObjective {
  type: 'kill' | 'collect' | 'interact';
  creatureId?: number;
  creatureName?: string;
  itemId?: number;
  required: number;
  current: number;
  completed: boolean;
}

export interface GrindSpot {
  creatureId: number;
  creatureName: string;
  level: number;
  position: Position;
  distanceFromPlayer: number;
}

export interface QuestProgress {
  questId: number;
  questName: string;
  status: 'accepted' | 'in-progress' | 'completed' | 'turned-in';
  objectives: QuestObjective[];
  currentObjectiveIndex: number;
}

/**
 * Quest Executor - Führt Quests automatisch aus
 */
export class QuestExecutor {
  private db = getDatabase();
  private currentQuest: QuestProgress | null = null;
  private killCount: Map<number, number> = new Map(); // creatureId -> count
  private visitedSpawns: Set<string> = new Set(); // Track visited spawn positions

  /**
   * Akzeptiere Quest und parse objectives
   */
  acceptQuest(questId: number): QuestProgress | null {
    const quest = this.db.getQuest(questId);
    if (!quest) return null;

    const objectives: QuestObjective[] = [];

    // Parse kill objectives
    for (let i = 1; i <= 4; i++) {
      const creatureId = quest[`ReqCreatureOrGOId${i}`];
      const required = quest[`ReqCreatureOrGOCount${i}`];

      if (creatureId && creatureId > 0 && required > 0) {
        const creature = this.db.getCreatureTemplate(creatureId);
        
        objectives.push({
          type: 'kill',
          creatureId,
          creatureName: creature?.Name || 'Unknown',
          required,
          current: 0,
          completed: false,
        });
      }
    }

    // Parse collect objectives (items)
    for (let i = 1; i <= 4; i++) {
      const itemId = quest[`ReqItemId${i}`];
      const required = quest[`ReqItemCount${i}`];

      if (itemId && itemId > 0 && required > 0) {
        objectives.push({
          type: 'collect',
          itemId,
          required,
          current: 0,
          completed: false,
        });
      }
    }

    this.currentQuest = {
      questId,
      questName: quest.Title,
      status: 'accepted',
      objectives,
      currentObjectiveIndex: 0,
    };

    this.killCount.clear();
    this.visitedSpawns.clear();

    return this.currentQuest;
  }

  /**
   * Finde Grind Spots für aktuelles Objective
   */
  findGrindSpots(playerPosition: Position): GrindSpot[] {
    if (!this.currentQuest) return [];

    const objective = this.currentQuest.objectives[this.currentQuest.currentObjectiveIndex];
    if (!objective || objective.type !== 'kill' || !objective.creatureId) return [];

    const spawns = this.db.getCreatureSpawns(objective.creatureId);
    const creature = this.db.getCreatureTemplate(objective.creatureId);

    const grindSpots: GrindSpot[] = spawns
      .filter(s => s.map === playerPosition.map) // Nur auf derselben Map
      .map(s => ({
        creatureId: objective.creatureId!,
        creatureName: objective.creatureName!,
        level: creature?.MinLevel || 1,
        position: {
          x: s.position_x,
          y: s.position_y,
          z: s.position_z,
          map: s.map,
        },
        distanceFromPlayer: calculateDistance(playerPosition, {
          x: s.position_x,
          y: s.position_y,
        }),
      }))
      .sort((a, b) => a.distanceFromPlayer - b.distanceFromPlayer); // Sortiere nach Distanz

    return grindSpots;
  }

  /**
   * Finde nächsten Grind Spot (unbesucht)
   */
  getNextGrindSpot(playerPosition: Position): GrindSpot | null {
    const spots = this.findGrindSpots(playerPosition);
    
    // Filter out visited spawns
    const unvisitedSpots = spots.filter(spot => {
      const key = `${spot.position.x.toFixed(1)},${spot.position.y.toFixed(1)}`;
      return !this.visitedSpawns.has(key);
    });

    const nextSpot = unvisitedSpots.length > 0 ? unvisitedSpots[0] : null;
    
    // Mark as visited if we found one
    if (nextSpot) {
      const key = `${nextSpot.position.x.toFixed(1)},${nextSpot.position.y.toFixed(1)}`;
      this.visitedSpawns.add(key);
    }
    
    return nextSpot;
  }

  /**
   * Registriere Kill (simuliert)
   */
  registerKill(creatureId: number): boolean {
    if (!this.currentQuest) return false;

    const objective = this.currentQuest.objectives[this.currentQuest.currentObjectiveIndex];
    if (!objective || objective.type !== 'kill' || objective.creatureId !== creatureId) {
      return false;
    }

    // Erhöhe Kill Count
    const currentKills = this.killCount.get(creatureId) || 0;
    this.killCount.set(creatureId, currentKills + 1);

    // Update Objective
    objective.current = Math.min(objective.current + 1, objective.required);
    objective.completed = objective.current >= objective.required;

    // Check if all objectives completed
    if (objective.completed) {
      const allCompleted = this.currentQuest.objectives.every(obj => obj.completed);
      if (allCompleted) {
        this.currentQuest.status = 'completed';
      } else {
        // Move to next objective
        this.currentQuest.currentObjectiveIndex++;
      }
    }

    return true;
  }

  /**
   * Ist Quest bereit zur Abgabe?
   */
  isQuestComplete(): boolean {
    return this.currentQuest?.status === 'completed';
  }

  /**
   * Gebe Quest ab
   */
  turnInQuest(questId: number): boolean {
    if (!this.currentQuest || this.currentQuest.questId !== questId) return false;
    if (this.currentQuest.status !== 'completed') return false;

    this.currentQuest.status = 'turned-in';
    return true;
  }

  /**
   * Hole Quest Progress
   */
  getQuestProgress(): QuestProgress | null {
    return this.currentQuest;
  }

  /**
   * Hole aktuelles Objective
   */
  getCurrentObjective(): QuestObjective | null {
    if (!this.currentQuest) return null;
    return this.currentQuest.objectives[this.currentQuest.currentObjectiveIndex] || null;
  }

  /**
   * Prüfe ob Mob für aktuelle Quest relevant ist
   */
  isRelevantMob(creatureId: number): boolean {
    if (!this.currentQuest) return false;
    
    const objective = this.getCurrentObjective();
    return objective?.type === 'kill' && objective.creatureId === creatureId;
  }
}

/**
 * Singleton Instance
 */
let executorInstance: QuestExecutor | null = null;

export function getQuestExecutor(): QuestExecutor {
  if (!executorInstance) {
    executorInstance = new QuestExecutor();
  }
  return executorInstance;
}
