class Unit {
  constructor(scene, x, y, textureKey, health, speed) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setScale(3);
    this.health = health;
    this.speed = speed;
  }

  update() {
    this.sprite.x += this.speed;
  }

  destroy() {
    this.sprite.destroy();
  }
}

export default Unit;
