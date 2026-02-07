# /// script
# requires-python = ">=3.13"
# dependencies = ["pillow"]
# ///
"""Prepare game-ready assets: unpack the Tiny RPG Character Asset Pack and
generate element sprites."""

import json
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image

ASSETS_DIR = Path(__file__).resolve().parent
ZIP_GLOB = "Tiny RPG Character Asset Pack*.zip"
UNPACK_DIR = ASSETS_DIR / "unpacked"

# Where the app serves static assets from
APP_ASSETS = ASSETS_DIR.parent / "app" / "public" / "assets" / "units"

# Find the top-level directory inside the zip (name varies by version)
PACK_GLOB = "Tiny RPG Character Asset Pack*"

FRAME_SIZE = 100  # Each frame is 100x100 in the 100x100 character sheets


# ---------------------------------------------------------------------------
# Element sprite definitions
# ---------------------------------------------------------------------------

ELEMENT_SPRITES = {
    "wood": {
        "colors": {
            "0": (0, 0, 0),            # Black background
            "1": (56, 32, 10),         # Dark border / shadow
            "2": (90, 56, 24),         # Dark wood
            "3": (130, 85, 40),        # Medium brown
            "4": (165, 115, 62),       # Warm wood
            "5": (195, 150, 90),       # Light wood grain
            "6": (222, 184, 135),      # Bright grain highlight
            "7": (42, 22, 6),          # Knot / dark seam
            "8": (160, 160, 170),      # Metal stud / nail
        },
        "pixels": [
            "0000000000000000",
            "0111111111111110",
            "0183345543438110",
            "0134556654543210",
            "0134345454343210",
            "0134556655543210",
            "0123445544432110",
            "0111111711111110",
            "0111111711111110",
            "0123445544432110",
            "0134556655543210",
            "0134345474343210",
            "0134556654543210",
            "0183345543438110",
            "0111111111111110",
            "0000000000000000",
        ],
    },
    "steel": {
        "colors": {
            "0": (0, 0, 0),            # Black background
            "1": (55, 55, 65),         # Dark edge
            "2": (85, 90, 100),        # Dark steel
            "3": (120, 125, 140),      # Medium steel
            "4": (155, 160, 175),      # Steel body
            "5": (185, 190, 205),      # Light steel
            "6": (215, 220, 235),      # Bright steel
            "7": (240, 243, 252),      # Specular highlight
            "8": (95, 110, 140),       # Rivet (blue tint)
        },
        "pixels": [
            "0000000000000000",
            "0111111111111110",
            "0187654333328110",
            "0176555444432110",
            "0165555555433110",
            "0155555555543110",
            "0145555555544310",
            "0145555555544310",
            "0134555555544310",
            "0134455555443210",
            "0133445555443210",
            "0123344444433210",
            "0123334443332210",
            "0182233333228110",
            "0111111111111110",
            "0000000000000000",
        ],
    },
    "magic": {
        "colors": {
            "0": (0, 0, 0),            # Black background
            "1": (5, 35, 20),          # Very dark green aura
            "2": (10, 70, 45),         # Dark green
            "3": (25, 120, 75),        # Green glow
            "4": (50, 175, 110),       # Bright green
            "5": (90, 220, 150),       # Neon green
            "6": (160, 255, 200),      # Cyan highlight
            "7": (235, 255, 245),      # White sparkle
            "8": (130, 60, 210),       # Purple accent
            "9": (210, 150, 255),      # Light purple sparkle
        },
        "pixels": [
            "0000000000000900",
            "0000012210000000",
            "0001234432100000",
            "0012345543210000",
            "0123456654321000",
            "0123467765432100",
            "9134567765432100",
            "0134577765432100",
            "0123467765432100",
            "0123456654321009",
            "0012345543210000",
            "0001234432100000",
            "0000123321000000",
            "0000012210000000",
            "0900000000000000",
            "0000000000000000",
        ],
    },
    "fire": {
        "colors": {
            "0": (0, 0, 0),            # Black background
            "1": (80, 8, 0),           # Dark ember base
            "2": (140, 20, 0),         # Deep red
            "3": (200, 50, 5),         # Red
            "4": (240, 100, 10),       # Red-orange
            "5": (255, 155, 25),       # Orange
            "6": (255, 200, 55),       # Amber
            "7": (255, 235, 110),      # Yellow
            "8": (255, 250, 200),      # White-hot center
            "9": (255, 180, 40),       # Secondary orange
        },
        "pixels": [
            "0000007000000000",
            "0000078000000000",
            "0000787000000000",
            "0007878000070000",
            "0007887000870000",
            "0078888508760000",
            "0078888878760000",
            "0788888887660000",
            "0688888887600000",
            "0688888876600000",
            "0068888876000000",
            "0006788760000000",
            "0006677600000000",
            "0000566500000000",
            "0000344000000000",
            "0000120000000000",
        ],
    },
}


