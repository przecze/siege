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


# Define color palettes for the arrow parts
arrow_colors = {
    "0": (0, 0, 0, 0),     # Transparent background
    "1": (139, 69, 19),    # Brown for the shaft
    "2": (192, 192, 192),  # Silver/Grey for the arrowhead
    "3": (255, 0, 0),      # Red for part of the fletchings
    "4": (0, 128, 0),      # Green for part of the fletchings
}

# Arrowhead part
arrowhead_sprite = [
    "00000000000000002200000000000000",
    "00000000000000022222000000000000",
    "00000000000000222222220000000000",
    "00000000000002222222222200000000",
    "00000000000022222222222220000000",
    "00000000000222222222222222000000",
]

# Shaft part
shaft_sprite = [
    "00000000000000021112000000000000",
    *["00000000000000021112000000000000" for _ in range(16)],
]

# Fletchings part
fletchings_sprite = [
    "00000000003333333333333330000000",
    "00000000033444444444444444300000",
    "00000000334444440044444444330000",
    "00000003344440000004444444433000",
    "00000033444400000000000444443300",
    "00000334444000000000000004443300",
]

# Combine all parts to form the final arrow sprite
arrow_sprite = arrowhead_sprite + shaft_sprite + fletchings_sprite

# Assuming the sprite_to_png function exists and is properly defined,
# you would call it like this:
# sprite_to_png(final_arrow_sprite, colors, "final_arrow.png")



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

sprite_to_png((arrow_sprite, arrow_colors), "public/assets/arrow.png")

## Create and save each sprite as a PNG file
#for name, sprite_data in sprites.items():
#    output_filename = f"{name}.png"
#    sprite_to_png(sprite_data, output_filename)
#    print(f"Saved {output_filename}")

