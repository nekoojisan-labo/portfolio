from pathlib import Path
import sys

from PIL import Image, ImageDraw


sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "characters" / "sprites"

FRAME_W = 72
FRAME_H = 92
COLS = 4
ROWS = 4
SHEET_W = FRAME_W * COLS
SHEET_H = FRAME_H * ROWS
CENTER_X = FRAME_W // 2
BASELINE_Y = 84

DIRECTIONS = ("down", "left", "right", "up")

OUTLINE = (9, 12, 18, 255)
DEEP = (0, 2, 6, 255)
WHITE = (236, 244, 250, 255)
PUPIL = (3, 4, 7, 255)
METAL = (176, 190, 198, 255)
METAL_DARK = (96, 108, 118, 255)
GOLD = (231, 177, 58, 255)
LEATHER = (78, 48, 31, 255)
SHOE = (12, 13, 17, 255)
SHOE_DARK = (5, 6, 9, 255)
SOLE = (221, 228, 231, 255)


NPC_SPECS = [
    {
        "id": "npc_elder",
        "hair": "#d8d9d2",
        "outfit": "#665844",
        "inner": "#dcc9ad",
        "accent": "#cfa85a",
        "skin": "#d8b79d",
        "pants": "#403a35",
        "style": "elder_jacket",
        "hair_style": "elder",
        "prop": "cane",
        "shoulder_w": 23,
        "hip_w": 20,
        "depth": 17,
        "torso_top": 41,
        "hip_y": 62,
        "head_y": 27,
        "head_w": 16,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 4,
        "stride_front": 4,
        "stride_side": 7,
        "arm_swing": 3,
        "hunch": 5,
        "bob": 0,
    },
    {
        "id": "npc_priest",
        "hair": "#1c2430",
        "outfit": "#21364c",
        "inner": "#eef3f8",
        "accent": "#cad8e8",
        "skin": "#d8b69a",
        "pants": "#1b2734",
        "style": "priest_robe",
        "hair_style": "priest",
        "prop": "priest_staff",
        "shoulder_w": 27,
        "hip_w": 29,
        "depth": 21,
        "torso_top": 32,
        "hip_y": 63,
        "hem_y": 77,
        "head_y": 19,
        "head_w": 17,
        "head_h": 20,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 5,
        "stride_side": 10,
        "arm_swing": 4,
    },
    {
        "id": "npc_worker",
        "hair": "#493527",
        "outfit": "#46505a",
        "inner": "#da8b12",
        "accent": "#f3c138",
        "skin": "#d3aa88",
        "pants": "#38434d",
        "style": "worker",
        "hair_style": "work_cap",
        "prop": "tool",
        "shoulder_w": 34,
        "hip_w": 31,
        "depth": 25,
        "torso_top": 36,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 18,
        "head_h": 19,
        "leg_w": 7,
        "arm_w": 7,
        "stride_front": 7,
        "stride_side": 13,
        "arm_swing": 6,
    },
    {
        "id": "npc_citizen_male",
        "hair": "#27292d",
        "outfit": "#2c3542",
        "inner": "#d9dee5",
        "accent": "#3477b8",
        "skin": "#d3ad95",
        "pants": "#222a34",
        "style": "suit",
        "hair_style": "side_part",
        "prop": "briefcase",
        "shoulder_w": 28,
        "hip_w": 23,
        "depth": 20,
        "torso_top": 36,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 17,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 6,
        "stride_side": 11,
        "arm_swing": 5,
    },
    {
        "id": "npc_citizen_female",
        "hair": "#653248",
        "outfit": "#7c455f",
        "inner": "#ead1dc",
        "accent": "#59d5c7",
        "skin": "#dfb596",
        "pants": "#4b2c42",
        "style": "female_coat",
        "hair_style": "bob",
        "prop": "handbag",
        "shoulder_w": 24,
        "hip_w": 28,
        "depth": 18,
        "torso_top": 36,
        "hip_y": 62,
        "hem_y": 73,
        "head_y": 22,
        "head_w": 18,
        "head_h": 20,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 6,
        "stride_side": 10,
        "arm_swing": 5,
    },
    {
        "id": "npc_resident",
        "hair": "#4a3829",
        "outfit": "#315947",
        "inner": "#d8c9a0",
        "accent": "#f2c14d",
        "skin": "#d5b399",
        "pants": "#27373a",
        "style": "hoodie",
        "hair_style": "casual",
        "prop": "eco_bag",
        "shoulder_w": 29,
        "hip_w": 27,
        "depth": 21,
        "torso_top": 37,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 17,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 6,
        "stride_side": 11,
        "arm_swing": 5,
    },
    {
        "id": "citizen",
        "hair": "#343a42",
        "outfit": "#49525a",
        "inner": "#c5ced5",
        "accent": "#768896",
        "skin": "#d2ae94",
        "pants": "#30363c",
        "style": "plain",
        "hair_style": "plain_short",
        "shoulder_w": 27,
        "hip_w": 24,
        "depth": 19,
        "torso_top": 37,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 17,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 6,
        "stride_side": 10,
        "arm_swing": 4,
    },
    {
        "id": "merchant_weapon",
        "hair": "#2d2622",
        "outfit": "#672827",
        "inner": "#d3c6b1",
        "accent": "#e05242",
        "skin": "#d1a884",
        "pants": "#3b2b29",
        "style": "merchant_apron",
        "hair_style": "merchant_cap",
        "prop": "sword",
        "shoulder_w": 35,
        "hip_w": 31,
        "depth": 25,
        "torso_top": 35,
        "hip_y": 61,
        "head_y": 21,
        "head_w": 18,
        "head_h": 19,
        "leg_w": 7,
        "arm_w": 6,
        "stride_front": 7,
        "stride_side": 13,
        "arm_swing": 5,
    },
    {
        "id": "merchant_armor",
        "hair": "#4b3628",
        "outfit": "#6a5632",
        "inner": "#c48f37",
        "accent": "#efc35f",
        "skin": "#d2ab88",
        "pants": "#4b3d28",
        "style": "armor_apron",
        "hair_style": "merchant_cap",
        "prop": "gauntlets",
        "shoulder_w": 37,
        "hip_w": 34,
        "depth": 27,
        "torso_top": 36,
        "hip_y": 62,
        "head_y": 22,
        "head_w": 18,
        "head_h": 18,
        "leg_w": 7,
        "arm_w": 7,
        "stride_front": 6,
        "stride_side": 11,
        "arm_swing": 4,
    },
    {
        "id": "merchant_item",
        "hair": "#294534",
        "outfit": "#1f5a42",
        "inner": "#cde7cf",
        "accent": "#42d687",
        "skin": "#ddb492",
        "pants": "#24352f",
        "style": "item_apron",
        "hair_style": "merchant_cap",
        "prop": "bottles",
        "shoulder_w": 24,
        "hip_w": 22,
        "depth": 18,
        "torso_top": 36,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 16,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 4,
        "stride_front": 6,
        "stride_side": 10,
        "arm_swing": 5,
    },
    {
        "id": "merchant_magic",
        "hair": "#3b1d56",
        "outfit": "#2b1738",
        "inner": "#7653b5",
        "accent": "#d37df2",
        "skin": "#d5add0",
        "pants": "#24112f",
        "style": "magic_robe",
        "hair_style": "hood",
        "prop": "crystal_staff",
        "shoulder_w": 28,
        "hip_w": 29,
        "depth": 21,
        "torso_top": 34,
        "hip_y": 62,
        "hem_y": 76,
        "head_y": 21,
        "head_w": 16,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 5,
        "stride_side": 10,
        "arm_swing": 4,
    },
    {
        "id": "innkeeper",
        "hair": "#855636",
        "outfit": "#7b482c",
        "inner": "#efd2a4",
        "accent": "#f0a23d",
        "skin": "#dcb391",
        "pants": "#513424",
        "style": "innkeeper",
        "hair_style": "round_hair",
        "prop": "tray",
        "shoulder_w": 34,
        "hip_w": 35,
        "depth": 26,
        "torso_top": 36,
        "hip_y": 62,
        "head_y": 22,
        "head_w": 18,
        "head_h": 18,
        "leg_w": 6,
        "arm_w": 6,
        "stride_front": 5,
        "stride_side": 10,
        "arm_swing": 4,
    },
    {
        "id": "banker",
        "hair": "#202631",
        "outfit": "#1e2b4a",
        "inner": "#dce7f2",
        "accent": "#4ba6de",
        "skin": "#d3ac8c",
        "pants": "#172035",
        "style": "banker",
        "hair_style": "combed",
        "prop": "ledger",
        "shoulder_w": 24,
        "hip_w": 20,
        "depth": 17,
        "torso_top": 36,
        "hip_y": 61,
        "head_y": 22,
        "head_w": 16,
        "head_h": 19,
        "leg_w": 4,
        "arm_w": 4,
        "stride_front": 5,
        "stride_side": 9,
        "arm_swing": 4,
    },
    {
        "id": "guildmaster",
        "hair": "#64646b",
        "outfit": "#6e2b2d",
        "inner": "#c9a356",
        "accent": "#ef594d",
        "skin": "#d0a27e",
        "pants": "#3a2425",
        "style": "guildmaster",
        "hair_style": "swept_back",
        "prop": "cape",
        "shoulder_w": 39,
        "hip_w": 33,
        "depth": 28,
        "torso_top": 34,
        "hip_y": 62,
        "head_y": 20,
        "head_w": 19,
        "head_h": 20,
        "leg_w": 7,
        "arm_w": 7,
        "stride_front": 7,
        "stride_side": 13,
        "arm_swing": 5,
    },
    {
        "id": "dark_merchant",
        "hair": "#0d0a13",
        "outfit": "#15101d",
        "inner": "#402850",
        "accent": "#8454c7",
        "skin": "#9f86ad",
        "pants": "#100a15",
        "style": "dark_robe",
        "hair_style": "deep_hood",
        "prop": "hidden_pouch",
        "shoulder_w": 27,
        "hip_w": 25,
        "depth": 19,
        "torso_top": 36,
        "hip_y": 62,
        "hem_y": 76,
        "head_y": 23,
        "head_w": 16,
        "head_h": 19,
        "leg_w": 5,
        "arm_w": 5,
        "stride_front": 4,
        "stride_side": 8,
        "arm_swing": 3,
        "hunch": 4,
        "bob": 0,
    },
]


