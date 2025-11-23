/**
 * Guide Loader - Lädt Questing Guides und findet den nächsten Step
 */

import type { WoWRace } from '../types/character';
import guidesData from '../data/guide/generated_guides.json';

export interface GuideStep {
  id: number;
  type: 'quest' | 'travel' | 'grind' | 'turnin' | 'accept';
  objectives: Array<{
    type: string;
    description: string;
    questId?: number;
    coords?: { x: number; y: number };
  }>;
  recommendedLevel: number;
  zone: string;
  description: string;
  questId?: number;
}

export interface GuideSegment {
  levelRange: [number, number];
  zone: string;
  steps: GuideStep[];
}

export interface LevelingGuide {
  race: string;
  faction: string;
  startZone: string;
  startingLevel: number;
  targetLevel: number;
  segments: GuideSegment[];
}

/**
 * Guide Loader Klasse
 */
export class GuideLoader {
  private guides: LevelingGuide[];

  constructor() {
    this.guides = (guidesData as any).guides;
  }

  /**
   * Hole Guide für Race
   */
  getGuideForRace(race: WoWRace): LevelingGuide | null {
    return this.guides.find(g => g.race === race) || null;
  }

  /**
   * Finde den nächsten Step basierend auf Level und Zone
   */
  getNextStep(race: WoWRace, currentLevel: number, currentZone: string): GuideStep | null {
    const guide = this.getGuideForRace(race);
    if (!guide) return null;

    // Finde passendes Segment für Level
    const segment = guide.segments.find(seg => {
      const [minLevel, maxLevel] = seg.levelRange;
      return currentLevel >= minLevel && currentLevel <= maxLevel;
    });

    if (!segment) return null;

    // Finde ersten Step der zum Level passt
    // Filtere Steps ohne echte Quests (travel, grind) aus
    const validSteps = segment.steps.filter(s => {
      // Nur Steps mit quest type oder objectives mit questId
      if (s.type === 'quest') return true;
      if (s.objectives && s.objectives.length > 0) {
        return s.objectives.some((obj: any) => obj.questId !== undefined);
      }
      return false;
    });

    const step = validSteps.find(s => s.recommendedLevel <= currentLevel);

    return step || null;
  }

  /**
   * Hole Start-Position aus Guide
   */
  getStartPosition(race: WoWRace): { zone: string; coords?: { x: number; y: number } } | null {
    const guide = this.getGuideForRace(race);
    if (!guide) return null;

    return {
      zone: guide.startZone,
      coords: undefined // Wird später aus DB geholt
    };
  }

  /**
   * Hole alle Steps für ein Level-Range
   */
  getStepsForLevel(race: WoWRace, level: number): GuideStep[] {
    const guide = this.getGuideForRace(race);
    if (!guide) return [];

    const segment = guide.segments.find(seg => {
      const [minLevel, maxLevel] = seg.levelRange;
      return level >= minLevel && level <= maxLevel;
    });

    return segment?.steps || [];
  }
}

/**
 * Singleton Instance
 */
let guideLoaderInstance: GuideLoader | null = null;

export function getGuideLoader(): GuideLoader {
  if (!guideLoaderInstance) {
    guideLoaderInstance = new GuideLoader();
  }
  return guideLoaderInstance;
}
