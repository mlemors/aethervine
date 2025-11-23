/**
 * Test: Simple Manual Control
 * Level 5 Character travels from Northshire to Goldshire
 */

import { GameEngine, type Character } from '../src/game/GameEngine';

console.log('=== Manual Control Test: Northshire -> Goldshire ===\n');

// Create Level 5 character starting in Northshire Abbey
const character: Character = {
  name: 'TestHero',
  race: 'Human',
  class: 'Warrior',
  level: 5,
  experience: 1400,
  position: {
    x: -8914.55,  // Northshire Abbey
    y: -135.43,
    z: 81.87,
    map: 0,
  },
};

const engine = new GameEngine(character);

console.log(`Starting: ${character.name} (Level ${character.level})`);
console.log(`Location: Northshire Abbey\n`);

// Start engine
engine.start();

// Wait 2 seconds, then travel to Goldshire
setTimeout(() => {
  console.log('\n🎯 COMMAND: Travel to Goldshire\n');
  
  const goldshire = {
    x: -9466.62,
    y: 45.83,
    z: 56.95,
    map: 0,
  };
  
  engine.travelToCoordinates(goldshire, 'Goldshire');
}, 2000);

// Check every 10 seconds
let checkCount = 0;
const checker = setInterval(() => {
  checkCount++;
  const state = engine.getState();
  
  console.log(`\n[${checkCount * 10}s] Status Check:`);
  console.log(`  State: ${state.currentState}`);
  console.log(`  Zone: ${state.currentZone || 'Unknown'}`);
  console.log(`  Position: (${state.character.position.x.toFixed(1)}, ${state.character.position.y.toFixed(1)})`);
  
  if (state.currentState === 'traveling') {
    console.log(`  Destination: ${state.destinationName}`);
  }
  
  // If arrived at Goldshire
  if (state.currentZone === 'Goldhain' && state.currentState === 'idle') {
    console.log('\n✨ ARRIVED AT GOLDSHIRE!\n');
    
    console.log('📋 Available actions:');
    state.availableActions.forEach((action, idx) => {
      console.log(`  [${idx + 1}] ${action}`);
    });
    
    console.log('\n🎯 COMMAND: Go to inn\n');
    engine.executeAction('Zum Gasthaus gehen');
    
    // Wait a bit then go to trainer
    setTimeout(() => {
      console.log('\n🎯 COMMAND: Go to class trainer\n');
      engine.executeAction('Zum Klassenlehrer gehen');
      
      // Stop after trainer visit
      setTimeout(() => {
        console.log('\n=== TEST COMPLETE ===');
        console.log(`Final Zone: ${engine.getState().currentZone}`);
        console.log(`Total actions: ${engine.getState().actionLog.length}`);
        
        clearInterval(checker);
        engine.stop();
        process.exit(0);
      }, 10000);
    }, 5000);
  }
  
  // Timeout after 2 minutes
  if (checkCount >= 12) {
    console.log('\n⏰ Test timeout');
    clearInterval(checker);
    engine.stop();
    process.exit(1);
  }
}, 10000);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏸️  Interrupted');
  engine.stop();
  process.exit(0);
});
