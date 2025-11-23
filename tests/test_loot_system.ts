/**
 * Test Loot and Inventory System
 */

import { getLootSystem } from '../src/game/LootSystem';
import { getInventorySystem } from '../src/game/InventorySystem';
import { getDatabase } from '../src/data/sqlite_loader';

const lootSystem = getLootSystem();
const inventorySystem = getInventorySystem();
const db = getDatabase();

console.log('\n=== Loot & Inventory System Tests ===\n');

// Test 1: Generate mob loot
console.log('Test 1: Generate Mob Loot (Kobold Vermin - ID 80)');
const koboldLoot = lootSystem.generateMobLoot(80, 1);
console.log(`Gold: ${inventorySystem.formatGold(koboldLoot.gold)}`);
console.log(`Items dropped: ${koboldLoot.items.length}`);
if (koboldLoot.items.length > 0) {
  for (const drop of koboldLoot.items) {
    console.log(`  - ${drop.item.name} x${drop.count} (Quality: ${drop.item.Quality})`);
  }
} else {
  console.log('  (No items dropped)');
}

// Test 2: Create inventory and add loot
console.log('\n\nTest 2: Inventory Management');
const inventory = inventorySystem.createInventory();
console.log('Created empty inventory');

// Add some loot
const testLoot = lootSystem.generateMobLoot(80, 1);
inventorySystem.addLoot(inventory, testLoot.items);
inventorySystem.addGold(inventory, testLoot.gold);

const summary = inventorySystem.getInventorySummary(inventory);
console.log(`Inventory: ${summary.totalItems} items (${summary.uniqueItems} unique)`);
console.log(`Gold: ${summary.gold}`);
console.log(`Equipment slots filled: ${summary.equippedCount}/17`);

// Test 3: Quest rewards
console.log('\n\nTest 3: Quest Rewards (Quest 783 - A Threat Within)');
const quest783 = db.getQuest(783);
if (quest783) {
  console.log(`Quest: ${quest783.Title}`);
  console.log(`XP Reward: ${quest783.RewXP}`);
  
  const goldReward = lootSystem.getQuestGoldReward(783);
  console.log(`Gold Reward: ${inventorySystem.formatGold(goldReward)}`);
  
  const itemRewards = lootSystem.getQuestRewards(783);
  console.log(`Item Rewards: ${itemRewards.length}`);
  for (const reward of itemRewards) {
    console.log(`  - ${reward.item.name} x${reward.count}`);
  }
}

// Test 4: Item stats
console.log('\n\nTest 4: Item Stats (Worn Leather Vest - ID 3597)');
const leatherVest = db.getItem(3597);
if (leatherVest) {
  console.log(`Name: ${leatherVest.name}`);
  console.log(`Quality: ${leatherVest.Quality}`);
  console.log(`Item Level: ${leatherVest.ItemLevel}`);
  console.log(`Required Level: ${leatherVest.RequiredLevel}`);
  console.log(`Armor Type: ${lootSystem.getArmorTypeName(leatherVest)}`);
  console.log(`Armor: ${leatherVest.armor}`);
  
  const stats = lootSystem.getItemStats(leatherVest);
  console.log(`Stats:`);
  for (const stat of stats) {
    console.log(`  ${stat.name}: +${stat.value}`);
  }
}

// Test 5: Equipment system
console.log('\n\nTest 5: Equip Items');
const testInventory = inventorySystem.createInventory();

// Add a leather vest to inventory
if (leatherVest) {
  inventorySystem.addItem(testInventory, leatherVest, 1);
  console.log(`Added ${leatherVest.name} to inventory`);
  
  // Try to equip it
  const result = inventorySystem.equipItem(
    testInventory,
    leatherVest.entry,
    leatherVest,
    'Warrior',
    1
  );
  
  if (result.success) {
    console.log(`✓ Successfully equipped ${leatherVest.name}`);
    
    // Check equipment stats
    const equipStats = inventorySystem.calculateEquipmentStats(
      testInventory,
      (id) => db.getItem(id)
    );
    console.log(`Equipment Stats:`);
    console.log(`  Armor: ${equipStats.armor}`);
    console.log(`  Strength: ${equipStats.strength}`);
    console.log(`  Agility: ${equipStats.agility}`);
    console.log(`  Stamina: ${equipStats.stamina}`);
  } else {
    console.log(`✗ Failed to equip: ${result.error}`);
  }
}

// Test 6: Multiple mob kills simulation
console.log('\n\nTest 6: Kill 10 Kobolds and Collect Loot');
const killingInventory = inventorySystem.createInventory();
let totalGold = 0;
let totalItems = 0;

for (let i = 1; i <= 10; i++) {
  const loot = lootSystem.generateMobLoot(80, 1);
  inventorySystem.addLoot(killingInventory, loot.items);
  inventorySystem.addGold(killingInventory, loot.gold);
  totalGold += loot.gold;
  totalItems += loot.items.length;
}

console.log(`After 10 kills:`);
const finalSummary = inventorySystem.getInventorySummary(killingInventory);
console.log(`  Total gold: ${finalSummary.gold} (avg: ${Math.floor(totalGold / 10)}c per kill)`);
console.log(`  Total items: ${finalSummary.totalItems} (avg: ${(totalItems / 10).toFixed(1)} per kill)`);
console.log(`  Unique items: ${finalSummary.uniqueItems}`);

// Show inventory contents
console.log(`\nInventory contents:`);
for (const item of killingInventory.bags) {
  const itemData = db.getItem(item.itemId);
  if (itemData) {
    console.log(`  - ${itemData.name} x${item.count}`);
  }
}

console.log('\n=== All Tests Complete ===\n');
