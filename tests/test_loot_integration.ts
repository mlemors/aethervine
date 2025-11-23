/**
 * Test: GameEngine with Loot System Integration
 */

import { GameEngine, type Character } from '../src/game/GameEngine';
import type { Position } from '../src/game/MovementSystem';

console.log('\n=== GameEngine + Loot Integration Test ===\n');

// Create test character
const testCharacter: Character = {
  name: 'Lootmaster',
  race: 'Human',
  class: 'Warrior',
  level: 5,
  experience: 0,
  experienceToNext: 2800,
  position: { x: -8949.95, y: -132.493, map: 0 },
};

const engine = new GameEngine(testCharacter);
const state = (engine as any).state;

console.log(`Character: ${state.character.name} (Level ${state.character.level})`);
console.log(`Starting Gold: ${(engine as any).inventorySystem.formatGold(state.inventory.gold)}`);
console.log(`Starting Items: ${state.inventory.bags.length}\n`);

// Simulate finding and killing a mob
console.log('🗡️  Simulating mob kill with loot...\n');

const mobId = 80; // Kobold Vermin
state.currentMobId = mobId;

// Generate loot
const lootResult = (engine as any).lootSystem.generateMobLoot(mobId, state.character.level);

// Add gold
if (lootResult.gold > 0) {
  (engine as any).inventorySystem.addGold(state.inventory, lootResult.gold);
  console.log(`💰 Looted ${(engine as any).inventorySystem.formatGold(lootResult.gold)}`);
}

// Add items
if (lootResult.items.length > 0) {
  for (const drop of lootResult.items) {
    (engine as any).inventorySystem.addItem(state.inventory, drop.item, drop.count);
    const countStr = drop.count > 1 ? ` x${drop.count}` : '';
    console.log(`📦 Looted: ${drop.item.name}${countStr}`);
  }
} else {
  console.log('📦 No items dropped');
}

// Show final inventory
console.log(`\n📊 Inventory Summary:`);
const summary = (engine as any).inventorySystem.getInventorySummary(state.inventory);
console.log(`  Gold: ${summary.gold}`);
console.log(`  Items: ${summary.totalItems} (${summary.uniqueItems} unique)`);
console.log(`  Equipment: ${summary.equippedCount} pieces equipped`);

if (state.inventory.bags.length > 0) {
  console.log(`\n📦 Bag Contents:`);
  for (const item of state.inventory.bags) {
    const itemData = (engine as any).db.getItem(item.itemId);
    if (itemData) {
      console.log(`  - ${itemData.name} x${item.count}`);
    }
  }
}

// Test multiple kills
console.log(`\n\n🌾 Farming 20 Kobolds...\n`);
let totalGold = 0;
let totalItems = 0;

for (let i = 1; i <= 20; i++) {
  const loot = (engine as any).lootSystem.generateMobLoot(mobId, state.character.level);
  (engine as any).inventorySystem.addLoot(state.inventory, loot.items);
  (engine as any).inventorySystem.addGold(state.inventory, loot.gold);
  totalGold += loot.gold;
  totalItems += loot.items.length;
}

const finalSummary = (engine as any).inventorySystem.getInventorySummary(state.inventory);
console.log(`After 20 kills:`);
console.log(`  Total gold: ${finalSummary.gold} (avg: ${Math.floor(totalGold / 20)}c per kill)`);
console.log(`  Total items: ${finalSummary.totalItems} (avg: ${(totalItems / 20).toFixed(1)} per kill)`);
console.log(`  Unique items: ${finalSummary.uniqueItems}`);

// Show top 10 items by quantity
console.log(`\n📦 Top Items in Inventory:`);
const sortedItems = state.inventory.bags
  .map((item: any) => ({
    ...item,
    data: (engine as any).db.getItem(item.itemId)
  }))
  .filter((item: any) => item.data)
  .sort((a: any, b: any) => b.count - a.count)
  .slice(0, 10);

for (const item of sortedItems) {
  console.log(`  - ${item.data.name} x${item.count}`);
}

console.log('\n=== Test Complete ===\n');
