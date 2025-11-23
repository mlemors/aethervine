/**
 * Center Display - Character Animation with Scrolling Background
 * Side-scrolling view with parallax effect
 */

import { useEffect, useRef, useState } from 'react';
import type { GameEngineState, GameState } from '../../game/GameEngine';

interface CenterDisplayProps {
  gameState: GameEngineState;
}

export const CenterDisplay = ({ gameState }: CenterDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const backgroundOffset = useRef(0);
  const foregroundOffset = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;

    const animate = () => {

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine movement speed based on game state
      const isMoving = gameState.currentState === 'traveling';
      const speed = isMoving ? 2 : 0;

      // Update background offsets (parallax effect)
      if (isMoving) {
        backgroundOffset.current = (backgroundOffset.current + speed * 0.3) % canvas.width;
        foregroundOffset.current = (foregroundOffset.current + speed) % canvas.width;
      }

      // Draw sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

      // Draw distant mountains (slow parallax)
      drawMountains(ctx, canvas.width, canvas.height, backgroundOffset.current * 0.2);

      // Draw middle-ground trees (medium parallax)
      drawTrees(ctx, canvas.width, canvas.height, backgroundOffset.current, 0.7);

      // Draw ground
      const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.75, 0, canvas.height);
      groundGradient.addColorStop(0, '#2a5c1a');
      groundGradient.addColorStop(1, '#1a3a0a');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);

      // Draw grass on ground (fast parallax)
      drawGrass(ctx, canvas.width, canvas.height, foregroundOffset.current);

      // Draw character (centered, always in same position)
      drawCharacter(ctx, canvas.width, canvas.height, gameState.currentState, animationFrame);

      // Draw enemy if in combat
      if (gameState.currentState === 'combat') {
        drawEnemy(ctx, canvas.width, canvas.height, animationFrame);
      }

      // Draw action indicator
      drawActionIndicator(ctx, canvas.width, canvas.height, gameState);

      // Update animation frame
      setAnimationFrame((prev) => (prev + 1) % 60);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState.currentState, animationFrame]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Zone Info */}
      <div className="bg-gray-800/90 backdrop-blur-sm px-6 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Zone</div>
            <div className="text-lg font-bold text-wow-gold">
              {gameState.currentZone || 'Elwynn Forest'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Position</div>
            <div className="text-sm font-mono text-gray-300">
              ({gameState.character.position.x.toFixed(0)}, {gameState.character.position.y.toFixed(0)})
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Display */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />

        {/* State Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <StateIndicator state={gameState.currentState} />
        </div>
      </div>
    </div>
  );
};

// Helper drawing functions
const drawMountains = (ctx: CanvasRenderingContext2D, width: number, height: number, offset: number) => {
  ctx.fillStyle = '#4a5f6a';
  for (let i = 0; i < 3; i++) {
    const x = ((i * width / 2) - offset) % (width * 1.5) - width * 0.25;
    ctx.beginPath();
    ctx.moveTo(x, height * 0.6);
    ctx.lineTo(x + width / 3, height * 0.3);
    ctx.lineTo(x + width / 1.5, height * 0.6);
    ctx.closePath();
    ctx.fill();
  }
};

const drawTrees = (ctx: CanvasRenderingContext2D, width: number, height: number, offset: number, scale: number) => {
  const treeSpacing = 200;
  const numTrees = Math.ceil(width / treeSpacing) + 2;

  for (let i = 0; i < numTrees; i++) {
    const x = ((i * treeSpacing) - offset) % (width + treeSpacing) - treeSpacing;
    const treeHeight = 80 * scale;
    const treeWidth = 40 * scale;

    // Trunk
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + treeWidth / 3, height * 0.75 - treeHeight / 2, treeWidth / 3, treeHeight / 2);

    // Foliage
    ctx.fillStyle = '#2d5016';
    ctx.beginPath();
    ctx.arc(x + treeWidth / 2, height * 0.75 - treeHeight / 2, treeWidth / 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawGrass = (ctx: CanvasRenderingContext2D, width: number, height: number, offset: number) => {
  ctx.strokeStyle = '#3a6622';
  ctx.lineWidth = 2;

  const grassSpacing = 20;
  const numGrass = Math.ceil(width / grassSpacing) + 2;

  for (let i = 0; i < numGrass; i++) {
    const x = ((i * grassSpacing) - offset) % (width + grassSpacing) - grassSpacing;
    const grassHeight = 10 + Math.random() * 10;

    ctx.beginPath();
    ctx.moveTo(x, height * 0.75);
    ctx.lineTo(x + 3, height * 0.75 - grassHeight);
    ctx.stroke();
  }
};

const drawCharacter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GameState,
  frame: number
) => {
  const x = width / 2;
  const y = height * 0.65;
  const size = 60;

  // Walking animation
  const bobOffset = state === 'traveling' ? Math.sin(frame * 0.3) * 5 : 0;

  // Body
  ctx.fillStyle = '#4a90e2';
  ctx.fillRect(x - size / 3, y - size + bobOffset, size / 1.5, size);

  // Head
  ctx.fillStyle = '#ffd1a3';
  ctx.beginPath();
  ctx.arc(x, y - size - 15 + bobOffset, 15, 0, Math.PI * 2);
  ctx.fill();

  // Arms (animated when moving)
  ctx.strokeStyle = '#ffd1a3';
  ctx.lineWidth = 6;
  const armSwing = state === 'traveling' ? Math.sin(frame * 0.3) * 15 : 0;

  ctx.beginPath();
  ctx.moveTo(x - size / 3, y - size * 0.8 + bobOffset);
  ctx.lineTo(x - size / 2, y - size * 0.5 + armSwing + bobOffset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size / 3, y - size * 0.8 + bobOffset);
  ctx.lineTo(x + size / 2, y - size * 0.5 - armSwing + bobOffset);
  ctx.stroke();

  // Legs (animated when moving)
  const legSwing = state === 'traveling' ? Math.sin(frame * 0.3) * 10 : 0;

  ctx.beginPath();
  ctx.moveTo(x - size / 6, y + bobOffset);
  ctx.lineTo(x - size / 4, y + size / 3 + legSwing);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + size / 6, y + bobOffset);
  ctx.lineTo(x + size / 4, y + size / 3 - legSwing);
  ctx.stroke();

  // Weapon (if in combat)
  if (state === 'combat') {
    const attackSwing = Math.sin(frame * 0.5) * 30;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y - size * 0.5);
    ctx.lineTo(x + size, y - size * 0.7 + attackSwing);
    ctx.stroke();
  }
};

const drawEnemy = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
  const x = width * 0.7;
  const y = height * 0.65;
  const size = 50;

  // Enemy body (red)
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(x - size / 3, y - size, size / 1.5, size);

  // Enemy head
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.arc(x, y - size - 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Damage flash
  if (frame % 30 < 5) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x - size / 3, y - size, size / 1.5, size);
  }
};

const drawActionIndicator = (
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  gameState: GameEngineState
) => {
  if (!gameState.destinationName && gameState.currentState === 'idle') return;

  const text = gameState.destinationName || getStateText(gameState.currentState);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  
  ctx.strokeText(text, width / 2, 40);
  ctx.fillText(text, width / 2, 40);
};

const getStateText = (state: GameState): string => {
  switch (state) {
    case 'traveling': return '🚶 Traveling...';
    case 'combat': return '⚔️ In Combat!';
    case 'looting': return '💰 Looting...';
    case 'turning-in-quest': return '✅ Quest Complete!';
    default: return '';
  }
};

const StateIndicator = ({ state }: { state: GameState }) => {
  const getStateColor = () => {
    switch (state) {
      case 'traveling': return 'bg-blue-500';
      case 'combat': return 'bg-red-500 animate-pulse';
      case 'looting': return 'bg-yellow-500';
      case 'turning-in-quest': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-full ${getStateColor()} text-white font-bold shadow-lg`}>
      {getStateText(state)}
    </div>
  );
};
