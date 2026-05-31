from pathlib import Path
import sys

from PIL import Image, ImageDraw


sys.dont_write_bytecode = True

from generate_walk_sprites import VARIANTS  # noqa: E402


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
OUTLINE = (10, 13, 20, 255)
DEEP_OUTLINE = (0, 2, 6, 255)
EYE_WHITE = (238, 247, 255, 255)
PUPIL = (4, 6, 10, 255)
SHOE = (9, 12, 18, 255)
SHOE_DARK = (5, 7, 12, 255)
SOLE = (232, 239, 243, 255)
METAL = (190, 205, 216, 255)


STYLE_OVERRIDES = {
    "kaito_walk": {"hair_style": "spiky", "role": "hero"},
    "akari_walk": {"hair_style": "soft_side", "ribbon": True, "soft_jacket": True},
    "riku_walk": {"hair_style": "silver_sweep", "high_collar": True, "shoulder_tabs": True},
    "yami_walk": {"hair_style": "hood_bangs", "hood_shadow": True, "shadow_eyes": True},
    "citizen_walk": {"hair_style": "neat", "badge": True},
    "npc_citizen_male_walk": {"hair_style": "side_part", "tie": True},
    "npc_citizen_female_walk": {"hair_style": "bob", "hair_clip": True},
    "npc_resident_walk": {"hair_style": "neat", "scarf": True},
    "npc_elder_walk": {"hair_style": "elder", "stoop": 2, "soft_jacket": True},
    "npc_priest_walk": {"hair_style": "neat", "robe": True, "high_collar": True, "priest_mark": True},
    "npc_worker_walk": {"hair_style": "work_cap", "tool_belt": True},
    "merchant_weapon_walk": {"hair_style": "merchant_cap", "apron": True, "shoulder_tabs": True},
    "merchant_armor_walk": {"hair_style": "merchant_cap", "apron": True, "armor_pad": True},
    "merchant_item_walk": {"hair_style": "merchant_cap", "apron": True, "pouches": True},
    "merchant_magic_walk": {"hair_style": "hood_bangs", "hood_shadow": True, "apron": True},
    "innkeeper_walk": {"hair_style": "bob", "apron": True, "warm_sash": True},
    "banker_walk": {"hair_style": "combed", "glasses": True, "tie": True},
    "guildmaster_walk": {"hair_style": "swept_back", "high_collar": True, "badge": True},
    "dark_merchant_walk": {"hair_style": "hood_bangs", "hood_shadow": True, "shadow_eyes": True, "pouches": True},
}


def rgb(hex_color):
    value = hex_color.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def blend(color, target, amount):
    return tuple(round(color[i] * (1 - amount) + target[i] * amount) for i in range(3))


def shade(color, amount):
    if amount >= 0:
        return blend(color, (255, 255, 255), amount)
    return blend(color, (0, 0, 0), -amount)


def with_alpha(color, alpha=255):
    if len(color) == 4:
        return color[:3] + (alpha,)
    return color + (alpha,)


def make_palette(spec):
    hair = rgb(spec["hair"])
    outfit = rgb(spec["outfit"])
    inner = rgb(spec["inner"])
    accent = rgb(spec["accent"])
    skin = rgb(spec["skin"])
    return {
        "hair": with_alpha(hair),
        "hair_dark": with_alpha(shade(hair, -0.32)),
        "hair_deep": with_alpha(shade(hair, -0.48)),
        "hair_light": with_alpha(shade(hair, 0.24)),
        "outfit": with_alpha(outfit),
        "outfit_dark": with_alpha(shade(outfit, -0.32)),
        "outfit_deep": with_alpha(shade(outfit, -0.46)),
        "outfit_light": with_alpha(shade(outfit, 0.22)),
        "pants": with_alpha(shade(outfit, 0.08)),
        "pants_dark": with_alpha(shade(outfit, -0.22)),
        "pants_deep": with_alpha(shade(outfit, -0.38)),
        "inner": with_alpha(inner),
        "inner_dark": with_alpha(shade(inner, -0.18)),
        "inner_light": with_alpha(shade(inner, 0.15)),
        "accent": with_alpha(accent),
        "accent_dim": with_alpha(shade(accent, -0.28)),
        "accent_light": with_alpha(shade(accent, 0.25)),
        "skin": with_alpha(skin),
        "skin_dark": with_alpha(shade(skin, -0.18)),
        "skin_light": with_alpha(shade(skin, 0.14)),
    }


def character_spec(name, spec):
    merged = dict(spec)
    merged.update(STYLE_OVERRIDES.get(name, {}))
    if merged.get("hood") and "hair_style" not in merged:
        merged["hair_style"] = "hood_bangs"
    merged.setdefault("hair_style", "neat")
    return merged


def bobbed(points, bob=0):
    return [(x, y + bob) for x, y in points]


def mapped(points, cx, bob=0, facing=1):
    return [(cx + x * facing, y + bob) for x, y in points]


def poly(draw, points, fill, outline=OUTLINE, width=2):
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=width)


def inner_poly(draw, points, fill):
    draw.polygon(points, fill=fill)


