import Phaser from 'phaser';
import Unit from './unit';

export default class Archer extends Unit {
  constructor(scene, x, y, player) {
    const params ={
      textureKey: 'archer',
      speed: 1,
      health: 100,
      player: player,
      attackPower: 1,
    };
    super(scene, x, y, params);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('archer', { start: 2, end: 2 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('archer', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('archer', { start: 4, end: 5 }),
      frameRate: 5,
      repeat: -1 // repeat forever
    });
    // sprites are reversed in this sheet
    this.flipX = !this.flipX;
    this.setScale(2);
  }
}
