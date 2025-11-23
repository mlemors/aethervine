/**
 * Game State Types
 */

export type GameActivity = 'idle' | 'questing' | 'grinding' | 'traveling' | 'in-combat';

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentActivity: GameActivity;
  tickCount: number;
  startTime: number;
}

export interface SaveData {
  version: string;
  timestamp: number;
  character: any; // Will be Character type
  quests: {
    completed: string[];
    active: any[]; // QuestProgress[]
  };
  inventory: any[]; // InventoryItem[]
  equipment: any; // Equipment
  settings: GameSettings;
}

export interface GameSettings {
  volume: {
    master: number;
    music: number;
    sfx: number;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';
  };
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
}
