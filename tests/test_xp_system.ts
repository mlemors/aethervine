/**
 * Test XP System
 */

import { getExperienceSystem } from '../src/game/ExperienceSystem';
import { GameEngine } from '../src/game/GameEngine';
import type { Character } from '../src/game/GameEngine';

const xpSystem = getExperienceSystem();

console.log('\n=== XP System Tests ===\n');

// Test 1: XP Table Verification
console.log('Test 1: XP Table Verification');
console.log('Level 1 → 2 requires:', xpSystem.getXPForLevel(2), 'XP');
console.log('Level 2 → 3 requires:', xpSystem.getXPForLevel(3), 'XP');
console.log('Level 9 → 10 requires:', xpSystem.getXPForLevel(10), 'XP');
console.log('Level 59 → 60 requires:', xpSystem.getXPForLevel(60), 'XP');

// Test 2: Mob XP Calculation
console.log('\n\nTest 2: Mob XP Calculation');
console.log('Level 5 player kills Level 5 mob:', xpSystem.calculateMobXP(5, 5), 'XP');
console.log('Level 5 player kills Level 7 mob:', xpSystem.calculateMobXP(7, 5), 'XP (bonus)');
console.log('Level 5 player kills Level 3 mob:', xpSystem.calculateMobXP(3, 5), 'XP (penalty)');
console.log('Level 5 player kills Level 1 mob:', xpSystem.calculateMobXP(1, 5), 'XP (gray)');

// Test 3: Experience Gain and Level Up
console.log('\n\nTest 3: Experience Gain and Level Up');
let level = 1;
let xp = 0;

console.log(`Starting: Level ${level}, XP ${xp}`);

// Add 400 XP (should level to 2)
const result1 = xpSystem.addExperience(level, xp, 400);
console.log(`+400 XP → Level ${result1.newLevel}, ${result1.remainingXP} total XP (${result1.levelsGained} level up)`);

level = result1.newLevel;
xp = result1.remainingXP;

// Add 500 XP (should level to 3)
const result2 = xpSystem.addExperience(level, xp, 500);
console.log(`+500 XP → Level ${result2.newLevel}, ${result2.remainingXP} total XP (${result2.levelsGained} level up)`);

level = result2.newLevel;
xp = result2.remainingXP;

// Add massive XP (should level multiple times)
const result3 = xpSystem.addExperience(level, xp, 10000);
console.log(`+10000 XP → Level ${result3.newLevel}, ${result3.remainingXP} total XP (${result3.levelsGained} level ups)`);

// Test 4: Progress Calculation
console.log('\n\nTest 4: Progress Calculation');
const stats1 = xpSystem.getExperienceStats(1, 200);
console.log(`Level 1 with 200 XP:`);
console.log(`  Progress: ${stats1.progress.toFixed(1)}%`);
console.log(`  Into level: ${stats1.xpIntoLevel}/${stats1.xpNeeded}`);
console.log(`  Remaining: ${stats1.xpRemaining}`);

const stats2 = xpSystem.getExperienceStats(5, 2500);
console.log(`\nLevel 5 with 2500 XP:`);
console.log(`  Progress: ${stats2.progress.toFixed(1)}%`);
console.log(`  Into level: ${stats2.xpIntoLevel}/${stats2.xpNeeded}`);
console.log(`  Remaining: ${stats2.xpRemaining}`);

// Test 5: Integration with GameEngine
console.log('\n\nTest 5: GameEngine Integration - Kill Mobs and Level Up');

const testCharacter: Character = {
  name: 'TestHero',
  race: 'Human',
  class: 'Warrior',
  level: 1,
  experience: 0,
  experienceToNext: 400,
  position: { x: -8949.95, y: -132.493, map: 0 },
};

const engine = new GameEngine(testCharacter);

// Override the internal state for testing
const engineState = (engine as any).state;
console.log(`Character: ${engineState.character.name} - Level ${engineState.character.level}`);
console.log(`XP: ${engineState.character.experience}/${engineState.character.experienceToNext}`);

// Simulate killing a level 1 mob (grants ~50 XP)
console.log('\n🗡️  Simulating mob kills...');
for (let i = 0; i < 10; i++) {
  const mobLevel = 1;
  const xpGain = xpSystem.calculateMobXP(mobLevel, engineState.character.level);
  
  if (xpGain > 0) {
    const oldLevel = engineState.character.level;
    const result = xpSystem.addExperience(
      engineState.character.level,
      engineState.character.experience,
      xpGain
    );
    
    engineState.character.experience = result.remainingXP;
    engineState.character.level = result.newLevel;
    engineState.character.experienceToNext = xpSystem.getXPToNextLevel(
      result.newLevel,
      result.remainingXP
    );

    const stats = xpSystem.getExperienceStats(result.newLevel, result.remainingXP);
    console.log(`  Kill #${i + 1}: +${xpGain} XP → ${stats.xpIntoLevel}/${stats.xpNeeded} (${stats.progress.toFixed(1)}%)`);
    
    if (result.levelsGained > 0) {
      console.log(`  🎉 LEVEL UP! ${oldLevel} → ${result.newLevel}`);
    }
  }
}

console.log(`\nFinal State: Level ${engineState.character.level}, ${engineState.character.experience} XP`);

// Test 6: XP Formatting
console.log('\n\nTest 6: XP Formatting');
console.log('500 XP:', xpSystem.formatXP(500));
console.log('1500 XP:', xpSystem.formatXP(1500));
console.log('15000 XP:', xpSystem.formatXP(15000));
console.log('150000 XP:', xpSystem.formatXP(150000));
console.log('1500000 XP:', xpSystem.formatXP(1500000));

console.log('\n=== All Tests Complete ===\n');
