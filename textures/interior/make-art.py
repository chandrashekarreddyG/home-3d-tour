# Interior artwork textures for the "Warm luxe" interior (drawn procedurally, no third-party images):
#   palm-mural.jpg   misty tropical palms for the backlit dining arches
#   lotus-relief.jpg two faces in profile (cream / black) with a gold halo, pearl strands and pink lotus buds
#   line-art.jpg     framed flowing-line artwork (beige on ivory)
import math, os, random
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.expanduser('~/Projects/home-3d-tour/textures/interior')
os.makedirs(OUT, exist_ok=True)
S = 2  # supersample


def bez(p0, p1, p2, p3, n=40):
    return [((1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t ** 3 * p3[0],
             (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t ** 3 * p3[1])
            for t in (i / n for i in range(n + 1))]


# ---------------- palm mural ----------------
def palm_mural(w=700, h=1500):
    W, H = w * S, h * S
    im = Image.new('RGB', (W, H), (236, 232, 224))
    d = ImageDraw.Draw(im)
    for y in range(H):  # warm sky gradient
        t = y / H
        d.line([(0, y), (W, y)], fill=(int(240 - 14 * t), int(236 - 12 * t), int(228 - 16 * t)))
    rnd = random.Random(5)

    def palm(x, base, height, lean, col, fronds=9, size=1.0):
        top = (x + lean, base - height)
        pts = bez((x, base), (x + lean * 0.2, base - height * 0.4), (x + lean * 0.8, base - height * 0.8), top)
        for i in range(len(pts) - 1):
            wdt = int((18 - 10 * i / len(pts)) * S * size)
            d.line([pts[i], pts[i + 1]], fill=col, width=wdt)
        for k in range(fronds):
            a = -math.pi / 2 + (k - (fronds - 1) / 2) * (math.pi * 1.25 / fronds) + rnd.uniform(-0.1, 0.1)
            L = rnd.uniform(200, 290) * S * size
            droop = rnd.uniform(0.35, 0.6) * L
            tip = (top[0] + math.cos(a) * L, top[1] + math.sin(a) * L * 0.55 + droop)
            mid = (top[0] + math.cos(a) * L * 0.55, top[1] + math.sin(a) * L * 0.5)
            spine = bez(top, mid, (tip[0] - math.cos(a) * L * 0.1, tip[1] - droop * 0.3), tip, 30)
            for j in range(1, len(spine) - 1):
                px, py = spine[j]
                nx, ny = spine[j + 1][0] - spine[j - 1][0], spine[j + 1][1] - spine[j - 1][1]
                ln = math.hypot(nx, ny) or 1
                nx, ny = -ny / ln, nx / ln
                leaf = (1 - abs(j / len(spine) - 0.45) * 1.6) * 55 * S * size
                for s in (-1, 1):
                    ex, ey = px + nx * leaf * s + (spine[j + 1][0] - px) * 2.2, py + ny * leaf * s + abs(leaf) * 0.45
                    d.line([(px, py), (ex, ey)], fill=col, width=max(2, int(3 * S * size)))
            d.line(spine, fill=col, width=int(4 * S * size))

    # three layers: far (pale), middle, near (darker grey-green)
    layers = [((196, 200, 192), 0.7, 0.55), ((160, 170, 158), 0.85, 0.72), ((112, 128, 112), 1.0, 0.9)]
    for col, size, hf in layers:
        for _ in range(3):
            x = rnd.uniform(0.1, 0.9) * W
            palm(x, H * 1.02, H * hf * rnd.uniform(0.8, 1.0), rnd.uniform(-120, 120) * S, col, size=size)
        im = im.filter(ImageFilter.GaussianBlur(1.5 * S * (1.2 - size)))
        d = ImageDraw.Draw(im)
    # foreground leaves (monstera-like ovals with slits) in deep green-grey
    for _ in range(9):
        cx, cy, r = rnd.uniform(0, W), H - rnd.uniform(0, 260) * S, rnd.uniform(90, 170) * S
        a = rnd.uniform(-0.8, 0.8)
        poly = [(cx + math.cos(t) * r * 0.75 * math.cos(a) - math.sin(t) * r * math.sin(a), cy + math.cos(t) * r * 0.75 * math.sin(a) + math.sin(t) * r * math.cos(a)) for t in [i / 30 * math.tau for i in range(30)]]
        d.polygon(poly, fill=(78, 98, 80))
        for k in range(5):
            t = (k + 1) / 6 * math.pi - math.pi / 2
            d.line([(cx, cy), (cx + math.cos(t + a) * r, cy + math.sin(t + a) * r)], fill=(236, 232, 224), width=int(6 * S))
    im = im.resize((w, h), Image.LANCZOS)
    im.save(f'{OUT}/palm-mural.jpg', quality=86)


# ---------------- lotus relief (Radha-Krishna inspired faces) ----------------
def face_profile(x0, y0, s):
    # profile facing left; returns head + neck polygon (scale s, top-left anchor)
    P = lambda x, y: (x0 + x * s, y0 + y * s)
    pts = []
    pts += bez(P(60, 0), P(20, 0), P(5, 30), P(8, 70))           # crown to forehead
    pts += bez(P(8, 70), P(6, 90), P(-12, 112), P(-6, 120))       # nose
    pts += bez(P(-6, 120), P(0, 124), P(2, 128), P(0, 134))       # upper lip
    pts += bez(P(0, 134), P(6, 138), P(4, 144), P(8, 150))        # lower lip
    pts += bez(P(8, 150), P(10, 168), P(24, 178), P(40, 176))     # chin / jaw
    pts += bez(P(40, 176), P(44, 200), P(42, 240), P(30, 290))    # neck front
    pts += [P(120, 290)]
    pts += bez(P(120, 290), P(110, 240), P(120, 200), P(140, 160))  # neck back
    pts += bez(P(140, 160), P(170, 120), P(150, 10), P(60, 0))      # back of head (hair)
    return pts


def lotus_relief(w=1200, h=1500):
    W, H = w * S, h * S
    im = Image.new('RGB', (W, H), (240, 233, 220))
    d = ImageDraw.Draw(im)
    # gold halo ring with rays
    cx, cy, R = W * 0.44, H * 0.3, W * 0.25
    for k in range(48):
        a = k / 48 * math.tau
        d.line([(cx + math.cos(a) * R * 1.02, cy + math.sin(a) * R * 1.02), (cx + math.cos(a) * R * 1.12, cy + math.sin(a) * R * 1.12)], fill=(190, 150, 70), width=int(5 * S))
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=(196, 156, 74), width=int(14 * S))
    # back face (black) and front face (cream with dark outline)
    s = W / 420
    back = face_profile(W * 0.56, H * 0.1, s * 1.02)
    d.polygon(back, fill=(28, 26, 26))
    front = face_profile(W * 0.3, H * 0.16, s)
    d.polygon(front, fill=(247, 241, 230), outline=(60, 50, 44))
    d.line(front + [front[0]], fill=(60, 50, 44), width=int(4 * S))
    # eyes (closed, serene), eyebrow, earring
    for (fx, fy, col) in [(W * 0.3, H * 0.16, (60, 50, 44)), (W * 0.56, H * 0.1, (200, 170, 100))]:
        ex, ey = fx + 40 * s, fy + 92 * s
        d.arc([ex - 18 * s, ey - 8 * s, ex + 18 * s, ey + 8 * s], 10, 170, fill=col, width=int(4 * S))
        d.arc([ex - 22 * s, ey - 26 * s, ex + 22 * s, ey - 6 * s], 200, 330, fill=col, width=int(4 * S))
        d.ellipse([fx + 92 * s, fy + 150 * s, fx + 108 * s, fy + 172 * s], fill=(196, 156, 74))
    # hair bun and gold band on the back figure
    d.ellipse([W * 0.56 + 120 * s, H * 0.1 + 10 * s, W * 0.56 + 190 * s, H * 0.1 + 80 * s], fill=(28, 26, 26))
    d.arc([W * 0.56 + 10 * s, H * 0.1 - 4 * s, W * 0.56 + 170 * s, H * 0.1 + 90 * s], 190, 300, fill=(196, 156, 74), width=int(8 * S))
    # shoulders / drapes
    d.pieslice([W * 0.42, H * 0.6, W * 0.98, H * 1.4], 180, 360, fill=(30, 28, 28))
    d.pieslice([W * 0.14, H * 0.64, W * 0.66, H * 1.4], 180, 360, fill=(246, 240, 229), outline=(60, 50, 44), width=int(4 * S))
    # pearl strands
    for k, (r0, n) in enumerate([(0.16, 26), (0.2, 30), (0.24, 34)]):
        for i in range(n):
            t = math.pi * (0.15 + 0.7 * i / (n - 1))
            px, py = W * 0.47 + math.cos(t) * W * r0, H * 0.6 + math.sin(t) * W * r0 * 0.75
            pr = 9 * S
            d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(250, 247, 240), outline=(170, 160, 140))
    # pink lotus buds on long green stems (left)
    rnd = random.Random(3)
    for k in range(5):
        bx, by = W * (0.06 + k * 0.045), H * (0.42 + rnd.uniform(0, 0.35))
        d.line(bez((bx, H), (bx + 20 * S, H * 0.9), (bx - 10 * S, by + 120 * S), (bx, by + 30 * S)), fill=(92, 130, 80), width=int(6 * S))
        for pa in (-0.5, 0, 0.5):
            pw, ph = 30 * S, 70 * S
            poly = [(bx + math.sin(pa) * ph * t - math.cos(pa) * pw * math.sin(t * math.pi), by + 30 * S - math.cos(pa) * ph * t - math.sin(pa) * pw * math.sin(t * math.pi) * 0.3) for t in [i / 20 for i in range(21)]]
            poly += [(bx + math.sin(pa) * ph * t + math.cos(pa) * pw * math.sin(t * math.pi), by + 30 * S - math.cos(pa) * ph * t + math.sin(pa) * pw * math.sin(t * math.pi) * 0.3) for t in [i / 20 for i in range(20, -1, -1)]]
            d.polygon(poly, fill=(226, 120, 150), outline=(180, 80, 110))
        for s2 in (-1, 1):
            lx = bx + s2 * 40 * S
            d.ellipse([lx - 34 * S, by + 220 * S, lx + 34 * S, by + 250 * S], fill=(110, 150, 96))
    im = im.filter(ImageFilter.GaussianBlur(0.6)).resize((w, h), Image.LANCZOS)
    im.save(f'{OUT}/lotus-relief.jpg', quality=88)


# ---------------- flowing line art ----------------
def line_art(w=900, h=1200):
    W, H = w * S, h * S
    im = Image.new('RGB', (W, H), (238, 232, 222))
    d = ImageDraw.Draw(im)
    for k in range(70):
        y = H * 0.1 + k * H * 0.011
        pts = [(x, y + math.sin(x / W * 5 + k * 0.13) * H * 0.06 + math.sin(x / W * 13 + k * 0.4) * H * 0.012) for x in range(0, W + 1, 6)]
        col = (120, 104, 86) if k % 7 == 0 else (176, 160, 140)
        d.line(pts, fill=col, width=int(3 * S if k % 7 == 0 else 2 * S))
    im = im.resize((w, h), Image.LANCZOS)
    im.save(f'{OUT}/line-art.jpg', quality=86)


palm_mural()
lotus_relief()
line_art()
print(sorted(os.listdir(OUT)))
