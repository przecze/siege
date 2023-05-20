import Phaser from 'phaser';
import Unit from './unit';

export default class Infantry extends Unit {
  constructor(scene, x, y, player) {
    const params ={
      textureKey: 'orc',
      speed: 2,
      health: 100,
      player: player,
      attackPower: 1,
    };
    super(scene, x, y, params);
  }
}
