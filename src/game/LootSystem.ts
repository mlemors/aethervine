/**
 * Loot System - Handles mob loot generation and quest rewards
 */

import { getDatabase, type Item } from '../data/database';

export interface LootDrop {
  item: Item;
  count: number;
  isQuestItem: boolean;
}

export interface LootResult {
  items: LootDrop[];
  gold: number;
}

export class LootSystem {
  private db = getDatabase();

  /**
   * Generate loot from a killed mob
   * @param creatureId The mob that was killed
   * @param playerLevel Player's current level
   * @param activeQuestIds List of quest IDs the player currently has active
   * @param itemCounts Current inventory item counts (optional, for quest item limits)
   */
  generateMobLoot(
    creatureId: number, 
    playerLevel: number,
    activeQuestIds: number[] = [],
    itemCounts: Map<number, number> = new Map()
  ): LootResult {
    const lootTable = this.db.getLootTable(creatureId);
    const drops: LootDrop[] = [];
    let gold = 0;

    // Generate gold (simple formula based on creature level)
    const creatureTemplate = this.db.getCreatureTemplate(creatureId);
    if (creatureTemplate) {
      const level = creatureTemplate.maxlevel || creatureTemplate.minlevel || 1;
      // Random gold: 1-5 copper per level
      gold = Math.floor(Math.random() * (level * 5)) + level;
    }

    // Process loot table
    for (const lootEntry of lootTable) {
      // Handle reference loot (negative mincountOrRef)
      if (lootEntry.mincountOrRef < 0) {
        const referenceId = Math.abs(lootEntry.mincountOrRef);
        const referenceChance = Math.abs(lootEntry.ChanceOrQuestChance);
        const roll = Math.random() * 100;

        // Check if reference loot drops
        if (roll <= referenceChance) {
          const referenceDrop = this.generateReferenceLoot(referenceId);
          if (referenceDrop) {
            drops.push(referenceDrop);
          }
        }
        continue;
      }

      // Check if it's a quest item (negative ChanceOrQuestChance)
      const isQuestItem = lootEntry.ChanceOrQuestChance < 0;

      // If it's a quest item, check if player needs it
      if (isQuestItem) {
        const playerNeedsItem = this.playerNeedsQuestItem(
          lootEntry.item,
          activeQuestIds,
          itemCounts
        );
        
        if (!playerNeedsItem) {
          continue; // Skip this quest item
        }
      }

      // Determine if item drops based on chance
      const chance = Math.abs(lootEntry.ChanceOrQuestChance);
      const roll = Math.random() * 100;

      if (roll <= chance) {
        const item = this.db.getItem(lootEntry.item);
        if (!item) continue;

        // Determine quantity
        const count = Math.floor(
          Math.random() * (lootEntry.maxcount - lootEntry.mincountOrRef + 1)
        ) + lootEntry.mincountOrRef;

        drops.push({
          item,
          count,
          isQuestItem,
        });
      }
    }

    return {
      items: drops,
      gold,
    };
  }

  /**
   * Check if player needs this quest item for any active quest
   * @param itemId The item to check
   * @param activeQuestIds List of active quest IDs
   * @param itemCounts Current inventory counts (to check if player has enough already)
   */
  private playerNeedsQuestItem(
    itemId: number, 
    activeQuestIds: number[], 
    itemCounts: Map<number, number> = new Map()
  ): boolean {
    if (activeQuestIds.length === 0) return false;

    // Check each active quest to see if it requires this item
    for (const questId of activeQuestIds) {
      const quest = this.db.getQuest(questId);
      if (!quest) continue;

      // Check all 6 possible item requirements
      for (let i = 1; i <= 6; i++) {
        const reqItemId = quest[`ReqItemId${i}`];
        const reqCount = quest[`ReqItemCount${i}`];
        
        if (reqItemId === itemId) {
          // Check if player already has enough of this item
          const currentCount = itemCounts.get(itemId) || 0;
          if (currentCount < reqCount) {
            return true; // Still needs more of this item
          }
        }
      }
    }

    return false; // Either not required or already has enough
  }

  /**
   * Generate one random item from a reference loot table
   */
  private generateReferenceLoot(referenceId: number): LootDrop | null {
    const refLootTable = this.db.getReferenceLootTable(referenceId);
    if (refLootTable.length === 0) return null;

    // Pick a random item from the reference table
    const randomEntry = refLootTable[Math.floor(Math.random() * refLootTable.length)];
    const item = this.db.getItem(randomEntry.item);
    if (!item) return null;

    // Determine quantity
    const count = Math.floor(
      Math.random() * (randomEntry.maxcount - randomEntry.mincountOrRef + 1)
    ) + randomEntry.mincountOrRef;

    return {
      item,
      count,
      isQuestItem: false,
    };
  }