def ellipse(draw, box, fill, outline=OUTLINE):
    draw.ellipse(box, fill=outline)
    x0, y0, x1, y1 = box
    draw.ellipse((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def rect(draw, box, fill, outline=OUTLINE):
    draw.rectangle(box, fill=outline)
    x0, y0, x1, y1 = box
    draw.rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def solid_rect(draw, box, fill):
    x0, y0, x1, y1 = box
    draw.rectangle((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)), fill=fill)


def line_limb(draw, points, fill, width=5, outline_width=9, outline=OUTLINE):
    draw.line(points, fill=outline, width=outline_width)
    draw.line(points, fill=fill, width=width)


def body_bob(phase):
    # Contact frames sink slightly; passing frames lift, while shoe baseline stays fixed.
    return -2 if phase in (1, 3) else 1


def front_hand_positions(phase, bob):
    if phase == 0:
        return (21, 55 + bob), (51, 63 + bob)
    if phase == 2:
        return (21, 63 + bob), (51, 55 + bob)
    if phase == 1:
        return (22, 59 + bob), (50, 57 + bob)
    return (22, 57 + bob), (50, 59 + bob)


def side_hand_positions(phase, bob, facing):
    def point(local_x, y):
        return CENTER_X + local_x * facing, y + bob

    if phase == 0:
        far_local, far_y = 14, 55
        near_local, near_y = -13, 59
    elif phase == 2:
        far_local, far_y = -13, 59
        near_local, near_y = 14, 55
    elif phase == 1:
        far_local, far_y = 6, 55
        near_local, near_y = -5, 62
    else:
        far_local, far_y = -6, 55
        near_local, near_y = 5, 62
    return point(far_local, far_y), point(near_local, near_y), far_local, near_local


def draw_shoe(draw, x, bottom, facing, c, front=True):
    fill = SHOE if front else SHOE_DARK
    if facing == 0:
        box = (x - 7, bottom - 5, x + 7, bottom)
        toe = (x + 2, bottom - 4, x + 6, bottom - 2)
        accent_line = (x - 4, bottom - 7, x + 4, bottom - 7)
    else:
        box = (
            x - 8 if facing < 0 else x - 5,
            bottom - 5,
            x + 5 if facing < 0 else x + 8,
            bottom,
        )
        toe = (
            x - 7 if facing < 0 else x + 3,
            bottom - 4,
            x - 2 if facing < 0 else x + 7,
            bottom - 2,
        )
        accent_line = (x - 4 * facing, bottom - 7, x + 4 * facing, bottom - 7)

    draw.rounded_rectangle(box, radius=2, fill=OUTLINE)
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), radius=1, fill=fill)
    draw.rectangle((x0 + 2, bottom - 1, x1 - 2, bottom), fill=SOLE)
    draw.rectangle(toe, fill=SOLE)
    draw.line(accent_line, fill=c["accent"], width=2)


def draw_knee_and_ankle(draw, knee, foot, c, facing=0, dark=False):
    knee_color = c["pants_deep"] if dark else c["pants_dark"]
    draw.rectangle((knee[0] - 3, knee[1] - 1, knee[0] + 3, knee[1] + 1), fill=knee_color)
    if facing == 0:
        draw.line((foot[0] - 3, foot[1] - 10, foot[0] + 3, foot[1] - 10), fill=c["accent"], width=2)
        draw.point((foot[0] - 2, foot[1] - 13), fill=c["outfit_light"])
    else:
        draw.line(
            (foot[0] - 3 * facing, foot[1] - 10, foot[0] + 3 * facing, foot[1] - 10),
            fill=c["accent"],
            width=2,
        )


def draw_front_legs(draw, c, phase, bob, back_view=False):
    hip_y = 58 + bob
    leg_left = c["pants_dark"]
    leg_right = c["pants"]

    def draw_leg(hip, knee, foot, color, front):
        line_limb(draw, [hip, knee, (foot[0], foot[1] - 3)], color, width=6, outline_width=10)
        draw_knee_and_ankle(draw, knee, foot, c, dark=not front)
        draw_shoe(draw, foot[0], foot[1], 0, c, front=front)

    if phase == 0:
        if back_view:
            rear = ((CENTER_X + 6, hip_y), (CENTER_X + 8, 72), (CENTER_X + 10, BASELINE_Y))
            front = ((CENTER_X - 6, hip_y), (CENTER_X - 10, 73), (CENTER_X - 13, BASELINE_Y))
        else:
            rear = ((CENTER_X + 6, hip_y), (CENTER_X + 7, 72), (CENTER_X + 9, BASELINE_Y))
            front = ((CENTER_X - 6, hip_y), (CENTER_X - 10, 72), (CENTER_X - 14, BASELINE_Y))
        draw_leg(*rear, leg_right, False)
        draw_leg(*front, leg_left, True)
    elif phase == 2:
        if back_view:
            rear = ((CENTER_X - 6, hip_y), (CENTER_X - 8, 72), (CENTER_X - 10, BASELINE_Y))
            front = ((CENTER_X + 6, hip_y), (CENTER_X + 10, 73), (CENTER_X + 13, BASELINE_Y))
        else:
            rear = ((CENTER_X - 6, hip_y), (CENTER_X - 7, 72), (CENTER_X - 9, BASELINE_Y))
            front = ((CENTER_X + 6, hip_y), (CENTER_X + 10, 72), (CENTER_X + 14, BASELINE_Y))
        draw_leg(*rear, leg_left, False)
        draw_leg(*front, leg_right, True)
    elif phase == 1:
        draw_leg((CENTER_X + 5, hip_y), (CENTER_X + 5, 72), (CENTER_X + 5, BASELINE_Y), leg_right, False)
        draw_leg((CENTER_X - 5, hip_y), (CENTER_X - 3, 72), (CENTER_X - 2, BASELINE_Y), leg_left, True)
    else:
        draw_leg((CENTER_X - 5, hip_y), (CENTER_X - 5, 72), (CENTER_X - 5, BASELINE_Y), leg_left, False)
        draw_leg((CENTER_X + 5, hip_y), (CENTER_X + 3, 72), (CENTER_X + 2, BASELINE_Y), leg_right, True)


def draw_side_legs(draw, c, phase, bob, facing):
    hip_y = 58 + bob
    front_x = CENTER_X + facing * 17
    back_x = CENTER_X - facing * 16
    near_hip = CENTER_X + facing * 3
    far_hip = CENTER_X - facing * 3

    def draw_leg(hip_x, knee_x, foot_x, color, front_layer):
        knee = (knee_x, 72)
        foot = (foot_x, BASELINE_Y - 3)
        line_limb(draw, [(hip_x, hip_y), knee, foot], color, width=6, outline_width=10)
        draw_knee_and_ankle(draw, knee, (foot_x, BASELINE_Y), c, facing=facing, dark=not front_layer)
        draw_shoe(draw, foot_x, BASELINE_Y, facing, c, front=front_layer)

    if phase == 0:
        draw_leg(far_hip, CENTER_X - facing * 8, back_x, c["pants_dark"], False)
        draw_leg(near_hip, CENTER_X + facing * 10, front_x, c["pants"], True)
    elif phase == 2:
        draw_leg(far_hip, CENTER_X + facing * 10, front_x, c["pants_dark"], False)
        draw_leg(near_hip, CENTER_X - facing * 8, back_x, c["pants"], True)
    elif phase == 1:
        draw_leg(far_hip, CENTER_X - facing * 2, CENTER_X - facing * 2, c["pants_dark"], False)
        draw_leg(near_hip, CENTER_X + facing * 3, CENTER_X + facing * 5, c["pants"], True)
    else:
        draw_leg(far_hip, CENTER_X + facing * 2, CENTER_X + facing * 2, c["pants_dark"], False)
        draw_leg(near_hip, CENTER_X - facing * 3, CENTER_X - facing * 5, c["pants"], True)


