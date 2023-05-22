import Phaser from 'phaser';
import HealthBar from './health_bar';
class Unit extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, params) {
    super(scene, x, y, params.textureKey);
    this.scene = scene;
    this.player = params.player;


    this.attackPower = params.attackPower;
    this.health = params.health;
    this.speed = params.speed;
    this.isEngaged = false;
    if (params.player == 'R') {
      this.speed = -params.speed;
      this.flipX = true;
    }
    let healthBarWidth = this.displayWidth * 0.8;
    this.healthBar = new HealthBar(scene, this.x, this.y - this.displayHeight / 2 - 20, healthBarWidth, 10);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    scene.add.existing(this);
  }

  update() {
    if (!this.isEngaged) {
      this.anims.play('run', true);
      this.x += this.speed;
      this.healthBar.x = this.x - this.displayWidth/2;
      this.healthBar.y = this.y - this.displayHeight/2 - 20;
      this.healthBar.draw();
    } else {
      this.anims.play('attack', true);
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    this.healthBar.decrease(damage);
    if (this.health <= 0) {
      this.health = 0;
      this.destroyed = true;
    }
  }

  destroy() {
    super.destroy();
    this.healthBar.destroy();
    this.destroyed = true;
  }

  isDead() {
    return this.destroyed;
  }
}

export default Unit;
