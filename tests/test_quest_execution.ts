/**
 * Test: Quest Execution Flow
 * Testet kompletten Flow: Accept -> Grind -> Kill -> Turn In
 */

import { QuestExecutor } from '../src/game/QuestExecutor';
import { calculateDistance, calculateTravelTime, MOVEMENT_SPEEDS } from '../src/game/MovementSystem';
import { getDatabase } from '../src/data/sqlite_loader';

console.log('=== Quest Execution Flow Test ===\n');

const db = getDatabase();
const executor = new QuestExecutor();

// 1. Akzeptiere Quest 7 - Kobold Camp Cleanup
console.log('📜 PHASE 1: Accept Quest');
const quest = executor.acceptQuest(7);
if (!quest) {
  console.log('❌ Failed to accept quest');
  process.exit(1);
}

console.log(`✓ Quest accepted: ${quest.questName}`);
console.log(`  Objectives:`);
quest.objectives.forEach((obj, idx) => {
  console.log(`    [${idx + 1}] ${obj.type}: ${obj.required}x ${obj.creatureName || 'Item'} (${obj.current}/${obj.required})`);
});
console.log('');

// 2. Start Position: Marshal McBride (wo wir die Quest annehmen)
console.log('🎯 PHASE 2: Find Grind Spots');
const questGiverPosition = {
  x: -8902.59,
  y: -162.61,
  z: 82.02,
  map: 0,
};

console.log(`Starting at quest giver: (${questGiverPosition.x.toFixed(1)}, ${questGiverPosition.y.toFixed(1)})`);

const grindSpots = executor.findGrindSpots(questGiverPosition);
console.log(`✓ Found ${grindSpots.length} grind spots for ${grindSpots[0]?.creatureName || 'Unknown'}`);
console.log(`  Nearest spots:`);
grindSpots.slice(0, 5).forEach((spot, idx) => {
  console.log(`    [${idx + 1}] (${spot.position.x.toFixed(1)}, ${spot.position.y.toFixed(1)}) - ${spot.distanceFromPlayer.toFixed(1)} yards away`);
});
console.log('');

// 3. Grind Loop: Laufe zu Spawns und töte Mobs
console.log('⚔️  PHASE 3: Grind Mobs');
let currentPosition = { ...questGiverPosition };
let killsNeeded = quest.objectives[0].required;
let totalTravelTime = 0;
let totalCombatTime = 0;
let spotVisits = 0;

console.log(`Need to kill ${killsNeeded}x ${quest.objectives[0].creatureName}\n`);

while (!executor.isQuestComplete() && spotVisits < 20) {
  const nextSpot = executor.getNextGrindSpot(currentPosition);
  
  if (!nextSpot) {
    console.log('❌ No more grind spots found!');
    break;
  }

  spotVisits++;
  const distance = calculateDistance(currentPosition, nextSpot.position);
  const travelInfo = calculateTravelTime(currentPosition, nextSpot.position, MOVEMENT_SPEEDS.RUN);

  console.log(`[Visit ${spotVisits}] Travel to spawn point:`);
  console.log(`  From: (${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)})`);
  console.log(`  To: (${nextSpot.position.x.toFixed(1)}, ${nextSpot.position.y.toFixed(1)})`);
  console.log(`  Distance: ${distance.toFixed(1)} yards`);
  console.log(`  Travel time: ${Math.floor(travelInfo.travelTimeSeconds / 60)}m ${Math.floor(travelInfo.travelTimeSeconds % 60)}s`);
  console.log(`  🚶 Running...`);

  // Simuliere echte Reisezeit (1 Sekunde = 1 Sekunde im Spiel)
  await new Promise(resolve => setTimeout(resolve, travelInfo.travelTimeSeconds * 1000));
  
  totalTravelTime += travelInfo.travelTimeSeconds;
  currentPosition = { 
    x: nextSpot.position.x, 
    y: nextSpot.position.y, 
    z: nextSpot.position.z || 0, 
    map: nextSpot.position.map || 0 
  };

  console.log(`  ✓ Arrived at spawn point`);

  // Simuliere: 50% Chance dass ein Mob da ist
  const mobPresent = Math.random() < 0.5;
  
  if (mobPresent) {
    console.log(`  ⚔️  Found ${nextSpot.creatureName}! Engaging in combat...`);
    
    // Combat dauert 5-10 Sekunden (abhängig von Level/Gear später)
    const combatDuration = 5 + Math.random() * 5;
    console.log(`  ⚡ Fighting... (${combatDuration.toFixed(1)}s)`);
    
    // Simuliere Kampfzeit
    await new Promise(resolve => setTimeout(resolve, combatDuration * 1000));
    
    totalCombatTime += combatDuration;
    
    console.log(`  💀 ${nextSpot.creatureName} defeated!`);
    executor.registerKill(nextSpot.creatureId);
    
    const progress = executor.getQuestProgress();
    const objective = progress?.objectives[0];
    if (objective) {
      console.log(`  📊 Progress: ${objective.current}/${objective.required} kills`);
    }
  } else {
    console.log(`  ✗ No mob at this spawn point, moving to next...`);
  }
  
  console.log('');
}