def draw_front_arms(draw, c, phase, bob, back_view=False):
    shoulder_y = 39 + bob
    left_hand, right_hand = front_hand_positions(phase, bob)
    left_color = c["outfit_dark"] if phase in (0, 1) else c["outfit"]
    right_color = c["outfit"] if phase in (0, 1) else c["outfit_dark"]
    if back_view:
        left_color, right_color = right_color, left_color

    line_limb(draw, [(25, shoulder_y), (23, 49 + bob), left_hand], left_color, width=5, outline_width=8)
    line_limb(draw, [(47, shoulder_y), (49, 49 + bob), right_hand], right_color, width=5, outline_width=8)
    draw.line((left_hand[0] - 2, left_hand[1] - 6, left_hand[0] + 2, left_hand[1] - 6), fill=c["accent"], width=2)
    draw.line((right_hand[0] - 2, right_hand[1] - 6, right_hand[0] + 2, right_hand[1] - 6), fill=c["accent"], width=2)
    draw.point((24, 45 + bob), fill=c["outfit_light"])
    draw.point((48, 45 + bob), fill=c["outfit_light"])
    ellipse(draw, (left_hand[0] - 3, left_hand[1] - 3, left_hand[0] + 3, left_hand[1] + 4), c["skin"])
    ellipse(draw, (right_hand[0] - 3, right_hand[1] - 3, right_hand[0] + 3, right_hand[1] + 4), c["skin"])


def draw_side_arms(draw, c, phase, bob, facing):
    def point(local_x, y):
        return CENTER_X + local_x * facing, y + bob

    far_hand, near_hand, far_local, near_local = side_hand_positions(phase, bob, facing)
    far_shoulder = point(-1, 39)
    near_shoulder = point(3, 40)
    line_limb(draw, [far_shoulder, point(5 if far_local > 0 else -5, 48), far_hand], c["outfit_dark"], width=5, outline_width=8)
    line_limb(draw, [near_shoulder, point(5 if near_local > 0 else -5, 50), near_hand], c["outfit"], width=5, outline_width=8)
    draw.line((near_hand[0] - 3 * facing, near_hand[1] - 6, near_hand[0] + 2 * facing, near_hand[1] - 6), fill=c["accent"], width=2)
    draw.point((near_shoulder[0] + facing, near_shoulder[1] + 7), fill=c["outfit_light"])
    ellipse(draw, (far_hand[0] - 3, far_hand[1] - 3, far_hand[0] + 3, far_hand[1] + 4), c["skin_dark"])
    ellipse(draw, (near_hand[0] - 3, near_hand[1] - 3, near_hand[0] + 3, near_hand[1] + 4), c["skin"])


def draw_back_layers(draw, spec, c, direction, bob):
    if spec.get("prop") == "cape":
        if direction == "up":
            pts = [(26, 39 + bob), (46, 39 + bob), (55, 79), (36, 83), (17, 79)]
        elif direction == "down":
            pts = [(28, 40 + bob), (44, 40 + bob), (48, 68), (36, 72), (24, 68)]
        else:
            facing = -1 if direction == "left" else 1
            pts = mapped([(-7, 41), (7, 43), (15, 79), (-4, 75), (-12, 49)], CENTER_X, bob, facing)
        poly(draw, pts, c["outfit_deep"])
        draw.line(bobbed([(30, 44), (36, 73), (42, 44)], bob), fill=c["accent_dim"], width=1)


