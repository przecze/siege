import Phaser from 'phaser';
import HealthBar from './health_bar';
class Unit extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, params) {
    super(scene, x, y, params.textureKey);
    this.scene = scene;
    this.player = params.player;
    this.textureKey = params.textureKey;

    this.attackPower = params.attackPower;
    this.health = params.health;
    this.speed = params.speed;
    this.isEngaged = false;
    if (params.player == 'R') {
      this.speed = -params.speed;
      this.flipX = ! this.flipX;
    }
    // if hasHealtBar not provided assume true
    this.hasHealthBar = params.hasHealthBar === undefined ? true : params.hasHealthBar;
    if (this.hasHealthBar) {
      let healthBarWidth = this.displayWidth * 0.8;
      this.healthBar = new HealthBar(scene, this.x - healthBarWidth / 2, this.y - this.displayHeight / 2 - 5, healthBarWidth, 10);
    }
    scene.add.existing(this);
  }

  update() {
    if (!this.isEngaged) {
      this.anims.play(this.textureKey + '-run', true);
      this.x += this.speed;
      if (this.hasHealthBar) {
        let healthBarWidth = this.displayWidth * 0.8;
        this.healthBar.x = this.x - healthBarWidth / 2;
        this.healthBar.y = this.y - this.displayHeight / 2 - 5;
        this.healthBar.draw();
      }
    } else {
      this.anims.play(this.textureKey + '-attack', true);
      this.isEngaged = false;
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.hasHealthBar) {
      this.healthBar.decrease(damage);
    }
    if (this.health <= 0) {
      this.health = 0;
      this.destroyed = true;
    }
  }

  destroy() {
    super.destroy();
    if (this.hasHealthBar) {
      this.healthBar.destroy();
    }
    this.destroyed = true;
  }

  isDead() {
    return this.destroyed;
  }
}

export default Unit;
