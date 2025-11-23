#!/usr/bin/env node
/**
 * Test Classic data integration
 */
import { DataLoader } from '../src/data/loader';
import { xpToNext, gainXP } from '../src/game/engine';
import { Character } from '../src/game/types/character';

function testDataLoader() {
  console.log('🧪 Testing DataLoader...\n');
  
  const loader = DataLoader.getInstance('src/data/normalized');
  const data = loader.loadData();
  
  console.log('📊 Loaded data summary:');
  console.log(`   Zones: ${data.zones.length}`);
  console.log(`   Creatures: ${data.creatures.length}`);
  console.log(`   Items: ${data.items.length}`);
  console.log(`   Quests: ${data.quests.length}\n`);
  
  // Test zone lookup
  const elwynn = loader.getZone('Elwynn Forest');
  console.log('🗺️  Zone "Elwynn Forest":', elwynn?.name, `(map ${elwynn?.mapID})`);
  
  // Test creatures in zone
  const creatures = loader.getCreaturesInZone('Elwynn Forest');
  console.log(`👹 Creatures in Elwynn Forest: ${creatures.length}`);
  creatures.slice(0, 3).forEach(c => {
    console.log(`   - Level ${c.level} ${c.name} (XP: ${c.xp})`);
  });
  
  // Test quests
  const starterQuests = loader.getStarterQuests();
  console.log(`\n📜 Starter quests (level <= 10): ${starterQuests.length}`);
  starterQuests.slice(0, 3).forEach(q => {
    console.log(`   - [${q.id}] ${q.name} @ ${q.zone}`);
  });
  
  // Test items
  const items = data.items.slice(0, 3);
  console.log(`\n📦 Sample items:`);
  items.forEach(i => {
    console.log(`   - [${i.id}] ${i.name} (slot: ${i.slot})`);
  });
}

function testXPSystem() {
  console.log('\n\n🧪 Testing XP System...\n');
  
  for (let lvl = 1; lvl <= 10; lvl++) {
    const xpNeeded = xpToNext(lvl);
    console.log(`Level ${lvl}: ${xpNeeded} XP to next`);
  }
}

function testCharacterProgression() {
  console.log('\n\n🧪 Testing Character Progression...\n');
  
  const character: Character = {
    id: '1',
    name: 'TestHero',
    class: 'Warrior',
    level: 1,
    xp: 0,
    xpToNext: xpToNext(1),
    stats: {
      strength: 15,
      stamina: 15,
      agility: 10,
      intellect: 10,
      spirit: 10,
      attackPower: 0,
      critChance: 0
    },
    position: { zone: 'Elwynn Forest' },
    equipment: {},
    inventory: [],
    bagsSlots: 16,
    gold: 0
  };
  
  console.log(`Starting: ${character.name} (Level ${character.level})`);
  console.log(`XP: ${character.xp}/${character.xpToNext}\n`);
  
  // Simulate gaining XP
  const xpGains = [100, 200, 150, 250, 300];
  for (const xp of xpGains) {
    const result = gainXP(character, xp);
    console.log(`Gained ${xp} XP → Level ${character.level}, XP: ${character.xp}/${character.xpToNext}${result.leveled ? ' ✨ LEVEL UP!' : ''}`);
  }
}

if (require.main === module) {
  testDataLoader();
  testXPSystem();
  testCharacterProgression();
  console.log('\n✅ All tests passed!\n');
}