def draw_front_torso(draw, c, bob, spec, back_view=False):
    rect(draw, (32, 32 + bob, 40, 41 + bob), c["skin_dark"] if back_view else c["skin"])
    lower = 71 if spec.get("robe") else 68
    jacket = [
        (24, 36 + bob),
        (48, 36 + bob),
        (53, 49 + bob),
        (49, lower + bob),
        (42, lower + bob),
        (30, lower + bob),
        (23, lower + bob),
        (19, 49 + bob),
    ]
    poly(draw, jacket, c["outfit"])
    inner_poly(
        draw,
        [(38, 38 + bob), (50, 49 + bob), (48, lower - 2 + bob), (39, lower + bob)],
        c["outfit_dark"],
    )
    draw.line((25, 39 + bob, 35, 37 + bob), fill=c["outfit_light"], width=1)

    if back_view:
        draw.line((25, 39 + bob, 47, 39 + bob), fill=c["accent_dim"], width=2)
        draw.line([(29, 44 + bob), (36, 63 + bob), (43, 44 + bob)], fill=c["outfit_light"], width=2)
        draw.line((24, 64 + bob, 48, 64 + bob), fill=c["accent"], width=2)
        if spec.get("hood_shadow"):
            draw.arc((22, 29 + bob, 50, 47 + bob), 180, 360, fill=c["accent_dim"], width=2)
        return

    inner = [(31, 38 + bob), (41, 38 + bob), (44, 64 + bob), (28, 64 + bob)]
    poly(draw, inner, c["inner"], outline=DEEP_OUTLINE)
    draw.rectangle((33, 47 + bob, 40, 50 + bob), fill=c["inner_dark"])
    draw.line((36, 40 + bob, 36, 65 + bob), fill=c["accent_dim"], width=1)
    draw.line((29, 39 + bob, 23, 63 + bob), fill=c["accent"], width=2)
    draw.line((43, 39 + bob, 49, 63 + bob), fill=c["accent"], width=2)
    draw.line((26, 47 + bob, 31, 48 + bob), fill=c["accent_light"], width=1)
    draw.line((41, 49 + bob, 48, 48 + bob), fill=c["accent_dim"], width=1)
    draw.line((27, 68 + bob, 45, 68 + bob), fill=c["accent"], width=2)

    if spec.get("high_collar"):
        poly(draw, [(28, 36 + bob), (32, 31 + bob), (35, 39 + bob)], c["outfit_dark"], width=1)
        poly(draw, [(44, 36 + bob), (40, 31 + bob), (37, 39 + bob)], c["outfit_dark"], width=1)
        draw.line((31, 34 + bob, 41, 34 + bob), fill=c["accent"], width=1)
    else:
        poly(draw, [(28, 37 + bob), (34, 38 + bob), (31, 43 + bob)], c["outfit_dark"], width=1)
        poly(draw, [(44, 37 + bob), (38, 38 + bob), (41, 43 + bob)], c["outfit_dark"], width=1)

    if spec.get("soft_jacket"):
        draw.line((25, 51 + bob, 31, 55 + bob), fill=c["outfit_light"], width=1)
    if spec.get("shoulder_tabs"):
        draw.rectangle((22, 39 + bob, 30, 41 + bob), fill=c["accent_dim"])
        draw.rectangle((42, 39 + bob, 50, 41 + bob), fill=c["accent_dim"])
    if spec.get("armor_pad"):
        ellipse(draw, (19, 38 + bob, 30, 48 + bob), METAL)
        ellipse(draw, (42, 38 + bob, 53, 48 + bob), METAL)
        draw.line((22, 43 + bob, 28, 43 + bob), fill=c["accent"], width=1)
        draw.line((44, 43 + bob, 50, 43 + bob), fill=c["accent"], width=1)
    if spec.get("apron"):
        poly(draw, [(28, 47 + bob), (44, 47 + bob), (46, 69 + bob), (26, 69 + bob)], c["inner_dark"], width=1)
        draw.line((30, 51 + bob, 42, 51 + bob), fill=c["accent"], width=1)
        draw.line((36, 47 + bob, 36, 68 + bob), fill=c["inner_light"], width=1)
    if spec.get("robe"):
        draw.line((28, 53 + bob, 44, 53 + bob), fill=c["accent_dim"], width=1)
        draw.line((36, 38 + bob, 36, 70 + bob), fill=c["accent"], width=2)
    if spec.get("priest_mark"):
        draw.line((36, 43 + bob, 36, 54 + bob), fill=c["accent_light"], width=2)
        draw.line((31, 48 + bob, 41, 48 + bob), fill=c["accent_light"], width=2)
    if spec.get("tie"):
        poly(draw, [(36, 40 + bob), (39, 45 + bob), (36, 53 + bob), (33, 45 + bob)], c["accent"], width=1)
    if spec.get("ribbon"):
        draw.polygon([(32, 41 + bob), (28, 38 + bob), (29, 44 + bob)], fill=c["accent"])
        draw.polygon([(40, 41 + bob), (44, 38 + bob), (43, 44 + bob)], fill=c["accent"])
        draw.rectangle((35, 39 + bob, 37, 42 + bob), fill=OUTLINE)
    if spec.get("scarf"):
        draw.line((29, 38 + bob, 43, 42 + bob), fill=c["accent"], width=3)
    if spec.get("warm_sash"):
        draw.line((27, 55 + bob, 45, 61 + bob), fill=c["accent"], width=3)
    if spec.get("tool_belt"):
        draw.rectangle((25, 61 + bob, 47, 64 + bob), fill=OUTLINE)
        draw.rectangle((27, 62 + bob, 33, 64 + bob), fill=c["accent"])
        draw.rectangle((40, 62 + bob, 45, 64 + bob), fill=METAL)
    if spec.get("pouches"):
        draw.rounded_rectangle((24, 59 + bob, 31, 68 + bob), radius=1, fill=OUTLINE)
        draw.rectangle((25, 61 + bob, 30, 67 + bob), fill=c["outfit_light"])
        draw.rounded_rectangle((41, 59 + bob, 48, 68 + bob), radius=1, fill=OUTLINE)
        draw.rectangle((42, 61 + bob, 47, 67 + bob), fill=c["outfit_light"])
    if spec.get("badge"):
        draw.rectangle((42, 45 + bob, 45, 48 + bob), fill=c["accent"])


def draw_side_torso(draw, c, bob, facing, spec):
    rect(draw, (CENTER_X - 3, 32 + bob, CENTER_X + 4, 41 + bob), c["skin"])
    lower = 70 if spec.get("robe") else 68
    jacket = mapped(
        [(-10, 36), (7, 35), (13, 47), (10, lower - 6), (2, lower), (-8, 65), (-13, 49)],
        CENTER_X,
        bob,
        facing,
    )
    poly(draw, jacket, c["outfit"])
    inner_poly(draw, mapped([(2, 39), (11, 47), (9, 61), (2, 64)], CENTER_X, bob, facing), c["outfit_dark"])
    inner = mapped([(-1, 38), (7, 39), (8, 61), (0, 63)], CENTER_X, bob, facing)
    poly(draw, inner, c["inner"], outline=DEEP_OUTLINE)
    draw.line(mapped([(8, 40), (10, 61)], CENTER_X, bob, facing), fill=c["accent"], width=2)
    draw.line(mapped([(-10, 62), (8, 65)], CENTER_X, bob, facing), fill=c["accent"], width=2)
    draw.line(mapped([(-8, 42), (-2, 40)], CENTER_X, bob, facing), fill=c["outfit_light"], width=1)
    if spec.get("high_collar"):
        poly(draw, mapped([(-5, 37), (-1, 31), (4, 39)], CENTER_X, bob, facing), c["outfit_dark"], width=1)
        draw.line(mapped([(-3, 34), (5, 36)], CENTER_X, bob, facing), fill=c["accent"], width=1)
    if spec.get("apron"):
        poly(draw, mapped([(-2, 48), (9, 49), (8, 68), (-3, 66)], CENTER_X, bob, facing), c["inner_dark"], width=1)
        draw.line(mapped([(0, 53), (8, 54)], CENTER_X, bob, facing), fill=c["accent"], width=1)
    if spec.get("robe"):
        draw.line(mapped([(1, 40), (2, 69)], CENTER_X, bob, facing), fill=c["accent"], width=2)
    if spec.get("armor_pad"):
        ellipse(draw, (CENTER_X + facing * 4 - 5, 39 + bob, CENTER_X + facing * 4 + 5, 49 + bob), METAL)
    if spec.get("tool_belt") or spec.get("pouches"):
        draw.line(mapped([(-8, 61), (9, 62)], CENTER_X, bob, facing), fill=OUTLINE, width=3)
        draw.rectangle((CENTER_X + facing * 7 - 3, 62 + bob, CENTER_X + facing * 7 + 3, 67 + bob), fill=c["accent"])
    if spec.get("tie"):
        poly(draw, mapped([(1, 41), (5, 47), (2, 54), (-1, 47)], CENTER_X, bob, facing), c["accent"], width=1)


