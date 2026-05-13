export interface AsepriteAsset {
  png: string;
  json: string;
}

export interface ImageAsset {
  path: string;
}

export const UNIT_ASSETS = {
  soldier: { png: './assets/units/soldier.png', json: './assets/units/soldier.json' },
  lancer:  { png: './assets/units/lancer.png',  json: './assets/units/lancer.json' },
  archer:  { png: './assets/units/archer.png',  json: './assets/units/archer.json' },
} as const satisfies Record<string, AsepriteAsset>;

export type UnitTextureKey = keyof typeof UNIT_ASSETS;

export const ATLAS_ASSETS = {
  elements: { png: './assets/units/elements.png', json: './assets/units/elements.json' },
} as const satisfies Record<string, AsepriteAsset>;

export type AtlasKey = keyof typeof ATLAS_ASSETS;

export const IMAGE_ASSETS = {
  background: { path: './assets/background.svg' },
  arrow:      { path: './assets/units/arrow.png' },
} as const satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof IMAGE_ASSETS;

export const DATA_ASSETS = {
  unitPatterns: { path: './data/unitPatterns.json' },
} as const satisfies Record<string, { path: string }>;