// 4. Zurück zum Quest Giver
if (executor.isQuestComplete()) {
  console.log('🎉 PHASE 4: Quest Complete - Return to Quest Giver');
  
  const questDb = db.getQuest(7);
  
  // Quest Ender ist Marshal McBride (gleiche Position)
  const returnDistance = calculateDistance(currentPosition, questGiverPosition);
  const returnTravel = calculateTravelTime(currentPosition, questGiverPosition, MOVEMENT_SPEEDS.RUN);
  
  console.log(`Returning to ${questDb?.Title || 'Quest Giver'}:`);
  console.log(`  From: (${currentPosition.x.toFixed(1)}, ${currentPosition.y.toFixed(1)})`);
  console.log(`  To: (${questGiverPosition.x.toFixed(1)}, ${questGiverPosition.y.toFixed(1)})`);
  console.log(`  Distance: ${returnDistance.toFixed(1)} yards`);
  console.log(`  Travel time: ${Math.floor(returnTravel.travelTimeSeconds / 60)}m ${Math.floor(returnTravel.travelTimeSeconds % 60)}s`);
  console.log(`  🚶 Running back...`);
  
  // Simuliere Rückweg
  await new Promise(resolve => setTimeout(resolve, returnTravel.travelTimeSeconds * 1000));
  
  console.log(`  ✓ Arrived at quest giver`);
  console.log('');

  totalTravelTime += returnTravel.travelTimeSeconds;

  const turnedIn = executor.turnInQuest(7);
  if (turnedIn) {
    console.log('✓ Quest turned in successfully!');
  }
} else {
  console.log('❌ Quest not completed after visiting spots');
}

// 5. Summary
console.log('\n=== SUMMARY ===');
const progress = executor.getQuestProgress();
console.log(`Quest: ${progress?.questName}`);
console.log(`Status: ${progress?.status}`);
console.log(`Spawn points visited: ${spotVisits}`);
console.log(`Total travel time: ${Math.floor(totalTravelTime / 60)}m ${Math.floor(totalTravelTime % 60)}s`);
console.log(`Total combat time: ${Math.floor(totalCombatTime / 60)}m ${Math.floor(totalCombatTime % 60)}s`);
console.log(`Total time: ${Math.floor((totalTravelTime + totalCombatTime) / 60)}m ${Math.floor((totalTravelTime + totalCombatTime) % 60)}s`);

if (progress?.objectives) {
  console.log(`Objectives:`);
  progress.objectives.forEach((obj, idx) => {
    const status = obj.completed ? '✓' : '✗';
    console.log(`  ${status} [${idx + 1}] ${obj.current}/${obj.required} ${obj.creatureName || 'Items'}`);
  });
}

db.close();
