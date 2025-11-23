/**
 * Game Engine - Hauptspiel-Loop für Auto-Leveling
 */

import { QuestNavigator } from './QuestNavigator';
import { QuestExecutor, type QuestProgress, type GrindSpot } from './QuestExecutor';
import { calculateTravelTime, MOVEMENT_SPEEDS, type Position } from './MovementSystem';
import { getDatabase } from '../data/sqlite_loader';
import { getZoneManager, type Zone, type POI } from './ZoneManager';
import { getExperienceSystem } from './ExperienceSystem';

export type GameState = 'idle' | 'traveling' | 'combat' | 'looting' | 'turning-in-quest';
export type GameMode = 'auto' | 'manual';

export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  experienceToNext: number;
  position: Position;
}

export interface GameEngineState {
  character: Character;
  mode: GameMode;
  currentState: GameState;
  currentZone: string | null;
  currentQuest: QuestProgress | null;
  currentDestination: Position | null;
  destinationName: string | null;
  travelStartTime: number | null;
  travelEndTime: number | null;
  combatStartTime: number | null;
  combatEndTime: number | null;
  actionLog: string[];
  availableActions: string[];
  isPaused: boolean;
}

/**
 * Game Engine - Automatisches Leveling System
 */
export class GameEngine {
  private state: GameEngineState;
  private navigator: QuestNavigator;
  private executor: QuestExecutor;
  private zoneManager = getZoneManager();
  private db = getDatabase();
  private xpSystem = getExperienceSystem();
  private updateInterval: NodeJS.Timeout | null = null;
  private onStateChange?: (state: GameEngineState) => void;

  constructor(character: Character, onStateChange?: (state: GameEngineState) => void) {
    // Initialize experienceToNext if not set
    if (!character.experienceToNext || character.experienceToNext === 0) {
      character.experienceToNext = this.xpSystem.getXPToNextLevel(
        character.level,
        character.experience
      );
    }

    this.state = {
      character,
      mode: 'manual',
      currentState: 'idle',
      currentZone: null,
      currentQuest: null,
      currentDestination: null,
      destinationName: null,
      travelStartTime: null,
      travelEndTime: null,
      combatStartTime: null,
      combatEndTime: null,
      actionLog: [],
      availableActions: [],
      isPaused: false,
    };

    this.navigator = new QuestNavigator();
    this.executor = new QuestExecutor();
    this.onStateChange = onStateChange;

    // Set start position based on race/class
    // For now, use simplified class ID (1 = Warrior)
    const classId = character.class === 'Warrior' ? 1 : 1;
    const startPos = this.navigator.getStartPosition(character.race as any, classId);
    if (startPos) {
      this.state.character.position = startPos;
    }
  }

  /**
   * Starte Game Loop
   */
  start(): void {
    this.log(`🎮 Game Engine started for ${this.state.character.name}`);
    this.log(`📍 Starting position: (${this.state.character.position.x.toFixed(1)}, ${this.state.character.position.y.toFixed(1)})`);
    
    // Update zone
    this.updateZone();
    
    // Update every second
    this.updateInterval = setInterval(() => this.update(), 1000);
    
    // In manual mode, just show available actions
    if (this.state.mode === 'manual') {
      this.log(`⏸️  Manual mode - waiting for player input`);
      this.updateAvailableActions();
    } else {
      // Auto mode: Start first quest
      this.startNextQuest();
    }
  }

  /**
   * Stoppe Game Loop
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.log('⏸️  Game Engine stopped');
  }

  /**
   * Main Update Loop
   */
  private update(): void {
    const now = Date.now();

    // Skip if paused
    if (this.state.isPaused) return;

    switch (this.state.currentState) {
      case 'traveling':
        this.updateTravel(now);
        break;
      
      case 'combat':
        this.updateCombat(now);
        break;
      
      case 'turning-in-quest':
        this.updateQuestTurnIn(now);
        break;
      
      case 'idle':
        // In auto mode, decide next action
        if (this.state.mode === 'auto') {
          this.decideNextAction();
        }
        break;
    }

    this.notifyStateChange();
  }

  /**
   * Update current zone based on position
   */
  private updateZone(): void {
    const zone = this.zoneManager.getCurrentZone(this.state.character.position);
    const newZone = zone?.nameDE || null;
    
    if (newZone !== this.state.currentZone) {
      const oldZone = this.state.currentZone;
      this.state.currentZone = newZone;
      
      if (oldZone && newZone) {
        this.log(`🗺️  Entered ${newZone}`);
      } else if (newZone) {
        this.log(`📍 Current zone: ${newZone}`);
      }
      
      this.updateAvailableActions();
    }
  }