def generate_element_sprites() -> None:
    """Generate a combined element spritesheet + Phaser JSON atlas into APP_ASSETS.

    Produces ``elements.png`` (a single-row strip of 16x16 tiles) and
    ``elements.json`` (Phaser JSON-Hash atlas) so all four element tiles are
    loaded as one texture with named frames.
    """
    APP_ASSETS.mkdir(parents=True, exist_ok=True)

    names = list(ELEMENT_SPRITES.keys())
    tile_w = len(ELEMENT_SPRITES[names[0]]["pixels"][0])
    tile_h = len(ELEMENT_SPRITES[names[0]]["pixels"])
    sheet_w = tile_w * len(names)

    sheet = Image.new("RGBA", (sheet_w, tile_h))
    frames: dict = {}

    for i, name in enumerate(names):
        data = ELEMENT_SPRITES[name]
        pixels = data["pixels"]
        colors = data["colors"]
        ox = i * tile_w
        for y in range(tile_h):
            for x in range(tile_w):
                rgb = colors[pixels[y][x]]
                sheet.putpixel((ox + x, y), (*rgb, 255))
        frames[name] = {
            "frame": {"x": ox, "y": 0, "w": tile_w, "h": tile_h},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": tile_w, "h": tile_h},
            "sourceSize": {"w": tile_w, "h": tile_h},
        }

    atlas = {
        "frames": frames,
        "meta": {
            "image": "elements.png",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": tile_h},
            "scale": "1",
        },
    }

    out_png = APP_ASSETS / "elements.png"
    out_json = APP_ASSETS / "elements.json"
    sheet.save(out_png)
    out_json.write_text(json.dumps(atlas, indent=2))
    print(f"  elements.png ({sheet_w}x{tile_h}, {len(names)} frames)")
    print(f"  elements.json (generated)")


# ---------------------------------------------------------------------------
# Asset-pack unpacking helpers
# ---------------------------------------------------------------------------

def find_pack_root() -> Path | None:
    """Return the single top-level directory inside UNPACK_DIR."""
    candidates = sorted(UNPACK_DIR.glob(PACK_GLOB))
    return candidates[0] if candidates else None


def unpack_zip() -> bool:
    """Extract the zip if not already done. Returns True if pack is available."""
    if UNPACK_DIR.exists() and find_pack_root():
        print(f"Already unpacked in {UNPACK_DIR}")
        return True

    zips = sorted(ASSETS_DIR.glob(ZIP_GLOB))
    if not zips:
        print(
            f"ERROR: No asset zip found in {ASSETS_DIR}\n"
            f"Download the full pack from:\n"
            f"  https://zerie.itch.io/tiny-rpg-character-asset-pack\n"
            f"and place the zip file in the assets/ directory.",
            file=sys.stderr,
        )
        return False

    zip_path = zips[-1]  # latest version if multiple
    print(f"Unpacking {zip_path.name} -> {UNPACK_DIR}/")
    UNPACK_DIR.mkdir(exist_ok=True)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(UNPACK_DIR)

    return True


def copy_asset(src: Path, dst: Path) -> None:
    """Copy a file, creating parent dirs as needed. Skip if unchanged."""
    if dst.exists() and dst.stat().st_size == src.stat().st_size:
        print(f"  {dst.name} (up to date)")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"  {dst.name} (copied)")


