import Unit from "./unit";

export default class Archer extends Unit {
  constructor(scene, x, y, player) {
    const params = {
      textureKey: 'archer',
      speed: 0.5,
      health: 30,
      player: player,
      attackPower: 1,
    };
    super(scene, x, y, params);
    // Animations are created globally from Aseprite data in GameScene.create()
    this.setScale(3);

    // Archer-specific: walk out then start shooting
    this.startingX = x;
    this.ARCHER_WALKOUT = 150;
    this.arrowCooldown = 0;
    this.remainingArrows = 5;
  }

  shouldShoot() {
    // If it walked more than ARCHER_WALKOUT, from player's castle, start attacking
		if (this.remainingArrows === 0) {
			return false;
		}
    return (
      (this.player === "L" && this.x > this.startingX + this.ARCHER_WALKOUT) ||
      (this.player === "R" && this.x < this.startingX - this.ARCHER_WALKOUT)
    );
  }

  update() {
    if (this.shouldShoot()) {
      this.isEngaged = true;
    }
    if (
			this.remainingArrows > 0 &&
      this.anims.currentAnim?.key === "archer-attack" &&
      this.anims.currentFrame.index === 6 &&
      this.arrowCooldown >= 30
    ) {
      this.scene.battlefield.spawnArrow(this.x, this.player);
      this.arrowCooldown = 0;
			this.remainingArrows--;
    }
    this.arrowCooldown++;
    super.update();
  }
}