def draw_front_eye(draw, x, y, c, sleepy=False):
    draw.rectangle((x - 3, y - 2, x + 3, y + 2), fill=DEEP_OUTLINE)
    if sleepy:
        draw.line((x - 2, y, x + 2, y), fill=c["accent_dim"], width=1)
        return
    draw.rectangle((x - 2, y - 1, x + 2, y + 1), fill=EYE_WHITE)
    draw.rectangle((x - 1, y - 1, x + 1, y + 1), fill=c["accent"])
    draw.rectangle((x, y - 1, x + 1, y + 1), fill=PUPIL)
    draw.point((x - 1, y - 1), fill=(255, 255, 255, 255))


def draw_face_down_details(draw, c, bob, spec):
    sleepy = spec.get("shadow_eyes", False)
    draw.line((27, 23 + bob, 33, 22 + bob), fill=OUTLINE, width=1)
    draw.line((39, 22 + bob, 45, 23 + bob), fill=OUTLINE, width=1)
    draw_front_eye(draw, 30, 26 + bob, c, sleepy=sleepy)
    draw_front_eye(draw, 42, 26 + bob, c, sleepy=sleepy)
    draw.rectangle((35, 29 + bob, 37, 31 + bob), fill=c["skin_dark"])
    draw.point((38, 30 + bob), fill=c["skin_light"])
    draw.line((32, 34 + bob, 40, 34 + bob), fill=DEEP_OUTLINE, width=1)
    draw.point((41, 33 + bob), fill=c["skin_dark"])


def draw_face_side_details(draw, c, bob, facing, spec):
    sleepy = spec.get("shadow_eyes", False)
    eye_x = CENTER_X + 6 * facing
    eye_y = 25 + bob
    draw.line((eye_x - 4 * facing, eye_y - 3, eye_x + 2 * facing, eye_y - 4), fill=OUTLINE, width=1)
    if sleepy:
        draw.line((eye_x - 2 * facing, eye_y, eye_x + 2 * facing, eye_y), fill=c["accent_dim"], width=1)
    else:
        draw.rectangle((eye_x - 2, eye_y - 1, eye_x + 2, eye_y + 1), fill=DEEP_OUTLINE)
        draw.rectangle((eye_x - 1, eye_y - 1, eye_x + 1, eye_y), fill=EYE_WHITE)
        draw.point((eye_x + facing, eye_y - 1), fill=c["accent"])
        draw.point((eye_x + facing, eye_y), fill=PUPIL)
    draw.line((CENTER_X + 9 * facing, 32 + bob, CENTER_X + 13 * facing, 32 + bob), fill=DEEP_OUTLINE, width=1)


def draw_ribbon_or_clip(draw, c, bob, spec, facing=1, side=False):
    if spec.get("ribbon"):
        if side:
            x = CENTER_X - facing * 8
            y = 21 + bob
            draw.polygon([(x, y), (x - 5 * facing, y - 3), (x - 4 * facing, y + 4)], fill=OUTLINE)
            draw.polygon([(x, y), (x - 4 * facing, y - 2), (x - 3 * facing, y + 3)], fill=c["accent"])
        else:
            draw.polygon([(48, 21 + bob), (55, 17 + bob), (54, 25 + bob)], fill=OUTLINE)
            draw.polygon([(48, 21 + bob), (53, 18 + bob), (52, 24 + bob)], fill=c["accent"])
            draw.rectangle((46, 20 + bob, 49, 23 + bob), fill=c["accent_light"])
    if spec.get("hair_clip"):
        if side:
            draw.line((CENTER_X + facing * 3, 18 + bob, CENTER_X + facing * 10, 17 + bob), fill=c["accent"], width=2)
        else:
            draw.line((42, 18 + bob, 48, 17 + bob), fill=c["accent"], width=2)


def hair_points_down(style):
    if style == "soft_side":
        return [
            (20, 28), (18, 20), (23, 14), (30, 10), (35, 8), (42, 10), (50, 16),
            (54, 25), (51, 35), (45, 39), (43, 28), (37, 24), (32, 27), (28, 23), (24, 29),
        ]
    if style == "silver_sweep":
        return [
            (21, 25), (20, 17), (27, 11), (33, 9), (39, 6), (47, 10), (52, 17),
            (49, 25), (43, 23), (37, 28), (33, 21), (27, 27),
        ]
    if style == "hood_bangs":
        return [
            (19, 30), (18, 19), (24, 11), (34, 7), (45, 10), (52, 18), (53, 31),
            (48, 37), (43, 26), (38, 30), (34, 23), (29, 30), (24, 25),
        ]
    if style == "elder":
        return [
            (22, 27), (20, 18), (27, 13), (34, 11), (40, 12), (48, 17), (50, 27),
            (45, 35), (39, 29), (34, 32), (29, 28), (25, 35),
        ]
    if style == "bob":
        return [
            (21, 28), (20, 18), (27, 12), (36, 10), (46, 13), (52, 22), (51, 34),
            (45, 40), (39, 34), (34, 36), (28, 34), (24, 40),
        ]
    if style == "work_cap" or style == "merchant_cap":
        return [
            (22, 25), (21, 17), (28, 12), (36, 10), (44, 12), (50, 18), (49, 26),
            (43, 23), (38, 27), (32, 24), (27, 28),
        ]
    if style == "combed":
        return [
            (22, 24), (22, 17), (29, 12), (37, 11), (46, 13), (51, 19), (49, 27),
            (42, 24), (36, 22), (30, 27),
        ]
    if style == "swept_back":
        return [
            (21, 25), (21, 18), (28, 12), (36, 8), (44, 9), (52, 14), (51, 23),
            (45, 22), (39, 18), (34, 24), (28, 25),
        ]
    if style == "side_part":
        return [
            (22, 25), (21, 18), (27, 13), (34, 11), (43, 12), (50, 18), (49, 27),
            (43, 24), (37, 21), (31, 27),
        ]
    return [
        (22, 24), (20, 16), (27, 13), (28, 7), (34, 11), (36, 5), (40, 11),
        (47, 8), (45, 15), (52, 18), (47, 25), (43, 21), (39, 26),
        (35, 21), (31, 27), (27, 21),
    ]


