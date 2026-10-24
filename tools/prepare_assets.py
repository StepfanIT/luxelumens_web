"""Builds the site's image assets.

python tools/prepare_assets.py <app repo> <folder with pl_*.png / en_*.png app screenshots>

* house/on.webp     the night photo from the app, as shot
* house/off.webp    the same house with the eave light removed
* house/light.webp  grayscale eave light; the site tints it with a look's
                    colours and adds it back onto off.webp
* app/<lang>/*.webp phone screenshots
* roofline.json     the roofline the app traces over the photo (0..1)
"""
import json
import pathlib
import re
import sys

import numpy as np
from PIL import Image, ImageFilter

APP = pathlib.Path(sys.argv[1])
SHOTS = pathlib.Path(sys.argv[2])
OUT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'assets'
SCREENS = ['home', 'scenes', 'effects', 'schedule', 'nowplaying', 'color']


def roofline():
    src = (APP / 'lib' / 'core' / 'lighting' / 'roofline.dart').read_text(encoding='utf-8')
    start = src.index('segments = <List<Offset>>[')
    body = src[start:src.index('];', start)]
    segments = []
    for block in re.findall(r'\[(.*?)\]', body.split('[', 1)[1], flags=re.S):
        pts = [[float(x), float(y)] for x, y in re.findall(r'Offset\(([\d.]+),\s*([\d.]+)\)', block)]
        if pts:
            segments.append(pts)
    return segments


def blur(a, radius):
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32) / 255


def relight(segments):
    on = np.asarray(Image.open(APP / 'assets' / 'images' / 'house_night.webp').convert('RGB'))
    on = on.astype(np.float32) / 255
    h, w, _ = on.shape
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)

    # Light washes the fascia and the wall below every eave line.
    falloff = np.zeros((h, w), np.float32)
    for seg in segments:
        pts = np.array(seg, np.float32) * [w, h]
        for (ax, ay), (bx, by) in zip(pts[:-1], pts[1:]):
            x0, x1 = sorted((ax, bx))
            if x1 - x0 < 1:
                continue
            t = np.clip((xs - ax) / (bx - ax), 0, 1)
            dy = ys - (ay + (by - ay) * t)
            f = np.where(dy >= -5, np.exp(-np.clip(dy, 0, None) / 175.0), 0.0)
            f = np.where(dy < 0, f * np.clip((dy + 5) / 5, 0, 1), f)
            falloff = np.maximum(falloff, np.where((xs >= x0 - 6) & (xs <= x1 + 6), f, 0.0))
    falloff = blur(falloff, 10)

    # Windows, the porch, the garden and the trees keep their own light.
    keep = np.zeros((h, w), np.float32)
    for x0, y0, x1, y1 in [
        (485, 395, 590, 472), (813, 360, 887, 448), (712, 388, 750, 645),
        (1110, 368, 1310, 468), (535, 552, 592, 647), (1182, 527, 1278, 641),
        (1324, 520, 1406, 552), (858, 532, 904, 672), (800, 556, 816, 594),
    ]:
        keep[y0:y1, x0:x1] = 1
    keep[655:, :] = 1
    keep[560:, :150] = 1
    keep[380:, 1415:] = 1
    keep = blur(keep, 4)

    r, g, b = on[..., 0], on[..., 1], on[..., 2]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    warm = np.clip((r - b - 0.01) / 0.14, 0, 1) * np.clip(lum / 0.10, 0, 1)
    mask = falloff * warm * (1 - keep)

    light = on * (0.95 * mask)[..., None]
    off = on - light + np.array([0.010, 0.016, 0.034], np.float32) * mask[..., None]
    off = np.clip(off, 0, 1)

    light_lum = 0.2126 * light[..., 0] + 0.7152 * light[..., 1] + 0.0722 * light[..., 2]
    scale = np.percentile(light_lum[light_lum > 0.01], 99.7)
    gray = np.clip(light_lum / scale, 0, 1)
    lit = light_lum > 0.02
    chroma = light[lit].sum(0) / light_lum[lit].sum()
    warm_rgb = (np.clip(chroma * scale, 0, 1) * 255).round().astype(int).tolist()
    sky = (on[:40].reshape(-1, 3).mean(0) * 255).round().astype(int).tolist()

    house = OUT / 'house'
    house.mkdir(parents=True, exist_ok=True)
    Image.fromarray((on * 255).round().astype(np.uint8)).save(house / 'on.webp', 'WEBP', quality=88, method=6)
    Image.fromarray((off * 255).round().astype(np.uint8)).save(house / 'off.webp', 'WEBP', quality=88, method=6)
    Image.fromarray((gray * 255).round().astype(np.uint8), 'L').convert('RGB').save(
        house / 'light.webp', 'WEBP', quality=90, method=6)
    print('warm light', warm_rgb, 'sky', sky)


def screens():
    for lang in ['pl', 'en']:
        folder = OUT / 'app' / lang
        folder.mkdir(parents=True, exist_ok=True)
        for name in SCREENS:
            im = Image.open(SHOTS / f'{lang}_{name}.png').convert('RGB')
            width = 780
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            im.save(folder / f'{name}.webp', 'WEBP', quality=86, method=6)
            print(lang, name, im.size, (folder / f'{name}.webp').stat().st_size // 1024, 'KB')


segments = roofline()
(OUT / 'roofline.json').parent.mkdir(parents=True, exist_ok=True)
(OUT / 'roofline.json').write_text(json.dumps(segments), encoding='utf-8')
relight(segments)
screens()
