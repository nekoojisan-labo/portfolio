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
OUTLINE = (3, 6, 11, 255)
DEEP_OUTLINE = (0, 2, 6, 255)
SHOE = (9, 12, 18, 255)


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
        "hair_dark": with_alpha(shade(hair, -0.28)),
        "hair_light": with_alpha(shade(hair, 0.18)),
        "outfit": with_alpha(outfit),
        "outfit_dark": with_alpha(shade(outfit, -0.27)),
        "outfit_light": with_alpha(shade(outfit, 0.18)),
        "pants": with_alpha(shade(outfit, 0.10)),
        "pants_dark": with_alpha(shade(outfit, -0.18)),
        "inner": with_alpha(inner),
        "inner_dark": with_alpha(shade(inner, -0.14)),
        "accent": with_alpha(accent),
        "accent_dim": with_alpha(shade(accent, -0.22)),
        "skin": with_alpha(skin),
        "skin_dark": with_alpha(shade(skin, -0.16)),
    }


def poly(draw, points, fill, outline=OUTLINE):
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=2)


def ellipse(draw, box, fill, outline=OUTLINE):
    draw.ellipse(box, fill=outline)
    x0, y0, x1, y1 = box
    draw.ellipse((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def rect(draw, box, fill, outline=OUTLINE):
    draw.rectangle(box, fill=outline)
    x0, y0, x1, y1 = box
    draw.rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=fill)


def line_limb(draw, points, fill, width=5, outline_width=9, outline=OUTLINE):
    draw.line(points, fill=outline, width=outline_width)
    draw.line(points, fill=fill, width=width)


def mapped(points, cx, bob=0, facing=1):
    return [(cx + x * facing, y + bob) for x, y in points]


def body_bob(phase):
    # Contact frames sink slightly; passing frames lift, while shoe baseline stays fixed.
    return -2 if phase in (1, 3) else 1


def draw_shoe(draw, x, bottom, facing, c, front=True):
    fill = SHOE if front else (6, 8, 13, 255)
    if facing == 0:
        box = (x - 6, bottom - 4, x + 6, bottom)
        accent_line = (x - 4, bottom - 6, x + 4, bottom - 6)
    else:
        box = (x - 7 if facing < 0 else x - 5, bottom - 4, x + 5 if facing < 0 else x + 7, bottom)
        accent_line = (x - 4 * facing, bottom - 6, x + 4 * facing, bottom - 6)
    draw.rounded_rectangle(box, radius=2, fill=OUTLINE)
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), radius=1, fill=fill)
    draw.line(accent_line, fill=c["accent"], width=2)


def draw_front_legs(draw, c, phase, bob, back_view=False):
    hip_y = 58 + bob
    leg_left = c["pants_dark"]
    leg_right = c["pants"]

    def draw_leg(hip, knee, foot, color, front):
        line_limb(draw, [hip, knee, (foot[0], foot[1] - 3)], color, width=6, outline_width=10)
        draw_shoe(draw, foot[0], foot[1], 0, c, front=front)
        draw.line((foot[0] - 3, foot[1] - 10, foot[0] + 3, foot[1] - 10), fill=c["accent"], width=2)

    if phase == 0:
        if back_view:
            rear = ((CENTER_X + 6, hip_y), (CENTER_X + 8, 72), (CENTER_X + 10, BASELINE_Y))
            front = ((CENTER_X - 6, hip_y), (CENTER_X - 10, 73), (CENTER_X - 13, BASELINE_Y))
            draw_leg(*rear, leg_right, False)
            draw_leg(*front, leg_left, True)
        else:
            rear = ((CENTER_X + 6, hip_y), (CENTER_X + 7, 72), (CENTER_X + 9, BASELINE_Y))
            front = ((CENTER_X - 6, hip_y), (CENTER_X - 10, 72), (CENTER_X - 14, BASELINE_Y))
            draw_leg(*rear, leg_right, False)
            draw_leg(*front, leg_left, True)
    elif phase == 2:
        if back_view:
            rear = ((CENTER_X - 6, hip_y), (CENTER_X - 8, 72), (CENTER_X - 10, BASELINE_Y))
            front = ((CENTER_X + 6, hip_y), (CENTER_X + 10, 73), (CENTER_X + 13, BASELINE_Y))
            draw_leg(*rear, leg_left, False)
            draw_leg(*front, leg_right, True)
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
        draw_shoe(draw, foot_x, BASELINE_Y, facing, c, front=front_layer)
        draw.line((foot_x - 3 * facing, BASELINE_Y - 10, foot_x + 3 * facing, BASELINE_Y - 10), fill=c["accent"], width=2)

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
    if phase == 0:
        left_hand = (21, 55 + bob)
        right_hand = (51, 63 + bob)
    elif phase == 2:
        left_hand = (21, 63 + bob)
        right_hand = (51, 55 + bob)
    elif phase == 1:
        left_hand = (22, 59 + bob)
        right_hand = (50, 57 + bob)
    else:
        left_hand = (22, 57 + bob)
        right_hand = (50, 59 + bob)

    left_color = c["outfit_dark"] if phase in (0, 1) else c["outfit"]
    right_color = c["outfit"] if phase in (0, 1) else c["outfit_dark"]
    if back_view:
        left_color, right_color = right_color, left_color

    line_limb(draw, [(25, shoulder_y), (23, 49 + bob), left_hand], left_color, width=5, outline_width=8)
    line_limb(draw, [(47, shoulder_y), (49, 49 + bob), right_hand], right_color, width=5, outline_width=8)
    ellipse(draw, (left_hand[0] - 3, left_hand[1] - 3, left_hand[0] + 3, left_hand[1] + 4), c["skin"])
    ellipse(draw, (right_hand[0] - 3, right_hand[1] - 3, right_hand[0] + 3, right_hand[1] + 4), c["skin"])
    draw.line((left_hand[0] - 2, left_hand[1] - 6, left_hand[0] + 2, left_hand[1] - 6), fill=c["accent"], width=2)
    draw.line((right_hand[0] - 2, right_hand[1] - 6, right_hand[0] + 2, right_hand[1] - 6), fill=c["accent"], width=2)


