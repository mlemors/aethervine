/**
 * Game Container Component - Renders Phaser Game
 */

import { useEffect, useRef } from 'react';
import { PhaserGame } from '@game/PhaserGame';

export const GameContainer = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current && !gameInstanceRef.current) {
      gameInstanceRef.current = PhaserGame.initialize('phaser-game');
    }

    return () => {
      // Cleanup on unmount
      if (gameInstanceRef.current) {
        PhaserGame.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      <div id="phaser-game" ref={gameRef} className="rounded-lg overflow-hidden shadow-2xl" />
    </div>
  );
};