  /**
   * Update available actions based on current zone
   */
  private updateAvailableActions(): void {
    const actions = this.zoneManager.getAvailableActions(this.state.character.position);
    this.state.availableActions = actions;
    
    if (actions.length > 0 && this.state.mode === 'manual') {
      this.log(`\n📋 Available actions:`);
      actions.forEach((action, idx) => {
        this.log(`  [${idx + 1}] ${action}`);
      });
    }
  }

  /**
   * Pause/Resume game
   */
  pause(): void {
    this.state.isPaused = true;
    this.log('⏸️  Game paused');
  }

  resume(): void {
    this.state.isPaused = false;
    this.log('▶️  Game resumed');
  }

  /**
   * Set game mode
   */
  setMode(mode: GameMode): void {
    this.state.mode = mode;
    this.log(`🎮 Mode changed to: ${mode}`);
    
    if (mode === 'auto') {
      this.decideNextAction();
    } else {
      this.updateAvailableActions();
    }
  }

  /**
   * Execute manual action
   */
  executeAction(action: string): void {
    if (this.state.currentState !== 'idle') {
      this.log('⚠️  Cannot execute action while busy');
      return;
    }

    this.log(`\n🎯 Executing: ${action}`);

    switch (action) {
      case 'Zum Gasthaus gehen':
        this.goToInn();
        break;
      case 'Zum Klassenlehrer gehen':
        this.goToClassTrainer();
        break;
      case 'Zum Berufslehrer gehen':
        this.goToProfessionTrainer();
        break;
      case 'Zum Händler gehen':
        this.goToVendor();
        break;
      case 'Mobs in der Nähe farmen':
        this.farmNearbyMobs();
        break;
      case 'Quest annehmen/abgeben':
        this.handleQuests();
        break;
      default:
        this.log('❌ Unknown action');
    }
  }

  /**
   * Go to inn
   */
  private goToInn(): void {
    const poi = this.zoneManager.findNearestPOI(this.state.character.position, 'inn');
    if (poi) {
      this.travelTo(poi.position, `Traveling to ${poi.nameDE}`);
    } else {
      this.log('❌ No inn found in this zone');
    }
  }

  /**
   * Go to class trainer
   */
  private goToClassTrainer(): void {
    const poi = this.zoneManager.findNearestPOI(this.state.character.position, 'class-trainer');
    if (poi) {
      this.travelTo(poi.position, `Traveling to ${poi.nameDE}`);
    } else {
      this.log('❌ No class trainer found in this zone');
    }
  }

  /**
   * Go to profession trainer
   */
  private goToProfessionTrainer(): void {
    const poi = this.zoneManager.findNearestPOI(this.state.character.position, 'profession-trainer');
    if (poi) {
      this.travelTo(poi.position, `Traveling to ${poi.nameDE}`);
    } else {
      this.log('❌ No profession trainer found in this zone');
    }
  }

  /**
   * Go to vendor
   */
  private goToVendor(): void {
    const poi = this.zoneManager.findNearestPOI(this.state.character.position, 'vendor');
    if (poi) {
      this.travelTo(poi.position, `Traveling to ${poi.nameDE}`);
    } else {
      this.log('❌ No vendor found in this zone');
    }
  }

  /**
   * Farm nearby mobs
   */
  private farmNearbyMobs(): void {
    this.log('🌾 Starting to farm nearby mobs...');
    // TODO: Implement mob farming
  }

  /**
   * Handle quests
   */
  private handleQuests(): void {
    if (this.state.currentQuest && this.executor.isQuestComplete()) {
      this.returnToQuestGiver();
    } else {
      this.startNextQuest();
    }
  }

  /**
   * Update Travel State
   */
  private updateTravel(now: number): void {
    if (!this.state.travelEndTime || !this.state.currentDestination) return;

    if (now >= this.state.travelEndTime) {
      // Arrived at destination
      this.state.character.position = { ...this.state.currentDestination };
      this.log(`✓ Arrived at ${this.state.destinationName || 'destination'}`);
      
      // Update zone
      this.updateZone();
      
      this.state.travelStartTime = null;
      this.state.travelEndTime = null;
      this.state.currentDestination = null;
      this.state.destinationName = null;
      this.state.currentState = 'idle';
      
      // In manual mode, show available actions
      if (this.state.mode === 'manual') {
        this.updateAvailableActions();
      }
    }
  }

