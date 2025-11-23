/**
 * Test: Quest Item Drops
 */

import { getLootSystem } from '../src/game/LootSystem';
import { getDatabase } from '../src/data/sqlite_loader';

const lootSystem = getLootSystem();
const db = getDatabase();

console.log('\n=== Quest Item Drop Test ===\n');

// Quest 6: Bounty on Garrick Padfoot
// Requires: Garrick's Head (item 182)
// Drops from: Garrick Padfoot (creature 103)

const questId = 6;
const creatureId = 103;
const quest = db.getQuest(questId);

if (quest) {
  console.log(`Quest: ${quest.Title}`);
  console.log(`Required Item: ${quest.ReqItemId1} (${quest.ReqItemCount1}x)`);
  
  const requiredItem = db.getItem(quest.ReqItemId1);
  if (requiredItem) {
    console.log(`Item Name: ${requiredItem.name}\n`);
  }
}

// Check loot table
console.log('Loot Table for Garrick Padfoot:');
const lootTable = db.getLootTable(creatureId);
for (const entry of lootTable) {
  const item = db.getItem(entry.item);
  const isQuestItem = entry.ChanceOrQuestChance < 0;
  const chance = Math.abs(entry.ChanceOrQuestChance);
  console.log(`  - ${item?.name || 'Unknown'} (${chance}% ${isQuestItem ? '- QUEST ITEM' : ''})`);
}

console.log('\n--- Test 1: Kill WITHOUT Quest Active ---');
let drops = 0;
for (let i = 0; i < 10; i++) {
  const loot = lootSystem.generateMobLoot(creatureId, 5, []); // No active quests
  if (loot.items.length > 0) {
    drops++;
    for (const drop of loot.items) {
      console.log(`  Kill ${i + 1}: ${drop.item.name} (Quest: ${drop.isQuestItem})`);
    }
  }
}
console.log(`Total drops: ${drops}/10 kills`);

console.log('\n--- Test 2: Kill WITH Quest Active (Quest 6) ---');
let questItemDrops = 0;
for (let i = 0; i < 10; i++) {
  const loot = lootSystem.generateMobLoot(creatureId, 5, [questId]); // Quest 6 active
  if (loot.items.length > 0) {
    for (const drop of loot.items) {
      console.log(`  Kill ${i + 1}: ${drop.item.name} ${drop.isQuestItem ? '🎯 (QUEST ITEM!)' : ''}`);
      if (drop.isQuestItem) questItemDrops++;
    }
  }
}
console.log(`Quest items dropped: ${questItemDrops}/10 kills`);

console.log('\n--- Test 3: Different Quest - Should NOT Drop ---');
const wrongQuestId = 7; // Different quest
let wrongQuestDrops = 0;
for (let i = 0; i < 10; i++) {
  const loot = lootSystem.generateMobLoot(creatureId, 5, [wrongQuestId]);
  if (loot.items.length > 0) {
    for (const drop of loot.items) {
      if (drop.isQuestItem) {
        wrongQuestDrops++;
        console.log(`  Kill ${i + 1}: UNEXPECTED - ${drop.item.name}`);
      }
    }
  }
}
console.log(`Quest items (should be 0): ${wrongQuestDrops}/10 kills`);

console.log('\n--- Test 4: Riverpaw Gnoll Bounty (Quest 11) ---');
// Quest 11: Riverpaw Gnoll Bounty
// Requires: Painted Gnoll Armband (item 782) - 8 required
// Drops from: Riverpaw Runt (creature 97) and Riverpaw Outrunner (478)

const quest11 = db.getQuest(11);
const runtId = 97; // Riverpaw Runt

if (quest11) {
  console.log(`Quest: ${quest11.Title}`);
  console.log(`Required: ${quest11.ReqItemCount1}x ${db.getItem(quest11.ReqItemId1)?.name}`);
  console.log(`Killing: Riverpaw Runt\n`);

  let armbandCount = 0;
  const killsNeeded = [];
  
  for (let i = 0; i < 100; i++) {
    const loot = lootSystem.generateMobLoot(runtId, 5, [11]);
    for (const drop of loot.items) {
      if (drop.isQuestItem && drop.item.entry === 782) {
        armbandCount += drop.count;
        killsNeeded.push(i + 1);
      }
    }
    
    if (armbandCount >= 8) {
      console.log(`✓ Collected 8/8 armbands after ${i + 1} kills`);
      console.log(`Drops on kills: ${killsNeeded.join(', ')}`);
      console.log(`Drop rate: ${((killsNeeded.length / (i + 1)) * 100).toFixed(1)}%`);
      break;
    }
  }
  
  if (armbandCount < 8) {
    console.log(`Only collected ${armbandCount}/8 after 100 kills (bad luck!)`);
  }
}

console.log('\n=== Test Complete ===\n');
