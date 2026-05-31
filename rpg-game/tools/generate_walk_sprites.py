from pathlib import Path
from colorsys import rgb_to_hsv, hsv_to_rgb

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "characters" / "source" / "kaito_generated_sheet.png"
OUT_DIR = ROOT / "assets" / "characters" / "sprites"

FRAME_W = 72
FRAME_H = 92
COLS = 4
ROWS = 4


VARIANTS = {
    "kaito_walk": {
        "hair": "#10131a",
        "outfit": "#111a27",
        "inner": "#d9e8f6",
        "accent": "#22d9ff",
        "skin": "#e6b998",
    },
    "akari_walk": {
        "hair": "#e59ab8",
        "outfit": "#44223a",
        "inner": "#ffd6ea",
        "accent": "#ff5ca8",
        "skin": "#efb79f",
    },
    "riku_walk": {
        "hair": "#c5ced8",
        "outfit": "#243241",
        "inner": "#c4d0dc",
        "accent": "#42d6b3",
        "skin": "#d3b39a",
    },
    "yami_walk": {
        "hair": "#2e1745",
        "outfit": "#160b24",
        "inner": "#6f3fb0",
        "accent": "#b26cff",
        "skin": "#c8a8ce",
        "hood": True,
    },
    "citizen_walk": {
        "hair": "#313946",
        "outfit": "#283848",
        "inner": "#c9d7e3",
        "accent": "#4ac7ff",
        "skin": "#d4b199",
    },
    "npc_citizen_male_walk": {
        "hair": "#24272d",
        "outfit": "#253141",
        "inner": "#d7dce3",
        "accent": "#66d5ff",
        "skin": "#c9ad95",
        "prop": "briefcase",
    },
    "npc_citizen_female_walk": {
        "hair": "#75374a",
        "outfit": "#683048",
        "inner": "#f1d3e1",
        "accent": "#57edcf",
        "skin": "#dfb79e",
    },
    "npc_resident_walk": {
        "hair": "#4a3a2a",
        "outfit": "#2f4c3a",
        "inner": "#decda8",
        "accent": "#ffd166",
        "skin": "#d4b69e",
    },
    "npc_elder_walk": {
        "hair": "#d6d6d6",
        "outfit": "#625140",
        "inner": "#e7d8c5",
        "accent": "#f8d46a",
        "skin": "#d8bca6",
        "prop": "cane",
    },
    "npc_priest_walk": {
        "hair": "#222831",
        "outfit": "#233443",
        "inner": "#eef5ff",
        "accent": "#61edff",
        "skin": "#d7b69a",
        "prop": "priest",
    },
    "npc_worker_walk": {
        "hair": "#4b3a2d",
        "outfit": "#374151",
        "inner": "#f5a60b",
        "accent": "#fbbf24",
        "skin": "#d2ad8f",
        "prop": "tool",
    },
    "merchant_weapon_walk": {
        "hair": "#28272c",
        "outfit": "#2b1d1d",
        "inner": "#c9d0d9",
        "accent": "#28d7ff",
        "skin": "#d3ad91",
        "prop": "sword",
    },
    "merchant_armor_walk": {
        "hair": "#4b392e",
        "outfit": "#343025",
        "inner": "#b98b43",
        "accent": "#f7c948",
        "skin": "#d3ad91",
        "prop": "shield",
    },
    "merchant_item_walk": {
        "hair": "#284232",
        "outfit": "#173b32",
        "inner": "#d4f5df",
        "accent": "#39f6a7",
        "skin": "#dfb79a",
        "prop": "satchel",
    },
    "merchant_magic_walk": {
        "hair": "#4a1d69",
        "outfit": "#241132",
        "inner": "#8b5cf6",
        "accent": "#e879f9",
        "skin": "#d9afd0",
        "prop": "staff",
    },
    "innkeeper_walk": {
        "hair": "#8a5a38",
        "outfit": "#5a3421",
        "inner": "#f7d6a8",
        "accent": "#f59e0b",
        "skin": "#ddb996",
        "prop": "inn",
    },
    "banker_walk": {
        "hair": "#202938",
        "outfit": "#17213b",
        "inner": "#dbeafe",
        "accent": "#38bdf8",
        "skin": "#d5b093",
        "prop": "bank",
    },
    "guildmaster_walk": {
        "hair": "#52525b",
        "outfit": "#3a2020",
        "inner": "#c5a35a",
        "accent": "#ef4444",
        "skin": "#d2a987",
        "prop": "cape",
    },
    "dark_merchant_walk": {
        "hair": "#15111f",
        "outfit": "#120819",
        "inner": "#51305f",
        "accent": "#8b5cf6",
        "skin": "#aa91b8",
        "hood": True,
    },
}


def rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgba(hex_color, alpha=255):
    return rgb(hex_color) + (alpha,)


def is_green_screen(r, g, b):
    return g > 125 and g > r * 1.55 and g > b * 1.35


def remove_green(image):
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if is_green_screen(r, g, b):
                pixels[x, y] = (0, 0, 0, 0)
    return image


def alpha_bbox(image):
    alpha = image.getchannel("A")
    return alpha.getbbox()


def trim_and_fit(frame):
    frame = remove_green(frame)
    bbox = alpha_bbox(frame)
    if not bbox:
        return Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))

    cropped = frame.crop(bbox)
    max_w = 50
    max_h = 72
    scale = min(max_w / cropped.width, max_h / cropped.height)
    size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))
    resized = cropped.resize(size, Image.Resampling.LANCZOS)

    out = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    x = (FRAME_W - resized.width) // 2
    y = FRAME_H - resized.height - 8
    out.alpha_composite(resized, (x, y))

    alpha = out.getchannel("A")
    alpha = alpha.point(lambda a: 0 if a < 24 else 255)
    out.putalpha(alpha)
    return out


def build_base_sheet():
    src = Image.open(SOURCE).convert("RGBA")
    sheet = Image.new("RGBA", (FRAME_W * COLS, FRAME_H * ROWS), (0, 0, 0, 0))
    for row in range(ROWS):
        for col in range(COLS):
            x0 = round(src.width * col / COLS)
            x1 = round(src.width * (col + 1) / COLS)
            y0 = round(src.height * row / ROWS)
            y1 = round(src.height * (row + 1) / ROWS)
            frame = trim_and_fit(src.crop((x0, y0, x1, y1)))
            sheet.alpha_composite(frame, (col * FRAME_W, row * FRAME_H))
    return sheet


def blend_color(color, target, strength):
    r, g, b = color
    tr, tg, tb = target
    return (
        round(r * (1 - strength) + tr * strength),
        round(g * (1 - strength) + tg * strength),
        round(b * (1 - strength) + tb * strength),
    )