  /**
   * Update Combat State
   */
  private updateCombat(now: number): void {
    if (!this.state.combatEndTime) return;

    if (now >= this.state.combatEndTime) {
      // Combat finished
      this.log('💀 Enemy defeated!');
      
      this.state.combatStartTime = null;
      this.state.combatEndTime = null;
      this.state.currentState = 'idle';
    }
  }

  /**
   * Update Quest Turn-In State
   */
  private updateQuestTurnIn(now: number): void {
    if (!this.state.travelEndTime) return;

    if (now >= this.state.travelEndTime) {
      // Arrived at quest giver, turn in quest
      if (this.state.currentQuest) {
        const success = this.executor.turnInQuest(this.state.currentQuest.questId);
        if (success) {
          this.log(`✓ Quest completed: ${this.state.currentQuest.questName}`);
          
          // Award quest XP reward
          const quest = this.db.getQuest(this.state.currentQuest.questId);
          if (quest && quest.RewXP > 0) {
            this.awardExperience(quest.RewXP, this.state.currentQuest.questName);
          }
        }
        this.state.currentQuest = null;
      }
      
      this.state.travelStartTime = null;
      this.state.travelEndTime = null;
      this.state.currentState = 'idle';
    }
  }

  /**
   * Decide what to do next
   */
  private decideNextAction(): void {
    // Check if we have an active quest
    if (!this.state.currentQuest) {
      this.startNextQuest();
      return;
    }

    // Check if quest is complete
    if (this.executor.isQuestComplete()) {
      this.returnToQuestGiver();
      return;
    }

    // Continue grinding
    this.continueGrinding();
  }

  /**
   * Start next quest from guide
   */
  private startNextQuest(): void {
    // Get current zone from character position (simplified)
    const currentZone = 'Northshire'; // TODO: Determine from position
    
    const destination = this.navigator.getNextDestination(
      this.state.character.race as any,
      this.state.character.level,
      currentZone
    );

    if (!destination) {
      this.log('❌ No more quests available');
      this.stop();
      return;
    }

    if (destination.type === 'quest-giver') {
      // Accept quest
      const quest = this.executor.acceptQuest(destination.questId!);
      if (quest) {
        this.state.currentQuest = quest;
        this.log(`📜 Quest accepted: ${quest.questName}`);
        
        // Log objectives
        quest.objectives.forEach((obj, idx) => {
          this.log(`  [${idx + 1}] ${obj.type}: ${obj.required}x ${obj.creatureName || 'Item'}`);
        });

        // Start grinding
        this.state.currentState = 'idle';
      }
    } else {
      // Travel to quest giver first
      this.travelTo(destination.coords, 'Traveling to quest giver');
    }
  }

  /**
   * Continue grinding for quest objectives
   */
  private continueGrinding(): void {
    const nextSpot = this.executor.getNextGrindSpot(this.state.character.position);
    
    if (!nextSpot) {
      this.log('⚠️  No more grind spots available');
      // Try to complete quest anyway
      if (this.executor.isQuestComplete()) {
        this.returnToQuestGiver();
      }
      return;
    }

    // Travel to grind spot
    const distance = Math.sqrt(
      Math.pow(nextSpot.position.x - this.state.character.position.x, 2) +
      Math.pow(nextSpot.position.y - this.state.character.position.y, 2)
    );

    if (distance > 1) {
      this.travelTo(nextSpot.position, `Traveling to grind spot (${distance.toFixed(1)} yards)`);
    } else {
      // Already at spawn point, check for mob
      this.checkForMob(nextSpot);
    }
  }

