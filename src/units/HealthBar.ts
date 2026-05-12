import Phaser from 'phaser';

export class HealthBar {
  private bar: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private value: number = 100;
  private p: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draw();
    scene.add.existing(this.bar);
  }

  decrease(amount: number): void {
    this.value = Math.max(0, this.value - amount);
    this.p = this.value / 100;
    this.draw();
  }

  update(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.draw();
  }

  destroy(): void {
    this.bar.destroy();
  }

  private draw(): void {
    this.bar.clear();
    this.bar.fillStyle(0xff0000);
    this.bar.fillRect(this.x, this.y, this.width, this.height);
    this.bar.fillStyle(0x00ff00);
    this.bar.fillRect(this.x + 2, this.y + 2, this.width * this.p - 5, this.height - 4);
  }
}