def draw_cap_details(draw, c, bob, style):
    if style == "work_cap":
        draw.polygon([(23, 18 + bob), (34, 12 + bob), (45, 14 + bob), (50, 20 + bob), (24, 20 + bob)], fill=OUTLINE)
        draw.polygon([(25, 18 + bob), (34, 14 + bob), (44, 15 + bob), (48, 19 + bob), (25, 19 + bob)], fill=c["accent"])
        draw.rectangle((45, 20 + bob, 55, 22 + bob), fill=OUTLINE)
        draw.rectangle((45, 20 + bob, 53, 21 + bob), fill=c["accent_light"])
    elif style == "merchant_cap":
        draw.polygon([(23, 18 + bob), (31, 12 + bob), (44, 13 + bob), (51, 20 + bob), (25, 21 + bob)], fill=OUTLINE)
        draw.polygon([(25, 18 + bob), (32, 14 + bob), (43, 15 + bob), (48, 20 + bob), (26, 20 + bob)], fill=c["inner_dark"])
        draw.rectangle((43, 20 + bob, 54, 22 + bob), fill=OUTLINE)
        draw.rectangle((44, 20 + bob, 52, 21 + bob), fill=c["accent"])


def draw_hair_down(draw, c, bob, spec):
    style = spec.get("hair_style", "neat")
    if spec.get("hood_shadow"):
        hood = [(18, 32 + bob), (17, 19 + bob), (23, 10 + bob), (36, 5 + bob), (49, 10 + bob), (55, 20 + bob), (54, 33 + bob), (48, 42 + bob), (24, 42 + bob)]
        poly(draw, hood, c["outfit_dark"])
        draw.arc((20, 13 + bob, 52, 43 + bob), 195, 345, fill=c["accent_dim"], width=2)
    poly(draw, bobbed(hair_points_down(style), bob), c["hair"])
    if style == "soft_side":
        draw.polygon([(25, 24 + bob), (36, 12 + bob), (34, 27 + bob)], fill=c["hair_light"])
        draw.line((44, 19 + bob, 50, 27 + bob), fill=c["hair_dark"], width=2)
    elif style == "silver_sweep":
        draw.polygon([(29, 18 + bob), (43, 8 + bob), (38, 22 + bob)], fill=c["hair_light"])
        draw.line((25, 24 + bob, 36, 16 + bob), fill=c["hair_dark"], width=2)
    elif style == "hood_bangs":
        draw.polygon([(25, 22 + bob), (34, 13 + bob), (32, 29 + bob)], fill=c["hair_dark"])
        draw.polygon([(39, 20 + bob), (47, 16 + bob), (43, 29 + bob)], fill=c["hair_light"])
        if spec.get("hood_shadow"):
            draw.rectangle((25, 20 + bob, 47, 24 + bob), fill=c["outfit_deep"])
    elif style == "elder":
        draw.line((25, 19 + bob, 45, 18 + bob), fill=c["hair_light"], width=2)
        draw.line((24, 28 + bob, 29, 36 + bob), fill=c["hair_dark"], width=2)
        draw.line((47, 27 + bob, 43, 36 + bob), fill=c["hair_dark"], width=2)
    elif style == "combed":
        draw.line((28, 16 + bob, 47, 18 + bob), fill=c["hair_light"], width=2)
        draw.line((36, 13 + bob, 31, 26 + bob), fill=c["hair_dark"], width=2)
    elif style == "swept_back":
        draw.line((27, 16 + bob, 48, 12 + bob), fill=c["hair_light"], width=2)
        draw.line((38, 12 + bob, 49, 21 + bob), fill=c["hair_dark"], width=1)
    elif style == "bob":
        draw.line((25, 24 + bob, 25, 37 + bob), fill=c["hair_dark"], width=2)
        draw.line((47, 23 + bob, 46, 37 + bob), fill=c["hair_dark"], width=2)
        draw.line((31, 16 + bob, 43, 15 + bob), fill=c["hair_light"], width=2)
    elif style == "side_part":
        draw.line((35, 13 + bob, 31, 27 + bob), fill=c["hair_dark"], width=2)
        draw.line((36, 15 + bob, 48, 20 + bob), fill=c["hair_light"], width=1)
    else:
        draw.polygon([(25, 22 + bob), (31, 15 + bob), (30, 24 + bob)], fill=c["hair_light"])
        draw.polygon([(38, 13 + bob), (46, 10 + bob), (43, 19 + bob)], fill=c["hair_dark"])
    draw_cap_details(draw, c, bob, style)
    draw_ribbon_or_clip(draw, c, bob, spec)


def draw_head_down(draw, c, bob, spec):
    rect(draw, (32, 32 + bob, 40, 40 + bob), c["skin_dark"])
    ellipse(draw, (23, 13 + bob, 49, 38 + bob), c["skin"])
    draw.rectangle((25, 29 + bob, 27, 33 + bob), fill=c["skin_dark"])
    draw.rectangle((45, 29 + bob, 47, 33 + bob), fill=c["skin_dark"])
    draw_hair_down(draw, c, bob, spec)
    draw_face_down_details(draw, c, bob, spec)
    if spec.get("glasses"):
        draw.rectangle((27, 24 + bob, 33, 29 + bob), outline=METAL)
        draw.rectangle((39, 24 + bob, 45, 29 + bob), outline=METAL)
        draw.line((34, 26 + bob, 38, 26 + bob), fill=METAL, width=1)


