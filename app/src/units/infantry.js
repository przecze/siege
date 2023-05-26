import Phaser from 'phaser';
import Unit from './unit';

export default class Infantry extends Unit {
  constructor(scene, x, y, player) {
    const params ={
      textureKey: 'infantry',
      speed: 2,
      health: 100,
      player: player,
      attackPower: 1,
    };
    super(scene, x, y, params);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('infantry', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('infantry', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('infantry_att', { start: 16, end: 19 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
  }
}
