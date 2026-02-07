# /// script
# requires-python = ">=3.13"
# ///
"""Unpack the Tiny RPG Character Asset Pack and copy game-ready assets."""

import shutil
import sys
import zipfile
from pathlib import Path

ASSETS_DIR = Path(__file__).resolve().parent
ZIP_GLOB = "Tiny RPG Character Asset Pack*.zip"
UNPACK_DIR = ASSETS_DIR / "unpacked"

# Where the app serves static assets from
APP_ASSETS = ASSETS_DIR.parent / "app" / "public" / "assets"

# Find the top-level directory inside the zip (name varies by version)
PACK_GLOB = "Tiny RPG Character Asset Pack*"


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


def publish_assets() -> None:
    """Copy processed assets into the app's public directory."""
    pack = find_pack_root()
    if not pack:
        return

    print(f"Publishing assets to {APP_ASSETS}/")

    # Arrow projectile
    copy_asset(
        pack / "Arrow(Projectile)" / "Arrow01(32x32).png",
        APP_ASSETS / "arrow.png",
    )


def main() -> int:
    if not unpack_zip():
        return 1
    publish_assets()
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
