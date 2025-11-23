/**
 * Test: Game Engine Auto-Leveling
 * Testet automatisches Leveling mit realer Zeit-Simulation
 */

import { GameEngine, type Character } from '../src/game/GameEngine';

console.log('=== Game Engine Auto-Leveling Test ===\n');

// Create test character
const character: Character = {
  name: 'TestWarrior',
  race: 'Human',
  class: 'Warrior',
  level: 1,
  experience: 0,
  position: {
    x: 0,
    y: 0,
    z: 0,
    map: 0,
  },
};

// Create game engine with state change listener
const engine = new GameEngine(character, (state) => {
  // Show last log entry
  if (state.actionLog.length > 0) {
    const lastLog = state.actionLog[state.actionLog.length - 1];
    // Already logged in engine, don't duplicate
  }
});

console.log('Starting game engine...\n');
engine.start();

// Let it run for 2 minutes to see quest completion
setTimeout(() => {
  console.log('\n⏰ Test time limit reached');
  engine.stop();
  
  const finalState = engine.getState();
  console.log('\n=== FINAL STATE ===');
  console.log(`Character: ${finalState.character.name} (Level ${finalState.character.level})`);
  console.log(`Position: (${finalState.character.position.x.toFixed(1)}, ${finalState.character.position.y.toFixed(1)})`);
  console.log(`Current State: ${finalState.currentState}`);
  
  if (finalState.currentQuest) {
    console.log(`\nActive Quest: ${finalState.currentQuest.questName}`);
    console.log(`Status: ${finalState.currentQuest.status}`);
    finalState.currentQuest.objectives.forEach((obj, idx) => {
      const status = obj.completed ? '✓' : '⏳';
      console.log(`  ${status} [${idx + 1}] ${obj.current}/${obj.required} ${obj.creatureName || 'Items'}`);
    });
  }
  
  console.log(`\nTotal actions logged: ${finalState.actionLog.length}`);
  
  process.exit(0);
}, 120000); // 2 minutes

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⏸️  Interrupted by user');
  engine.stop();
  process.exit(0);
});
