import Phaser from 'phaser';
import Unit from './unit';

export default class Infantry extends Unit {
  constructor(scene, x, y, player) {
    const params ={
      textureKey: 'rider',
      speed: 4,
      health: 80,
      player: player,
      attackPower: 3,
    };
    super(scene, x, y, params);
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('rider', { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('rider', { start: 12, end: 17 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('rider_att', { start: 12, end: 16 }),
      frameRate: 10,
      repeat: -1 // repeat forever
    });
  }
}