def draw_side_arms(draw, c, phase, bob, facing):
    def point(local_x, y):
        return (CENTER_X + local_x * facing, y + bob)

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

    far_hand = point(far_local, far_y)
    near_hand = point(near_local, near_y)
    far_shoulder = point(-1, 39)
    near_shoulder = point(3, 40)
    line_limb(draw, [far_shoulder, point(5 if far_local > 0 else -5, 48), far_hand], c["outfit_dark"], width=5, outline_width=8)
    line_limb(draw, [near_shoulder, point(5 if near_local > 0 else -5, 50), near_hand], c["outfit"], width=5, outline_width=8)
    ellipse(draw, (far_hand[0] - 3, far_hand[1] - 3, far_hand[0] + 3, far_hand[1] + 4), c["skin_dark"])
    ellipse(draw, (near_hand[0] - 3, near_hand[1] - 3, near_hand[0] + 3, near_hand[1] + 4), c["skin"])
    draw.line((near_hand[0] - 3 * facing, near_hand[1] - 6, near_hand[0] + 2 * facing, near_hand[1] - 6), fill=c["accent"], width=2)


def draw_front_torso(draw, c, bob, back_view=False):
    rect(draw, (32, 32 + bob, 40, 41 + bob), c["skin_dark"] if back_view else c["skin"])
    jacket = [
        (24, 36 + bob),
        (48, 36 + bob),
        (52, 49 + bob),
        (48, 64 + bob),
        (42, 68 + bob),
        (30, 68 + bob),
        (24, 64 + bob),
        (20, 49 + bob),
    ]
    poly(draw, jacket, c["outfit"])
    if back_view:
        draw.line((25, 39 + bob, 47, 39 + bob), fill=c["accent_dim"], width=2)
        draw.line([(29, 44 + bob), (36, 62 + bob), (43, 44 + bob)], fill=c["outfit_light"], width=2)
        draw.line((24, 63 + bob, 48, 63 + bob), fill=c["accent"], width=2)
    else:
        inner = [(31, 38 + bob), (41, 38 + bob), (43, 63 + bob), (29, 63 + bob)]
        poly(draw, inner, c["inner"], outline=DEEP_OUTLINE)
        draw.line((29, 39 + bob, 23, 62 + bob), fill=c["accent"], width=2)
        draw.line((43, 39 + bob, 49, 62 + bob), fill=c["accent"], width=2)
        draw.line((36, 40 + bob, 36, 64 + bob), fill=c["accent_dim"], width=1)
        draw.rectangle((32, 47 + bob, 40, 50 + bob), fill=c["inner_dark"])
    draw.line((27, 67 + bob, 45, 67 + bob), fill=c["accent"], width=2)


def draw_side_torso(draw, c, bob, facing):
    rect(draw, (CENTER_X - 3, 32 + bob, CENTER_X + 4, 41 + bob), c["skin"])
    jacket = mapped(
        [(-10, 36), (7, 35), (12, 47), (9, 62), (2, 68), (-8, 65), (-13, 49)],
        CENTER_X,
        bob,
        facing,
    )
    poly(draw, jacket, c["outfit"])
    inner = mapped([(-1, 38), (7, 39), (8, 61), (0, 63)], CENTER_X, bob, facing)
    poly(draw, inner, c["inner"], outline=DEEP_OUTLINE)
    draw.line(mapped([(8, 40), (10, 61)], CENTER_X, bob, facing), fill=c["accent"], width=2)
    draw.line(mapped([(-10, 62), (8, 65)], CENTER_X, bob, facing), fill=c["accent"], width=2)


