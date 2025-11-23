/**
 * Test: Unique Quest Item Drop Limit
 * 
 * Tests that unique quest items (100% drop, only need 1) stop dropping
 * after the first one is collected.
 */

import { getLootSystem } from '../src/game/LootSystem';
import { getDatabase } from '../src/data/sqlite_loader';

const lootSystem = getLootSystem();
const db = getDatabase();

console.log('\n=== Unique Quest Item Limit Test ===\n');

// Quest 6: Bounty on Garrick Padfoot
// Requires: Garrick's Head (item 182) - ONLY 1 NEEDED
// Drops from: Garrick Padfoot (creature 103)

const questId = 6;
const creatureId = 103;
const questItemId = 182; // Garrick's Head

console.log('Quest: Bounty on Garrick Padfoot');
console.log('Required: 1x Garrick\'s Head (100% drop)\n');

console.log('Phase 1: First kill (should drop)');
const itemCounts = new Map<number, number>();
const loot1 = lootSystem.generateMobLoot(creatureId, 5, [questId], itemCounts);

let garricksHeadCount = 0;
for (const drop of loot1.items) {
  if (drop.item.entry === questItemId) {
    garricksHeadCount++;
    itemCounts.set(questItemId, garricksHeadCount);
    console.log(`  ✓ Garrick's Head dropped! (${garricksHeadCount}/1)`);
  }
}

console.log('\nPhase 2: Subsequent kills (should NOT drop)');
console.log(`Current inventory: ${garricksHeadCount}x Garrick's Head\n`);

let extraDrops = 0;
for (let i = 0; i < 10; i++) {
  const loot = lootSystem.generateMobLoot(creatureId, 5, [questId], itemCounts);
  
  for (const drop of loot.items) {
    if (drop.item.entry === questItemId) {
      extraDrops++;
      console.log(`  ⚠️ Kill ${i + 1}: Garrick's Head still dropped!`);
    }
  }
}

console.log(`\n📊 Results:`);
console.log(`  First kill dropped: ${garricksHeadCount > 0 ? 'Yes ✅' : 'No ❌'}`);
console.log(`  Extra drops (10 kills): ${extraDrops}`);
console.log(`  Final inventory: ${itemCounts.get(questItemId) || 0}x Garrick's Head`);

if (garricksHeadCount === 1 && extraDrops === 0) {
  console.log('\n✅ TEST PASSED!');
  console.log('  ✓ Quest item dropped on first kill');
  console.log('  ✓ No additional drops after reaching 1/1');
} else {
  console.log('\n❌ TEST FAILED!');
  if (garricksHeadCount !== 1) {
    console.log(`  ✗ Expected 1 drop on first kill, got ${garricksHeadCount}`);
  }
  if (extraDrops > 0) {
    console.log(`  ✗ ${extraDrops} extra drops when already at 1/1`);
  }
}

console.log();
