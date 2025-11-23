/**
 * Character Panel - Left Side
 * Shows character stats, equipment slots, and inventory
 */

import type { Character } from '../../types/character';
import type { GameEngineState } from '../../game/GameEngine';

interface CharacterPanelProps {
  character: Character;
  gameState: GameEngineState;
}

const EQUIPMENT_SLOTS = [
  { slot: 'head', icon: '🪖', name: 'Head' },
  { slot: 'neck', icon: '📿', name: 'Neck' },
  { slot: 'shoulder', icon: '🛡️', name: 'Shoulders' },
  { slot: 'back', icon: '🧥', name: 'Back' },
  { slot: 'chest', icon: '👕', name: 'Chest' },
  { slot: 'wrist', icon: '⌚', name: 'Wrists' },
  { slot: 'hands', icon: '🧤', name: 'Hands' },
  { slot: 'waist', icon: '🔗', name: 'Waist' },
  { slot: 'legs', icon: '👖', name: 'Legs' },
  { slot: 'feet', icon: '👢', name: 'Feet' },
  { slot: 'finger1', icon: '💍', name: 'Ring 1' },
  { slot: 'finger2', icon: '💍', name: 'Ring 2' },
  { slot: 'trinket1', icon: '✨', name: 'Trinket 1' },
  { slot: 'trinket2', icon: '✨', name: 'Trinket 2' },
  { slot: 'mainHand', icon: '⚔️', name: 'Main Hand' },
  { slot: 'offHand', icon: '🛡️', name: 'Off Hand' },
  { slot: 'ranged', icon: '🏹', name: 'Ranged' },
];

export const CharacterPanel = ({ character, gameState }: CharacterPanelProps) => {
  const stats = gameState.character;
  const inventory = gameState.inventory;

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
      {/* Character Header */}
      <div className="bg-gradient-to-r from-wow-gold/20 to-transparent p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="text-5xl">👤</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-wow-gold">{character.name}</h2>
            <div className="text-sm text-gray-400">
              Level {stats.level} {character.race} {character.class}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>XP</span>
            <span>{stats.experience} / {stats.experienceToNext}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
              style={{ width: `${(stats.experience / stats.experienceToNext) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-bold text-wow-gold mb-2">STATS</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <StatItem icon="💪" label="Strength" value="20" />
          <StatItem icon="🏃" label="Agility" value="15" />
          <StatItem icon="🛡️" label="Stamina" value="18" />
          <StatItem icon="🧠" label="Intellect" value="10" />
          <StatItem icon="✨" label="Spirit" value="12" />
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-bold text-wow-gold mb-3">EQUIPMENT</h3>
        <div className="space-y-1">
          {EQUIPMENT_SLOTS.map((slot) => {
            const equipped = inventory.equipment[slot.slot as keyof typeof inventory.equipment];
            return (
              <div
                key={slot.slot}
                className="flex items-center gap-2 p-2 bg-gray-900/50 rounded border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <span className="text-lg">{slot.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">{slot.name}</div>
                  {equipped ? (
                    <div className="text-sm text-green-400 truncate">
                      {equipped.itemId}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 italic">Empty</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gold */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Gold:</span>
          <span className="text-lg font-bold text-wow-gold">
            💰 {Math.floor(inventory.gold / 10000)}g {Math.floor((inventory.gold % 10000) / 100)}s {inventory.gold % 100}c
          </span>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-gray-300">
    <span>{icon}</span>
    <span className="text-xs">{label}:</span>
    <span className="font-bold ml-auto">{value}</span>
  </div>
);
