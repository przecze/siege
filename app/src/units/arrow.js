import Phaser from 'phaser';
import Unit from './unit';

export default class Arrow extends Unit {
    constructor(scene, x, y, player) {
      const params ={
        textureKey: 'arrow',
        speed: 0,
        health: 1,
        player: player,
        attackPower: 50,
	hasHealthBar: false,
      };
      super(scene, x, y, params);

        // Scale the arrow
      this.setScale(2); // Scale up x2

      // Physics properties
      scene.physics.world.enable(this);

      // Adjust the gravity for a more realistic arc
      this.body.setGravityY(800); // Adjusted for a less steep trajectory

      // Adjust initial velocity for the desired trajectory
      const velocityX = 500; // Horizontal velocity
      const velocityY = -500; // Vertical velocity, negative to move up

      this.body.setVelocity(velocityX, velocityY);

    }

    update() {
	this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x) + Math.PI / 2;
    }

    isDead() {
	return this.destroyed || this.y > this.scene.sys.game.config.height - 50;
    }
}
