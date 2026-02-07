import './style.css';
import Phaser from 'phaser';
import BootScene from './scenes/boot';
import MenuScene from './scenes/menu';
import GameScene from './scenes/game';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene],
};

const game = new Phaser.Game(config);
