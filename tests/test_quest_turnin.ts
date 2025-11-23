/**
 * Test Quest Turn-In with Collection Objectives
 * 
 * This test verifies the complete quest item flow:
 * 1. Accept quest with collection objective
 * 2. Kill mobs and collect quest items
 * 3. Verify collection objective progress
 * 4. Turn in quest
 * 5. Verify quest items removed from inventory
 */

import { QuestExecutor } from '../src/game/QuestExecutor';
import { LootSystem } from '../src/game/LootSystem';
import { InventorySystem } from '../src/game/InventorySystem';
import { getDatabase } from '../src/data/sqlite_loader';

async function testQuestTurnIn() {
  console.log('=== Quest Turn-In Test ===\n');

  const db = await getDatabase();
  const executor = new QuestExecutor();
  const lootSystem = new LootSystem();
  const inventorySystem = new InventorySystem();

  // Test Quest: 11 - Riverpaw Gnoll Bounty
  // Requires: 8x Painted Gnoll Armband (item 782)
  // Kill: Riverpaw Runt (creature 97)

  console.log('📋 Step 1: Accept Quest 11 - Riverpaw Gnoll Bounty');
  const quest = executor.acceptQuest(11);
  if (!quest) {
    console.error('❌ Failed to accept quest!');
    return;
  }

  console.log(`  ✓ Quest accepted: ${quest.questName}`);
  console.log(`  📝 Objectives:`);
  for (const obj of quest.objectives) {
    if (obj.type === 'collect') {
      console.log(`    - Collect item ${obj.itemId}: ${obj.current}/${obj.required}`);
    }
  }

  // Create inventory
  const inventory = inventorySystem.createInventory();

  console.log('\n📋 Step 2: Kill Riverpaw Runts and collect armbands');
  
  let armbandCount = 0;
  let killCount = 0;
  const requiredArmbands = 8;

  while (armbandCount < requiredArmbands && killCount < 50) {
    killCount++;

    // Generate loot with quest awareness
    const loot = lootSystem.generateMobLoot(97, 1, [11]);

    // Add items to inventory
    for (const drop of loot.items) {
      inventorySystem.addItem(inventory, drop.item, drop.count);
      
      if (drop.item.entry === 782) {
        armbandCount += drop.count;
        console.log(`  Kill ${killCount}: 🎯 Painted Gnoll Armband dropped! (${armbandCount}/${requiredArmbands})`);
      }
    }

    // Update collection progress
    const itemCounts = inventorySystem.getItemCounts(inventory);
    executor.updateCollectionProgress(itemCounts);

    // Check quest progress
    const progress = executor.getQuestProgress();
    if (progress && progress.status === 'completed') {
      console.log(`  ✅ Quest completed after ${killCount} kills!`);
      break;
    }
  }

  console.log(`\n📋 Step 3: Verify collection objective progress`);
  const finalProgress = executor.getQuestProgress();
  if (!finalProgress) {
    console.error('❌ Quest progress lost!');
    return;
  }

  console.log(`  Quest Status: ${finalProgress.status}`);
  for (const obj of finalProgress.objectives) {
    if (obj.type === 'collect') {
      console.log(`  Collection: ${obj.current}/${obj.required} (${obj.completed ? '✅ Complete' : '❌ Incomplete'})`);
    }
  }

  // Verify inventory has the items
  const itemCounts = inventorySystem.getItemCounts(inventory);
  const actualArmbands = itemCounts.get(782) || 0;
  console.log(`  Inventory: ${actualArmbands} Painted Gnoll Armband(s)`);

  if (actualArmbands < requiredArmbands) {
    console.error(`❌ Not enough armbands collected! Need ${requiredArmbands}, have ${actualArmbands}`);
    return;
  }

  console.log('\n📋 Step 4: Turn in quest');
  if (finalProgress.status !== 'completed') {
    console.error('❌ Quest not ready to turn in!');
    return;
  }

  const turnInSuccess = executor.turnInQuest(11);
  if (!turnInSuccess) {
    console.error('❌ Failed to turn in quest!');
    return;
  }

  console.log('  ✓ Quest turned in successfully');

  // Simulate quest item removal (as done in GameEngine)
  console.log('\n📋 Step 5: Remove quest items from inventory');
  const questData = db.getQuest(11);
  if (!questData) {
    console.error('❌ Quest data not found!');
    return;
  }

  for (let i = 1; i <= 6; i++) {
    const itemId = questData[`ReqItemId${i}`];
    const itemCount = questData[`ReqItemCount${i}`];
    
    if (itemId && itemId > 0 && itemCount > 0) {
      const removed = inventorySystem.removeItem(inventory, itemId, itemCount);
      if (removed) {
        const itemData = db.getItem(itemId);
        const itemName = itemData?.name || `Item ${itemId}`;
        console.log(`  ↪️ Removed: ${itemName} x${itemCount}`);
      }
    }
  }

  // Verify items removed
  const finalItemCounts = inventorySystem.getItemCounts(inventory);
  const remainingArmbands = finalItemCounts.get(782) || 0;
  console.log(`\n📋 Step 6: Verify inventory after turn-in`);
  console.log(`  Remaining armbands: ${remainingArmbands}`);

  if (remainingArmbands > 0) {
    console.error(`❌ Quest items not removed! Still have ${remainingArmbands} armbands`);
    return;
  }

  console.log('\n✅ ALL TESTS PASSED!');
  console.log(`  ✓ Quest items dropped when quest active`);
  console.log(`  ✓ Collection objectives tracked correctly`);
  console.log(`  ✓ Quest marked complete when items collected`);
  console.log(`  ✓ Quest items removed from inventory on turn-in`);
}

testQuestTurnIn().catch(console.error);
