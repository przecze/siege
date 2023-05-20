from PIL import Image

# Define color palettes for each sprite (RGB format)
wood_colors = {
    "0": (0, 0, 0),  # Black - background
    "1": (139, 69, 19),  # Brown - wood
    "2": (222, 184, 135),  # Burlywood - wood
}
steel_colors = {
    "0": (0, 0, 0),  # Black - background
    "1": (192, 192, 192),  # Silver - steel
    "2": (128, 128, 128),  # Gray - steel
}
magic_colors = {
    "0": (0, 0, 0),  # Black - background
    "1": (0, 255, 0),  # Green - magic
    "2": (0, 128, 0),  # Dark Green - magic
}
fire_colors = {
    "0": (0, 0, 0),  # Black - background
    "1": (255, 0, 0),  # Red - fire
    "2": (255, 140, 0),  # Dark Orange - fire
}

# Define the 8x8 pixel sprites as lists of strings
wood_sprite = [
    "00000000",
    "01111110",
    "01222210",
    "01222210",
    "01222210",
    "01222210",
    "01111110",
    "00000000",
]
steel_sprite = [
    "11111111",
    "12222221",
    "12222221",
    "12222221",
    "12222221",
    "12222221",
    "12222221",
    "11111111",
]
magic_sprite = [
    "00100100",
    "01111110",
    "01222120",
    "01222120",
    "01222120",
    "01111110",
    "00100100",
    "00000000",
]
fire_sprite = [
    "00000000",
    "00011000",
    "00111100",
    "01111210",
    "01111210",
    "00111100",
    "00011000",
    "00000000",
]

sprites = {
    "wood": (wood_sprite, wood_colors),
    "steel": (steel_sprite, steel_colors),
    "magic": (magic_sprite, magic_colors),
    "fire": (fire_sprite, fire_colors),
}
infantry_colors = {
    "0": (0, 0, 0, 0),       # Black - background
    "1": (128, 64, 0),    # Brown - boots and belt
    "2": (0, 128, 0),     # Green - pants
    "3": (192, 192, 192), # Light Gray - chainmail
    "4": (128, 128, 128), # Dark Gray - sword
    "5": (255, 215, 0),   # Gold - sword hilt
    "6": (255, 0, 0),     # Red - hat
    "7": (255, 228, 196), # Light Peach - skin (face and hands)
    "8": (128, 0, 0),     # Dark Red - feather on hat
}

infantry_sprite = [
    '0000000067800000',
    '0000006777776000',
    '0000067878876000',
    '0000678876560000',
    '0000000034300000',
    '0000000124210000',
    '0000001122223000',
    '0000022222224440',
    '0000122524444110',
    '0000222254422210',
    '0000122525221110',
    '0000022000220000',
    '0000022000220000',
    '0000011000110000',
    '0000011110111100'
 ]



# Function to convert a sprite string into a PNG image
def sprite_to_png(sprite_data, output_filename):
    sprite_lines, colors = sprite_data
    sprite_size = (len(sprite_lines[0]), len(sprite_lines))
    img = Image.new("RGBA", sprite_size)

    for y in range(sprite_size[1]):
        for x in range(sprite_size[0]):
            color_id = sprite_lines[y][x]
            color = colors[color_id]
            if len(color) == 3:
                color = tuple(list(color)+[256])
            img.putpixel((x, y), colors[color_id])

    img.save(output_filename)

## Create and save each sprite as a PNG file
#for name, sprite_data in sprites.items():
#    output_filename = f"{name}.png"
#    sprite_to_png(sprite_data, output_filename)
#    print(f"Saved {output_filename}")

