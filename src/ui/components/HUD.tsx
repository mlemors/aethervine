/**
 * HUD Component - Heads Up Display
 */

import { useCharacterStore } from '../stores/characterStore';
import { useGameStore } from '../stores/gameStore';

export const HUD = () => {
  const character = useCharacterStore((state) => state.character);
  const { currentActivity, isPaused } = useGameStore();

  if (!character) {
    return null;
  }

  const xpPercentage = (character.experience / character.experienceToNext) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div className="max-w-6xl mx-auto">
        {/* Character Info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-gray-800/90 rounded-lg px-4 py-2 border border-wow-gold/30">
            <div className="text-wow-gold font-bold text-lg">{character.name}</div>
            <div className="text-gray-300 text-sm">
              Level {character.level} {character.class}
            </div>
          </div>

          <div className="bg-gray-800/90 rounded-lg px-4 py-2 border border-wow-gold/30">
            <div className="text-gray-400 text-xs mb-1">Gold</div>
            <div className="text-wow-gold font-bold">{character.gold.toFixed(2)}g</div>
          </div>

          <div className="bg-gray-800/90 rounded-lg px-4 py-2 border border-wow-gold/30">
            <div className="text-gray-400 text-xs mb-1">Activity</div>
            <div className="text-white font-semibold capitalize">{currentActivity}</div>
          </div>

          {isPaused && (
            <div className="bg-red-900/90 rounded-lg px-4 py-2 border border-red-500">
              <div className="text-red-200 font-bold">⏸ PAUSED</div>
            </div>
          )}
        </div>

        {/* XP Bar */}
        <div className="bg-gray-800/90 rounded-lg p-2 border border-wow-gold/30">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Experience</span>
            <span>
              {character.experience} / {character.experienceToNext}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
