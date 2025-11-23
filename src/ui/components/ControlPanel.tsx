/**
 * Control Panel Component
 */

import { useGameStore } from '../stores/gameStore';
import { useCharacterStore } from '../stores/characterStore';
import { EventBus } from '@core/EventBus';

export const ControlPanel = () => {
  const { isRunning, isPaused, pause, resume } = useGameStore();
  const { character, gainExperience } = useCharacterStore();

  const handlePauseToggle = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleTestCombat = () => {
    // Test combat event
    EventBus.emit('combat:started', { enemy: 'Test Wolf' });
    
    setTimeout(() => {
      EventBus.emit('combat:ended');
      gainExperience(100);
    }, 3000);
  };

  if (!character) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/90 rounded-lg p-4 border border-wow-gold/30">
          <div className="flex gap-3">
            <button
              onClick={handlePauseToggle}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                isPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>

            <button
              onClick={handleTestCombat}
              disabled={!isRunning || isPaused}
              className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              ⚔️ Test Combat
            </button>

            <div className="ml-auto flex items-center gap-2 text-gray-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Game Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