def draw_hair_up(draw, c, bob, spec):
    style = spec.get("hair_style", "neat")
    if spec.get("hood_shadow"):
        hood = [(18, 31 + bob), (18, 18 + bob), (24, 10 + bob), (36, 5 + bob), (49, 10 + bob), (55, 20 + bob), (54, 33 + bob), (47, 42 + bob), (25, 42 + bob)]
        poly(draw, hood, c["outfit_dark"])
    if style == "soft_side":
        pts = [(21, 29), (19, 20), (24, 13), (34, 8), (44, 11), (52, 19), (53, 31), (47, 40), (39, 42), (29, 39)]
    elif style == "bob":
        pts = [(20, 29), (20, 18), (28, 11), (36, 9), (45, 12), (52, 21), (52, 35), (45, 42), (36, 40), (27, 42)]
    elif style == "elder":
        pts = [(22, 28), (21, 18), (29, 12), (37, 11), (45, 14), (50, 23), (48, 34), (40, 38), (31, 37), (24, 34)]
    elif style == "work_cap" or style == "merchant_cap":
        pts = [(22, 27), (22, 18), (29, 12), (37, 10), (45, 13), (50, 21), (49, 29), (42, 31), (34, 29), (27, 31)]
    else:
        pts = [(22, 28), (19, 20), (25, 15), (26, 8), (33, 11), (36, 5), (40, 11), (47, 8), (46, 16), (53, 21), (49, 30), (43, 37), (36, 40), (28, 36)]
    poly(draw, bobbed(pts, bob), c["hair"])
    draw.line((25, 30 + bob, 47, 31 + bob), fill=c["hair_dark"], width=2)
    draw.line((30, 36 + bob, 42, 36 + bob), fill=c["hair_light"], width=1)
    if style == "work_cap" or style == "merchant_cap":
        draw.rectangle((25, 17 + bob, 48, 20 + bob), fill=OUTLINE)
        draw.rectangle((27, 17 + bob, 46, 19 + bob), fill=c["accent" if style == "work_cap" else "inner_dark"])


def draw_head_up(draw, c, bob, spec):
    rect(draw, (32, 32 + bob, 40, 40 + bob), c["skin_dark"])
    ellipse(draw, (23, 12 + bob, 49, 39 + bob), c["hair"])
    draw_hair_up(draw, c, bob, spec)


def hair_points_side(style):
    if style == "soft_side":
        return [
            (-12, 27), (-14, 18), (-7, 12), (1, 9), (8, 11), (14, 16), (15, 27),
            (9, 35), (3, 30), (-2, 35), (-6, 26),
        ]
    if style == "silver_sweep":
        return [
            (-12, 24), (-13, 17), (-5, 11), (3, 8), (11, 10), (16, 15), (12, 22),
            (5, 20), (0, 30), (-6, 24),
        ]
    if style == "hood_bangs":
        return [
            (-13, 29), (-15, 18), (-8, 11), (2, 7), (12, 11), (17, 20), (15, 31),
            (8, 36), (4, 25), (-2, 31), (-7, 24),
        ]
    if style == "bob":
        return [
            (-12, 29), (-13, 18), (-6, 12), (3, 9), (12, 12), (16, 21), (15, 35),
            (9, 40), (3, 33), (-4, 36),
        ]
    if style == "work_cap" or style == "merchant_cap":
        return [
            (-12, 24), (-12, 17), (-5, 12), (4, 10), (12, 13), (15, 20), (10, 25),
            (4, 23), (-1, 28), (-7, 24),
        ]
    return [
        (-11, 24), (-13, 17), (-5, 13), (-4, 7), (2, 11), (6, 5), (8, 12),
        (15, 12), (11, 18), (13, 25), (5, 23), (0, 30), (-5, 24),
    ]


def draw_hair_side(draw, c, bob, facing, spec):
    style = spec.get("hair_style", "neat")
    if spec.get("hood_shadow"):
        hood = mapped([(-15, 31), (-15, 18), (-8, 10), (3, 6), (14, 10), (19, 21), (17, 34), (8, 41), (-6, 39)], CENTER_X, bob, facing)
        poly(draw, hood, c["outfit_dark"])
        draw.arc((CENTER_X - 16, 13 + bob, CENTER_X + 17, 40 + bob), 195, 345, fill=c["accent_dim"], width=2)
    poly(draw, mapped(hair_points_side(style), CENTER_X, bob, facing), c["hair"])
    if style == "soft_side":
        draw.polygon(mapped([(-6, 23), (5, 12), (2, 28)], CENTER_X, bob, facing), fill=c["hair_light"])
    elif style == "silver_sweep":
        draw.polygon(mapped([(-5, 18), (8, 9), (5, 23)], CENTER_X, bob, facing), fill=c["hair_light"])
    elif style == "hood_bangs":
        draw.polygon(mapped([(0, 20), (10, 15), (5, 30)], CENTER_X, bob, facing), fill=c["hair_dark"])
    elif style == "bob":
        draw.line(mapped([(-8, 25), (-8, 37)], CENTER_X, bob, facing), fill=c["hair_dark"], width=2)
    elif style == "combed":
        draw.line(mapped([(-5, 16), (12, 18)], CENTER_X, bob, facing), fill=c["hair_light"], width=2)
    else:
        draw.line(mapped([(5, 18), (12, 17)], CENTER_X, bob, facing), fill=c["hair_light"], width=2)
    if style == "work_cap":
        draw.polygon(mapped([(-10, 18), (-2, 12), (11, 15), (15, 21), (-10, 20)], CENTER_X, bob, facing), fill=OUTLINE)
        draw.polygon(mapped([(-8, 18), (-1, 14), (10, 16), (13, 20), (-8, 19)], CENTER_X, bob, facing), fill=c["accent"])
        solid_rect(draw, (CENTER_X + facing * 12 - 1, 20 + bob, CENTER_X + facing * 21 + 1, 22 + bob), OUTLINE)
    elif style == "merchant_cap":
        draw.polygon(mapped([(-10, 18), (-3, 13), (10, 15), (15, 21), (-10, 20)], CENTER_X, bob, facing), fill=OUTLINE)
        draw.polygon(mapped([(-8, 18), (-2, 15), (9, 16), (13, 20), (-8, 19)], CENTER_X, bob, facing), fill=c["inner_dark"])
        solid_rect(draw, (CENTER_X + facing * 12 - 1, 20 + bob, CENTER_X + facing * 21 + 1, 22 + bob), OUTLINE)
    draw_ribbon_or_clip(draw, c, bob, spec, facing=facing, side=True)


def draw_head_side(draw, c, bob, facing, spec):
    face = (CENTER_X - 10, 14 + bob, CENTER_X + 10, 37 + bob)
    ellipse(draw, face, c["skin"])
    nose = mapped([(8, 24), (15, 26), (8, 29)], CENTER_X, bob, facing)
    poly(draw, nose, c["skin"], outline=OUTLINE, width=1)
    ear_x = CENTER_X - 8 * facing
    ellipse(draw, (ear_x - 3, 24 + bob, ear_x + 3, 31 + bob), c["skin_dark"])
    draw_hair_side(draw, c, bob, facing, spec)
    draw_face_side_details(draw, c, bob, facing, spec)
    if spec.get("glasses"):
        eye_x = CENTER_X + 6 * facing
        draw.rectangle((eye_x - 3, 23 + bob, eye_x + 3, 28 + bob), outline=METAL)
        draw.line((eye_x - 4 * facing, 25 + bob, CENTER_X - 7 * facing, 26 + bob), fill=METAL, width=1)


