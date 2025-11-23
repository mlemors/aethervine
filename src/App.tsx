/**
 * Main App Component
 */

import { useState, useEffect } from 'react';
import { StartScreen } from './ui/components/StartScreen';
import { LoginScreen } from './ui/components/LoginScreen';
import { CharacterSelection } from './ui/components/CharacterSelection';
import { CharacterCreation } from './ui/components/CharacterCreation';
import { GameUI } from './ui/components/GameUI';
import { useAccountStore } from './ui/stores/accountStore';
import { useCharacterStore } from './ui/stores/characterStore';

type Screen = 'start' | 'login' | 'character-select' | 'character-creation' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const currentAccount = useAccountStore((state) => state.currentAccount);
  const logout = useAccountStore((state) => state.logout);
  const character = useCharacterStore((state) => state.character);

  // Auto-navigate to character select if logged in
  useEffect(() => {
    if (currentAccount && currentScreen === 'start') {
      setCurrentScreen('character-select');
    }
  }, [currentAccount, currentScreen]);

  const handleStart = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('character-select');
  };

  const handleCreateNewCharacter = () => {
    setCurrentScreen('character-creation');
  };

  const handleCharacterCreated = () => {
    setCurrentScreen('character-select');
  };

  const handleCharacterSelected = () => {
    setCurrentScreen('game');
  };

  const handleBackToCharacterSelect = () => {
    setCurrentScreen('character-select');
  };

  const handleBackToLogin = () => {
    logout();
    setCurrentScreen('start');
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
  };

  // Render current screen
  switch (currentScreen) {
    case 'start':
      return <StartScreen onStart={handleStart} />;

    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={handleBackToStart} />;

    case 'character-select':
      return (
        <CharacterSelection
          onCharacterSelected={handleCharacterSelected}
          onCreateNew={handleCreateNewCharacter}
          onBack={handleBackToLogin}
        />
      );

    case 'character-creation':
      return (
        <CharacterCreation
          onBack={handleBackToCharacterSelect}
          onCharacterCreated={handleCharacterCreated}
        />
      );

    case 'game':
      if (!character) {
        return (
          <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">Loading...</div>
          </div>
        );
      }

      return <GameUI />;

    default:
      return null;
  }
}

export default App;

