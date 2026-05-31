from pathlib import Path
import sys

from PIL import Image


sys.dont_write_bytecode = True

from generate_walk_sprites import (  # noqa: E402
    OUT_DIR,
    ROOT,
    VARIANTS,
    build_base_sheet,
    clean_green_fringe,
    draw_prop,
    recolor,
    rgb,
)


FRAME_W = 72
FRAME_H = 92
COLS = 4
ROWS = 4
SHEET_W = FRAME_W * COLS
SHEET_H = FRAME_H * ROWS
CENTER_X = FRAME_W // 2
BASELINE_Y = 84
HIP_Y = 57
LOWER_FADE_START = 55
LOWER_FULL_Y = 66
UPPER_FULL_Y = 64
UPPER_FADE_END = 71

DIRECTIONS = ("down", "left", "right", "up")


def clamp(value, low, high):
    return max(low, min(high, value))


def split_frame(sheet, row, col):
    return sheet.crop(
        (
            col * FRAME_W,
            row * FRAME_H,
            (col + 1) * FRAME_W,
            (row + 1) * FRAME_H,
        )
    )


def alpha_scale(alpha, amount):
    return (alpha * amount + 127) // 255


def lower_weight(y):
    if y < LOWER_FADE_START:
        return 0
    if y >= LOWER_FULL_Y:
        return 255
    return round(255 * (y - LOWER_FADE_START) / (LOWER_FULL_Y - LOWER_FADE_START))


def upper_weight(y):
    if y <= UPPER_FULL_Y:
        return 255
    if y >= UPPER_FADE_END:
        return 0
    return round(255 * (UPPER_FADE_END - y) / (UPPER_FADE_END - UPPER_FULL_Y))


def side_weight(x, side):
    # side=-1 is the left half, side=1 is the right half. The feather keeps the
    # leg split from tearing the jacket center line.
    feather = 7
    distance = (CENTER_X - x) if side < 0 else (x - CENTER_X)
    return clamp(round(255 * (distance + feather) / (feather * 2)), 0, 255)


def make_leg_mask(frame, side):
    alpha = frame.getchannel("A")
    mask = Image.new("L", (FRAME_W, FRAME_H), 0)
    src = alpha.load()
    dst = mask.load()
    for y in range(FRAME_H):
        yw = lower_weight(y)
        if yw == 0:
            continue
        for x in range(FRAME_W):
            a = src[x, y]
            if a == 0:
                continue
            dst[x, y] = alpha_scale(alpha_scale(a, yw), side_weight(x, side))
    return mask


def make_upper_mask(frame):
    alpha = frame.getchannel("A")
    mask = Image.new("L", (FRAME_W, FRAME_H), 0)
    src = alpha.load()
    dst = mask.load()
    for y in range(FRAME_H):
        yw = upper_weight(y)
        if yw == 0:
            continue
        for x in range(FRAME_W):
            a = src[x, y]
            if a:
                dst[x, y] = alpha_scale(a, yw)
    return mask


def with_mask(frame, mask):
    layer = frame.copy()
    layer.putalpha(mask)
    return layer


def shear_from_hip(layer, foot_shift):
    """Move pixels horizontally with zero shift at the hip and max shift at foot."""
    if foot_shift == 0:
        return layer

    denom = max(1, (BASELINE_Y - 1) - HIP_Y)
    shear = foot_shift / denom

    # PIL wants the inverse transform. Forward: x2 = x + shear * (y - HIP_Y).
    matrix = (1, -shear, shear * HIP_Y, 0, 1, 0)
    return layer.transform(
        (FRAME_W, FRAME_H),
        Image.Transform.AFFINE,
        matrix,
        resample=Image.Resampling.BICUBIC,
    )


def stride_shifts(direction, phase):
    if direction == "down":
        return {
            0: {-1: -8, 1: 3},
            1: {-1: 0, 1: 0},
            2: {-1: -3, 1: 8},
            3: {-1: 0, 1: 0},
        }[phase]

    if direction == "up":
        return {
            0: {-1: -7, 1: 3},
            1: {-1: 0, 1: 0},
            2: {-1: -3, 1: 7},
            3: {-1: 0, 1: 0},
        }[phase]

    # Side frames already carry the AI-rendered leg silhouette. These shifts
    # amplify the contact frames while keeping passing frames narrow.
    return {
        0: {-1: -7, 1: 6},
        1: {-1: 0, 1: 0},
        2: {-1: -6, 1: 7},
        3: {-1: 0, 1: 0},
    }[phase]


def leg_layer(frame, direction, phase):
    shifts = stride_shifts(direction, phase)
    result = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))

    lead_side = -1 if phase in (0, 1) else 1
    order = (1, -1) if lead_side < 0 else (-1, 1)
    for side in order:
        layer = with_mask(frame, make_leg_mask(frame, side))
        shifted = shear_from_hip(layer, shifts[side])
        result.alpha_composite(shifted)
    return result


def clip_to_baseline(frame):
    out = frame.copy()
    pixels = out.load()
    for y in range(BASELINE_Y, FRAME_H):
        for x in range(FRAME_W):
            pixels[x, y] = (0, 0, 0, 0)
    return out


def compose_walk_frame(frame, direction, phase):
    lower = leg_layer(frame, direction, phase)
    out = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    out.alpha_composite(lower)
    out = Image.composite(frame, out, make_upper_mask(frame))
    return clip_to_baseline(out)


def build_walk_cycle_sheet(source_sheet):
    sheet = Image.new("RGBA", (SHEET_W, SHEET_H), (0, 0, 0, 0))

    for row, direction in enumerate(DIRECTIONS):
        # The left-facing source row has the cleanest AI side stride. Mirroring it
        # for right-facing keeps the same style quality and makes the stride width
        # consistent across both horizontal directions.
        source_row = 1 if direction == "right" else row
        source_direction = "left" if direction == "right" else direction
        for col in range(COLS):
            frame = split_frame(source_sheet, source_row, col)
            if direction == "right":
                frame = frame.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            walked = compose_walk_frame(frame, source_direction, col)
            sheet.alpha_composite(walked, (col * FRAME_W, row * FRAME_H))

    clean_green_fringe(sheet)
    return sheet


def variant_body_spec(spec):
    body = dict(spec)
    # Props are added after the leg warp so canes, staffs, bags, and capes do not
    # get bent with the lower-body affine transform.
    body.pop("prop", None)
    return body


def save_variant(name, spec, base):
    body = recolor(base, variant_body_spec(spec))
    walked = build_walk_cycle_sheet(body)
    if spec.get("prop"):
        draw_prop(walked, spec["prop"], rgb(spec["accent"]))
    clean_green_fringe(walked)

    png = OUT_DIR / f"{name}.png"
    webp = OUT_DIR / f"{name}.webp"
    walked.save(png, "PNG", optimize=True)
    walked.save(webp, "WEBP", lossless=True, method=6)
    return png, webp


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base = build_base_sheet()

    for name, spec in VARIANTS.items():
        png, webp = save_variant(name, spec, base)
        print(f"generated {png.relative_to(ROOT)} and {webp.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
