/**
 * Character Selection Screen
 */

import { useState, useEffect } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import type { Character } from '../../types/character';

interface CharacterSelectionProps {
  onCharacterSelected: () => void;
  onCreateNew: () => void;
  onBack?: () => void;
}

export const CharacterSelection = ({ onCharacterSelected, onCreateNew, onBack }: CharacterSelectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { character } = useCharacterStore();

  // ESC key handler to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Mock characters for now - will be loaded from store later
  const characters: Character[] = character ? [character] : [];

  const selectedChar = selectedIndex >= 0 ? characters[selectedIndex] : null;

  const handleEnterWorld = () => {
    if (selectedChar) {
      onCharacterSelected();
    }
  };

  const handleDelete = () => {
    if (selectedChar && confirm(`Delete ${selectedChar.name}?`)) {
      // TODO: Implement character deletion
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/backgrounds/teldrassil.png)',
          filter: 'brightness(0.5)',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl h-full max-h-[900px] flex flex-col p-8">
        {/* Header */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-t-lg border-2 border-b-0 border-wow-gold/30 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-wow-gold">SELECT CHARACTER</h1>
              <p className="text-gray-400 mt-1">
                Realm: <span className="text-wow-gold">Aethervine</span> • Type:{' '}
                <span className="text-green-400">PvE</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-900/90 backdrop-blur-sm border-2 border-t-0 border-b-0 border-wow-gold/30 flex">
          {/* Left: Selected Character Preview */}
          <div className="w-1/3 border-r border-gray-700 p-6 flex flex-col items-center justify-center">
            {selectedChar ? (
              <div className="text-center">
                <div className="text-8xl mb-4">🏃</div>
                <h2 className="text-3xl font-bold text-wow-gold mb-2">{selectedChar.name}</h2>
                <p className="text-xl text-gray-300">
                  Level {selectedChar.level} {selectedChar.race} {selectedChar.class}
                </p>
                <p className="text-wow-gold mt-2">⚔️ {selectedChar.faction}</p>
                <p className="text-gray-400 mt-4">📍 {selectedChar.position.zone}</p>
              </div>
            ) : (
              <div className="text-gray-500 text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-lg">Select a character</p>
              </div>
            )}
          </div>

          {/* Right: Character List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-3">
              {characters.map((char, index) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    index === selectedIndex
                      ? 'bg-wow-gold/20 border-wow-gold shadow-lg'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🏃</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-wow-gold">{char.name}</h3>
                        <span className="text-sm text-gray-400">
                          Lv {char.level}
                        </span>
                      </div>
                      <p className="text-gray-300">
                        {char.race} {char.class}
                      </p>
                      <p className="text-sm text-gray-400">{char.position.zone}</p>
                    </div>
                  </div>
                </button>
              ))}

              {/* Create New Character Slot */}
              <button
                onClick={onCreateNew}
                className="w-full p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-wow-gold hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-5xl text-gray-600 group-hover:text-wow-gold transition-colors">
                    +
                  </div>
                  <p className="text-lg font-semibold text-gray-500 group-hover:text-wow-gold transition-colors">
                    CREATE NEW CHARACTER
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-b-lg border-2 border-t-0 border-wow-gold/30 p-6">
          <div className="flex justify-between">
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              ← LOGOUT
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={!selectedChar}
                className="px-6 py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                DELETE
              </button>
              <button
                onClick={handleEnterWorld}
                disabled={!selectedChar}
                className="px-8 py-3 bg-gradient-to-r from-aether-cyan to-aether-teal hover:from-aether-cyan-dark hover:to-aether-cyan disabled:bg-gray-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg border-2 border-aether-gold disabled:border-gray-600"
              >
                ENTER WORLD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
