/**
 * Main Game Scene
 */

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';

export class MainScene extends Phaser.Scene {
  private characterSprite?: Phaser.GameObjects.Sprite;
  private enemySprite?: Phaser.GameObjects.Sprite;
  
  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Create background
    this.cameras.main.setBackgroundColor(0x2a2a2a);
    
    // Add title text
    this.add.text(400, 50, 'Aethervine', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.add.text(400, 100, 'WoW Classic Idle RPG', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    
    // Create character sprite
    this.characterSprite = this.add.sprite(300, 300, 'character');
    this.characterSprite.setScale(2);
    
    // Setup event listeners
    this.setupEventListeners();
    
    EventBus.emit('scene:main:ready');
  }

  private setupEventListeners(): void {
    EventBus.on('combat:started', this.onCombatStarted.bind(this));
    EventBus.on('combat:ended', this.onCombatEnded.bind(this));
  }

  private onCombatStarted(data: { enemy: string }): void {
    console.log('Combat started with:', data.enemy);
    
    // Spawn enemy sprite
    if (!this.enemySprite) {
      this.enemySprite = this.add.sprite(500, 300, 'enemy');
      this.enemySprite.setScale(2);
    }
    
    // Simple attack animation (character moves towards enemy)
    if (this.characterSprite) {
      this.tweens.add({
        targets: this.characterSprite,
        x: 450,
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private onCombatEnded(): void {
    console.log('Combat ended');
    
    // Stop animations
    this.tweens.killAll();
    
    // Remove enemy
    if (this.enemySprite) {
      this.enemySprite.destroy();
      this.enemySprite = undefined;
    }
    
    // Reset character position
    if (this.characterSprite) {
      this.characterSprite.setX(300);
    }
  }

  update(): void {
    // Game loop update (called every frame)
  }
}