def draw_head_down(draw, c, bob):
    rect(draw, (32, 32 + bob, 40, 39 + bob), c["skin_dark"])
    ellipse(draw, (23, 13 + bob, 49, 37 + bob), c["skin"])
    hair = [
        (22, 23 + bob),
        (20, 16 + bob),
        (27, 13 + bob),
        (28, 7 + bob),
        (34, 11 + bob),
        (36, 5 + bob),
        (40, 11 + bob),
        (47, 8 + bob),
        (45, 15 + bob),
        (52, 18 + bob),
        (47, 25 + bob),
        (43, 21 + bob),
        (39, 26 + bob),
        (35, 21 + bob),
        (31, 27 + bob),
        (27, 21 + bob),
    ]
    poly(draw, hair, c["hair"])
    draw.polygon([(25, 22 + bob), (31, 15 + bob), (30, 24 + bob)], fill=c["hair_light"])
    draw.rectangle((29, 25 + bob, 32, 27 + bob), fill=DEEP_OUTLINE)
    draw.rectangle((40, 25 + bob, 43, 27 + bob), fill=DEEP_OUTLINE)
    draw.rectangle((35, 30 + bob, 38, 31 + bob), fill=c["skin_dark"])
    draw.line((28, 35 + bob, 44, 35 + bob), fill=c["skin_dark"], width=1)


def draw_head_up(draw, c, bob):
    rect(draw, (32, 32 + bob, 40, 39 + bob), c["skin_dark"])
    ellipse(draw, (23, 12 + bob, 49, 38 + bob), c["hair"])
    back_hair = [
        (22, 28 + bob),
        (19, 20 + bob),
        (25, 15 + bob),
        (26, 8 + bob),
        (33, 11 + bob),
        (36, 5 + bob),
        (40, 11 + bob),
        (47, 8 + bob),
        (46, 16 + bob),
        (53, 21 + bob),
        (49, 30 + bob),
        (43, 36 + bob),
        (36, 39 + bob),
        (28, 36 + bob),
    ]
    poly(draw, back_hair, c["hair"])
    draw.line((26, 31 + bob, 46, 31 + bob), fill=c["hair_dark"], width=2)
    draw.line((30, 36 + bob, 42, 36 + bob), fill=c["hair_light"], width=1)


def draw_head_side(draw, c, bob, facing):
    face = (CENTER_X - 10, 14 + bob, CENTER_X + 10, 36 + bob)
    ellipse(draw, face, c["skin"])
    nose = mapped([(8, 24), (14, 26), (8, 28)], CENTER_X, bob, facing)
    poly(draw, nose, c["skin"], outline=OUTLINE)
    ear_x = CENTER_X - 8 * facing
    ellipse(draw, (ear_x - 3, 24 + bob, ear_x + 3, 31 + bob), c["skin_dark"])
    hair = mapped(
        [
            (-11, 24),
            (-13, 17),
            (-5, 13),
            (-4, 7),
            (2, 11),
            (6, 5),
            (8, 12),
            (15, 12),
            (11, 18),
            (13, 25),
            (5, 23),
            (0, 30),
            (-5, 24),
        ],
        CENTER_X,
        bob,
        facing,
    )
    poly(draw, hair, c["hair"])
    draw.line(mapped([(5, 18), (12, 17)], CENTER_X, bob, facing), fill=c["hair_light"], width=2)
    eye = (CENTER_X + 6 * facing, 25 + bob)
    draw.rectangle((eye[0] - 1, eye[1], eye[0] + 1, eye[1] + 2), fill=DEEP_OUTLINE)


def draw_frame(spec, direction, phase):
    c = make_palette(spec)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    bob = body_bob(phase)

    if direction == "down":
        draw_front_legs(draw, c, phase, bob, back_view=False)
        draw_front_arms(draw, c, phase, bob, back_view=False)
        draw_front_torso(draw, c, bob, back_view=False)
        draw_head_down(draw, c, bob)
    elif direction == "up":
        draw_front_legs(draw, c, phase, bob, back_view=True)
        draw_front_arms(draw, c, phase, bob, back_view=True)
        draw_front_torso(draw, c, bob, back_view=True)
        draw_head_up(draw, c, bob)
    else:
        facing = -1 if direction == "left" else 1
        draw_side_legs(draw, c, phase, bob, facing)
        draw_side_arms(draw, c, phase, bob, facing)
        draw_side_torso(draw, c, bob, facing)
        draw_head_side(draw, c, bob, facing)

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
    for name, spec in VARIANTS.items():
        sheet = build_sheet(spec)
        png = OUT_DIR / f"{name}.png"
        webp = OUT_DIR / f"{name}.webp"
        sheet.save(png, "PNG", optimize=True)
        sheet.save(webp, "WEBP", lossless=True, method=6)
        print(f"generated {png.relative_to(ROOT)} and {webp.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
