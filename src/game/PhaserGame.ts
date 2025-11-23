/**
 * Phaser Game Instance Wrapper
 */

import Phaser from 'phaser';
import { gameConfig } from './config';

export class PhaserGame {
  private static instance: Phaser.Game | null = null;

  static initialize(parentId: string): Phaser.Game {
    if (this.instance) {
      return this.instance;
    }

    const config = {
      ...gameConfig,
      parent: parentId,
    };

    this.instance = new Phaser.Game(config);
    return this.instance;
  }

  static getInstance(): Phaser.Game | null {
    return this.instance;
  }

  static destroy(): void {
    if (this.instance) {
      this.instance.destroy(true);
      this.instance = null;
    }
  }
}
