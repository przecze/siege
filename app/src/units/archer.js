import Phaser from 'phaser';
import Unit from './unit';
import Arrow from './arrow';

export default class Archer extends Unit {
    constructor(scene, x, y, player) {
        super(scene, x, y, {
            textureKey: 'archer_idle_1',
            speed: 1,
            health: 30,
            player: player,
            attackPower: 1,
        });

        // Create animations
        this.createAnimations();
	this.setScale(1.5);
        this.startingX = x;
        this.ARCHER_WALKOUT = 150;
        this.anims.play('run', true);
        this.arrowCooldown = 0;
    }

    shouldStartAttack() {
      // If it walked more than ARCHER_WALKOUT, from player's castle, start attacking
      return (this.player === 'L' && this.x > this.startingX + this.ARCHER_WALKOUT)
             || (this.player === 'R' && this.x < this.startingX - this.ARCHER_WALKOUT);
    }


    update() {
      if (this.shouldStartAttack()) {
	this.isEngaged = true;
      }
      // call scene.spawnArror if frame 6 of attack animation is reached
      if (this.anims.currentAnim.key === 'attack'
	  && this.anims.currentFrame.index === 6
	  && this.arrowCooldown >= 10) {
	this.scene.battlefield.spawnArrow(this.x, this.player);
	this.arrowCooldown = 0;
      }
      this.arrowCooldown++;
      super.update();
    }

    createAnimations() {
        // Define animation details in an array
        const animations = [
            { key: 'run', prefix: 'archer_run_', frameCount: 6 },
            { key: 'idle', prefix: 'archer_idle_', frameCount: 6 },
            { key: 'attack', prefix: 'archer_attack_', frameCount: 9 },
            { key: 'shoot', prefix: 'archer_shoot_', frameCount: 12 },
        ];
        animations.forEach(anim => {
            const frameNames = [];
            for (let i = 1; i <= anim.frameCount; i++) {
                frameNames.push({ key: `${anim.prefix}${i}` });
            }
            this.anims.create({
                key: anim.key,
                frames: frameNames,
                frameRate: 10,
                repeat: -1
            });
        });
    }
}
