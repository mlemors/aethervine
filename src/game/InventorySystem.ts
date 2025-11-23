/**
 * Inventory and Equipment System
 */

import type { Item } from '../data/sqlite_loader';
import { getLootSystem, type LootDrop } from './LootSystem';

/**
 * Item instance in inventory/equipment
 */
export interface ItemInstance {
  itemId: number;
  count: number;
  slot?: number; // Bag slot or equipment slot
}

/**
 * Equipment Slots
 */
export interface EquipmentSlots {
  head: ItemInstance | null;
  neck: ItemInstance | null;
  shoulder: ItemInstance | null;
  back: ItemInstance | null;
  chest: ItemInstance | null;
  wrist: ItemInstance | null;
  hands: ItemInstance | null;
  waist: ItemInstance | null;
  legs: ItemInstance | null;
  feet: ItemInstance | null;
  finger1: ItemInstance | null;
  finger2: ItemInstance | null;
  trinket1: ItemInstance | null;
  trinket2: ItemInstance | null;
  mainHand: ItemInstance | null;
  offHand: ItemInstance | null;
  ranged: ItemInstance | null;
}

export interface InventoryState {
  bags: ItemInstance[]; // Unlimited for now
  equipment: EquipmentSlots;
  gold: number; // In copper (1 gold = 100 silver = 10000 copper)
}

// Inventory Slot enum constants
const InventorySlot = {
  NONE: 0,
  HEAD: 1,
  NECK: 2,
  SHOULDER: 3,
  BODY: 4,
  CHEST: 5,
  WAIST: 6,
  LEGS: 7,
  FEET: 8,
  WRIST: 9,
  HANDS: 10,
  FINGER: 11,
  TRINKET: 12,
  WEAPON: 13,
  SHIELD: 14,
  RANGED: 15,
  BACK: 16,
  TWO_HAND: 17,
  BAG: 18,
  TABARD: 19,
  ROBE: 20,
  WEAPON_MAINHAND: 21,
  WEAPON_OFFHAND: 22,
  HOLDABLE: 23,
  AMMO: 24,
  THROWN: 25,
  RANGED_RIGHT: 26,
} as const;

export class InventorySystem {
  private lootSystem = getLootSystem();

  /**
   * Create empty inventory
   */
  createInventory(): InventoryState {
    return {
      bags: [],
      equipment: {
        head: null,
        neck: null,
        shoulder: null,
        back: null,
        chest: null,
        wrist: null,
        hands: null,
        waist: null,
        legs: null,
        feet: null,
        finger1: null,
        finger2: null,
        trinket1: null,
        trinket2: null,
        mainHand: null,
        offHand: null,
        ranged: null,
      },
      gold: 0,
    };
  }

  /**
   * Add item to inventory
   */
  addItem(inventory: InventoryState, item: Item, count: number = 1): boolean {
    // Check if item is stackable and already exists
    const existingItem = inventory.bags.find(inv => inv.itemId === item.entry);
    
    if (existingItem && item.stackable > 1) {
      existingItem.count += count;
      return true;
    }

    // Add new item
    inventory.bags.push({
      itemId: item.entry,
      count,
    });

    return true;
  }

  /**
   * Add loot to inventory
   */
  addLoot(inventory: InventoryState, loot: LootDrop[]): void {
    for (const drop of loot) {
      this.addItem(inventory, drop.item, drop.count);
    }
  }

  /**
   * Add gold (in copper)
   */
  addGold(inventory: InventoryState, copper: number): void {
    inventory.gold += copper;
  }

  /**
   * Remove item from inventory
   */
  removeItem(inventory: InventoryState, itemId: number, count: number = 1): boolean {
    const item = inventory.bags.find(inv => inv.itemId === itemId);
    if (!item || item.count < count) return false;

    item.count -= count;
    if (item.count <= 0) {
      const index = inventory.bags.indexOf(item);
      inventory.bags.splice(index, 1);
    }

    return true;
  }

