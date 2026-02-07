import Phaser from "phaser";
import Unit from "./unit";

export default class Arrow extends Unit {
  constructor(scene, x, y, player) {
    const params = {
      textureKey: "arrow",
      speed: 0,
      health: 1,
      player: player,
      attackPower: 30,
      hasHealthBar: false,
    };
    super(scene, x, y, params);

    this.setScale(2);

    // Physics properties
    scene.physics.world.enable(this);

    // Adjust the gravity for a more realistic arc
    this.body.setGravityY(200); // Adjusted for a less steep trajectory

    // Adjust initial velocity for the desired trajectory
    const velocityX = 250; // Horizontal velocity
    const velocityY = -175; // Vertical velocity, negative to move up

    this.body.setVelocity(velocityX, velocityY);
    if (player === "R") {
      this.body.setVelocity(-velocityX, velocityY);
    }
  }

  update() {
    this.rotation =
      Math.atan2(this.body.velocity.y, this.body.velocity.x);
      if (this.player === "R") {
        this.rotation = Math.PI + this.rotation;
      }
		if (this.y > this.scene.sys.game.config.height - 50) {
			this.destroy();
		}
  }

  isDead() {
    return this.destroyed || this.y > this.scene.sys.game.config.height - 50;
  }
}
