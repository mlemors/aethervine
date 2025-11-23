/**
 * Test: Level 1 Human Character - Erste Bewegung zum Quest NPC
 */

import { getQuestNavigator } from '../src/game/QuestNavigator';
import { TravelSimulation, MOVEMENT_SPEEDS } from '../src/game/MovementSystem';
import { closeDatabase } from '../src/data/sqlite_loader';

async function testFirstJourney() {
  console.log('🎮 Aethervine - First Journey Test\n');
  console.log('='.repeat(70));
  console.log('\n📍 PHASE 1: Character Start Position\n');

  const navigator = getQuestNavigator();
  
  // Level 1 Human Warrior
  const race = 'Human';
  const classId = 1; // Warrior
  const level = 1;
  const startZone = 'Elwynn Forest';

  // Hole Start-Position
  const startPos = navigator.getStartPosition(race, classId);
  if (!startPos) {
    console.error('❌ Could not find start position!');
    return;
  }

  console.log(`✅ ${race} ${classId === 1 ? 'Warrior' : 'Class'} spawned at:`);
  console.log(`   Zone: ${startZone}`);
  console.log(`   Coordinates: (${startPos.x.toFixed(2)}, ${startPos.y.toFixed(2)}, ${startPos.z?.toFixed(2)})`);
  console.log(`   Map: ${startPos.map}`);

  // Finde nächstes Ziel
  console.log('\n📍 PHASE 2: Finding Next Objective\n');
  
  const navStep = navigator.planNextMove(race, level, startZone, startPos);
  if (!navStep) {
    console.error('❌ Could not find next destination!');
    return;
  }

  const { destination, travelInfo, estimatedArrival } = navStep;

  console.log(`✅ Next objective found:`);
  console.log(`   Type: ${destination.type}`);
  console.log(`   Description: ${destination.description}`);
  if (destination.npcName) {
    console.log(`   NPC: ${destination.npcName} (ID: ${destination.npcId})`);
  }
  if (destination.questId) {
    console.log(`   Quest ID: ${destination.questId}`);
  }
  console.log(`   Zone: ${destination.zone}`);
  console.log(`   Target Coords: (${destination.coords.x.toFixed(2)}, ${destination.coords.y.toFixed(2)}, ${destination.coords.z?.toFixed(2)})`);

  // Travel Info
  console.log('\n📍 PHASE 3: Travel Calculation\n');
  console.log(`✅ Route calculated:`);
  console.log(`   Distance: ${travelInfo.distance.toFixed(2)} yards`);
  console.log(`   Speed: ${travelInfo.speedYardsPerSec} yards/sec (Running)`);
  console.log(`   Travel Time: ${estimatedArrival}`);

  // Starte Travel Simulation
  console.log('\n📍 PHASE 4: Travel Simulation\n');
  console.log(`🏃 Character is now traveling...\n`);

  const simulation = new TravelSimulation(
    startPos,
    destination.coords,
    MOVEMENT_SPEEDS.RUN
  );

  // Simuliere Bewegung mit Progress Updates
  return new Promise<void>((resolve) => {
    const updateInterval = setInterval(() => {
      if (simulation.isCompleted()) {
        clearInterval(updateInterval);
        
        const finalPos = simulation.getCurrentPosition();
        console.log('\n✅ ARRIVAL!\n');
        console.log(`   Final Position: (${finalPos.x.toFixed(2)}, ${finalPos.y.toFixed(2)}, ${finalPos.z?.toFixed(2)})`);
        console.log(`   Destination: ${destination.npcName || destination.description}`);
        console.log(`   Quest: ${destination.description}`);
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ First journey completed successfully!');
        console.log('='.repeat(70));
        
        closeDatabase();
        resolve();
      } else {
        const progress = simulation.getProgress();
        const remaining = simulation.getRemainingTime();
        const currentPos = simulation.getCurrentPosition();
        
        const progressBar = '█'.repeat(Math.floor(progress * 30)) + '░'.repeat(30 - Math.floor(progress * 30));
        
        console.log(`[${progressBar}] ${(progress * 100).toFixed(1)}% | ETA: ${remaining.toFixed(1)}s | Pos: (${currentPos.x.toFixed(1)}, ${currentPos.y.toFixed(1)})`);
      }
    }, 1000); // Update jede Sekunde
  });
}

// Run test
testFirstJourney().catch(console.error);