  /**
   * Equip item from inventory
   */
  equipItem(
    inventory: InventoryState,
    itemId: number,
    item: Item,
    playerClass: string,
    playerLevel: number
  ): { success: boolean; error?: string } {
    // Check if player can equip
    const canEquip = this.lootSystem.canEquipItem(item, playerClass, playerLevel);
    if (!canEquip.canEquip) {
      return { success: false, error: canEquip.reason };
    }

    // Determine equipment slot
    const slot = this.getEquipmentSlotForItem(item);
    if (!slot) {
      return { success: false, error: 'Item cannot be equipped' };
    }

    // Check if item is in inventory
    const invItem = inventory.bags.find(inv => inv.itemId === itemId);
    if (!invItem) {
      return { success: false, error: 'Item not in inventory' };
    }

    // Handle special cases (rings, trinkets - 2 slots)
    if (slot === 'finger1' || slot === 'finger2') {
      return this.equipRing(inventory, itemId);
    }
    if (slot === 'trinket1' || slot === 'trinket2') {
      return this.equipTrinket(inventory, itemId);
    }

    // Unequip current item in slot
    if (inventory.equipment[slot]) {
      const currentItem = inventory.equipment[slot]!;
      this.addItem(inventory, { entry: currentItem.itemId } as Item, currentItem.count);
    }

    // Equip new item
    inventory.equipment[slot] = {
      itemId,
      count: 1,
    };

    // Remove from bags
    this.removeItem(inventory, itemId, 1);

    return { success: true };
  }

  /**
   * Unequip item to inventory
   */
  unequipItem(inventory: InventoryState, slot: keyof EquipmentSlots): boolean {
    const item = inventory.equipment[slot];
    if (!item) return false;

    // Add to bags
    this.addItem(inventory, { entry: item.itemId } as Item, item.count);

    // Remove from equipment
    inventory.equipment[slot] = null;

    return true;
  }

  /**
   * Get equipment slot for item
   */
  private getEquipmentSlotForItem(item: Item): keyof EquipmentSlots | null {
    const slotMap: Record<number, keyof EquipmentSlots> = {
      [InventorySlot.HEAD]: 'head',
      [InventorySlot.NECK]: 'neck',
      [InventorySlot.SHOULDER]: 'shoulder',
      [InventorySlot.BACK]: 'back',
      [InventorySlot.CHEST]: 'chest',
      [InventorySlot.ROBE]: 'chest',
      [InventorySlot.WRIST]: 'wrist',
      [InventorySlot.HANDS]: 'hands',
      [InventorySlot.WAIST]: 'waist',
      [InventorySlot.LEGS]: 'legs',
      [InventorySlot.FEET]: 'feet',
      [InventorySlot.FINGER]: 'finger1',
      [InventorySlot.TRINKET]: 'trinket1',
      [InventorySlot.WEAPON]: 'mainHand',
      [InventorySlot.WEAPON_MAINHAND]: 'mainHand',
      [InventorySlot.WEAPON_OFFHAND]: 'offHand',
      [InventorySlot.SHIELD]: 'offHand',
      [InventorySlot.RANGED]: 'ranged',
      [InventorySlot.TWO_HAND]: 'mainHand',
    };

    return slotMap[item.InventoryType] || null;
  }

  /**
   * Equip ring (find empty slot or replace)
   */
  private equipRing(inventory: InventoryState, itemId: number): { success: boolean } {
    if (!inventory.equipment.finger1) {
      inventory.equipment.finger1 = { itemId, count: 1 };
    } else if (!inventory.equipment.finger2) {
      inventory.equipment.finger2 = { itemId, count: 1 };
    } else {
      // Replace finger1
      this.addItem(inventory, { entry: inventory.equipment.finger1.itemId } as Item, 1);
      inventory.equipment.finger1 = { itemId, count: 1 };
    }

    this.removeItem(inventory, itemId, 1);
    return { success: true };
  }

