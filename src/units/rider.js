import Unit from './unit_legacy';

export default class Rider extends Unit {
  constructor(scene, x, y, player) {
    const params = {
      textureKey: 'lancer',
      speed: 4,
      health: 80,
      player: player,
      attackPower: 3,
    };
    super(scene, x, y, params);
    // Animations are created globally from Aseprite data in GameScene.create()
    this.setScale(3);
  }
}