  /**
   * Get quest reward items
   */
  getQuestRewards(questId: number): LootDrop[] {
    const quest = this.db.getQuest(questId);
    if (!quest) return [];

    const rewards: LootDrop[] = [];

    // Reward items (fixed rewards)
    for (let i = 1; i <= 4; i++) {
      const itemId = quest[`RewItemId${i}`];
      const count = quest[`RewItemCount${i}`];

      if (itemId && count > 0) {
        const item = this.db.getItem(itemId);
        if (item) {
          rewards.push({
            item,
            count,
            isQuestItem: false,
          });
        }
      }
    }

    // Choice rewards (player chooses one)
    for (let i = 1; i <= 6; i++) {
      const itemId = quest[`RewChoiceItemId${i}`];
      const count = quest[`RewChoiceItemCount${i}`];

      if (itemId && count > 0) {
        const item = this.db.getItem(itemId);
        if (item) {
          rewards.push({
            item,
            count,
            isQuestItem: false,
          });
        }
      }
    }

    return rewards;
  }

  /**
   * Get gold reward from quest
   */
  getQuestGoldReward(questId: number): number {
    const quest = this.db.getQuest(questId);
    if (!quest) return 0;

    return quest.RewOrReqMoney || 0;
  }

  /**
   * Parse item stats
   */
  getItemStats(item: Item): Array<{ name: string; value: number }> {
    const stats: Array<{ name: string; value: number }> = [];

    // Armor
    if (item.armor > 0) {
      stats.push({ name: 'Armor', value: item.armor });
    }

    // Primary stats
    for (let i = 1; i <= 10; i++) {
      const statType = item[`stat_type${i}` as keyof Item] as number;
      const statValue = item[`stat_value${i}` as keyof Item] as number;

      if (statType > 0 && statValue !== 0) {
        const statName = this.getStatName(statType);
        stats.push({ name: statName, value: statValue });
      }
    }

    return stats;
  }

  /**
   * Get stat name from stat type ID
   */
  private getStatName(statType: number): string {
    const statNames: Record<number, string> = {
      0: 'Mana',
      1: 'Health',
      3: 'Agility',
      4: 'Strength',
      5: 'Intellect',
      6: 'Spirit',
      7: 'Stamina',
      12: 'Defense',
      13: 'Dodge',
      14: 'Parry',
      15: 'Block',
      16: 'Melee Hit',
      17: 'Ranged Hit',
      18: 'Spell Hit',
      19: 'Melee Crit',
      20: 'Ranged Crit',
      21: 'Spell Crit',
      38: 'Attack Power',
      39: 'Ranged Attack Power',
      45: 'Spell Power',
    };

    return statNames[statType] || `Unknown Stat ${statType}`;
  }

  /**
   * Check if player can use item (class/level restrictions)
   */
  canEquipItem(item: Item, playerClass: string, playerLevel: number): {
    canEquip: boolean;
    reason?: string;
  } {
    // Check level requirement
    if (item.RequiredLevel > playerLevel) {
      return {
        canEquip: false,
        reason: `Requires level ${item.RequiredLevel}`,
      };
    }

    // Check class restriction
    if (item.AllowableClass !== -1) {
      const classIds: Record<string, number> = {
        'Warrior': 1,
        'Paladin': 2,
        'Hunter': 4,
        'Rogue': 8,
        'Priest': 16,
        'Shaman': 64,
        'Mage': 128,
        'Warlock': 256,
        'Druid': 1024,
      };

      const classId = classIds[playerClass] || 0;
      if (!(item.AllowableClass & classId)) {
        return {
          canEquip: false,
          reason: 'Wrong class',
        };
      }
    }

    return { canEquip: true };
  }

  /**
   * Get armor type name
   */
  getArmorTypeName(item: Item): string {
    if (item.class !== 4) return ''; // 4 = Armor class

    const armorTypes: Record<number, string> = {
      0: 'Misc',
      1: 'Cloth',
      2: 'Leather',
      3: 'Mail',
      4: 'Plate',
      6: 'Shield',
    };

    return armorTypes[item.subclass] || 'Unknown';
  }
}

/**
 * Singleton Instance
 */
let lootSystemInstance: LootSystem | null = null;

export function getLootSystem(): LootSystem {
  if (!lootSystemInstance) {
    lootSystemInstance = new LootSystem();
  }
  return lootSystemInstance;
}
