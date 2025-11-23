/**
 * Test: Verify XP data is loaded from database
 */

import { getExperienceSystem } from '../src/game/ExperienceSystem';

const xpSystem = getExperienceSystem();

console.log('\n=== XP Database Verification ===\n');

// Database values (from player_xp_for_level)
// Note: These are CUMULATIVE XP values (total XP needed to reach that level)
const expectedValues = {
  2: 400,
  3: 900,
  10: 6500,
  20: 21300,
  30: 44300,
  40: 85700,
  50: 141200,
  60: 209800,
};

console.log('Comparing XP values from database:\n');

let allCorrect = true;
for (const [level, expectedXP] of Object.entries(expectedValues)) {
  const actualXP = xpSystem.getXPForLevel(parseInt(level));
  const match = actualXP === expectedXP;
  
  console.log(`Level ${level.padStart(2)}: ${actualXP.toString().padStart(7)} XP ${match ? '✅' : '❌ Expected: ' + expectedXP}`);
  
  if (!match) {
    allCorrect = false;
  }
}

console.log('\n' + (allCorrect ? '✅ All XP values match database!' : '❌ Some values do not match'));

// Show full table
console.log('\n=== Full XP Table (Level 1-60) ===\n');
for (let level = 1; level <= 60; level++) {
  const xp = xpSystem.getXPForLevel(level);
  if (level === 1) {
    console.log(`Level  ${level}: ${xp.toString().padStart(7)} XP (starting XP)`);
  } else {
    console.log(`Level ${level.toString().padStart(2)}: ${xp.toString().padStart(7)} XP`);
  }
}

console.log('\n');
