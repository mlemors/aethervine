/**
 * Action Panel - Right Side
 * Shows current action, manual controls, and action log
 */

import { useState } from 'react';
import type { GameEngine, GameEngineState } from '../../game/GameEngine';

interface ActionPanelProps {
  gameEngine: GameEngine;
  gameState: GameEngineState;
}

export const ActionPanel = ({ gameEngine, gameState }: ActionPanelProps) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'log'>('controls');

  const handleStartAuto = () => {
    gameEngine.setMode('auto');
    gameEngine.start();
  };

  const handleStop = () => {
    gameEngine.pause();
  };

  const handleResume = () => {
    gameEngine.resume();
  };

  const handleManualAction = (action: string) => {
    gameEngine.executeAction(action);
  };

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
      {/* Current Quest Info */}
      {gameState.currentQuest && (
        <div className="bg-gradient-to-r from-purple-900/40 to-transparent p-4 border-b border-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-2xl">📜</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-purple-300 truncate">
                {gameState.currentQuest.questName}
              </h3>
              <div className="text-xs text-gray-400 mt-1">
                Status: <span className="text-purple-400">{gameState.currentQuest.status}</span>
              </div>
              
              {/* Quest Objectives */}
              <div className="mt-2 space-y-1">
                {gameState.currentQuest.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className={obj.completed ? 'text-green-400' : 'text-gray-400'}>
                      {obj.completed ? '✓' : '○'}
                    </span>
                    <span className="text-gray-300">
                      {obj.type === 'kill' && `Kill ${obj.creatureName}: ${obj.current}/${obj.required}`}
                      {obj.type === 'collect' && `Collect items: ${obj.current}/${obj.required}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Controls */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-bold text-wow-gold mb-3">GAME MODE</h3>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleStartAuto}
            disabled={gameState.mode === 'auto' && !gameState.isPaused}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-all"
          >
            🤖 Auto Quest
          </button>
          
          {gameState.isPaused ? (
            <button
              onClick={handleResume}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded transition-all"
            >
              ▶️ Resume
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={gameState.mode === 'manual'}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-all"
            >
              ⏸️ Pause
            </button>
          )}
        </div>

        {/* Current State Indicator */}
        <div className="bg-gray-900/50 rounded p-3 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Current State:</span>
            <span className="text-sm font-bold text-cyan-400">
              {getStateEmoji(gameState.currentState)} {gameState.currentState}
            </span>
          </div>
          {gameState.destinationName && (
            <div className="text-xs text-gray-400">
              → {gameState.destinationName}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-900/50">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'controls'
              ? 'text-wow-gold border-b-2 border-wow-gold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          🎮 Controls
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 px-4 py-2 text-sm font-bold transition-colors ${
            activeTab === 'log'
              ? 'text-wow-gold border-b-2 border-wow-gold'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          📜 Action Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'controls' ? (
          <ManualControls
            gameState={gameState}
            onAction={handleManualAction}
          />
        ) : (
          <ActionLog logs={gameState.actionLog} />
        )}
      </div>
    </div>
  );
};

// Manual Controls Component
const ManualControls = ({
  gameState,
  onAction,
}: {
  gameState: GameEngineState;
  onAction: (action: string) => void;
}) => {
  const isDisabled = gameState.currentState !== 'idle' || gameState.mode === 'auto';

  return (
    <div className="p-4 space-y-2 overflow-y-auto h-full">
      <h3 className="text-sm font-bold text-wow-gold mb-3">MANUAL ACTIONS</h3>
      
      {gameState.mode === 'auto' && (
        <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-sm text-blue-300 mb-4">
          ℹ️ Auto mode is active. Pause to use manual controls.
        </div>
      )}

      {gameState.currentState !== 'idle' && gameState.mode !== 'auto' && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-sm text-yellow-300 mb-4">
          ⚠️ Character is busy: {gameState.currentState}
        </div>
      )}

      {gameState.availableActions.length > 0 ? (
        <div className="space-y-2">
          {gameState.availableActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action)}
              disabled={isDisabled}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 text-left text-white rounded border border-gray-600 hover:border-gray-500 transition-all"
            >
              {getActionIcon(action)} {action}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No actions available in current zone
        </div>
      )}
    </div>
  );
};

// Action Log Component
const ActionLog = ({ logs }: { logs: string[] }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-bold text-wow-gold mb-3 sticky top-0 bg-gray-800 pb-2">
        ACTION LOG
      </h3>
      
      {logs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No actions logged yet
        </div>
      ) : (
        <div className="space-y-1">
          {[...logs].reverse().map((log, idx) => (
            <div
              key={idx}
              className="text-sm font-mono text-gray-300 p-2 bg-gray-900/30 rounded border-l-2 border-transparent hover:border-cyan-500 hover:bg-gray-900/50 transition-colors"
            >
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Functions
const getStateEmoji = (state: string): string => {
  switch (state) {
    case 'idle': return '💤';
    case 'traveling': return '🚶';
    case 'combat': return '⚔️';
    case 'looting': return '💰';
    case 'turning-in-quest': return '✅';
    default: return '❓';
  }
};

const getActionIcon = (action: string): string => {
  if (action.includes('Gasthaus')) return '🏠';
  if (action.includes('Klassenlehrer')) return '🎓';
  if (action.includes('Berufslehrer')) return '🔨';
  if (action.includes('Händler')) return '🛒';
  if (action.includes('farmen')) return '🗡️';
  if (action.includes('Quest')) return '📜';
  return '➡️';
};
