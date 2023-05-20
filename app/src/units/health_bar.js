import Phaser from 'phaser';
// src/components/HealthBar.js
export default class HealthBar {
  constructor(scene, x, y, width, height) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.value = 100;
    this.p = 1;

    this.draw();

    scene.add.existing(this.bar);
  }

  decrease(amount) {
    this.value -= amount;

    if (this.value < 0) {
      this.value = 0;
    }
    this.p = this.value / 100;

    this.draw();
  }

  draw() {
    this.bar.clear();

    // draw health
    this.bar.fillStyle(0xff0000);
    this.bar.fillRect(this.x, this.y, this.width, this.height);

    // draw filled portion
    this.bar.fillStyle(0x00ff00);
  this.bar.fillRect(this.x + 2, this.y + 2, this.width * this.p - 5, this.height - 4);
  }

  update(x, y) {
    this.x = x;
    this.y = y;
    this.draw();
  }

  destroy() {
    this.bar.destroy();
  }
}

