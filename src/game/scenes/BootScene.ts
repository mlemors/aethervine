/**
 * Boot Scene - Initial loading scene
 */

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // TODO: Load initial assets
    this.load.setPath('assets');
    
    // For now, create placeholder graphics
    this.createPlaceholderAssets();
  }

  create(): void {
    EventBus.emit('scene:boot:complete');
    this.scene.start('MainScene');
  }

  private createPlaceholderAssets(): void {
    // Create simple colored rectangles as placeholders
    const graphics = this.add.graphics();
    
    // Character placeholder (green square)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('character', 32, 32);
    
    // Enemy placeholder (red square)
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('enemy', 32, 32);
    
    graphics.destroy();
  }
}
