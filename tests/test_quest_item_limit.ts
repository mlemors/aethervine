/**
 * Test Quest Item Drop Limit
 * 
 * Verifies that quest items stop dropping once the player has collected
 * enough for the quest objective.
 */

import { LootSystem } from '../src/game/LootSystem';
import { InventorySystem } from '../src/game/InventorySystem';
import { getDatabase } from '../src/data/sqlite_loader';

async function testQuestItemLimit() {
  console.log('=== Quest Item Drop Limit Test ===\n');

  const db = await getDatabase();
  const lootSystem = new LootSystem();
  const inventorySystem = new InventorySystem();

  // Test Quest: 11 - Riverpaw Gnoll Bounty
  // Requires: 8x Painted Gnoll Armband (item 782)
  // Mob: Riverpaw Runt (creature 97)

  console.log('📋 Test: Quest items should stop dropping when player has enough\n');

  const inventory = inventorySystem.createInventory();
  const activeQuestIds = [11];
  const requiredCount = 8;
  let totalKills = 0;
  let totalDrops = 0;

  console.log('Phase 1: Collecting items (0 -> 8)');
  
  // Kill until we have 8 armbands
  while (totalKills < 100) {
    totalKills++;
    
    const itemCounts = inventorySystem.getItemCounts(inventory);
    const currentCount = itemCounts.get(782) || 0;

    // Generate loot
    const loot = lootSystem.generateMobLoot(97, 1, activeQuestIds, itemCounts);
    
    // Add items to inventory
    for (const drop of loot.items) {
      inventorySystem.addItem(inventory, drop.item, drop.count);
      
      if (drop.item.entry === 782) {
        totalDrops += drop.count;
        console.log(`  Kill ${totalKills}: 🎯 Armband dropped! Inventory: ${currentCount + drop.count}/${requiredCount}`);
      }
    }

    // Check if we have enough
    const newCounts = inventorySystem.getItemCounts(inventory);
    const newCount = newCounts.get(782) || 0;
    
    if (newCount >= requiredCount) {
      console.log(`\n✅ Collected ${requiredCount} armbands after ${totalKills} kills`);
      break;
    }
  }

  console.log('\nPhase 2: Verify items stop dropping (kills 51-100)');
  
  const killsBeforeLimit = totalKills;
  let dropsAfterLimit = 0;
  const extraKills = 50;

  for (let i = 0; i < extraKills; i++) {
    totalKills++;
    
    const itemCounts = inventorySystem.getItemCounts(inventory);
    const currentCount = itemCounts.get(782) || 0;

    // Generate loot - should NOT drop quest items anymore
    const loot = lootSystem.generateMobLoot(97, 1, activeQuestIds, itemCounts);
    
    // Check for quest items
    for (const drop of loot.items) {
      if (drop.item.entry === 782) {
        dropsAfterLimit += drop.count;
        console.log(`  ⚠️ Kill ${totalKills}: Armband still dropped! (${currentCount}/${requiredCount})`);
      }
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  Total kills: ${totalKills}`);
  console.log(`  Kills to collect 8 items: ${killsBeforeLimit}`);
  console.log(`  Extra kills after limit: ${extraKills}`);
  console.log(`  Quest items dropped after limit: ${dropsAfterLimit}`);

  const finalCounts = inventorySystem.getItemCounts(inventory);
  const finalCount = finalCounts.get(782) || 0;
  console.log(`  Final inventory count: ${finalCount}`);

  if (dropsAfterLimit === 0 && finalCount === requiredCount) {
    console.log('\n✅ TEST PASSED!');
    console.log('  ✓ Quest items stopped dropping at exactly 8/8');
    console.log('  ✓ No extra items dropped after limit reached');
  } else {
    console.log('\n❌ TEST FAILED!');
    if (dropsAfterLimit > 0) {
      console.log(`  ✗ ${dropsAfterLimit} items dropped after limit reached`);
    }
    if (finalCount !== requiredCount) {
      console.log(`  ✗ Final count ${finalCount} doesn't match required ${requiredCount}`);
    }
  }

  // Test 2: Without quest active - should never drop
  console.log('\n\n📋 Test 2: Items should not drop without quest active\n');
  
  const inventory2 = inventorySystem.createInventory();
  let dropsWithoutQuest = 0;

  for (let i = 0; i < 20; i++) {
    const itemCounts = inventorySystem.getItemCounts(inventory2);
    const loot = lootSystem.generateMobLoot(97, 1, [], itemCounts); // No active quests
    
    for (const drop of loot.items) {
      if (drop.item.entry === 782) {
        dropsWithoutQuest++;
      }
    }
  }

  if (dropsWithoutQuest === 0) {
    console.log('✅ TEST PASSED! No quest items dropped without active quest');
  } else {
    console.log(`❌ TEST FAILED! ${dropsWithoutQuest} quest items dropped without quest`);
  }
}

testQuestItemLimit().catch(console.error);
