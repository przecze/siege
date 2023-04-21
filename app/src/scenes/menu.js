import Phaser from 'phaser';
export default class MenuScene extends Phaser.Scene {
constructor() {
super('menu');
}

create() {
const { width, height } = this.sys.game.config;
  // Add your menu elements here

// Example: Start button
const startButton = this.add.text(width / 2, height / 2, 'Start Game', {
  fontSize: '32px',
  color: '#fff',
})
  .setOrigin(0.5, 0.5)
  .setInteractive();
this.scene.start('game');

startButton.on('pointerdown', () => {
  this.scene.start('game');
});
}
}
