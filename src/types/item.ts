/**
 * Item and Equipment Types
 */

export type ItemRarity = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'trade-good' | 'currency';

export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'staff' | 'bow' | 'gun' | 'wand';

export type ArmorType = 'cloth' | 'leather' | 'mail' | 'plate';

export type EquipmentSlot =
  | 'head'
  | 'neck'
  | 'shoulder'
  | 'back'
  | 'chest'
  | 'wrist'
  | 'hands'
  | 'waist'
  | 'legs'
  | 'feet'
  | 'finger1'
  | 'finger2'
  | 'trinket1'
  | 'trinket2'
  | 'main-hand'
  | 'off-hand'
  | 'ranged';

export interface ItemStats {
  strength?: number;
  agility?: number;
  stamina?: number;
  intellect?: number;
  spirit?: number;
  armor?: number;
  minDamage?: number;
  maxDamage?: number;
  speed?: number; // Weapon speed
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  subtype?: WeaponType | ArmorType | string;
  rarity: ItemRarity;
  level: number;
  
  slot?: EquipmentSlot;
  stats?: ItemStats;
  
  stackable?: boolean;
  maxStack?: number;
  
  requirements?: {
    level?: number;
    class?: string[];
  };
  
  vendor?: {
    buy: number; // in gold
    sell: number;
  };
  
  questItem?: boolean;
}

export type Equipment = Partial<Record<EquipmentSlot, Item>>;

export interface InventoryItem {
  item: Item;
  quantity: number;
  slot: number;
}