def prop_side(direction):
    if direction == "left":
        return -1
    return 1


def draw_frame_prop(draw, spec, c, direction, phase, bob):
    prop = spec.get("prop")
    if not prop:
        return
    side = prop_side(direction)
    if direction == "down":
        _, hand = front_hand_positions(phase, bob)
        x = hand[0] + 5
        y = hand[1] - 2
    elif direction == "up":
        hand, _ = front_hand_positions(phase, bob)
        x = hand[0] - 5
        y = hand[1] - 2
        side = -1
    else:
        _, hand, _, _ = side_hand_positions(phase, bob, side)
        x = hand[0] + side * 4
        y = hand[1] - 2

    if prop == "cane":
        draw.line((x, y, x + side * 2, BASELINE_Y), fill=OUTLINE, width=4)
        draw.line((x, y, x + side * 2, BASELINE_Y), fill=c["inner_light"], width=2)
        draw.arc((x - 6, y - 6, x + 6, y + 6), 190 if side > 0 else -10, 20 if side > 0 else 170, fill=c["inner_light"], width=2)
    elif prop == "sword":
        draw.line((x - side * 7, y + 10, x + side * 10, y - 18), fill=OUTLINE, width=5)
        draw.line((x - side * 7, y + 10, x + side * 10, y - 18), fill=METAL, width=2)
        draw.line((x - side * 9, y + 7, x + side * 4, y + 12), fill=c["accent"], width=3)
    elif prop == "shield":
        sx = x + side * 3
        draw.ellipse((sx - 8, y - 12, sx + 8, y + 11), fill=OUTLINE)
        draw.ellipse((sx - 6, y - 10, sx + 6, y + 9), fill=c["accent_dim"])
        draw.line((sx, y - 8, sx, y + 7), fill=METAL, width=1)
        draw.line((sx - 4, y - 1, sx + 4, y - 1), fill=c["accent_light"], width=1)
    elif prop == "staff":
        sx = x + side * 2
        draw.line((sx, y - 25, sx, BASELINE_Y), fill=OUTLINE, width=4)
        draw.line((sx, y - 25, sx, BASELINE_Y), fill=METAL, width=2)
        draw.ellipse((sx - 6, y - 33, sx + 6, y - 21), fill=OUTLINE)
        draw.ellipse((sx - 4, y - 31, sx + 4, y - 23), fill=c["accent"])
        draw.point((sx - 1, y - 29), fill=(255, 255, 255, 255))
    elif prop == "satchel" or prop == "briefcase":
        sx = x + side * 2
        fill = (90, 56, 34, 255) if prop == "satchel" else c["outfit_deep"]
        draw.rounded_rectangle((sx - 8, y + 3, sx + 8, y + 18), radius=2, fill=OUTLINE)
        draw.rounded_rectangle((sx - 6, y + 5, sx + 6, y + 16), radius=1, fill=fill)
        draw.rectangle((sx - 3, y + 7, sx + 3, y + 9), fill=c["accent"])
    elif prop == "tool":
        draw.line((x - side * 7, y + 2, x + side * 7, y + 16), fill=OUTLINE, width=5)
        draw.line((x - side * 7, y + 2, x + side * 7, y + 16), fill=c["accent"], width=2)
        draw.rectangle((x + side * 5 - 2, y + 13, x + side * 5 + 3, y + 18), fill=METAL)
    elif prop == "bank":
        draw.rectangle((27, 46 + bob, 45, 49 + bob), fill=c["accent"])
        draw.rectangle((30, 43 + bob, 42, 46 + bob), fill=METAL)
    elif prop == "inn":
        draw.rectangle((26, 55 + bob, 46, 58 + bob), fill=c["accent"])
    elif prop == "priest":
        draw.line((28, 46 + bob, 44, 46 + bob), fill=c["accent"], width=2)
        draw.line((36, 38 + bob, 36, 54 + bob), fill=c["accent"], width=2)


def draw_frame(spec, direction, phase):
    c = make_palette(spec)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    bob = body_bob(phase)
    body_shift = spec.get("stoop", 0)
    pose_bob = bob + body_shift

    draw_back_layers(draw, spec, c, direction, pose_bob)
    if direction == "down":
        draw_front_legs(draw, c, phase, pose_bob, back_view=False)
        draw_front_arms(draw, c, phase, pose_bob, back_view=False)
        draw_front_torso(draw, c, pose_bob, spec, back_view=False)
        draw_head_down(draw, c, pose_bob, spec)
        draw_frame_prop(draw, spec, c, direction, phase, pose_bob)
    elif direction == "up":
        draw_front_legs(draw, c, phase, pose_bob, back_view=True)
        draw_front_arms(draw, c, phase, pose_bob, back_view=True)
        draw_front_torso(draw, c, pose_bob, spec, back_view=True)
        draw_head_up(draw, c, pose_bob, spec)
        draw_frame_prop(draw, spec, c, direction, phase, pose_bob)
    else:
        facing = -1 if direction == "left" else 1
        draw_side_legs(draw, c, phase, pose_bob, facing)
        draw_side_arms(draw, c, phase, pose_bob, facing)
        draw_side_torso(draw, c, pose_bob, facing, spec)
        draw_head_side(draw, c, pose_bob, facing, spec)
        draw_frame_prop(draw, spec, c, direction, phase, pose_bob)

    return frame


def build_sheet(spec):
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for col in range(COLS):
            frame = draw_frame(spec, direction, col)
            sheet.alpha_composite(frame, (col * FRAME_W, row * FRAME_H))
    return sheet


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, base_spec in VARIANTS.items():
        spec = character_spec(name, base_spec)
        sheet = build_sheet(spec)
        png = OUT_DIR / f"{name}.png"
        webp = OUT_DIR / f"{name}.webp"
        sheet.save(png, "PNG", optimize=True)
        sheet.save(webp, "WEBP", lossless=True, method=6)
        print(f"generated {png.relative_to(ROOT)} and {webp.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
