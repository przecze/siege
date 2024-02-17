import Phaser from 'phaser';
import Unit from './unit'; // Adjust the path as necessary

export default class Archer extends Unit {
    constructor(scene, x, y, player) {
        super(scene, x, y, {
            textureKey: 'archer_idle_1', // Default texture
            speed: 1, // Example speed, adjust as necessary
            health: 30, // Example health, adjust as necessary
            player: player,
            attackPower: 1, // Example attack power, adjust as necessary
        });

        // Create animations
        this.createAnimations();
	this.setScale(1.5);
    }

    createAnimations() {
        // Assuming the 'preload' method in your scene loads images as 'archerIdle1', 'archerMove1', etc.

        // Move Animation
        this.anims.create({
            key: 'run',
            frames: [
		    {
			    key: 'archer_run_1',
		    },
		    {
			    key: 'archer_run_2',
		    },
		    {
			    key: 'archer_run_3',
		    },
		    {
			    key: 'archer_run_4',
		    },
		    {
			    key: 'archer_run_5',
		    },
		    {
			    key: 'archer_run_6',
		    },
	    ],
            frameRate: 10,
            repeat: -1
        });
	this.anims.create({
	    key: 'idle',
	    frames: [
		    {
			    key: 'archer_idle_1',
		    },
		    {
			    key: 'archer_idle_2',
		    },
		    {
			    key: 'archer_idle_3',
		    },
		    {
			    key: 'archer_idle_4',
		    },
		    {
			    key: 'archer_idle_5',
		    },
		    {
			    key: 'archer_idle_6',
		    },
	    ],
	    frameRate: 10,
	    repeat: -1
	});
	this.anims.create({
	    key: 'attack',
	    frames: [
		    {
			    key: 'archer_attack_1',
	            },
		    {
			    key: 'archer_attack_2',
		    },
		    {
			    key: 'archer_attack_3',
		    },
		    {
			    key: 'archer_attack_4',
		    },
		    {
			    key: 'archer_attack_5',
		    },
		    {
			    key: 'archer_attack_6',
		    },
		    {
			    key: 'archer_attack_7',
		    },
		    {
			    key: 'archer_attack_8',
		    },
		    {
			    key: 'archer_attack_9',
		    },

	    ],
	    frameRate: 10,
	    repeat: -1,
	});
    }

    playIdleAnimation() {
        this.play('idle', true);
    }

    playMoveAnimation() {
        this.play('move', true);
    }

    playAttackAnimation() {
        this.play('attack', true);
    }

    // Implement additional logic as needed, such as movement, attacking, etc.
}