def rgb(hex_color):
    value = hex_color.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def blend(color, target, amount):
    return tuple(round(color[i] * (1 - amount) + target[i] * amount) for i in range(3))


def shade(color, amount):
    if amount >= 0:
        return blend(color, (255, 255, 255), amount)
    return blend(color, (0, 0, 0), -amount)


def rgba(color, alpha=255):
    if len(color) == 4:
        return color[:3] + (alpha,)
    return color + (alpha,)


def make_palette(spec):
    hair = rgb(spec["hair"])
    outfit = rgb(spec["outfit"])
    inner = rgb(spec["inner"])
    accent = rgb(spec["accent"])
    skin = rgb(spec["skin"])
    pants = rgb(spec.get("pants", spec["outfit"]))
    return {
        "hair": rgba(hair),
        "hair_dark": rgba(shade(hair, -0.28)),
        "hair_light": rgba(shade(hair, 0.18)),
        "outfit": rgba(outfit),
        "outfit_dark": rgba(shade(outfit, -0.24)),
        "outfit_deep": rgba(shade(outfit, -0.42)),
        "outfit_light": rgba(shade(outfit, 0.2)),
        "inner": rgba(inner),
        "inner_dark": rgba(shade(inner, -0.18)),
        "inner_light": rgba(shade(inner, 0.18)),
        "accent": rgba(accent),
        "accent_dark": rgba(shade(accent, -0.28)),
        "accent_light": rgba(shade(accent, 0.25)),
        "skin": rgba(skin),
        "skin_dark": rgba(shade(skin, -0.18)),
        "skin_light": rgba(shade(skin, 0.16)),
        "pants": rgba(pants),
        "pants_dark": rgba(shade(pants, -0.26)),
        "pants_deep": rgba(shade(pants, -0.42)),
    }


def pt(value):
    return int(round(value))


def points(seq):
    return [(pt(x), pt(y)) for x, y in seq]


def box(x0, y0, x1, y1):
    return (pt(min(x0, x1)), pt(min(y0, y1)), pt(max(x0, x1)), pt(max(y0, y1)))


def side_points(seq, cx, facing, bob=0, lean=0):
    return points((cx + x * facing + lean, y + bob) for x, y in seq)


def poly(draw, seq, fill, outline=OUTLINE, width=2):
    pts = points(seq)
    draw.polygon(pts, fill=fill)
    if outline and width:
        draw.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def rect(draw, xy, fill, outline=OUTLINE):
    b = box(*xy)
    draw.rectangle(b, fill=outline)
    x0, y0, x1, y1 = b
    if x1 - x0 > 2 and y1 - y0 > 2:
        draw.rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def ellipse(draw, xy, fill, outline=OUTLINE):
    b = box(*xy)
    draw.ellipse(b, fill=outline)
    x0, y0, x1, y1 = b
    if x1 - x0 > 2 and y1 - y0 > 2:
        draw.ellipse((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def round_rect(draw, xy, radius, fill, outline=OUTLINE):
    b = box(*xy)
    draw.rounded_rectangle(b, radius=radius, fill=outline)
    x0, y0, x1, y1 = b
    draw.rounded_rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), radius=max(0, radius - 1), fill=fill)


def limb(draw, seq, fill, width=5, outline_width=None):
    pts = points(seq)
    outline_width = outline_width if outline_width is not None else width + 4
    draw.line(pts, fill=OUTLINE, width=outline_width, joint="curve")
    draw.line(pts, fill=fill, width=width, joint="curve")


def draw_staff_line(draw, seq, fill=LEATHER, width=2):
    limb(draw, seq, fill, width=width, outline_width=width + 3)


def body_bob(spec, phase):
    if spec.get("bob", 1) == 0:
        return 0
    return -1 if phase in (1, 3) else 0


def draw_shoe(draw, x, bottom, facing, c, front=True, wide=0):
    fill = SHOE if front else SHOE_DARK
    if facing == 0:
        b = box(x - 6 - wide, bottom - 4, x + 6 + wide, bottom)
        lace = (x - 3, bottom - 5, x + 3, bottom - 5)
    else:
        b = box(x - 6 - wide if facing < 0 else x - 4 - wide, bottom - 4,
                x + 4 + wide if facing < 0 else x + 6 + wide, bottom)
        lace = (x - 3 * facing, bottom - 5, x + 3 * facing, bottom - 5)
    draw.rounded_rectangle(b, radius=2, fill=OUTLINE)
    x0, y0, x1, y1 = b
    draw.rounded_rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), radius=1, fill=fill)
    draw.rectangle((x0 + 2, bottom - 1, x1 - 2, bottom), fill=SOLE)
    draw.line(lace, fill=c["accent"], width=1)


