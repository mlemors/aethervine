/**
 * Main App Component
 */

import { useEffect } from 'react';
import { GameContainer } from './ui/components/GameContainer';
import { HUD } from './ui/components/HUD';
import { ControlPanel } from './ui/components/ControlPanel';
import { useCharacterStore } from './ui/stores/characterStore';
import { useGameStore } from './ui/stores/gameStore';

function App() {
  const character = useCharacterStore((state) => state.character);
  const createCharacter = useCharacterStore((state) => state.createCharacter);
  const start = useGameStore((state) => state.start);

  useEffect(() => {
    // Auto-create a test character for now
    if (!character) {
      createCharacter('Testchar', 'Mage', 'Human');
      start();
    }
  }, [character, createCharacter, start]);

  if (!character) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-900">
      <GameContainer />
      <HUD />
      <ControlPanel />
    </div>
  );
}

export default App;