def process_character(
    char_dir: Path,
    char_name: str,
    output_key: str,
    animations: list[tuple[str, str]],
) -> None:
    """Build a combined spritesheet + Aseprite JSON from individual strip PNGs.

    Each frame is individually trimmed to its minimal bounding box.  The JSON
    uses Aseprite's trimmed-sprite format so Phaser knows how to position each
    frame within the original canvas.  ``sourceSize`` is the original frame
    size (100x100) so ``setOrigin(0.5, 1)`` anchors at the bottom-center of
    the virtual canvas — i.e. the character's feet.

    Args:
        char_dir: Directory containing the strip PNGs (e.g. .../Soldier/Soldier/)
        char_name: Character name prefix in filenames (e.g. "Soldier")
        output_key: Output filename stem (e.g. "soldier" → soldier.png + soldier.json)
        animations: List of (tag_name, strip_suffix) tuples, e.g.
                    [("idle", "Idle"), ("run", "Walk"), ("attack", "Attack01")]
    """
    # --- Load all strips and extract individual frames ---
    all_frames: list[tuple[str, Image.Image]] = []  # (tag_name, frame_img)
    tag_ranges: list[tuple[str, int, int]] = []  # (tag_name, start, end)

    for tag_name, strip_suffix in animations:
        strip_path = char_dir / f"{char_name}-{strip_suffix}.png"
        if not strip_path.exists():
            print(f"  WARNING: {strip_path.name} not found, skipping")
            continue
        img = Image.open(strip_path)
        frame_count = img.width // FRAME_SIZE
        tag_start = len(all_frames)
        for i in range(frame_count):
            x = i * FRAME_SIZE
            frame = img.crop((x, 0, x + FRAME_SIZE, FRAME_SIZE))
            all_frames.append((tag_name, frame))
        tag_ranges.append((tag_name, tag_start, len(all_frames) - 1))

    if not all_frames:
        print(f"  ERROR: No frames found for {char_name}")
        return

    # --- Find unified content bbox across ALL frames ---
    uni_min_x, uni_min_y = FRAME_SIZE, FRAME_SIZE
    uni_max_x, uni_max_y = 0, 0
    for _, frame in all_frames:
        bbox = frame.getbbox()
        if bbox:
            uni_min_x = min(uni_min_x, bbox[0])
            uni_min_y = min(uni_min_y, bbox[1])
            uni_max_x = max(uni_max_x, bbox[2])
            uni_max_y = max(uni_max_y, bbox[3])

    src_w = uni_max_x - uni_min_x
    src_h = uni_max_y - uni_min_y
    print(f"  {char_name}: sourceSize {src_w}x{src_h} "
          f"(from {FRAME_SIZE}x{FRAME_SIZE}, offset {uni_min_x},{uni_min_y})")

    # --- Per-frame trim: find each frame's tight bbox ---
    trimmed: list[tuple[Image.Image, tuple[int, int, int, int]]] = []
    max_h = 0
    for _, frame in all_frames:
        bbox = frame.getbbox()
        if bbox:
            cropped = frame.crop(bbox)
            trimmed.append((cropped, bbox))
            max_h = max(max_h, cropped.height)
        else:
            # Fully transparent frame — keep as 1x1
            trimmed.append((Image.new("RGBA", (1, 1)), (0, 0, 1, 1)))

    # --- Pack into a single-row spritesheet (bottom-aligned) ---
    total_w = sum(img.width for img, _ in trimmed)
    sheet = Image.new("RGBA", (total_w, max_h))

    frames_json = []
    sheet_x = 0
    for idx, ((cropped, bbox), (_, _orig)) in enumerate(zip(trimmed, all_frames)):
        cw, ch = cropped.size
        sheet.paste(cropped, (sheet_x, max_h - ch))

        # spriteSourceSize is relative to the unified bbox, not the full 100x100
        frames_json.append({
            "filename": str(idx),
            "frame": {"x": sheet_x, "y": max_h - ch, "w": cw, "h": ch},
            "rotated": False,
            "trimmed": True,
            "spriteSourceSize": {
                "x": bbox[0] - uni_min_x,
                "y": bbox[1] - uni_min_y,
                "w": cw, "h": ch,
            },
            "sourceSize": {"w": src_w, "h": src_h},
            "duration": 100,
        })
        sheet_x += cw

    frame_tags = [
        {"name": f"{output_key}-{name}", "from": start, "to": end, "direction": "forward"}
        for name, start, end in tag_ranges
    ]

    atlas_json = {
        "frames": frames_json,
        "meta": {
            "app": "https://www.aseprite.org/",
            "version": "1.3",
            "image": f"{output_key}.png",
            "format": "RGBA8888",
            "size": {"w": total_w, "h": max_h},
            "scale": "1",
            "frameTags": frame_tags,
        },
    }

    # Write outputs
    out_png = APP_ASSETS / f"{output_key}.png"
    out_json = APP_ASSETS / f"{output_key}.json"
    out_png.parent.mkdir(parents=True, exist_ok=True)

    sheet.save(out_png)
    out_json.write_text(json.dumps(atlas_json, indent=2))

    savings = (1 - total_w * max_h / (len(all_frames) * FRAME_SIZE ** 2)) * 100
    print(f"  {char_name}: {len(all_frames)} frames, sheet {total_w}x{max_h} "
          f"(sourceSize {src_w}x{src_h}, {savings:.0f}% smaller)")
    print(f"  {output_key}.png + {output_key}.json ({len(frame_tags)} animations)")


def publish_assets() -> None:
    """Copy and process assets into the app's public directory."""
    pack = find_pack_root()
    if not pack:
        return

    print(f"Publishing assets to {APP_ASSETS}/")

    # Arrow projectile
    copy_asset(
        pack / "Arrow(Projectile)" / "Arrow01(32x32).png",
        APP_ASSETS / "arrow.png",
    )

    chars_dir = pack / "Characters(100x100)"

    # Soldier → infantry
    process_character(
        chars_dir / "Soldier" / "Soldier",
        "Soldier",
        "soldier",
        [
            ("run", "Walk"),
            ("attack", "Attack01"),
        ],
    )

    # Lancer → rider
    process_character(
        chars_dir / "Lancer" / "Lancer",
        "Lancer",
        "lancer",
        [
            ("run", "Walk01"),
            ("attack", "Attack01"),
        ],
    )

    # Archer
    process_character(
        chars_dir / "Archer" / "Archer",
        "Archer",
        "archer",
        [
            ("run", "Walk"),
            ("attack", "Attack01"),
        ],
    )


def main() -> int:
    # Always generate element sprites (no external asset pack needed)
    print("Generating element sprites...")
    generate_element_sprites()

    # Unpack and process character assets from the zip
    if not unpack_zip():
        return 1
    publish_assets()
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
