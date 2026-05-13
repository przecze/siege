import Phaser from 'phaser';
import { UNIT_ASSETS, ATLAS_ASSETS, IMAGE_ASSETS, DATA_ASSETS } from '../assets/AssetRegistry';

export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload(): void {
    for (const [key, { png, json }] of Object.entries(ATLAS_ASSETS)) {
      this.load.atlas(key, png, json);
    }
    for (const [key, { path }] of Object.entries(DATA_ASSETS)) {
      this.load.json(key, path);
    }
    for (const [key, { png, json }] of Object.entries(UNIT_ASSETS)) {
      this.load.aseprite(key, png, json);
    }
    for (const [key, { path }] of Object.entries(IMAGE_ASSETS)) {
      this.load.image(key, path);
    }
  }

  create(): void {
    for (const key of Object.keys(UNIT_ASSETS)) {
      this.anims.createFromAseprite(key);
    }
    this.scene.start('changelog');
  }
}
