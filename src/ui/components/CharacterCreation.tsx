/**
 * Character Creation Screen
 */

import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import type { WoWClass, WoWRace, WoWFaction } from '../../types/character';
import { RACES, CLASS_COLORS, generateRandomName, getAllianceRaces, getHordeRaces } from '../../data/gameData';

interface CharacterCreationProps {
  onBack: () => void;
  onCharacterCreated: () => void;
}

export const CharacterCreation = ({ onBack, onCharacterCreated }: CharacterCreationProps) => {
  const [faction, setFaction] = useState<WoWFaction | null>(null);
  const [race, setRace] = useState<WoWRace | null>(null);
  const [wowClass, setWowClass] = useState<WoWClass | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [error, setError] = useState('');

  const { createCharacter } = useCharacterStore();

  const availableRaces = faction === 'Alliance' ? getAllianceRaces() : faction === 'Horde' ? getHordeRaces() : [];
  const availableClasses = race ? RACES[race].allowedClasses : [];
  const isValid = faction && race && wowClass && characterName.length >= 2 && characterName.length <= 12 && /^[A-Za-z]+$/.test(characterName);

  const handleFactionSelect = (selectedFaction: WoWFaction) => {
    setFaction(selectedFaction);
    setRace(null);
    setWowClass(null);
    setError('');
  };

  const handleRaceSelect = (selectedRace: WoWRace) => {
    setRace(selectedRace);
    setWowClass(null);
    setError('');
  };

  const handleClassSelect = (selectedClass: WoWClass) => {
    setWowClass(selectedClass);
    setError('');
  };

  const handleRandomName = () => {
    if (race) {
      setCharacterName(generateRandomName(race));
    }
  };

  const handleCreate = () => {
    if (!isValid || !race || !wowClass) {
      setError('Please complete all fields');
      return;
    }

    createCharacter(characterName, wowClass, race);
    onCharacterCreated();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: race ? `url(/assets/backgrounds/${race.toLowerCase().replace(' ', '-')}-bg.jpg)` : 'url(/assets/backgrounds/creation-bg.jpg)',
          filter: 'brightness(0.4)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl h-full max-h-[900px] flex flex-col p-8">
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-t-lg border-2 border-b-0 border-wow-gold/30 p-6">
          <h1 className="text-4xl font-bold text-wow-gold">CHARACTER CREATION</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-900/95 backdrop-blur-sm border-2 border-t-0 border-b-0 border-wow-gold/30 flex overflow-hidden">
          {/* Left Panel: Faction, Race, Class */}
          <div className="w-1/3 border-r border-gray-700 p-6 overflow-y-auto">
            {/* Faction Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-wow-gold mb-4">CHOOSE FACTION</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleFactionSelect('Alliance')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    faction === 'Alliance'
                      ? 'bg-blue-900/50 border-blue-500 shadow-lg'
                      : 'bg-gray-800/50 border-gray-600 hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="font-bold text-blue-300">ALLIANCE</div>
                </button>
                <button
                  onClick={() => handleFactionSelect('Horde')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    faction === 'Horde'
                      ? 'bg-red-900/50 border-red-500 shadow-lg'
                      : 'bg-gray-800/50 border-gray-600 hover:border-red-500/50'
                  }`}
                >
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="font-bold text-red-300">HORDE</div>
                </button>
              </div>
            </div>

            {/* Race Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-wow-gold mb-4">CHOOSE RACE</h3>
              {!faction ? (
                <p className="text-gray-500 text-center py-8">Select a faction first</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableRaces.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRaceSelect(r)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        race === r
                          ? 'bg-wow-gold/20 border-wow-gold shadow-lg'
                          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{RACES[r].icon}</div>
                      <div className="font-semibold text-sm">{r}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Class Selection */}
            <div>
              <h3 className="text-xl font-bold text-wow-gold mb-4">CHOOSE CLASS</h3>
              {!race ? (
                <p className="text-gray-500 text-center py-8">Select a race first</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Druid'] as WoWClass[]).map((c) => {
                    const isAvailable = availableClasses.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => isAvailable && handleClassSelect(c)}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          wowClass === c
                            ? 'bg-wow-gold/20 border-wow-gold shadow-lg'
                            : isAvailable
                            ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                            : 'bg-gray-900/50 border-gray-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div
                          className="font-semibold text-sm"
                          style={{ color: isAvailable ? CLASS_COLORS[c] : '#666' }}
                        >
                          {c}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center Panel: Character Preview */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            {race ? (
              <div className="text-center">
                <div className="text-9xl mb-6">{RACES[race].icon}</div>
                <div className="bg-gray-800/70 rounded-lg p-6 max-w-md">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Race:</span>
                      <span className="text-wow-gold font-semibold">{race}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Class:</span>
                      <span
                        className="font-semibold"
                        style={{ color: wowClass ? CLASS_COLORS[wowClass] : '#666' }}
                      >
                        {wowClass || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Starting Zone:</span>
                      <span className="text-green-400">{RACES[race].startZone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-center">
                <div className="text-8xl mb-4">👤</div>
                <p className="text-xl">Select race and class</p>
              </div>
            )}
          </div>

          {/* Right Panel: Name & Details */}
          <div className="w-1/3 border-l border-gray-700 p-6 overflow-y-auto">
            {/* Character Name */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-wow-gold mb-4">CHARACTER NAME</h3>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Enter name..."
                maxLength={12}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-wow-gold transition-colors mb-2"
              />
              <button
                onClick={handleRandomName}
                disabled={!race}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Random Name
              </button>
              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <div>• 2-12 characters</div>
                <div>• Letters only</div>
                <div>• Must be unique</div>
              </div>
            </div>

            {/* Racial Traits */}
            {race && (
              <div>
                <h3 className="text-xl font-bold text-wow-gold mb-4">RACIAL TRAITS</h3>
                <div className="space-y-2">
                  {RACES[race].racialTraits.map((trait) => (
                    <div key={trait} className="bg-gray-800/50 rounded px-3 py-2 text-sm text-gray-300">
                      • {trait}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-b-lg border-2 border-t-0 border-wow-gold/30 p-6">
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500 rounded-lg px-4 py-3 text-red-200">
              {error}
            </div>
          )}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              ← BACK
            </button>
            <button
              onClick={handleCreate}
              disabled={!isValid}
              className="px-8 py-3 bg-gradient-to-r from-aether-cyan to-aether-teal hover:from-aether-cyan-dark hover:to-aether-cyan disabled:bg-gray-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg border-2 border-aether-gold disabled:border-gray-600"
            >
              CREATE CHARACTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