def front_arm_positions(spec, phase, bob):
    sw = spec["shoulder_w"] / 2
    y = spec["torso_top"] + 6 + bob
    swing = spec.get("arm_swing", 5)
    if phase == 0:
        left_hand = (CENTER_X - sw - 2, 56 + bob - swing // 3)
        right_hand = (CENTER_X + sw + 3, 61 + bob + swing // 2)
    elif phase == 2:
        left_hand = (CENTER_X - sw - 3, 61 + bob + swing // 2)
        right_hand = (CENTER_X + sw + 2, 56 + bob - swing // 3)
    elif phase == 1:
        left_hand = (CENTER_X - sw - 1, 58 + bob)
        right_hand = (CENTER_X + sw + 2, 58 + bob)
    else:
        left_hand = (CENTER_X - sw - 2, 59 + bob)
        right_hand = (CENTER_X + sw + 1, 57 + bob)
    left_shoulder = (CENTER_X - sw + 2, y)
    right_shoulder = (CENTER_X + sw - 2, y)
    return left_shoulder, right_shoulder, left_hand, right_hand


def side_arm_positions(spec, phase, bob, facing):
    swing = spec.get("arm_swing", 5)
    top = spec["torso_top"] + 7 + bob
    near_shoulder = (CENTER_X + 4 * facing, top)
    far_shoulder = (CENTER_X - 3 * facing, top)
    if phase == 0:
        near_hand = (CENTER_X - facing * (7 + swing), 59 + bob)
        far_hand = (CENTER_X + facing * (8 + swing), 55 + bob)
    elif phase == 2:
        near_hand = (CENTER_X + facing * (8 + swing), 55 + bob)
        far_hand = (CENTER_X - facing * (7 + swing), 59 + bob)
    elif phase == 1:
        near_hand = (CENTER_X + facing * 4, 59 + bob)
        far_hand = (CENTER_X - facing * 4, 57 + bob)
    else:
        near_hand = (CENTER_X - facing * 4, 58 + bob)
        far_hand = (CENTER_X + facing * 4, 58 + bob)
    return far_shoulder, near_shoulder, far_hand, near_hand


def draw_front_legs(draw, spec, c, phase, bob, back_view=False):
    hip_y = spec["hip_y"] + bob
    stride = spec["stride_front"]
    hip_sep = max(4, spec["hip_w"] // 5)
    leg_w = spec["leg_w"]
    knee_y = hip_y + (BASELINE_Y - hip_y) * 0.58
    shoe_w = 1 if spec["leg_w"] >= 7 else 0

    def leg(hip_x, knee_x, foot_x, fill, front):
        limb(draw, [(hip_x, hip_y), (knee_x, knee_y), (foot_x, BASELINE_Y - 4)], fill, width=leg_w)
        draw.rectangle(box(knee_x - 2, knee_y - 1, knee_x + 2, knee_y + 1), fill=c["pants_deep"])
        draw_shoe(draw, foot_x, BASELINE_Y, 0, c, front=front, wide=shoe_w)

    if phase == 0:
        rear = (CENTER_X + hip_sep, CENTER_X + 3, CENTER_X + max(3, stride // 2), c["pants_dark"], False)
        front = (CENTER_X - hip_sep, CENTER_X - stride // 2, CENTER_X - stride - 3, c["pants"], True)
    elif phase == 2:
        rear = (CENTER_X - hip_sep, CENTER_X - 3, CENTER_X - max(3, stride // 2), c["pants_dark"], False)
        front = (CENTER_X + hip_sep, CENTER_X + stride // 2, CENTER_X + stride + 3, c["pants"], True)
    elif phase == 1:
        rear = (CENTER_X + hip_sep, CENTER_X + 3, CENTER_X + 3, c["pants_dark"], False)
        front = (CENTER_X - hip_sep, CENTER_X - 1, CENTER_X - 1, c["pants"], True)
    else:
        rear = (CENTER_X - hip_sep, CENTER_X - 3, CENTER_X - 3, c["pants_dark"], False)
        front = (CENTER_X + hip_sep, CENTER_X + 1, CENTER_X + 1, c["pants"], True)

    if back_view:
        leg(*front)
        leg(*rear)
    else:
        leg(*rear)
        leg(*front)


def draw_side_legs(draw, spec, c, phase, bob, facing):
    hip_y = spec["hip_y"] + bob
    stride = spec["stride_side"]
    leg_w = spec["leg_w"]
    shoe_w = 1 if spec["leg_w"] >= 7 else 0
    knee_y = hip_y + (BASELINE_Y - hip_y) * 0.56

    def leg(hip_x, knee_x, foot_x, fill, front):
        limb(draw, [(hip_x, hip_y), (knee_x, knee_y), (foot_x, BASELINE_Y - 4)], fill, width=leg_w)
        draw.rectangle(box(knee_x - 2, knee_y - 1, knee_x + 2, knee_y + 1), fill=c["pants_deep"])
        draw_shoe(draw, foot_x, BASELINE_Y, facing, c, front=front, wide=shoe_w)

    if phase == 0:
        far = (CENTER_X - 4 * facing, CENTER_X - 6 * facing, CENTER_X - (stride - 2) * facing, c["pants_dark"], False)
        near = (CENTER_X + 3 * facing, CENTER_X + 8 * facing, CENTER_X + stride * facing, c["pants"], True)
    elif phase == 2:
        far = (CENTER_X - 4 * facing, CENTER_X + 8 * facing, CENTER_X + stride * facing, c["pants_dark"], False)
        near = (CENTER_X + 3 * facing, CENTER_X - 6 * facing, CENTER_X - (stride - 2) * facing, c["pants"], True)
    elif phase == 1:
        far = (CENTER_X - 4 * facing, CENTER_X - 2 * facing, CENTER_X - 2 * facing, c["pants_dark"], False)
        near = (CENTER_X + 3 * facing, CENTER_X + 2 * facing, CENTER_X + 4 * facing, c["pants"], True)
    else:
        far = (CENTER_X - 4 * facing, CENTER_X + 2 * facing, CENTER_X + 2 * facing, c["pants_dark"], False)
        near = (CENTER_X + 3 * facing, CENTER_X - 2 * facing, CENTER_X - 4 * facing, c["pants"], True)

    leg(*far)
    leg(*near)


def draw_front_arms(draw, spec, c, phase, bob, back_view=False):
    left_s, right_s, left_h, right_h = front_arm_positions(spec, phase, bob)
    aw = spec["arm_w"]
    left_color = c["outfit_dark"] if phase in (0, 1) else c["outfit"]
    right_color = c["outfit"] if phase in (0, 1) else c["outfit_dark"]
    if back_view:
        left_color, right_color = right_color, left_color
    limb(draw, [left_s, (left_s[0] - 2, 49 + bob), left_h], left_color, width=aw)
    limb(draw, [right_s, (right_s[0] + 2, 49 + bob), right_h], right_color, width=aw)
    ellipse(draw, (left_h[0] - 3, left_h[1] - 3, left_h[0] + 3, left_h[1] + 4), c["skin_dark"])
    ellipse(draw, (right_h[0] - 3, right_h[1] - 3, right_h[0] + 3, right_h[1] + 4), c["skin"])
    return left_h, right_h


def draw_side_arms(draw, spec, c, phase, bob, facing):
    far_s, near_s, far_h, near_h = side_arm_positions(spec, phase, bob, facing)
    aw = spec["arm_w"]
    limb(draw, [far_s, (CENTER_X - 2 * facing, 49 + bob), far_h], c["outfit_dark"], width=aw)
    limb(draw, [near_s, (CENTER_X + 6 * facing, 50 + bob), near_h], c["outfit"], width=aw)
    ellipse(draw, (far_h[0] - 3, far_h[1] - 3, far_h[0] + 3, far_h[1] + 4), c["skin_dark"])
    ellipse(draw, (near_h[0] - 3, near_h[1] - 3, near_h[0] + 3, near_h[1] + 4), c["skin"])
    return far_h, near_h


def draw_cape(draw, spec, c, direction, bob):
    if direction == "down":
        pts = [(CENTER_X - 18, 37 + bob), (CENTER_X + 18, 37 + bob), (CENTER_X + 25, 78), (CENTER_X, 83), (CENTER_X - 25, 78)]
    elif direction == "up":
        pts = [(CENTER_X - 20, 36 + bob), (CENTER_X + 20, 36 + bob), (CENTER_X + 27, 82), (CENTER_X, 84), (CENTER_X - 27, 82)]
    else:
        facing = -1 if direction == "left" else 1
        pts = side_points([(-10, 38), (9, 37), (18, 82), (0, 84), (-18, 72)], CENTER_X, facing, bob)
    poly(draw, pts, c["outfit_deep"])
    if direction in ("down", "up"):
        draw.line(points([(CENTER_X - 14, 44 + bob), (CENTER_X, 78), (CENTER_X + 14, 44 + bob)]), fill=c["accent_dark"], width=2)
    else:
        draw.line(points([(pts[1][0], pts[1][1] + 5), (pts[3][0], pts[3][1] - 3)]), fill=c["accent_dark"], width=2)


def draw_back_props(draw, spec, c, direction, bob):
    prop = spec.get("prop")
    if prop == "cape":
        draw_cape(draw, spec, c, direction, bob)
    if prop == "sword":
        if direction == "right":
            draw_staff_line(draw, [(23, 76), (49, 24)], METAL, width=3)
            draw_staff_line(draw, [(45, 22), (53, 18)], LEATHER, width=3)
        elif direction == "left":
            draw_staff_line(draw, [(49, 76), (23, 24)], METAL, width=3)
            draw_staff_line(draw, [(27, 22), (19, 18)], LEATHER, width=3)
        else:
            draw_staff_line(draw, [(22, 77), (51, 25)], METAL, width=3)
            draw_staff_line(draw, [(48, 24), (56, 19)], LEATHER, width=3)
        draw.rectangle(box(42, 32 + bob, 49, 35 + bob), fill=GOLD)


def draw_front_torso(draw, spec, c, bob, back_view=False):
    sw = spec["shoulder_w"] / 2
    hw = spec["hip_w"] / 2
    top = spec["torso_top"] + bob
    hip = spec["hip_y"] + bob
    hem = spec.get("hem_y", hip + 7)
    style = spec["style"]

    if style in ("priest_robe", "magic_robe", "dark_robe"):
        body = [(CENTER_X - sw, top), (CENTER_X + sw, top), (CENTER_X + hw + 4, hem), (CENTER_X - hw - 4, hem)]
    elif style == "female_coat":
        body = [(CENTER_X - sw, top), (CENTER_X + sw, top), (CENTER_X + hw + 3, hem), (CENTER_X - hw - 3, hem)]
    else:
        body = [(CENTER_X - sw, top), (CENTER_X + sw, top), (CENTER_X + hw, hip + 6), (CENTER_X - hw, hip + 6)]
    poly(draw, body, c["outfit"])
    draw.polygon(points([(CENTER_X + 1, top + 2), (CENTER_X + sw - 3, top + 7), (CENTER_X + hw - 2, hip + 4), (CENTER_X + 2, hip + 5)]), fill=c["outfit_dark"])
    draw.line(points([(CENTER_X - sw + 3, top + 3), (CENTER_X - 3, top + 2)]), fill=c["outfit_light"], width=1)

    if back_view:
        draw.line(points([(CENTER_X - sw + 3, top + 4), (CENTER_X + sw - 3, top + 4)]), fill=c["accent_dark"], width=2)
        if style in ("priest_robe", "magic_robe", "dark_robe"):
            draw.line(points([(CENTER_X, top + 4), (CENTER_X, hem - 2)]), fill=c["accent_dark"], width=2)
        return

    if style in ("suit", "banker"):
        poly(draw, [(CENTER_X - 7, top + 3), (CENTER_X + 7, top + 3), (CENTER_X + 6, hip + 1), (CENTER_X - 6, hip + 1)], c["inner"], outline=DEEP, width=1)
        poly(draw, [(CENTER_X, top + 5), (CENTER_X + 4, top + 10), (CENTER_X, top + 21), (CENTER_X - 4, top + 10)], c["accent"], width=1)
        draw.line(points([(CENTER_X - 10, top + 2), (CENTER_X - 3, top + 11), (CENTER_X - 8, top + 16)]), fill=c["outfit_light"], width=2)
        draw.line(points([(CENTER_X + 10, top + 2), (CENTER_X + 3, top + 11), (CENTER_X + 8, top + 16)]), fill=c["outfit_deep"], width=2)
    elif style == "plain":
        rect(draw, (CENTER_X - 6, top + 3, CENTER_X + 6, hip + 2), c["inner"], outline=DEEP)
        draw.line(points([(CENTER_X - sw + 3, hip - 2), (CENTER_X + sw - 3, hip - 2)]), fill=c["accent"], width=2)
    elif style == "hoodie":
        draw.line(points([(CENTER_X - 7, top + 2), (CENTER_X, top + 9), (CENTER_X + 7, top + 2)]), fill=c["inner"], width=2)
        draw.line(points([(CENTER_X - 3, top + 10), (CENTER_X - 5, top + 20)]), fill=c["accent"], width=1)
        draw.line(points([(CENTER_X + 3, top + 10), (CENTER_X + 5, top + 20)]), fill=c["accent"], width=1)
        round_rect(draw, (CENTER_X - 9, hip - 6, CENTER_X + 9, hip + 4), 2, c["outfit_dark"], outline=DEEP)
    elif style == "worker":
        rect(draw, (CENTER_X - 9, top + 2, CENTER_X + 9, hip + 2), c["inner"], outline=DEEP)
        draw.line(points([(CENTER_X - 10, top + 2), (CENTER_X - 5, hip + 2)]), fill=c["accent"], width=3)
        draw.line(points([(CENTER_X + 10, top + 2), (CENTER_X + 5, hip + 2)]), fill=c["accent"], width=3)
        draw.rectangle(box(CENTER_X - 16, hip - 2, CENTER_X + 16, hip + 2), fill=OUTLINE)
        draw.rectangle(box(CENTER_X - 14, hip - 1, CENTER_X - 5, hip + 2), fill=c["accent"])
        draw.rectangle(box(CENTER_X + 7, hip - 1, CENTER_X + 14, hip + 2), fill=METAL)
    elif style == "female_coat":
        poly(draw, [(CENTER_X - 8, top + 3), (CENTER_X + 8, top + 3), (CENTER_X + 5, hip + 2), (CENTER_X - 5, hip + 2)], c["inner"], outline=DEEP, width=1)
        draw.line(points([(CENTER_X, top + 4), (CENTER_X, hem - 2)]), fill=c["accent_dark"], width=2)
        draw.line(points([(CENTER_X - hw, hip + 3), (CENTER_X + hw, hip + 3)]), fill=c["accent"], width=2)
        poly(draw, [(CENTER_X - 14, hip + 4), (CENTER_X + 14, hip + 4), (CENTER_X + 10, hem), (CENTER_X - 10, hem)], c["outfit_dark"], width=1)
    elif style == "elder_jacket":
        poly(draw, [(CENTER_X - 7, top + 3), (CENTER_X + 6, top + 4), (CENTER_X + 5, hip + 2), (CENTER_X - 8, hip + 1)], c["inner"], outline=DEEP, width=1)
        draw.line(points([(CENTER_X - 8, top + 7), (CENTER_X + 8, top + 12)]), fill=c["accent"], width=2)
        draw.line(points([(CENTER_X - 5, hip - 4), (CENTER_X + 8, hip - 1)]), fill=c["outfit_light"], width=1)
    elif style in ("merchant_apron", "armor_apron", "item_apron", "innkeeper"):
        apron_w = 11 if style == "item_apron" else 14
        poly(draw, [(CENTER_X - apron_w, top + 9), (CENTER_X + apron_w, top + 9), (CENTER_X + apron_w - 1, hip + 8), (CENTER_X - apron_w + 1, hip + 8)], c["inner"], width=1)
        draw.line(points([(CENTER_X - apron_w + 3, top + 14), (CENTER_X + apron_w - 3, top + 14)]), fill=c["accent"], width=2)
        draw.line(points([(CENTER_X, top + 10), (CENTER_X, hip + 7)]), fill=c["inner_dark"], width=1)
        if style == "armor_apron":
            ellipse(draw, (CENTER_X - sw - 4, top + 1, CENTER_X - sw + 9, top + 13), METAL)
            ellipse(draw, (CENTER_X + sw - 9, top + 1, CENTER_X + sw + 4, top + 13), METAL)
            draw.line(points([(CENTER_X - sw, top + 7), (CENTER_X - sw + 6, top + 7)]), fill=GOLD, width=1)
            draw.line(points([(CENTER_X + sw - 6, top + 7), (CENTER_X + sw, top + 7)]), fill=GOLD, width=1)
        if style == "item_apron":
            draw_pouch(draw, CENTER_X - 12, hip - 2, c["accent_dark"], c["accent"])
            draw_pouch(draw, CENTER_X + 11, hip - 1, c["accent_dark"], c["accent_light"])
        if style == "innkeeper":
            draw.line(points([(CENTER_X - 13, top + 4), (CENTER_X + 13, top + 9)]), fill=c["accent"], width=3)
    elif style in ("priest_robe", "magic_robe", "dark_robe"):
        draw.line(points([(CENTER_X, top + 4), (CENTER_X, hem - 2)]), fill=c["accent"], width=2)
        draw.line(points([(CENTER_X - sw + 4, top + 16), (CENTER_X + sw - 4, top + 16)]), fill=c["accent_dark"], width=2)
        if style == "priest_robe":
            poly(draw, [(CENTER_X - 8, top + 1), (CENTER_X, top + 9), (CENTER_X + 8, top + 1), (CENTER_X + 5, top + 18), (CENTER_X - 5, top + 18)], c["inner"], outline=DEEP, width=1)
            draw.line(points([(CENTER_X, top + 10), (CENTER_X, top + 24)]), fill=c["accent_light"], width=2)
            draw.line(points([(CENTER_X - 6, top + 17), (CENTER_X + 6, top + 17)]), fill=c["accent_light"], width=2)
        elif style == "magic_robe":
            draw.rectangle(box(CENTER_X - 5, top + 21, CENTER_X + 5, top + 27), fill=c["inner"])
            draw.point((CENTER_X, top + 24), fill=WHITE)
        else:
            draw.line(points([(CENTER_X - 9, top + 8), (CENTER_X + 9, top + 11)]), fill=c["accent_dark"], width=2)
    elif style == "guildmaster":
        poly(draw, [(CENTER_X - 12, top + 3), (CENTER_X + 12, top + 3), (CENTER_X + 8, hip + 2), (CENTER_X - 8, hip + 2)], c["inner"], outline=DEEP, width=1)
        draw.rectangle(box(CENTER_X - 20, top + 2, CENTER_X - 12, top + 7), fill=GOLD)
        draw.rectangle(box(CENTER_X + 12, top + 2, CENTER_X + 20, top + 7), fill=GOLD)
        ellipse(draw, (CENTER_X - 5, top + 13, CENTER_X + 5, top + 23), GOLD)
        draw.point((CENTER_X, top + 18), fill=c["accent"])


def draw_side_torso(draw, spec, c, bob, facing):
    top = spec["torso_top"] + bob
    hip = spec["hip_y"] + bob
    hem = spec.get("hem_y", hip + 7)
    depth = spec["depth"] / 2
    style = spec["style"]
    lean = spec.get("hunch", 0) * facing // 2
    lower = hem if style in ("priest_robe", "magic_robe", "dark_robe", "female_coat") else hip + 6
    poly(draw, side_points([(-depth, top), (depth, top + 1), (depth + 3, lower), (-depth + 1, lower - 2)], CENTER_X, facing, 0, lean), c["outfit"])
    draw.polygon(side_points([(2, top + 3), (depth, top + 8), (depth - 1, lower - 3), (2, lower - 3)], CENTER_X, facing, 0, lean), fill=c["outfit_dark"])

    if style in ("suit", "banker"):
        poly(draw, side_points([(-2, top + 4), (6, top + 5), (6, hip + 1), (-1, hip + 2)], CENTER_X, facing, 0, lean), c["inner"], outline=DEEP, width=1)
        poly(draw, side_points([(1, top + 7), (5, top + 13), (2, top + 22), (-1, top + 13)], CENTER_X, facing, 0, lean), c["accent"], width=1)
    elif style == "worker":
        draw.line(side_points([(-7, top + 3), (-3, hip + 2)], CENTER_X, facing, 0, lean), fill=c["accent"], width=3)
        draw.line(side_points([(6, top + 4), (4, hip + 2)], CENTER_X, facing, 0, lean), fill=c["accent"], width=3)
        draw.line(side_points([(-depth + 2, hip - 1), (depth + 2, hip)], CENTER_X, facing, 0, lean), fill=OUTLINE, width=3)
        draw.rectangle(box(CENTER_X + facing * 7 + lean - 3, hip, CENTER_X + facing * 7 + lean + 3, hip + 5), fill=METAL)
    elif style == "hoodie":
        draw.line(side_points([(-4, top + 3), (2, top + 10), (5, top + 4)], CENTER_X, facing, 0, lean), fill=c["inner"], width=2)
        round_rect(draw, (CENTER_X - 2 + lean, hip - 6, CENTER_X + facing * 10 + lean, hip + 3), 2, c["outfit_dark"], outline=DEEP)
    elif style == "female_coat":
        draw.line(side_points([(2, top + 4), (4, hem - 3)], CENTER_X, facing, 0, lean), fill=c["accent_dark"], width=2)
        draw.line(side_points([(-depth, hip + 3), (depth, hip + 4)], CENTER_X, facing, 0, lean), fill=c["accent"], width=2)
    elif style in ("merchant_apron", "armor_apron", "item_apron", "innkeeper"):
        poly(draw, side_points([(-2, top + 10), (depth - 1, top + 11), (depth - 1, hip + 8), (-2, hip + 7)], CENTER_X, facing, 0, lean), c["inner"], width=1)
        if style == "armor_apron":
            ellipse(draw, (CENTER_X + facing * 4 + lean - 6, top + 2, CENTER_X + facing * 4 + lean + 6, top + 14), METAL)
    elif style in ("priest_robe", "magic_robe", "dark_robe"):
        draw.line(side_points([(2, top + 4), (3, hem - 2)], CENTER_X, facing, 0, lean), fill=c["accent"], width=2)
        draw.line(side_points([(-depth + 3, top + 17), (depth, top + 17)], CENTER_X, facing, 0, lean), fill=c["accent_dark"], width=2)
    elif style == "guildmaster":
        poly(draw, side_points([(-3, top + 4), (8, top + 5), (7, hip + 2), (-2, hip + 2)], CENTER_X, facing, 0, lean), c["inner"], outline=DEEP, width=1)
        draw.rectangle(box(CENTER_X + facing * 8 + lean - 4, top + 2, CENTER_X + facing * 8 + lean + 5, top + 8), fill=GOLD)


def draw_pouch(draw, x, y, fill, accent):
    round_rect(draw, (x - 4, y - 2, x + 4, y + 7), 2, fill, outline=OUTLINE)
    draw.line(points([(x - 3, y + 1), (x + 3, y + 1)]), fill=accent, width=1)


def draw_front_eye(draw, x, y, c, sleepy=False):
    if sleepy:
        draw.line((x - 3, y, x + 3, y), fill=DEEP, width=1)
        draw.point((x + 2, y - 1), fill=c["accent"])
        return
    draw.rectangle(box(x - 3, y - 2, x + 3, y + 2), fill=DEEP)
    draw.rectangle(box(x - 2, y - 1, x + 2, y + 1), fill=WHITE)
    draw.rectangle(box(x, y - 1, x + 1, y + 1), fill=PUPIL)
    draw.point((x - 1, y - 1), fill=c["accent_light"])


def draw_glasses(draw, x, y, facing=0):
    if facing == 0:
        draw.rectangle(box(x - 10, y - 3, x - 4, y + 3), outline=DEEP)
        draw.rectangle(box(x + 4, y - 3, x + 10, y + 3), outline=DEEP)
        draw.line((x - 4, y, x + 4, y), fill=DEEP, width=1)
    else:
        draw.rectangle(box(x - 4, y - 3, x + 4, y + 3), outline=DEEP)
        draw.line((x - 5 * facing, y, x - 8 * facing, y), fill=DEEP, width=1)


def draw_hair_front(draw, spec, c, cx, cy, bob, back_view=False):
    hw = spec["head_w"]
    hh = spec["head_h"]
    style = spec["hair_style"]
    if style in ("hood", "deep_hood"):
        return
    if style == "elder":
        ellipse(draw, (cx - hw // 2 - 4, cy - hh // 2 - 2, cx - hw // 2 + 4, cy + 2), c["hair"])
        ellipse(draw, (cx + hw // 2 - 4, cy - hh // 2 - 2, cx + hw // 2 + 4, cy + 2), c["hair"])
        draw.arc(box(cx - 6, cy - hh // 2 - 2, cx + 6, cy + 4), 190, 350, fill=c["hair"], width=2)
        return
    if style == "bob":
        poly(draw, [(cx - hw // 2 - 4, cy - hh // 2 + 2), (cx, cy - hh // 2 - 7), (cx + hw // 2 + 4, cy - hh // 2 + 2), (cx + hw // 2 + 3, cy + hh // 2 + 2), (cx - hw // 2 - 3, cy + hh // 2 + 2)], c["hair_dark"])
        draw.rectangle(box(cx - hw // 2 - 3, cy + 1, cx + hw // 2 + 3, cy + hh // 2 + 4), fill=c["hair"])
        draw.line((cx + 5, cy - 8, cx + 13, cy - 7), fill=c["accent"], width=2)
        return
    if style == "work_cap":
        ellipse(draw, (cx - hw // 2 - 1, cy - hh // 2 - 5, cx + hw // 2 + 1, cy - 2), c["accent"])
        draw.rectangle(box(cx - hw // 2 - 3, cy - 5, cx + hw // 2 + 5, cy - 1), fill=OUTLINE)
        draw.rectangle(box(cx - hw // 2 - 2, cy - 5, cx + hw // 2 + 4, cy - 2), fill=c["accent_light"])
        return
    if style == "merchant_cap":
        ellipse(draw, (cx - hw // 2 - 3, cy - hh // 2 - 6, cx + hw // 2 + 3, cy - 4), c["inner_dark"])
        draw.rectangle(box(cx - hw // 2 - 5, cy - 5, cx + hw // 2 + 5, cy - 1), fill=OUTLINE)
        draw.rectangle(box(cx - hw // 2 - 4, cy - 5, cx + hw // 2 + 4, cy - 2), fill=c["accent"])
        return
    if style == "swept_back":
        poly(draw, [(cx - hw // 2 - 2, cy - 7), (cx - 5, cy - hh // 2 - 7), (cx + 5, cy - hh // 2 - 9), (cx + hw // 2 + 4, cy - 5), (cx + 7, cy - 1), (cx - hw // 2, cy - 1)], c["hair"])
        return
    if style == "round_hair":
        ellipse(draw, (cx - hw // 2 - 3, cy - hh // 2 - 5, cx + hw // 2 + 3, cy + 2), c["hair"])
        draw.rectangle(box(cx - 5, cy - 11, cx + 5, cy - 4), fill=c["hair_light"])
        return
    if style == "combed":
        ellipse(draw, (cx - hw // 2 - 2, cy - hh // 2 - 4, cx + hw // 2 + 2, cy + 1), c["hair"])
        draw.line((cx - 6, cy - 9, cx + 8, cy - 5), fill=c["hair_light"], width=1)
        return
    if style == "side_part":
        ellipse(draw, (cx - hw // 2 - 2, cy - hh // 2 - 4, cx + hw // 2 + 2, cy + 1), c["hair"])
        draw.line((cx - 2, cy - 11, cx - 8, cy - 4), fill=c["hair_light"], width=1)
        draw.polygon(points([(cx - 1, cy - 10), (cx + 9, cy - 4), (cx + 3, cy - 2)]), fill=c["hair_dark"])
        return
    if style == "priest":
        ellipse(draw, (cx - hw // 2 - 1, cy - hh // 2 - 4, cx + hw // 2 + 1, cy + 1), c["hair"])
        draw.rectangle(box(cx - 3, cy - hh // 2 - 7, cx + 3, cy - hh // 2 - 3), fill=OUTLINE)
        draw.rectangle(box(cx - 2, cy - hh // 2 - 6, cx + 2, cy - hh // 2 - 4), fill=c["hair_dark"])
        return
    if style == "casual":
        ellipse(draw, (cx - hw // 2 - 2, cy - hh // 2 - 4, cx + hw // 2 + 2, cy + 1), c["hair"])
        draw.rectangle(box(cx - 8, cy - 3, cx + 8, cy), fill=c["hair_dark"])
        return
    # plain_short
    ellipse(draw, (cx - hw // 2 - 1, cy - hh // 2 - 4, cx + hw // 2 + 1, cy + 1), c["hair"])


def draw_front_hair_overlay(draw, spec, c, cx, cy):
    hw = spec["head_w"]
    hh = spec["head_h"]
    style = spec["hair_style"]
    if style == "bob":
        poly(draw, [(cx - hw // 2 - 2, cy - hh // 2 + 1), (cx - 4, cy - hh // 2 - 5), (cx + 5, cy - hh // 2 - 5), (cx + hw // 2 + 2, cy - hh // 2 + 1), (cx + hw // 2, cy - 3), (cx - hw // 2, cy - 3)], c["hair"])
        draw.rectangle(box(cx - hw // 2 - 3, cy - 4, cx - hw // 2 + 2, cy + 8), fill=c["hair_dark"])
        draw.rectangle(box(cx + hw // 2 - 2, cy - 4, cx + hw // 2 + 3, cy + 8), fill=c["hair_dark"])
        draw.line((cx + 5, cy - 8, cx + 13, cy - 7), fill=c["accent"], width=2)
        return
    draw_hair_front(draw, spec, c, cx, cy, 0)


def draw_hood_head(draw, spec, c, cx, cy, bob, back_view=False):
    hw = spec["head_w"]
    hh = spec["head_h"]
    deep = spec["hair_style"] == "deep_hood"
    hood_fill = c["outfit_deep"] if deep else c["outfit"]
    hood_light = c["accent_dark"] if deep else c["outfit_light"]
    poly(draw, [(cx, cy - hh // 2 - 10), (cx + hw // 2 + 9, cy - 5), (cx + hw // 2 + 6, cy + hh // 2 + 7), (cx, cy + hh // 2 + 10), (cx - hw // 2 - 6, cy + hh // 2 + 7), (cx - hw // 2 - 9, cy - 5)], hood_fill)
    draw.line(points([(cx - hw // 2 - 3, cy - 3), (cx, cy - hh // 2 - 5), (cx + hw // 2 + 3, cy - 3)]), fill=hood_light, width=2)
    if back_view:
        draw.line(points([(cx - 7, cy + 2), (cx, cy + 8), (cx + 7, cy + 2)]), fill=c["accent_dark"], width=1)
        return
    face_fill = c["outfit_deep"] if deep else c["skin"]
    ellipse(draw, (cx - hw // 2 + 1, cy - hh // 2, cx + hw // 2 - 1, cy + hh // 2 + 1), face_fill, outline=DEEP)
    if deep:
        draw_front_eye(draw, cx - 4, cy, c, sleepy=True)
        draw_front_eye(draw, cx + 4, cy, c, sleepy=True)
    else:
        draw_front_eye(draw, cx - 4, cy - 1, c)
        draw_front_eye(draw, cx + 4, cy - 1, c)


def draw_head_front(draw, spec, c, direction, bob):
    back_view = direction == "up"
    cx = CENTER_X
    cy = spec["head_y"] + bob + max(0, spec.get("hunch", 0) // 2)
    hw = spec["head_w"]
    hh = spec["head_h"]
    if spec["hair_style"] in ("hood", "deep_hood"):
        draw_hood_head(draw, spec, c, cx, cy, bob, back_view)
        return
    draw_hair_front(draw, spec, c, cx, cy, bob, back_view)
    ellipse(draw, (cx - hw // 2, cy - hh // 2, cx + hw // 2, cy + hh // 2), c["skin"])
    if back_view:
        if spec["hair_style"] == "elder":
            draw.arc(box(cx - 9, cy - 11, cx + 9, cy + 8), 185, 355, fill=c["hair"], width=3)
        else:
            draw_hair_front(draw, spec, c, cx, cy, bob, back_view)
        return
    draw_front_hair_overlay(draw, spec, c, cx, cy)
    sleepy = spec["id"] == "dark_merchant"
    draw.line((cx - 9, cy - 4, cx - 4, cy - 5), fill=DEEP, width=1)
    draw.line((cx + 4, cy - 5, cx + 9, cy - 4), fill=DEEP, width=1)
    draw_front_eye(draw, cx - 5, cy, c, sleepy=sleepy)
    draw_front_eye(draw, cx + 5, cy, c, sleepy=sleepy)
    draw.rectangle(box(cx - 1, cy + 3, cx + 1, cy + 5), fill=c["skin_dark"])
    if spec["hair_style"] == "elder":
        draw.line((cx - 5, cy + 8, cx + 5, cy + 8), fill=c["hair_dark"], width=2)
        draw.line((cx - 8, cy + 3, cx - 4, cy + 4), fill=c["skin_dark"], width=1)
        draw.line((cx + 4, cy + 4, cx + 8, cy + 3), fill=c["skin_dark"], width=1)
    else:
        draw.line((cx - 3, cy + 8, cx + 4, cy + 8), fill=DEEP, width=1)
    if spec["style"] == "banker":
        draw_glasses(draw, cx, cy)
    if spec["style"] == "guildmaster":
        draw.line((cx - 8, cy + 9, cx + 8, cy + 9), fill=c["hair"], width=2)
        draw.rectangle(box(cx - 4, cy + 10, cx + 4, cy + 14), fill=c["hair_dark"])


def draw_hair_side(draw, spec, c, cx, cy, facing, back_view=False):
    hw = spec["head_w"]
    hh = spec["head_h"]
    style = spec["hair_style"]
    if style in ("hood", "deep_hood"):
        return
    if style == "work_cap":
        ellipse(draw, (cx - hw // 2 - 1, cy - hh // 2 - 5, cx + hw // 2 + 2, cy - 2), c["accent"])
        draw.rectangle(box(cx + facing * 2, cy - 5, cx + facing * 13, cy - 1), fill=OUTLINE)
        draw.rectangle(box(cx + facing * 2, cy - 5, cx + facing * 12, cy - 2), fill=c["accent_light"])
        return
    if style == "merchant_cap":
        ellipse(draw, (cx - hw // 2 - 3, cy - hh // 2 - 6, cx + hw // 2 + 3, cy - 4), c["inner_dark"])
        draw.rectangle(box(cx - facing * 5, cy - 5, cx + facing * 12, cy - 1), fill=OUTLINE)
        draw.rectangle(box(cx - facing * 4, cy - 5, cx + facing * 11, cy - 2), fill=c["accent"])
        return
    if style == "bob":
        poly(draw, [(cx - hw // 2 - 2, cy - hh // 2), (cx + facing * 1, cy - hh // 2 - 7), (cx + facing * (hw // 2 + 5), cy - 3), (cx + facing * (hw // 2 + 4), cy + hh // 2 + 4), (cx - facing * (hw // 2 + 2), cy + hh // 2 + 2)], c["hair"])
        return
    if style == "elder":
        ellipse(draw, (cx - facing * 10, cy - 10, cx - facing * 1, cy + 3), c["hair"])
        draw.arc(box(cx - 8, cy - 10, cx + 8, cy + 5), 190, 330, fill=c["hair"], width=2)
        return
    if style == "swept_back":
        poly(draw, [(cx - facing * 9, cy - 2), (cx - facing * 4, cy - 13), (cx + facing * 9, cy - 15), (cx + facing * 8, cy - 2)], c["hair"])
        return
    ellipse(draw, (cx - hw // 2 - 2, cy - hh // 2 - 4, cx + hw // 2 + 2, cy + 1), c["hair"])


def draw_side_hair_overlay(draw, spec, c, cx, cy, facing):
    hw = spec["head_w"]
    hh = spec["head_h"]
    style = spec["hair_style"]
    if style == "bob":
        poly(draw, [(cx - facing * (hw // 2 + 1), cy - 3), (cx - facing * 1, cy - hh // 2 - 6), (cx + facing * (hw // 2 + 4), cy - 3), (cx + facing * (hw // 2 + 2), cy + 5), (cx + facing * 2, cy - 2)], c["hair"])
        draw.rectangle(box(cx - facing * (hw // 2 + 1), cy - 2, cx - facing * (hw // 2 - 5), cy + 9), fill=c["hair_dark"])
        draw.line((cx + facing * 3, cy - 8, cx + facing * 10, cy - 8), fill=c["accent"], width=2)
        return
    draw_hair_side(draw, spec, c, cx, cy, facing)


def draw_hood_side(draw, spec, c, cx, cy, facing):
    hw = spec["head_w"]
    hh = spec["head_h"]
    deep = spec["hair_style"] == "deep_hood"
    hood_fill = c["outfit_deep"] if deep else c["outfit"]
    poly(draw, side_points([(-9, -4), (-3, -17), (11, -10), (13, 3), (4, 12), (-9, 9)], cx, facing, cy), hood_fill)
    draw.line(side_points([(-6, -3), (0, -12), (9, -5)], cx, facing, cy), fill=c["accent_dark"], width=2)
    face = c["outfit_deep"] if deep else c["skin"]
    ellipse(draw, (cx - 6, cy - 8, cx + 8, cy + 10), face, outline=DEEP)
    eye_x = cx + facing * 4
    if deep:
        draw.line((eye_x - 3, cy, eye_x + 3, cy), fill=c["accent"], width=1)
    else:
        draw.rectangle(box(eye_x - 2, cy - 1, eye_x + 2, cy + 1), fill=DEEP)
        draw.point((eye_x + facing, cy), fill=WHITE)


def draw_head_side(draw, spec, c, direction, bob):
    facing = -1 if direction == "left" else 1
    lean = spec.get("hunch", 0)
    cx = CENTER_X + facing * (2 + lean // 2)
    cy = spec["head_y"] + bob + max(0, lean // 2)
    hw = spec["head_w"]
    hh = spec["head_h"]
    if spec["hair_style"] in ("hood", "deep_hood"):
        draw_hood_side(draw, spec, c, cx, cy, facing)
        return
    draw_hair_side(draw, spec, c, cx, cy, facing)
    ellipse(draw, (cx - hw // 2, cy - hh // 2, cx + hw // 2, cy + hh // 2), c["skin"])
    draw_side_hair_overlay(draw, spec, c, cx, cy, facing)
    nose = (cx + facing * (hw // 2 + 2), cy + 2)
    draw.rectangle(box(cx + facing * 3, cy - 1, cx + facing * 8, cy + 1), fill=DEEP)
    draw.rectangle(box(cx + facing * 5, cy - 1, cx + facing * 7, cy), fill=WHITE)
    draw.point((cx + facing * 7, cy), fill=PUPIL)
    draw.line((cx + facing * (hw // 2 - 1), cy + 2, nose[0], nose[1]), fill=c["skin_dark"], width=1)
    draw.line((cx + facing * 3, cy + 8, cx + facing * 8, cy + 8), fill=DEEP, width=1)
    if spec["style"] == "banker":
        draw_glasses(draw, cx + facing * 6, cy, facing=facing)
    if spec["style"] == "guildmaster":
        draw.rectangle(box(cx - 2, cy + 10, cx + facing * 8, cy + 14), fill=c["hair_dark"])


def draw_front_prop(draw, spec, c, direction, phase, bob, hands):
    prop = spec.get("prop")
    if not prop:
        return
    left_h, right_h = hands
    down_like = direction in ("down", "up")
    if prop == "cane":
        x_top = right_h[0] + 1 if direction == "down" else left_h[0] - 1
        x_bot = x_top + 4
        draw_staff_line(draw, [(x_top, 56 + bob), (x_bot, BASELINE_Y)], LEATHER, width=2)
        draw.arc(box(x_top - 4, 52 + bob, x_top + 5, 60 + bob), 180, 360, fill=OUTLINE, width=2)
        draw.arc(box(x_top - 3, 53 + bob, x_top + 4, 59 + bob), 180, 360, fill=GOLD, width=1)
    elif prop == "priest_staff":
        x = 53 if down_like else 20
        draw_staff_line(draw, [(x, 31 + bob), (x, BASELINE_Y)], LEATHER, width=2)
        ellipse(draw, (x - 5, 25 + bob, x + 5, 35 + bob), GOLD)
        draw.line((x - 8, 33 + bob, x + 8, 33 + bob), fill=GOLD, width=2)
        for dx in (-7, 7):
            ellipse(draw, (x + dx - 2, 35 + bob, x + dx + 2, 39 + bob), GOLD, outline=DEEP)
        for i in range(6):
            ellipse(draw, (CENTER_X - 7 + i * 3, 43 + bob + (i % 2), CENTER_X - 5 + i * 3, 45 + bob + (i % 2)), c["accent"], outline=DEEP)
    elif prop == "tool":
        x, y = right_h
        draw_staff_line(draw, [(x - 1, y - 1), (x + 7, y + 7)], LEATHER, width=2)
        draw.rectangle(box(x + 5, y - 5, x + 13, y - 1), fill=OUTLINE)
        draw.rectangle(box(x + 6, y - 4, x + 12, y - 2), fill=METAL)
    elif prop == "briefcase":
        x = right_h[0] + 2 if direction == "down" else left_h[0] - 14
        y = 61 + bob
        round_rect(draw, (x - 1, y, x + 14, y + 16), 2, c["outfit_deep"], outline=OUTLINE)
        draw.rectangle(box(x + 4, y - 4, x + 10, y), fill=OUTLINE)
        draw.line((x + 2, y + 6, x + 12, y + 6), fill=c["accent"], width=1)
    elif prop == "handbag":
        x = right_h[0] + 1
        y = 62 + bob
        round_rect(draw, (x - 1, y, x + 12, y + 14), 3, c["outfit_dark"], outline=OUTLINE)
        draw.arc(box(x + 1, y - 7, x + 10, y + 4), 180, 360, fill=OUTLINE, width=2)
        draw.line((x + 2, y + 6, x + 10, y + 6), fill=c["accent"], width=1)
    elif prop == "eco_bag":
        x = left_h[0] - 12
        y = 60 + bob
        poly(draw, [(x, y + 4), (x + 13, y + 2), (x + 16, y + 17), (x + 1, y + 18)], c["inner"], width=1)
        draw.arc(box(x + 2, y - 3, x + 12, y + 8), 180, 360, fill=OUTLINE, width=2)
        draw.line((x + 3, y + 9, x + 12, y + 8), fill=c["accent"], width=2)
    elif prop == "gauntlets":
        for h in (left_h, right_h):
            rect(draw, (h[0] - 5, h[1] - 5, h[0] + 5, h[1] + 3), METAL)
            draw.line((h[0] - 4, h[1] - 1, h[0] + 4, h[1] - 1), fill=GOLD, width=1)
    elif prop == "bottles":
        for i, x in enumerate((CENTER_X - 9, CENTER_X + 8)):
            rect(draw, (x - 2, 58 + bob, x + 3, 68 + bob), c["accent_light"] if i else c["accent"])
            draw.rectangle(box(x - 1, 55 + bob, x + 2, 58 + bob), fill=DEEP)
    elif prop == "crystal_staff":
        x = 53 if direction == "down" else 20
        draw_staff_line(draw, [(x, 33 + bob), (x, BASELINE_Y)], LEATHER, width=2)
        poly(draw, [(x, 24 + bob), (x + 6, 31 + bob), (x, 38 + bob), (x - 6, 31 + bob)], c["accent_light"], outline=OUTLINE, width=2)
        draw.point((x - 1, 30 + bob), fill=WHITE)
    elif prop == "tray":
        x = right_h[0] + 4
        y = 57 + bob
        ellipse(draw, (x - 9, y - 3, x + 13, y + 5), c["inner_dark"], outline=OUTLINE)
        ellipse(draw, (x - 5, y - 8, x + 4, y + 1), c["accent_light"], outline=DEEP)
        draw.line((left_h[0] - 4, left_h[1] - 2, left_h[0] + 7, left_h[1] + 5), fill=WHITE, width=3)
    elif prop == "ledger":
        x = left_h[0] - 9
        y = 57 + bob
        rect(draw, (x, y, x + 13, y + 14), c["inner"], outline=OUTLINE)
        draw.line((x + 3, y + 4, x + 10, y + 4), fill=c["accent"], width=1)
        draw.line((x + 3, y + 8, x + 9, y + 8), fill=c["accent_dark"], width=1)
    elif prop == "hidden_pouch":
        draw_pouch(draw, CENTER_X + 12, 61 + bob, c["inner"], c["accent"])


def draw_side_prop(draw, spec, c, direction, phase, bob, hands):
    prop = spec.get("prop")
    if not prop:
        return
    facing = -1 if direction == "left" else 1
    far_h, near_h = hands
    if prop == "cane":
        x_top = near_h[0] + facing * 1
        x_bot = x_top + facing * 5
        draw_staff_line(draw, [(x_top, 56 + bob), (x_bot, BASELINE_Y)], LEATHER, width=2)
    elif prop in ("priest_staff", "crystal_staff"):
        x = CENTER_X + facing * 18
        draw_staff_line(draw, [(x, 32 + bob), (x, BASELINE_Y)], LEATHER, width=2)
        if prop == "priest_staff":
            ellipse(draw, (x - 5, 26 + bob, x + 5, 36 + bob), GOLD)
            draw.line((x - 7, 34 + bob, x + 7, 34 + bob), fill=GOLD, width=2)
        else:
            poly(draw, [(x, 24 + bob), (x + 6, 31 + bob), (x, 38 + bob), (x - 6, 31 + bob)], c["accent_light"], outline=OUTLINE, width=2)
    elif prop == "tool":
        x, y = near_h
        draw_staff_line(draw, [(x, y), (x + facing * 8, y + 7)], LEATHER, width=2)
        draw.rectangle(box(x + facing * 6, y - 5, x + facing * 14, y - 1), fill=METAL)
    elif prop == "briefcase":
        x = near_h[0] + facing * 7
        y = 61 + bob
        round_rect(draw, (x, y, x + facing * 15, y + 16), 2, c["outfit_deep"], outline=OUTLINE)
        draw.rectangle(box(x + facing * 4, y - 4, x + facing * 10, y), fill=OUTLINE)
    elif prop == "handbag":
        x = near_h[0] + facing * 4
        y = 62 + bob
        round_rect(draw, (x, y, x + facing * 13, y + 14), 3, c["outfit_dark"], outline=OUTLINE)
        draw.arc(box(x, y - 6, x + facing * 12, y + 5), 180, 360, fill=OUTLINE, width=2)
    elif prop == "eco_bag":
        x = near_h[0] + facing * 4
        y = 61 + bob
        poly(draw, [(x, y + 4), (x + facing * 13, y + 2), (x + facing * 16, y + 17), (x + facing * 1, y + 18)], c["inner"], width=1)
        draw.line((x + facing * 3, y + 8, x + facing * 12, y + 8), fill=c["accent"], width=2)
    elif prop == "gauntlets":
        for h in (near_h, far_h):
            rect(draw, (h[0] - 5, h[1] - 5, h[0] + 5, h[1] + 3), METAL)
    elif prop == "bottles":
        x = CENTER_X + facing * 9
        rect(draw, (x - 2, 58 + bob, x + 3, 68 + bob), c["accent_light"], outline=OUTLINE)
    elif prop == "tray":
        x = near_h[0] + facing * 7
        y = 57 + bob
        ellipse(draw, (x - 9, y - 3, x + 13, y + 5), c["inner_dark"], outline=OUTLINE)
        ellipse(draw, (x - 5, y - 8, x + 4, y + 1), c["accent_light"], outline=DEEP)
    elif prop == "ledger":
        x = near_h[0] + facing * 4
        y = 57 + bob
        rect(draw, (x, y, x + facing * 13, y + 14), c["inner"], outline=OUTLINE)
    elif prop == "hidden_pouch":
        draw_pouch(draw, CENTER_X + facing * 10, 62 + bob, c["inner"], c["accent"])


def clip_to_baseline(frame):
    pixels = frame.load()
    for y in range(BASELINE_Y + 1, FRAME_H):
        for x in range(FRAME_W):
            pixels[x, y] = (0, 0, 0, 0)
    return frame


def draw_frame(spec, direction, phase):
    c = make_palette(spec)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    bob = body_bob(spec, phase)

    draw_back_props(draw, spec, c, direction, bob)

    if direction in ("down", "up"):
        back_view = direction == "up"
        draw_front_legs(draw, spec, c, phase, bob, back_view=back_view)
        hands = draw_front_arms(draw, spec, c, phase, bob, back_view=back_view)
        draw_front_torso(draw, spec, c, bob, back_view=back_view)
        draw_head_front(draw, spec, c, direction, bob)
        draw_front_prop(draw, spec, c, direction, phase, bob, hands)
    else:
        facing = -1 if direction == "left" else 1
        draw_side_legs(draw, spec, c, phase, bob, facing)
        hands = draw_side_arms(draw, spec, c, phase, bob, facing)
        draw_side_torso(draw, spec, c, bob, facing)
        draw_head_side(draw, spec, c, direction, bob)
        draw_side_prop(draw, spec, c, direction, phase, bob, hands)

    clip_to_baseline(frame)
    return frame


def build_sheet(spec):
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for col in range(COLS):
            frame = draw_frame(spec, direction, col)
            sheet.alpha_composite(frame, (col * FRAME_W, row * FRAME_H))
    return sheet


def save_sheet(spec):
    sheet = build_sheet(spec)
    png = OUT_DIR / f"{spec['id']}_walk.png"
    webp = OUT_DIR / f"{spec['id']}_walk.webp"
    sheet.save(png, "PNG", optimize=True)
    sheet.save(webp, "WEBP", lossless=True, method=6)
    return png, webp


def validate(path):
    image = Image.open(path).convert("RGBA")
    if image.size != (SHEET_W, SHEET_H):
        raise ValueError(f"{path.name}: expected {(SHEET_W, SHEET_H)}, got {image.size}")
    for row in range(ROWS):
        for col in range(COLS):
            crop = image.crop((col * FRAME_W, row * FRAME_H, (col + 1) * FRAME_W, (row + 1) * FRAME_H))
            bbox = crop.getchannel("A").getbbox()
            if not bbox:
                raise ValueError(f"{path.name}: empty frame row={row} col={col}")
            max_y = bbox[3] - 1
            if max_y != BASELINE_Y:
                raise ValueError(f"{path.name}: foot baseline row={row} col={col} is y={max_y}, expected {BASELINE_Y}")
    return True


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for spec in NPC_SPECS:
        png, webp = save_sheet(spec)
        validate(png)
        validate(webp)
        print(f"generated {png.relative_to(ROOT)} and {webp.relative_to(ROOT)}")
    print(f"validated {len(NPC_SPECS)} NPC walk sheets: {SHEET_W}x{SHEET_H}, RGBA, baseline y={BASELINE_Y}")


if __name__ == "__main__":
    main()
