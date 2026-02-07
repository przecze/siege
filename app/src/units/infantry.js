import Unit from './unit';

export default class Infantry extends Unit {
  constructor(scene, x, y, player) {
    const params = {
      textureKey: 'soldier',
      speed: 2,
      health: 100,
      player: player,
      attackPower: 1,
    };
    super(scene, x, y, params);
    // Animations are created globally from Aseprite data in GameScene.create()
    this.setScale(3);
  }
}
