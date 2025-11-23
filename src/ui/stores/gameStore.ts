/**
 * Main Game Store (Zustand)
 */

import { create } from 'zustand';
import type { GameState, GameActivity } from '../../types/game';

interface GameStore extends GameState {
  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setActivity: (activity: GameActivity) => void;
  incrementTick: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  isRunning: false,
  isPaused: false,
  currentActivity: 'idle',
  tickCount: 0,
  startTime: Date.now(),

  // Actions
  start: () =>
    set({
      isRunning: true,
      isPaused: false,
      startTime: Date.now(),
      tickCount: 0,
    }),

  pause: () =>
    set({
      isPaused: true,
    }),

  resume: () =>
    set({
      isPaused: false,
    }),

  stop: () =>
    set({
      isRunning: false,
      isPaused: false,
      currentActivity: 'idle',
    }),

  setActivity: (activity) =>
    set({
      currentActivity: activity,
    }),

  incrementTick: () =>
    set((state) => ({
      tickCount: state.tickCount + 1,
    })),
}));
