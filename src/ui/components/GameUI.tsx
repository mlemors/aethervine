/**
 * Main Game UI - Three Panel Layout
 */

import { useEffect, useState } from 'react';
import { CharacterPanel } from './CharacterPanel';
import { ActionPanel } from './ActionPanel';
import { CenterDisplay } from './CenterDisplay';
import { GameEngine, type GameEngineState } from '../../game/GameEngine';
import { useCharacterStore } from '../stores/characterStore';

export const GameUI = () => {
  const { character } = useCharacterStore();
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameEngineState | null>(null);

  useEffect(() => {
    if (!character) return;

    // Initialize game engine
    const engine = new GameEngine(
      {
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        experience: character.experience,
        experienceToNext: character.experienceToNext,
        position: {
          x: 0,
          y: 0,
          z: 0,
          map: 0,
        },
      },
      (state) => setGameState(state)
    );

    setGameEngine(engine);
    setGameState(engine.getState());

    return () => {
      engine.stop();
    };
  }, [character]);

  if (!character || !gameEngine || !gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex overflow-hidden">
      {/* Left Panel: Character Info */}
      <CharacterPanel character={character} gameState={gameState} />

      {/* Center: Action Display & Animations */}
      <CenterDisplay gameState={gameState} />

      {/* Right Panel: Controls & Log */}
      <ActionPanel gameEngine={gameEngine} gameState={gameState} />
    </div>
  );
};