  /**
   * Check for mob at current location and engage
   */
  private checkForMob(grindSpot: GrindSpot): void {
    // 50% chance mob is present
    const mobPresent = Math.random() < 0.5;
    
    if (mobPresent) {
      this.log(`⚔️  Found ${grindSpot.creatureName}! Engaging in combat...`);
      
      // Start combat (5-10 seconds)
      const combatDuration = (5 + Math.random() * 5) * 1000;
      this.state.currentState = 'combat';
      this.state.combatStartTime = Date.now();
      this.state.combatEndTime = Date.now() + combatDuration;

      // Schedule kill registration
      setTimeout(() => {
        if (this.state.currentState === 'idle') {
          // Register kill
          this.executor.registerKill(grindSpot.creatureId);
          
          // Award XP for mob kill
          const mobLevel = grindSpot.level || this.state.character.level;
          const xpGained = this.xpSystem.calculateMobXP(mobLevel, this.state.character.level);
          
          if (xpGained > 0) {
            this.awardExperience(xpGained, `${grindSpot.creatureName} (${mobLevel})`);
          }
          
          const progress = this.executor.getQuestProgress();
          const objective = progress?.objectives[0];
          if (objective) {
            this.log(`📊 Progress: ${objective.current}/${objective.required} ${objective.creatureName}`);
          }
        }
      }, combatDuration);
    } else {
      this.log('✗ No mob at this spawn point');
      // Continue to next spot
      this.state.currentState = 'idle';
    }
  }

  /**
   * Return to quest giver to turn in quest
   */
  private returnToQuestGiver(): void {
    if (!this.state.currentQuest) return;

    const quest = this.db.getQuest(this.state.currentQuest.questId);
    if (!quest) return;

    // Get quest ender position (usually same as quest giver)
    const questEnder = this.db.getCreatureSpawns(quest.RewOrReqMoney > 0 ? 
      (quest.SrcSpell || quest.entry) : quest.entry)[0];
    
    if (questEnder) {
      const destination: Position = {
        x: questEnder.position_x,
        y: questEnder.position_y,
        z: questEnder.position_z,
        map: questEnder.map,
      };

      this.log(`🎉 Quest objectives complete! Returning to turn in...`);
      this.state.currentState = 'turning-in-quest';
      this.travelTo(destination, 'Returning to quest giver');
    }
  }

  /**
   * Travel to destination
   */
  private travelTo(destination: Position, message: string): void {
    const travelInfo = calculateTravelTime(
      this.state.character.position,
      destination,
      MOVEMENT_SPEEDS.RUN
    );

    this.log(`🚶 ${message} (${travelInfo.distance.toFixed(1)} yards, ${Math.floor(travelInfo.travelTimeSeconds)}s)`);

    this.state.currentState = 'traveling';
    this.state.currentDestination = destination;
    this.state.destinationName = message.replace('Traveling to ', '');
    this.state.travelStartTime = Date.now();
    this.state.travelEndTime = Date.now() + (travelInfo.travelTimeSeconds * 1000);
  }

  /**
   * Award experience and handle level ups
   */
  private awardExperience(xpGained: number, source: string): void {
    const oldLevel = this.state.character.level;

    const result = this.xpSystem.addExperience(
      this.state.character.level,
      this.state.character.experience,
      xpGained
    );

    this.state.character.experience = result.remainingXP;
    this.state.character.level = result.newLevel;
    this.state.character.experienceToNext = this.xpSystem.getXPToNextLevel(
      result.newLevel,
      result.remainingXP
    );

    // Log XP gain
    const stats = this.xpSystem.getExperienceStats(result.newLevel, result.remainingXP);
    this.log(`+${xpGained} XP from ${source} (${stats.xpIntoLevel}/${stats.xpNeeded})`);

    // Handle level up(s)
    if (result.levelsGained > 0) {
      this.handleLevelUp(oldLevel, result.newLevel);
    }
  }

  /**
   * Handle level up (one or more levels)
   */
  private handleLevelUp(oldLevel: number, newLevel: number): void {
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      this.log(`🎉 LEVEL UP! You are now level ${level}!`);
      
      // Simple stat increases per level (placeholder - can be expanded)
      // In real WoW, this depends on class
      // For now: +10 HP, +5 Mana per level
    }
  }

  /**
   * Add log entry
   */
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.state.actionLog.push(logEntry);
    console.log(logEntry);

    // Keep only last 100 logs
    if (this.state.actionLog.length > 100) {
      this.state.actionLog.shift();
    }
  }

  /**
   * Notify state change
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * Get current state
   */
  getState(): GameEngineState {
    return { ...this.state };
  }

  /**
   * Travel to specific coordinates (for testing/manual control)
   */
  travelToCoordinates(position: Position, name: string): void {
    if (this.state.currentState !== 'idle') {
      this.log('⚠️  Cannot travel while busy');
      return;
    }

    this.travelTo(position, `Traveling to ${name}`);
  }
}
