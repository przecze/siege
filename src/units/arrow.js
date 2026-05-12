import { Unit } from './Unit';
import { arrowDef } from '../data/units/arrow';

export default class Arrow extends Unit {
  constructor(scene, x, y, player) {
    super(scene, x, y, arrowDef, player);

    this.setScale(2);

    scene.physics.world.enable(this);
    this.body.setGravityY(200);

    const velocityX = player === 'R' ? -250 : 250;
    this.body.setVelocity(velocityX, -175);
  }

  update() {
    this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    if (this.player === 'R') this.rotation = Math.PI + this.rotation;
    if (this.y > this.scene.sys.game.config.height - 50) this.destroy();
  }

  isDead() {
    return this.destroyed || this.y > this.scene.sys.game.config.height - 50;
  }
}
