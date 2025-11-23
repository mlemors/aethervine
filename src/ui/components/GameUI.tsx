/**
 * Main Game UI - Three Panel Layout
 */

import { useEffect, useState } from 'react';
import { CharacterPanel } from './CharacterPanel';
import { ActionPanel } from './ActionPanel';
import { CenterDisplay } from './CenterDisplay';
import { GameEngine, type GameEngineState } from '../../game/GameEngine';
import { useCharacterStore } from '../stores/characterStore';
import { initDatabase } from '../../data/database';

export const GameUI = () => {
  const { character } = useCharacterStore();
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameEngineState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!character) {
      console.log('GameUI: No character found');
      return;
    }

    console.log('GameUI: Initializing with character:', character);

    // Initialize database and game engine asynchronously
    const initGame = async () => {
      try {
        console.log('GameUI: Initializing database...');
        await initDatabase();
        console.log('GameUI: Database ready');

        console.log('GameUI: Creating GameEngine...');
        
        // Initialize game engine
        const engine = new GameEngine(
          {
            name: character.name,
            race: character.race,
            class: character.class,
            level: character.level,
            experience: character.experience,
            experienceToNext: character.experienceToNext,
            position: character.position || {
              x: -8949.95,
              y: -132.493,
              z: 83.5312,
              map: 0,
            },
          },
          (state) => {
            console.log('GameUI: State updated', state.currentState);
            setGameState(state);
          }
        );

        console.log('GameUI: Engine created, getting initial state...');
        setGameEngine(engine);
        setGameState(engine.getState());
        console.log('GameUI: Engine initialized successfully');
      } catch (err) {
        console.error('GameUI: Failed to initialize engine:', err);
        console.error('GameUI: Error stack:', err instanceof Error ? err.stack : 'No stack trace');
        setError(err instanceof Error ? err.message : 'Failed to initialize game');
      }
    };

    initGame();

    return () => {
      if (gameEngine) {
        console.log('GameUI: Cleaning up engine');
        gameEngine.stop();
      }
    };
  }, [character]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
        <div className="text-2xl text-red-400">Error</div>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white gap-4">
        <div className="text-2xl">No Character Selected</div>
        <div className="text-sm text-gray-400">Please select a character first</div>
      </div>
    );
  }

  if (!gameEngine || !gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-2xl">Loading Game...</div>
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
