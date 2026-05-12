import Phaser from 'phaser';
import { Unit } from './Unit';
import { arrowDef } from '../data/units/arrow';
import type { PlayerSide } from '../types/PlayerSide';

export class Arrow extends Unit {
  constructor(scene: Phaser.Scene, x: number, y: number, player: PlayerSide) {
    super(scene, x, y, arrowDef, player);
    this.setScale(2);

    scene.physics.world.enable(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(200);
    body.setVelocity(player === 'R' ? -250 : 250, -175);
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.rotation = Math.atan2(body.velocity.y, body.velocity.x);
    if (this.player === 'R') this.rotation = Math.PI + this.rotation;
    if (this.y > (this.scene.sys.game.config.height as number) - 50) this.destroy();
  }

  isDead(): boolean {
    return this.destroyed || this.y > (this.scene.sys.game.config.height as number) - 50;
  }
}
