/**
 * Test: Loot Statistics over many kills
 */

import { getLootSystem } from '../src/game/LootSystem';

const lootSystem = getLootSystem();

console.log('\n=== Loot Statistics Test (100 Kobold Kills) ===\n');

const koboldId = 80; // Kobold Vermin
const playerLevel = 5;
const killCount = 100;

let totalGold = 0;
let totalItems = 0;
const itemCounts: Record<string, number> = {};
const qualityCounts: Record<number, number> = {};

for (let i = 0; i < killCount; i++) {
  const loot = lootSystem.generateMobLoot(koboldId, playerLevel);
  
  totalGold += loot.gold;
  totalItems += loot.items.length;
  
  for (const drop of loot.items) {
    itemCounts[drop.item.name] = (itemCounts[drop.item.name] || 0) + drop.count;
    qualityCounts[drop.item.Quality] = (qualityCounts[drop.item.Quality] || 0) + 1;
  }
}

console.log(`Total Kills: ${killCount}`);
console.log(`Total Gold: ${totalGold}c (avg: ${(totalGold / killCount).toFixed(1)}c per kill)`);
console.log(`Total Items: ${totalItems} (avg: ${(totalItems / killCount).toFixed(2)} per kill)`);
console.log(`Drop Rate: ${((totalItems / killCount) * 100).toFixed(1)}%`);

console.log('\n📊 Quality Distribution:');
const qualityNames = ['Gray (Poor)', 'White (Common)', 'Green (Uncommon)', 'Blue (Rare)', 'Purple (Epic)'];
for (const [quality, count] of Object.entries(qualityCounts)) {
  const percentage = ((count / totalItems) * 100).toFixed(1);
  console.log(`  ${qualityNames[parseInt(quality)]}: ${count} (${percentage}%)`);
}

console.log('\n🎁 Top 15 Items Looted:');
const sortedItems = Object.entries(itemCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

for (const [itemName, count] of sortedItems) {
  const percentage = ((count / totalItems) * 100).toFixed(1);
  console.log(`  ${itemName}: ${count} (${percentage}%)`);
}

console.log('\n=== Test Complete ===\n');
