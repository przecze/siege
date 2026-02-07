# Siege!!

Craft your units with pattern matching to overcome the opponent castle.

Two castles sit at opposite ends of a 1D battlefield. Players spawn units from their castle that advance toward the enemy, fighting any opponents they encounter. Crafting units happens on a 2D grid with blocks representing four resources — move the blocks to form a pattern and the corresponding unit spawns.

## Asset Setup

This game uses the [Tiny RPG Character Asset Pack](https://zerie.itch.io/tiny-rpg-character-asset-pack) by Zerie. Grab it, drop the zip into the right folder, and run one command.

### 1. Place the zip

Make sure `Tiny RPG Character Asset Pack v1.03b -Full 20 Characters.zip` is present in the `assets/` directory. The exact version suffix doesn't matter as long as the filename starts with `Tiny RPG Character Asset Pack`.

### 2. Run the asset pipeline

```sh
cd app
make assets
```

This runs `assets/unpack.py` inside a Docker container which:

1. **Extracts** the zip into `assets/unpacked/`.
2. **Copies** the arrow projectile sprite.
3. **Processes** each character (Soldier, Lancer, Archer) — crops the individual animation strip PNGs, finds a tight unified bounding box, trims each frame, packs everything into a single horizontal spritesheet, and generates an Aseprite-compatible JSON atlas with `frameTags` for each animation.

Output goes to `app/public/assets/units/` (also gitignored) and is ready for the game to load at runtime.
