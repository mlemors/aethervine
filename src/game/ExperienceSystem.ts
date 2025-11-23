/**
 * Experience System - Handles XP, Leveling, and Level Requirements
 */

import { getDatabase } from '../data/sqlite_loader';

/**
 * XP Table will be loaded from database
 * Fallback values based on WoW Classic 1.12.1 if DB not available
 */
let XP_TABLE: number[] | null = null;

/**
 * Load XP table from database
 */
function loadXPTable(): number[] {
  if (XP_TABLE !== null) {
    return XP_TABLE;
  }

  try {
    const db = getDatabase();
    const xpData = db.getPlayerXPForLevel();
    
    // Convert to array indexed by level (0 = level 1, etc.)
    XP_TABLE = [0]; // Level 1 starts at 0 XP
    for (const row of xpData) {
      XP_TABLE.push(row.xp_for_next_level);
    }
    
    console.log(`✅ Loaded ${XP_TABLE.length - 1} XP thresholds from database`);
    return XP_TABLE;
  } catch (error) {
    console.warn('⚠️  Could not load XP table from database, using fallback values');
    // Fallback XP table (approximate WoW Classic values)
    XP_TABLE = [
      0,      // Level 1 (start)
      400,    // Level 2
      900,    // Level 3
      1400,   // Level 4
      2100,   // Level 5
      2800,   // Level 6
      3600,   // Level 7
      4500,   // Level 8
      5400,   // Level 9
      6500,   // Level 10
      7600,   // Level 11
      8700,   // Level 12
      9800,   // Level 13
      11000,  // Level 14
      12300,  // Level 15
      13600,  // Level 16
      15000,  // Level 17
      16400,  // Level 18
      17800,  // Level 19
      19300,  // Level 20
      20800,  // Level 21
      22400,  // Level 22
      24000,  // Level 23
      25500,  // Level 24
      27200,  // Level 25
      28900,  // Level 26
      30500,  // Level 27
      32200,  // Level 28
      33900,  // Level 29
      36300,  // Level 30
      38800,  // Level 31
      41600,  // Level 32
      44600,  // Level 33
      48000,  // Level 34
      51400,  // Level 35
      55000,  // Level 36
      58700,  // Level 37
      62400,  // Level 38
      66200,  // Level 39
      70200,  // Level 40
      74300,  // Level 41
      78500,  // Level 42
      82800,  // Level 43
      87100,  // Level 44
      91600,  // Level 45
      96300,  // Level 46
      101000, // Level 47
      105800, // Level 48
      110700, // Level 49
      115700, // Level 50
      120900, // Level 51
      126100, // Level 52
      131500, // Level 53
      137000, // Level 54
      142500, // Level 55
      148200, // Level 56
      154000, // Level 57
      159900, // Level 58
      165800, // Level 59
      171900, // Level 60
    ];
    return XP_TABLE;
  }
}

export interface LevelUpResult {
  newLevel: number;
  remainingXP: number;
  levelsGained: number;
}

export class ExperienceSystem {
  /**
   * Calculate XP reward for killing a mob
   * Formula based on mob level vs player level
   */
  calculateMobXP(mobLevel: number, playerLevel: number): number {
    const levelDiff = mobLevel - playerLevel;
    
    // Base XP for mob (roughly 45-55 XP per level)
    const baseXP = mobLevel * 50;
    
    // XP penalty/bonus based on level difference
    let multiplier = 1.0;
    
    if (levelDiff >= 5) {
      // Mob is 5+ levels higher - bonus XP
      multiplier = 1.2;
    } else if (levelDiff >= 3) {
      // Mob is 3-4 levels higher - small bonus
      multiplier = 1.1;
    } else if (levelDiff >= -2) {
      // Mob is within 2 levels - normal XP
      multiplier = 1.0;
    } else if (levelDiff >= -4) {
      // Mob is 3-4 levels lower - reduced XP
      multiplier = 0.8;
    } else if (levelDiff >= -6) {
      // Mob is 5-6 levels lower - heavily reduced
      multiplier = 0.5;
    } else {
      // Mob is 7+ levels lower - gray mob, no XP
      return 0;
    }
    
    return Math.floor(baseXP * multiplier);
  }

  /**
   * Get XP required for next level
   */
  getXPForLevel(level: number): number {
    const table = loadXPTable();
    if (level < 1 || level > 60) return 0;
    return table[level - 1];
  }

  /**
   * Get XP required to reach target level from current XP
   */
  getXPToNextLevel(currentLevel: number, currentXP: number): number {
    if (currentLevel >= 60) return 0;
    
    const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
    return Math.max(0, xpForNextLevel - currentXP);
  }

  /**
   * Add XP and check for level up
   */
  addExperience(currentLevel: number, currentXP: number, xpGained: number): LevelUpResult {
    if (currentLevel >= 60) {
      return {
        newLevel: 60,
        remainingXP: currentXP,
        levelsGained: 0,
      };
    }

    let level = currentLevel;
    let xp = currentXP + xpGained;
    let levelsGained = 0;

    // Check for level ups (can level multiple times from one XP gain)
    while (level < 60 && xp >= this.getXPForLevel(level + 1)) {
      level++;
      levelsGained++;
    }

    return {
      newLevel: level,
      remainingXP: xp,
      levelsGained,
    };
  }

  /**
   * Calculate percentage to next level
   */
  getProgressToNextLevel(currentLevel: number, currentXP: number): number {
    if (currentLevel >= 60) return 100;

    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    const xpIntoLevel = currentXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;

    return Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));
  }

  /**
   * Format XP for display
   */
  formatXP(xp: number): string {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  }

  /**
   * Get all stats for current level/XP
   */
  getExperienceStats(level: number, currentXP: number) {
    const currentLevelXP = this.getXPForLevel(level);
    const nextLevelXP = this.getXPForLevel(level + 1);
    const xpIntoLevel = currentXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const xpRemaining = this.getXPToNextLevel(level, currentXP);
    const progress = this.getProgressToNextLevel(level, currentXP);

    return {
      level,
      currentXP,
      currentLevelXP,
      nextLevelXP,
      xpIntoLevel,
      xpNeeded,
      xpRemaining,
      progress,
    };
  }
}

/**
 * Singleton Instance
 */
let experienceSystemInstance: ExperienceSystem | null = null;

export function getExperienceSystem(): ExperienceSystem {
  if (!experienceSystemInstance) {
    experienceSystemInstance = new ExperienceSystem();
  }
  return experienceSystemInstance;
}