def recolor(sheet, spec):
    out = sheet.copy().convert("RGBA")
    pixels = out.load()
    targets = {key: rgb(spec[key]) for key in ("hair", "outfit", "inner", "accent", "skin")}

    for y in range(out.height):
        frame_y = y % FRAME_H
        for x in range(out.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue

            brightness = max(r, g, b)
            saturation = (brightness - min(r, g, b)) / max(brightness, 1)
            hue, sat, val = rgb_to_hsv(r / 255, g / 255, b / 255)

            # Generated Kaito has cyan accents and light hoodie panels.
            if b > 135 and g > 95 and r < 90:
                nr, ng, nb = blend_color((r, g, b), targets["accent"], 0.88)
            elif frame_y < 34 and brightness < 92:
                nr, ng, nb = blend_color((r, g, b), targets["hair"], 0.9)
            elif r > 145 and g > 92 and b > 68 and saturation > 0.14 and frame_y < 55:
                nr, ng, nb = blend_color((r, g, b), targets["skin"], 0.74)
            elif brightness > 150 and saturation < 0.28:
                nr, ng, nb = blend_color((r, g, b), targets["inner"], 0.82)
            elif brightness < 125 and frame_y >= 32:
                nr, ng, nb = blend_color((r, g, b), targets["outfit"], 0.82)
            else:
                nr, ng, nb = r, g, b

            pixels[x, y] = (nr, ng, nb, a)

    if spec.get("hood"):
        draw_hood(out, spec)
    if spec.get("prop"):
        draw_prop(out, spec["prop"], rgb(spec["accent"]))
    clean_green_fringe(out)
    return out


def clean_green_fringe(image):
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if g > 95 and g > r + 28 and g > b + 10:
                pixels[x, y] = (0, 0, 0, 0)


def draw_hood(sheet, spec):
    draw = ImageDraw.Draw(sheet)
    outline = (4, 7, 12, 255)
    fill = rgba(spec["outfit"])
    accent = rgba(spec["accent"])
    for row in range(ROWS):
        for col in range(COLS):
            ox = col * FRAME_W
            oy = row * FRAME_H
            cx = ox + FRAME_W // 2
            cy = oy + 26
            draw.arc([cx - 17, cy - 18, cx + 17, cy + 15], 180, 360, fill=outline, width=5)
            draw.arc([cx - 15, cy - 16, cx + 15, cy + 13], 180, 360, fill=fill, width=4)
            draw.arc([cx - 15, cy - 16, cx + 15, cy + 13], 190, 350, fill=accent, width=2)


def draw_prop(sheet, prop, accent_rgb):
    draw = ImageDraw.Draw(sheet)
    accent = accent_rgb + (255,)
    outline = (4, 7, 12, 255)
    light = (230, 242, 255, 255)

    for row in range(ROWS):
        for col in range(COLS):
            ox = col * FRAME_W
            oy = row * FRAME_H
            side = -1 if row == 1 else 1
            cx = ox + FRAME_W // 2
            base = oy + 58

            if prop == "sword":
                x = cx + side * 19
                draw.line([x - side * 8, base + 8, x + side * 8, base - 15], fill=outline, width=5)
                draw.line([x - side * 8, base + 8, x + side * 8, base - 15], fill=light, width=2)
                draw.line([x - side * 9, base + 5, x + side * 3, base + 10], fill=accent, width=3)
            elif prop == "shield":
                x = cx + side * 19
                draw.ellipse([x - 7, base - 11, x + 7, base + 10], fill=outline)
                draw.ellipse([x - 5, base - 9, x + 5, base + 8], fill=accent)
                draw.line([x, base - 7, x, base + 6], fill=light, width=1)
            elif prop == "staff":
                x = cx + side * 20
                draw.line([x, base - 25, x, base + 17], fill=outline, width=4)
                draw.line([x, base - 25, x, base + 17], fill=light, width=2)
                draw.ellipse([x - 5, base - 31, x + 5, base - 21], fill=outline)
                draw.ellipse([x - 3, base - 29, x + 3, base - 23], fill=accent)
            elif prop == "satchel":
                x = cx + side * 18
                draw.rounded_rectangle([x - 8, base + 3, x + 7, base + 17], radius=2, fill=outline)
                draw.rounded_rectangle([x - 6, base + 5, x + 5, base + 15], radius=2, fill=(88, 55, 30, 255))
                draw.ellipse([x - 2, base + 8, x + 3, base + 13], fill=accent)
            elif prop == "briefcase":
                x = cx + side * 20
                draw.rounded_rectangle([x - 8, base + 4, x + 8, base + 19], radius=2, fill=outline)
                draw.rounded_rectangle([x - 6, base + 6, x + 6, base + 17], radius=2, fill=(24, 31, 42, 255))
            elif prop == "cane":
                x = cx + side * 20
                draw.line([x, base - 5, x + side * 2, base + 25], fill=outline, width=4)
                draw.line([x, base - 5, x + side * 2, base + 25], fill=light, width=2)
            elif prop == "tool":
                x = cx + side * 20
                draw.line([x - side * 7, base + 2, x + side * 6, base + 16], fill=outline, width=5)
                draw.line([x - side * 7, base + 2, x + side * 6, base + 16], fill=accent, width=2)
            elif prop == "cape":
                draw.polygon([(cx - 12, oy + 47), (cx - 24, oy + 82), (cx - 6, oy + 77), (cx + 2, oy + 49)], fill=outline)
                draw.polygon([(cx - 11, oy + 49), (cx - 21, oy + 78), (cx - 7, oy + 74), (cx, oy + 51)], fill=(104, 23, 31, 255))
            elif prop == "priest":
                draw.line([cx - 9, oy + 46, cx + 9, oy + 46], fill=accent, width=2)
                draw.line([cx, oy + 39, cx, oy + 53], fill=accent, width=2)
            elif prop == "bank":
                draw.rectangle([cx - 10, oy + 45, cx + 10, oy + 48], fill=accent)
            elif prop == "inn":
                draw.rectangle([cx - 11, oy + 55, cx + 11, oy + 58], fill=accent)


def main():
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base = build_base_sheet()

    for name, spec in VARIANTS.items():
        sheet = recolor(base, spec)
        png = OUT_DIR / f"{name}.png"
        webp = OUT_DIR / f"{name}.webp"
        sheet.save(png, "PNG", optimize=True)
        sheet.save(webp, "WEBP", lossless=True, method=6)
        print(f"generated {png.relative_to(ROOT)} and {webp.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
