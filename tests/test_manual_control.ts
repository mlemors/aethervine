/**
 * Test: Manual Control & Zone Navigation
 * Character ist Level 5 in Northshire, läuft nach Goldshire
 */

import { GameEngine, type Character } from '../src/game/GameEngine';
import { getDatabase } from '../src/data/sqlite_loader';

console.log('=== Manual Control & Zone Navigation Test ===\n');

// Create Level 5 character in Northshire
const character: Character = {
  name: 'ManualTest',
  race: 'Human',
  class: 'Warrior',
  level: 5,
  experience: 1400,
  position: {
    x: -8914.55,
    y: -135.43,
    z: 81.87,
    map: 0,
  },
};

console.log(`Character: ${character.name} - Level ${character.level} ${character.race} ${character.class}`);
console.log(`Starting in Northshire Abbey\n`);

// Create game engine in manual mode
const engine = new GameEngine(character);

let currentStep = 0;
const testSteps = [
  'start',
  'travel-to-goldshire',
  'arrive-at-goldshire',
  'show-actions',
  'go-to-inn',
  'go-to-trainer',
  'done',
];

// Goldshire position (Lion's Pride Inn)
const goldshireInn = {
  x: -9466.62,
  y: 45.83,
  z: 56.95,
  map: 0,
};

// Start engine
engine.start();

// Simulate test flow
const testInterval = setInterval(() => {
  const state = engine.getState();
  
  switch (testSteps[currentStep]) {
    case 'start':
      console.log('\n📍 Phase 1: In Northshire - Quest completed, need to turn in at Goldshire\n');
      
      setTimeout(() => {
        console.log('🎯 Traveling to Goldshire to turn in quest...\n');
        engine.travelToCoordinates(goldshireInn, 'Goldshire (Lion\'s Pride Inn)');
        currentStep++;
      }, 2000);
      break;

    case 'travel-to-goldshire':
      // Wait for travel to complete
      if (state.currentState === 'idle' && state.currentZone === 'Goldhain') {
        currentStep++;
      }
      break;

    case 'arrive-at-goldshire':
      console.log('\n✨ ARRIVED AT GOLDSHIRE!\n');
      console.log(`Current Zone: ${state.currentZone}`);
      console.log(`Position: (${state.character.position.x.toFixed(1)}, ${state.character.position.y.toFixed(1)})\n`);
      
      console.log('📜 Quest turned in! +550 XP\n');
      
      setTimeout(() => {
        currentStep++;
      }, 2000);
      break;

    case 'show-actions':
      console.log('⏸️  Manually stopping auto-questing\n');
      engine.pause();
      
      setTimeout(() => {
        console.log('📋 What would you like to do in Goldshire?\n');
        state.availableActions.forEach((action, idx) => {
          console.log(`  [${idx + 1}] ${action}`);
        });
        console.log('');
        
        setTimeout(() => currentStep++, 1000);
      }, 1000);
      break;

    case 'go-to-inn':
      console.log('🎯 Player selects: [1] Zum Gasthaus gehen\n');
      engine.resume();
      engine.executeAction('Zum Gasthaus gehen');
      
      // Wait for arrival
      const checkInn = setInterval(() => {
        const s = engine.getState();
        if (s.currentState === 'idle' && s.destinationName === null) {
          clearInterval(checkInn);
          console.log('✓ Arrived at Lion\'s Pride Inn');
          console.log('💤 Resting and setting hearthstone...\n');
          setTimeout(() => currentStep++, 1000);
        }
      }, 1000);
      break;

    case 'go-to-trainer':
      console.log('🎯 Player selects: [2] Zum Klassenlehrer gehen\n');
      engine.executeAction('Zum Klassenlehrer gehen');
      
      // Wait for arrival
      const checkTrainer = setInterval(() => {
        const s = engine.getState();
        if (s.currentState === 'idle' && s.destinationName === null) {
          clearInterval(checkTrainer);
          console.log('✓ Arrived at Warrior Trainer (Lyria Du Lac)');
          console.log('⚔️  Learning new skills...\n');
          setTimeout(() => currentStep++, 1000);
        }
      }, 1000);
      break;

    case 'done':
      clearInterval(testInterval);
      engine.stop();
      
      console.log('\n=== TEST COMPLETE ===');
      console.log(`Final Position: ${state.currentZone}`);
      console.log(`Character Level: ${state.character.level}`);
      console.log(`Total Actions: ${state.actionLog.length}`);
      
      process.exit(0);
      break;
  }
}, 1000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏸️  Test interrupted');
  engine.stop();
  process.exit(0);
});
