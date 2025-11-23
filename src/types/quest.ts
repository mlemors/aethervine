/**
 * Quest System Types
 */

export type QuestType = 'kill' | 'collect' | 'escort' | 'explore' | 'deliver';

export interface QuestObjective {
  id: string;
  type: QuestType;
  description: string;
  target?: string; // Enemy name or item name
  required: number;
  current?: number;
}

export interface QuestRewards {
  experience: number;
  gold: number;
  items?: string[]; // Item IDs
  reputation?: {
    faction: string;
    amount: number;
  };
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  zone: string;
  level: number;
  faction?: 'Alliance' | 'Horde' | 'Neutral';
  questGiver: string;
  questGiverLocation?: { x: number; y: number };
  
  objectives: QuestObjective[];
  rewards: QuestRewards;
  
  prerequisites?: string[]; // Quest IDs that must be completed first
  followUp?: string; // Next quest in chain
}

export interface QuestProgress {
  questId: string;
  objectives: Array<{
    id: string;
    current: number;
    required: number;
  }>;
  startTime: number;
  isComplete: boolean;
}