  /**
   * Equip trinket (find empty slot or replace)
   */
  private equipTrinket(inventory: InventoryState, itemId: number): { success: boolean } {
    if (!inventory.equipment.trinket1) {
      inventory.equipment.trinket1 = { itemId, count: 1 };
    } else if (!inventory.equipment.trinket2) {
      inventory.equipment.trinket2 = { itemId, count: 1 };
    } else {
      // Replace trinket1
      this.addItem(inventory, { entry: inventory.equipment.trinket1.itemId } as Item, 1);
      inventory.equipment.trinket1 = { itemId, count: 1 };
    }

    this.removeItem(inventory, itemId, 1);
    return { success: true };
  }

  /**
   * Calculate total stats from equipped items
   */
  calculateEquipmentStats(inventory: InventoryState, getItem: (id: number) => Item | null): {
    strength: number;
    agility: number;
    stamina: number;
    intellect: number;
    spirit: number;
    armor: number;
    attackPower: number;
    spellPower: number;
  } {
    const stats = {
      strength: 0,
      agility: 0,
      stamina: 0,
      intellect: 0,
      spirit: 0,
      armor: 0,
      attackPower: 0,
      spellPower: 0,
    };

    // Iterate through all equipment slots
    const slots: (keyof EquipmentSlots)[] = [
      'head', 'neck', 'shoulder', 'back', 'chest', 'wrist',
      'hands', 'waist', 'legs', 'feet', 'finger1', 'finger2',
      'trinket1', 'trinket2', 'mainHand', 'offHand', 'ranged',
    ];

    for (const slot of slots) {
      const equipped = inventory.equipment[slot];
      if (!equipped) continue;

      const item = getItem(equipped.itemId);
      if (!item) continue;

      // Add armor
      if (item.armor) stats.armor += item.armor;

      // Add stats
      for (let i = 1; i <= 10; i++) {
        const statType = item[`stat_type${i}` as keyof Item] as number;
        const statValue = item[`stat_value${i}` as keyof Item] as number;

        if (statType > 0 && statValue !== 0) {
          switch (statType) {
            case 4: stats.strength += statValue; break;
            case 3: stats.agility += statValue; break;
            case 7: stats.stamina += statValue; break;
            case 5: stats.intellect += statValue; break;
            case 6: stats.spirit += statValue; break;
            case 38: stats.attackPower += statValue; break;
            case 45: stats.spellPower += statValue; break;
          }
        }
      }
    }

    return stats;
  }

  /**
   * Format gold display (gold.silver.copper)
   */
  formatGold(copper: number): string {
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const copperLeft = copper % 100;

    if (gold > 0) {
      return `${gold}g ${silver}s ${copperLeft}c`;
    } else if (silver > 0) {
      return `${silver}s ${copperLeft}c`;
    } else {
      return `${copperLeft}c`;
    }
  }

  /**
   * Get inventory summary
   */
  getInventorySummary(inventory: InventoryState): {
    totalItems: number;
    uniqueItems: number;
    gold: string;
    equippedCount: number;
  } {
    const totalItems = inventory.bags.reduce((sum, item) => sum + item.count, 0);
    const uniqueItems = inventory.bags.length;
    
    let equippedCount = 0;
    const slots: (keyof EquipmentSlots)[] = [
      'head', 'neck', 'shoulder', 'back', 'chest', 'wrist',
      'hands', 'waist', 'legs', 'feet', 'finger1', 'finger2',
      'trinket1', 'trinket2', 'mainHand', 'offHand', 'ranged',
    ];
    
    for (const slot of slots) {
      if (inventory.equipment[slot]) equippedCount++;
    }

    return {
      totalItems,
      uniqueItems,
      gold: this.formatGold(inventory.gold),
      equippedCount,
    };
  }

  /**
   * Get item counts for quest tracking
   */
  getItemCounts(inventory: InventoryState): Map<number, number> {
    const counts = new Map<number, number>();
    
    for (const bagItem of inventory.bags) {
      counts.set(bagItem.itemId, bagItem.count);
    }
    
    return counts;
  }
}

/**
 * Singleton Instance
 */
let inventorySystemInstance: InventorySystem | null = null;

export function getInventorySystem(): InventorySystem {
  if (!inventorySystemInstance) {
    inventorySystemInstance = new InventorySystem();
  }
  return inventorySystemInstance;
}
