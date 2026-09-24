"""
CROPWISE AI - Multi-Stage Dataset Builder
Constructs properly split, leak-free datasets for:
1. Leaf Detection (LEAF vs NON_LEAF)
2. Crop Species Classification (Tomato, Potato, Corn, Rice, UNKNOWN)
Incorporates realistic botanical features for supported and unsupported plant species,
as well as diverse non-leaf negative samples.
"""

import os
import random
import math
from typing import Tuple, Dict, List
from PIL import Image, ImageDraw, ImageFilter

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
LEAF_DATASET_DIR = os.path.join(CURRENT_DIR, "dataset_leaf")
CROP_DATASET_DIR = os.path.join(CURRENT_DIR, "dataset_crop")

# Configurable sample counts per class
LEAF_SPLITS = {"train": 48, "validation": 16, "test": 16}
CROP_SPLITS = {"train": 64, "validation": 16, "test": 16}


# ==============================================================================
# 1. BOTANICAL LEAF GENERATORS (Supported & Unsupported Species)
# ==============================================================================

def generate_crop_leaf(species: str, seed: int, diseased: bool = False, variant_override: str = None) -> Image.Image:
    """
    Generates an image of a supported crop leaf with distinctive botanical morphology.
    Supports Tomato, Potato, Corn, and Rice (Paddy).
    """
    random.seed(seed)
    w, h = 224, 224

    if species == "Tomato":
        # Dicot: compound odd-pinnate leaf with central rachis, terminal and 2 pairs of lateral leaflets with sharp serrations
        base_green = (random.randint(35, 55), random.randint(120, 160), random.randint(40, 70))
        img = Image.new("RGB", (w, h), (random.randint(220, 240), random.randint(220, 240), random.randint(220, 240)))
        draw = ImageDraw.Draw(img)
        # Main central rachis / stem
        vein_col = (min(255, base_green[0] + 30), min(255, base_green[1] + 35), min(255, base_green[2] + 20))
        draw.line([(w // 2, 22), (w // 2, h - 18)], fill=vein_col, width=3)
        # Terminal leaflet (top) with pointed serrations
        draw.ellipse([w // 2 - 25, 20, w // 2 + 25, 75], fill=base_green)
        draw.polygon([(w // 2 - 20, 35), (w // 2 - 32, 45), (w // 2 - 15, 55)], fill=base_green)
        draw.polygon([(w // 2 + 20, 35), (w // 2 + 32, 45), (w // 2 + 15, 55)], fill=base_green)
        # Upper lateral leaflets
        draw.ellipse([w // 2 - 68, 58, w // 2 - 14, 112], fill=base_green)
        draw.ellipse([w // 2 + 14, 58, w // 2 + 68, 112], fill=base_green)
        # Lower lateral leaflets
        draw.ellipse([w // 2 - 76, 112, w // 2 - 18, 168], fill=base_green)
        draw.ellipse([w // 2 + 18, 112, w // 2 + 76, 168], fill=base_green)
        # Stalks attaching leaflets to rachis
        draw.line([(w // 2, 85), (w // 2 - 25, 85)], fill=vein_col, width=2)
        draw.line([(w // 2, 85), (w // 2 + 25, 85)], fill=vein_col, width=2)
        draw.line([(w // 2, 138), (w // 2 - 30, 138)], fill=vein_col, width=2)
        draw.line([(w // 2, 138), (w // 2 + 30, 138)], fill=vein_col, width=2)

    elif species == "Potato":
        # Dicot: interruptedly pinnate potato leaf with large broad ovate terminal leaflet + 2 pairs of lateral leaflets (rounded margins)
        base_green = (random.randint(25, 45), random.randint(95, 135), random.randint(30, 60))
        img = Image.new("RGB", (w, h), (random.randint(215, 235), random.randint(215, 235), random.randint(215, 235)))
        draw = ImageDraw.Draw(img)
        vein_col = (base_green[0] + 25, base_green[1] + 30, base_green[2] + 20)
        draw.line([(w // 2, 25), (w // 2, h - 25)], fill=vein_col, width=3)
        # 2 lower lateral leaflets (broad ovate, smooth margins)
        draw.ellipse([28, 125, 92, 178], fill=base_green)
        draw.ellipse([w - 92, 125, w - 28, 178], fill=base_green)
        # 2 upper lateral leaflets
        draw.ellipse([38, 75, 96, 125], fill=base_green)
        draw.ellipse([w - 96, 75, w - 38, 125], fill=base_green)
        # Large broad terminal leaflet
        draw.ellipse([58, 20, w - 58, 105], fill=base_green)
        for y in range(40, 100, 20):
            draw.line([(w // 2, y), (w // 2 + 35, y - 8)], fill=vein_col, width=2)
            draw.line([(w // 2, y), (w // 2 - 35, y - 8)], fill=vein_col, width=2)

    elif species == "Corn":
        # Monocot: Maize leaf - distinctly broad tapering strap blade with pointed apex, thick white midrib, and wavy undulating margins
        base_green = (random.randint(45, 75), random.randint(130, 175), random.randint(45, 80))
        img = Image.new("RGB", (w, h), (random.randint(225, 245), random.randint(225, 245), random.randint(225, 245)))
        draw = ImageDraw.Draw(img)
        # Broad tapering blade with wavy undulating margins (Maize blade width: 38-65px)
        left_pts = []
        right_pts = []
        for y in range(25, h - 15, 12):
            progress = (y - 25) / (h - 40)
            half_w = int(14 + progress * 42 + 6 * math.sin(y * 0.25))
            left_pts.append((w // 2 - half_w, y))
            right_pts.append((w // 2 + half_w, y))
        pts = [(w // 2, 15)] + right_pts + left_pts[::-1]
        draw.polygon(pts, fill=base_green)
        # Prominent thick white/pale midrib (5px wide)
        draw.line([(w // 2, 15), (w // 2, h - 15)], fill=(245, 250, 230), width=5)
        # Longitudinal striate venation across the broad lamina
        for offset in range(8, 45, 8):
            v_col = (min(255, base_green[0] + 30), min(255, base_green[1] + 35), min(255, base_green[2] + 20))
            draw.line([(w // 2 + offset, 45 + offset), (w // 2 + offset + 4, h - 15)], fill=v_col, width=1)
            draw.line([(w // 2 - offset, 45 + offset), (w // 2 - offset - 4, h - 15)], fill=v_col, width=1)

    elif species in ["Rice", "Paddy"]:
        # Monocot: Rice / Paddy grass blade - slender linear lamina (8-20px), pointed needle-like acuminate apex, subtle delicate midrib (2px)
        variant_idx = seed % 4 if variant_override is None else ["young", "mature", "field", "cluster"].index(variant_override) if variant_override in ["young", "mature", "field", "cluster"] else 0
        bg_type = seed % 3

        if bg_type == 0:
            # Outdoor paddy field soil / muddy background
            bg_col = (random.randint(110, 135), random.randint(95, 120), random.randint(75, 95))
        elif bg_type == 1:
            # Flooded water reflection / sky tint
            bg_col = (random.randint(155, 185), random.randint(175, 200), random.randint(150, 175))
        else:
            # Clean diagnostic / lab background
            bg_col = (random.randint(225, 245), random.randint(225, 245), random.randint(225, 245))

        img = Image.new("RGB", (w, h), bg_col)
        draw = ImageDraw.Draw(img)

        # Color variation: young tiller lime green vs mature deeper emerald green
        if variant_idx == 0:
            blade_col = (random.randint(55, 80), random.randint(160, 205), random.randint(45, 75))
            blade_w = random.randint(10, 15)
        else:
            blade_col = (random.randint(40, 65), random.randint(130, 175), random.randint(35, 65))
            blade_w = random.randint(14, 20)

        # Draw slender grass blade: sharply tapering from base to acuminate needle-like apex
        tilt = (seed % 9 - 4) * 3  # -12 to +12 px tilt
        left_pts = []
        right_pts = []
        midrib_pts = []

        for y in range(15, h - 10, 10):
            prog = (y - 15) / (h - 25)
            cur_w = max(2, int(prog * blade_w))
            curve = int(7 * math.sin(prog * 2.4))
            cx = w // 2 + int(tilt * (1.0 - prog)) + curve
            left_pts.append((cx - cur_w, y))
            right_pts.append((cx + cur_w, y))
            midrib_pts.append((cx, y))

        pts = [(w // 2 + tilt, 12)] + right_pts + left_pts[::-1]
        draw.polygon(pts, fill=blade_col)

        # Delicate pale central midrib (2px wide, subtle - NOT heavy like Corn's 5px)
        midrib_col = (min(255, blade_col[0] + 35), min(255, blade_col[1] + 35), min(255, blade_col[2] + 25))
        if len(midrib_pts) >= 2:
            draw.line(midrib_pts, fill=midrib_col, width=2)

        # Fine parallel veins along the slender grass blade
        for v_off in [-blade_w // 2, blade_w // 2]:
            if abs(v_off) >= 3:
                vein_pts = [(pt[0] + v_off // 2, pt[1]) for pt in midrib_pts]
                if len(vein_pts) >= 2:
                    draw.line(vein_pts, fill=midrib_col, width=1)

        # If multi-leaf / cluster variant: draw second accompanying slender grass blade
        if variant_idx == 3:
            sec_pts = [(x - 30, y + 15) for (x, y) in pts]
            draw.polygon(sec_pts, fill=(blade_col[0] - 12, blade_col[1] - 12, blade_col[2] - 10))

    # Add disease lesions if specified
    if diseased:
        draw = ImageDraw.Draw(img)
        if species in ["Rice", "Paddy"]:
            d_type = seed % 2
            if d_type == 0:
                # Rice Leaf Blast: spindle / diamond shaped lesions with grayish centers and brown borders
                for _ in range(random.randint(2, 4)):
                    ly = random.randint(40, h - 50)
                    prog = (ly - 15) / (h - 25)
                    lx = w // 2 + int(tilt * (1.0 - prog)) + int(7 * math.sin(prog * 2.4))
                    draw.polygon([(lx, ly - 10), (lx + 5, ly), (lx, ly + 10), (lx - 5, ly)], fill=(90, 50, 30))
                    draw.polygon([(lx, ly - 6), (lx + 2, ly), (lx, ly + 6), (lx - 2, ly)], fill=(195, 200, 190))
            else:
                # Rice Brown Spot: small oval brown spots with yellow halos
                for _ in range(random.randint(3, 6)):
                    ly = random.randint(40, h - 50)
                    prog = (ly - 15) / (h - 25)
                    lx = w // 2 + int(tilt * (1.0 - prog)) + int(7 * math.sin(prog * 2.4)) + random.randint(-3, 3)
                    draw.ellipse([lx - 5, ly - 4, lx + 5, ly + 4], fill=(215, 190, 45))
                    draw.ellipse([lx - 3, ly - 2, lx + 3, ly + 2], fill=(70, 35, 20))
        elif species == "Corn":
            # Corn Leaf Blight: elongated rectangular / elliptical grayish-tan lesions
            for _ in range(random.randint(2, 4)):
                lx = random.randint(w // 2 - 30, w // 2 + 10)
                ly = random.randint(50, h - 60)
                draw.rectangle([lx, ly, lx + random.randint(18, 30), ly + random.randint(8, 14)], fill=(175, 155, 100))
                draw.rectangle([lx + 2, ly + 2, lx + random.randint(14, 26), ly + random.randint(6, 10)], fill=(90, 60, 35))
        else:
            # Concentric circular blight lesions for Tomato/Potato
            for _ in range(random.randint(3, 6)):
                cx = random.randint(60, w - 60)
                cy = random.randint(50, h - 50)
                rad = random.randint(8, 18)
                draw.ellipse([cx - rad - 2, cy - rad - 2, cx + rad + 2, cy + rad + 2], fill=(210, 185, 45))
                draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(80, 45, 25))

    return img.filter(ImageFilter.GaussianBlur(radius=0.5))


def generate_unknown_plant_leaf(plant_name: str, seed: int) -> Image.Image:
    """
    Generates distinct morphology for UNSUPPORTED plant species:
    Mango, Neem, Guava, Banana, Rose, Apple, Grape.
    """
    random.seed(seed)
    w, h = 224, 224
    img = Image.new("RGB", (w, h), (random.randint(220, 240), random.randint(220, 240), random.randint(220, 240)))
    draw = ImageDraw.Draw(img)

    if plant_name == "Mango":
        # Long, lanceolate, glossy dark green with curved apex
        col = (random.randint(20, 40), random.randint(85, 125), random.randint(25, 55))
        points = [(w // 2, 15), (w // 2 + 35, 70), (w // 2 + 40, 130), (w // 2 + 20, 185), (w // 2, h - 25),
                  (w // 2 - 20, 185), (w // 2 - 40, 130), (w // 2 - 35, 70)]
        draw.polygon(points, fill=col)
        draw.line([(w // 2, 20), (w // 2, h - 25)], fill=(col[0] + 40, col[1] + 45, col[2] + 25), width=2)
        for y in range(45, h - 45, 20):
            draw.line([(w // 2, y), (w // 2 + 30, y - 8)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=1)
            draw.line([(w // 2, y), (w // 2 - 30, y - 8)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=1)

    elif plant_name == "Neem":
        # Pinnate curved falcate leaflet with sharp serrated edges
        col = (random.randint(40, 65), random.randint(125, 165), random.randint(35, 65))
        points = [(w // 2 + 20, 20), (w // 2 + 45, 80), (w // 2 + 35, 140), (w // 2 - 5, h - 30),
                  (w // 2 - 35, 150), (w // 2 - 45, 90), (w // 2 - 10, 40)]
        draw.polygon(points, fill=col)
        # Serrations
        for y in range(40, h - 40, 15):
            draw.polygon([(w // 2 + 38, y), (w // 2 + 48, y + 4), (w // 2 + 35, y + 8)], fill=col)
            draw.polygon([(w // 2 - 38, y), (w // 2 - 48, y + 4), (w // 2 - 35, y + 8)], fill=col)

    elif plant_name == "Guava":
        # Elliptic-oblong leaf with sunken parallel lateral veins
        col = (random.randint(45, 70), random.randint(110, 150), random.randint(40, 70))
        draw.ellipse([45, 30, w - 45, h - 30], fill=col)
        vein_col = (col[0] - 20, col[1] - 20, col[2] - 15)  # Sunken darker veins
        draw.line([(w // 2, 35), (w // 2, h - 35)], fill=vein_col, width=3)
        for y in range(50, h - 50, 22):
            draw.line([(w // 2, y), (w // 2 + 45, y - 12)], fill=vein_col, width=2)
            draw.line([(w // 2, y), (w // 2 - 45, y - 12)], fill=vein_col, width=2)

    elif plant_name == "Banana":
        # Broad paddle-shaped oblong leaf with rounded apex and perpendicular lateral veins with tears
        col = (random.randint(55, 85), random.randint(145, 185), random.randint(45, 75))
        bg_col = (230, 235, 230)
        draw.rounded_rectangle([35, 20, w - 35, h - 20], radius=35, fill=col)
        # Massive central yellow-white midrib
        draw.line([(w // 2, 20), (w // 2, h - 20)], fill=(245, 245, 200), width=7)
        # Perpendicular lateral parallel veins
        for y in range(30, h - 30, 10):
            draw.line([(38, y), (w // 2 - 4, y)], fill=(col[0] - 20, col[1] - 20, col[2] - 15), width=1)
            draw.line([(w // 2 + 4, y), (w - 38, y)], fill=(col[0] - 20, col[1] - 20, col[2] - 15), width=1)
        # Wind tears cutting inwards
        draw.line([(35, 75), (75, 85)], fill=bg_col, width=3)
        draw.line([(w - 35, 135), (w - 75, 145)], fill=bg_col, width=3)

    elif plant_name == "Rose":
        # Small ovate leaflet with serrated margins and reddish/deep-green veins
        col = (random.randint(25, 45), random.randint(80, 120), random.randint(30, 55))
        draw.ellipse([50, 40, w - 50, h - 40], fill=col)
        for y in range(50, h - 50, 16):
            draw.line([(w // 2, y), (w // 2 + 35, y - 10)], fill=(90, 40, 40), width=1)
            draw.line([(w // 2, y), (w // 2 - 35, y - 10)], fill=(90, 40, 40), width=1)

    elif plant_name == "Apple":
        # Broad ovate apple leaf with rounded base and serrated edge
        col = (random.randint(40, 65), random.randint(115, 155), random.randint(40, 65))
        draw.ellipse([40, 30, w - 40, h - 30], fill=col)
        draw.line([(w // 2, 35), (w // 2, h - 35)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)

    elif plant_name == "Grape":
        # Palmate 3-lobed leaf
        col = (random.randint(45, 75), random.randint(130, 170), random.randint(40, 70))
        draw.polygon([(w // 2, 25), (w // 2 + 70, 70), (w // 2 + 55, 150),
                      (w // 2, h - 35), (w // 2 - 55, 150), (w // 2 - 70, 70)], fill=col)
        draw.line([(w // 2, 35), (w // 2, h - 35)], fill=(col[0] + 35, col[1] + 40, col[2] + 20), width=3)
        draw.line([(w // 2, 100), (w // 2 + 55, 70)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)
        draw.line([(w // 2, 100), (w // 2 - 55, 70)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)

    elif plant_name == "Papaya":
        # Broad palmate 7-lobed leaf with deep sinuses and radiating ivory veins
        col = (random.randint(40, 60), random.randint(125, 155), random.randint(35, 55))
        pts = [
            (w // 2, 25), (w // 2 + 18, 55), (w // 2 + 55, 40), (w // 2 + 35, 75),
            (w // 2 + 75, 95), (w // 2 + 40, 115), (w // 2 + 65, 155), (w // 2 + 25, 145),
            (w // 2 + 30, 185), (w // 2, 165),
            (w // 2 - 30, 185), (w // 2 - 25, 145), (w // 2 - 65, 155), (w // 2 - 40, 115),
            (w // 2 - 75, 95), (w // 2 - 35, 75), (w // 2 - 55, 40), (w // 2 - 18, 55)
        ]
        draw.polygon(pts, fill=col)
        # Primary radiating palmate veins from petiole
        vein_col = (235, 240, 215)
        draw.line([(w // 2, 165), (w // 2, 30)], fill=vein_col, width=2)
        draw.line([(w // 2, 165), (w // 2 + 55, 45)], fill=vein_col, width=2)
        draw.line([(w // 2, 165), (w // 2 - 55, 45)], fill=vein_col, width=2)
        draw.line([(w // 2, 165), (w // 2 + 70, 100)], fill=vein_col, width=2)
        draw.line([(w // 2, 165), (w // 2 - 70, 100)], fill=vein_col, width=2)

    elif plant_name == "Hibiscus":
        # Broad ovate with coarse irregular teeth
        col = (random.randint(30, 50), random.randint(110, 140), random.randint(35, 55))
        draw.ellipse([45, 30, w - 45, h - 30], fill=col)
        for a in range(0, 360, 20):
            rad = math.radians(a)
            cx = w // 2 + int(70 * math.cos(rad))
            cy = h // 2 + int(75 * math.sin(rad))
            draw.polygon([(cx, cy), (cx + 10, cy + 5), (cx + 5, cy + 10)], fill=col)

    elif plant_name in ["Lemon", "Citrus_Lemon"]:
        # Elliptic glossy leaf with winged petiole
        col = (random.randint(25, 45), random.randint(90, 125), random.randint(30, 50))
        draw.ellipse([50, 40, w - 50, h - 40], fill=col)
        draw.line([(w // 2, 40), (w // 2, h - 35)], fill=(col[0] + 35, col[1] + 40, col[2] + 20), width=2)

    elif plant_name == "Eucalyptus":
        # Sickle-shaped curved silvery-blue-green foliage
        col = (random.randint(70, 95), random.randint(120, 145), random.randint(110, 135))
        pts = [(w // 2 + 10, 20), (w // 2 + 40, 90), (w // 2 + 30, 160),
               (w // 2 - 10, h - 25), (w // 2 + 5, 150), (w // 2 + 15, 80)]
        draw.polygon(pts, fill=col)

    elif plant_name == "Soybean":
        # Trifoliate compound leaf: 3 ovate leaflets
        col = (random.randint(40, 70), random.randint(125, 165), random.randint(40, 70))
        # Left and right lateral leaflets
        draw.ellipse([30, 110, 95, 180], fill=col)
        draw.ellipse([w - 95, 110, w - 30, 180], fill=col)
        # Central terminal leaflet
        draw.ellipse([w // 2 - 45, 30, w // 2 + 45, 140], fill=col)
        draw.line([(w // 2, 35), (w // 2, h - 30)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)

    elif plant_name == "Chilli":
        # Dark glossy lanceolate to ovate leaf with slender tapering apex
        col = (random.randint(20, 45), random.randint(95, 135), random.randint(25, 50))
        pts = [(w // 2, 20), (w // 2 + 35, 75), (w // 2 + 30, 140), (w // 2 + 10, 185),
               (w // 2, h - 25), (w // 2 - 10, 185), (w // 2 - 30, 140), (w // 2 - 35, 75)]
        draw.polygon(pts, fill=col)
        draw.line([(w // 2, 20), (w // 2, h - 25)], fill=(col[0] + 35, col[1] + 40, col[2] + 25), width=2)
        for y in range(50, h - 50, 22):
            draw.line([(w // 2, y), (w // 2 + 25, y - 8)], fill=(col[0] + 25, col[1] + 30, col[2] + 20), width=1)
            draw.line([(w // 2, y), (w // 2 - 25, y - 8)], fill=(col[0] + 25, col[1] + 30, col[2] + 20), width=1)

    elif plant_name == "Coconut":
        # Long narrow linear pinnate frond leaflet with sharp midrib
        col = (random.randint(45, 75), random.randint(125, 165), random.randint(30, 60))
        pts = [(w // 2, 15), (w // 2 + 20, 60), (w // 2 + 22, 140), (w // 2 + 15, h - 25),
               (w // 2 - 15, h - 25), (w // 2 - 22, 140), (w // 2 - 20, 60)]
        draw.polygon(pts, fill=col)
        draw.line([(w // 2, 15), (w // 2, h - 25)], fill=(235, 240, 215), width=3)

    elif plant_name == "Banyan":
        # Large thick leathery oval leaf with prominent pale midrib
        col = (random.randint(30, 55), random.randint(95, 135), random.randint(30, 60))
        draw.ellipse([40, 25, w - 40, h - 35], fill=col)
        # Prominent ivory midrib and primary lateral veins
        draw.line([(w // 2, 30), (w // 2, h - 35)], fill=(230, 235, 210), width=3)
        for y in range(45, h - 45, 20):
            draw.line([(w // 2, y), (w // 2 + 42, y - 10)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)
            draw.line([(w // 2, y), (w // 2 - 42, y - 10)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=2)

    elif plant_name == "Groundnut":
        # Tetrafoliate compound leaf: 4 rounded obovate leaflets radiating from petiole apex
        col = (random.randint(45, 75), random.randint(130, 170), random.randint(40, 70))
        cx, cy = w // 2, h // 2 + 10
        # Petiole stalk
        draw.line([(cx, cy), (cx, h - 25)], fill=(col[0] + 25, col[1] + 30, col[2] + 20), width=3)
        # 4 obovate leaflets clustered at petiole apex
        draw.ellipse([cx - 60, cy - 65, cx - 5, cy - 10], fill=col)
        draw.ellipse([cx + 5, cy - 65, cx + 60, cy - 10], fill=col)
        draw.ellipse([cx - 70, cy - 15, cx - 10, cy + 35], fill=col)
        draw.ellipse([cx + 10, cy - 15, cx + 70, cy + 35], fill=col)
        # Vein connections
        draw.line([(cx, cy), (cx - 30, cy - 35)], fill=(230, 235, 210), width=1)
        draw.line([(cx, cy), (cx + 30, cy - 35)], fill=(230, 235, 210), width=1)
        draw.line([(cx, cy), (cx - 35, cy + 10)], fill=(230, 235, 210), width=1)
        draw.line([(cx, cy), (cx + 35, cy + 10)], fill=(230, 235, 210), width=1)

    elif plant_name == "Orchid":
        # Thick leathery strap-like green leaf with central longitudinal furrow
        col = (random.randint(40, 65), random.randint(110, 150), random.randint(40, 65))
        draw.rounded_rectangle([60, 20, w - 60, h - 20], radius=20, fill=col)
        # Central sunken furrow / vein to give realistic texture
        draw.line([(w // 2, 20), (w // 2, h - 20)], fill=(col[0] - 25, col[1] - 25, col[2] - 20), width=3)
    elif plant_name == "Sunflower":
        # Broad cordate (heart-shaped) rough hairy leaf with pointed tip
        col = (random.randint(45, 75), random.randint(125, 165), random.randint(35, 65))
        pts = [(w // 2, 25), (w // 2 + 65, 85), (w // 2 + 55, 160), (w // 2 + 20, 185),
               (w // 2, 175), (w // 2 - 20, 185), (w // 2 - 55, 160), (w // 2 - 65, 85)]
        draw.polygon(pts, fill=col)
        draw.line([(w // 2, 25), (w // 2, 175)], fill=(col[0] + 30, col[1] + 35, col[2] + 20), width=3)
        draw.line([(w // 2, 90), (w // 2 + 50, 75)], fill=(col[0] + 25, col[1] + 30, col[2] + 15), width=2)
        draw.line([(w // 2, 90), (w // 2 - 50, 75)], fill=(col[0] + 25, col[1] + 30, col[2] + 15), width=2)

    elif plant_name == "Okra":
        # Palmate 5-lobed leaf with deep sinuses
        col = (random.randint(35, 60), random.randint(115, 155), random.randint(35, 60))
        pts = [(w // 2, 25), (w // 2 + 25, 60), (w // 2 + 65, 55), (w // 2 + 40, 95),
               (w // 2 + 60, 140), (w // 2 + 15, 130), (w // 2, 175),
               (w // 2 - 15, 130), (w // 2 - 60, 140), (w // 2 - 40, 95),
               (w // 2 - 65, 55), (w // 2 - 25, 60)]
        draw.polygon(pts, fill=col)
        draw.line([(w // 2, 25), (w // 2, 175)], fill=(225, 235, 210), width=2)

    elif plant_name == "Cotton":
        # Broad 3-5 lobed maple-like leaf with rounded lobes
        col = (random.randint(35, 65), random.randint(110, 150), random.randint(35, 65))
        pts = [(w // 2, 30), (w // 2 + 35, 55), (w // 2 + 60, 90), (w // 2 + 35, 130),
               (w // 2, 160), (w // 2 - 35, 130), (w // 2 - 60, 90), (w // 2 - 35, 55)]
        draw.polygon(pts, fill=col)
        draw.line([(w // 2, 30), (w // 2, 160)], fill=(230, 235, 210), width=2)

    return img.filter(ImageFilter.GaussianBlur(radius=0.5))


# ==============================================================================
# 2. NON-LEAF GENERATORS (Diverse Negatives)
# ==============================================================================

def generate_non_leaf_image(category: str, seed: int) -> Image.Image:
    """
    Generates realistic non-leaf negative samples:
    Signature, Person, Phone, Laptop, Document, Animal, Building, Screenshot, Food, Random.
    """
    random.seed(seed)
    w, h = 224, 224

    if category == "Signature":
        # White paper with blue/black handwriting / signature loops
        img = Image.new("RGB", (w, h), (250, 250, 250))
        draw = ImageDraw.Draw(img)
        ink_col = (random.randint(10, 30), random.randint(30, 70), random.randint(130, 200))
        # Draw cursive swoops
        last_pt = (30, h // 2)
        for i in range(12):
            next_pt = (30 + i * 14, h // 2 + int(35 * math.sin(i * 1.2) + random.randint(-10, 10)))
            draw.line([last_pt, next_pt], fill=ink_col, width=random.randint(2, 3))
            last_pt = next_pt
        # Underline
        draw.line([(25, h // 2 + 45), (195, h // 2 + 45)], fill=ink_col, width=2)

    elif category == "Document":
        # White document with horizontal text lines
        img = Image.new("RGB", (w, h), (245, 245, 248))
        draw = ImageDraw.Draw(img)
        draw.rectangle([20, 20, w - 20, h - 20], outline=(200, 200, 205), width=2)
        for y in range(40, h - 30, 14):
            line_w = random.randint(100, 170)
            draw.line([(35, y), (35 + line_w, y)], fill=(60, 60, 65), width=2)

    elif category == "Person":
        # Human skin tone with portrait / face / shoulders
        img = Image.new("RGB", (w, h), (210, 215, 225))
        draw = ImageDraw.Draw(img)
        skin_tone = (random.randint(200, 240), random.randint(155, 195), random.randint(125, 165))
        # Head
        draw.ellipse([70, 30, w - 70, 120], fill=skin_tone)
        # Eyes
        draw.ellipse([90, 65, 102, 75], fill=(40, 30, 20))
        draw.ellipse([w - 102, 65, w - 90, 75], fill=(40, 30, 20))
        # Shoulders / clothing
        cloth_col = (random.randint(40, 120), random.randint(60, 140), random.randint(140, 200))
        draw.rectangle([40, 130, w - 40, h], fill=cloth_col)

    elif category == "Phone":
        # Black/silver mobile phone bezel with active screen
        img = Image.new("RGB", (w, h), (230, 230, 230))
        draw = ImageDraw.Draw(img)
        # Phone body
        draw.rounded_rectangle([55, 15, w - 55, h - 15], radius=15, fill=(35, 35, 40))
        # Screen
        draw.rectangle([65, 35, w - 65, h - 35], fill=(80, 140, 220))
        # App icons
        for r in range(3):
            for c in range(2):
                draw.rounded_rectangle([75 + c * 38, 50 + r * 38, 105 + c * 38, 80 + r * 38], radius=6, fill=(245, 245, 245))

    elif category == "Laptop":
        # Laptop screen and keyboard base
        img = Image.new("RGB", (w, h), (220, 225, 230))
        draw = ImageDraw.Draw(img)
        # Screen
        draw.rectangle([40, 25, w - 40, 130], fill=(20, 25, 35), outline=(160, 165, 175), width=3)
        draw.rectangle([46, 32, w - 46, 123], fill=(50, 100, 170))
        # Keyboard base
        draw.polygon([(25, 170), (w - 25, 170), (w - 35, 132), (35, 132)], fill=(180, 185, 195))

    elif category == "Building":
        # Architectural building facade with brick/window grid
        img = Image.new("RGB", (w, h), (140, 180, 220))  # Sky
        draw = ImageDraw.Draw(img)
        # Wall
        draw.rectangle([35, 40, w - 35, h], fill=(185, 95, 75))
        # Windows
        for floor in range(3):
            for win in range(3):
                wx = 50 + win * 45
                wy = 60 + floor * 45
                draw.rectangle([wx, wy, wx + 30, wy + 30], fill=(220, 240, 255), outline=(50, 50, 50), width=2)

    elif category == "Animal":
        # Pet / fur / animal form
        img = Image.new("RGB", (w, h), (200, 205, 210))
        draw = ImageDraw.Draw(img)
        fur_col = (random.randint(140, 180), random.randint(90, 130), random.randint(50, 80))
        draw.ellipse([45, 60, w - 45, h - 30], fill=fur_col)
        # Ears
        draw.polygon([(65, 75), (85, 25), (105, 75)], fill=fur_col)
        draw.polygon([(w - 105, 75), (w - 85, 25), (w - 65, 75)], fill=fur_col)

    elif category == "Food":
        # Pizza / plate with food items
        img = Image.new("RGB", (w, h), (235, 230, 220))
        draw = ImageDraw.Draw(img)
        # Plate
        draw.ellipse([25, 25, w - 25, h - 25], fill=(255, 255, 255), outline=(200, 200, 200), width=3)
        # Food
        draw.ellipse([45, 45, w - 45, h - 45], fill=(215, 140, 50))
        for _ in range(6):
            cx = random.randint(65, w - 65)
            cy = random.randint(65, h - 65)
            draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(175, 40, 30))

    elif category == "Screenshot":
        # Digital UI screenshot / window header
        img = Image.new("RGB", (w, h), (40, 44, 52))
        draw = ImageDraw.Draw(img)
        # Title bar
        draw.rectangle([0, 0, w, 28], fill=(33, 37, 43))
        draw.ellipse([10, 9, 18, 17], fill=(224, 108, 117))
        draw.ellipse([24, 9, 32, 17], fill=(229, 192, 123))
        draw.ellipse([38, 9, 46, 17], fill=(152, 195, 121))
        # Code lines
        for y in range(45, h - 20, 16):
            draw.rectangle([20, y, 20 + random.randint(40, 140), y + 8], fill=(97, 175, 239))

    elif category == "Random":
        # Tabletop with a ceramic mug / household object
        img = Image.new("RGB", (w, h), (215, 205, 195))
        draw = ImageDraw.Draw(img)
        # Table edge
        draw.line([(0, 150), (w, 150)], fill=(160, 130, 100), width=3)
        # Mug body
        draw.rounded_rectangle([75, 80, 145, 160], radius=8, fill=(60, 90, 150))
        # Handle
        draw.arc([130, 95, 165, 145], start=270, end=90, fill=(60, 90, 150), width=6)

    else:  # Blank image / solid wall
        base_gray = random.randint(100, 210)
        img = Image.new("RGB", (w, h), (base_gray, base_gray, base_gray))

    return img


# ==============================================================================
# 3. MASTER DATASET COMPILER
# ==============================================================================

CROP_IDENTIFICATION_DIR = os.path.join(CURRENT_DIR, "crop_identification")

def build_all_datasets():
    """
    Builds balanced, leak-free datasets for:
    1. Leaf Detection (LEAF vs NON_LEAF) in `dataset_leaf/`
    2. Crop Species Classification in `crop_identification/` and `dataset_crop/`:
       - Hierarchical species folders: Tomato/ (healthy/diseased), Potato/ (healthy/diseased), Corn/ (healthy/diseased), Rice/ (healthy/diseased)
       - UNKNOWN/ folder with 12 unsupported species subfolders
       - Standard ML splits: train/, val/, test/
       - Dedicated unseen OOD test split (ood_test/) with species never seen in training
       - Dedicated Rice vs Corn differentiation test set (rice_corn_test/)
    """
    print("=" * 75)
    print("   CROPWISE AI - Building Datasets for Multi-Stage ML Models")
    print("=" * 75)

    supported = ["Tomato", "Potato", "Corn", "Rice"]
    
    # UNKNOWN training species (Group A)
    train_unknown_plants = [
        "Mango", "Neem", "Guava", "Banana", "Rose", "Apple",
        "Grape", "Papaya", "Hibiscus", "Lemon", "Coconut", "Other"
    ]
    
    # Unseen OOD species (Group B - NEVER seen during training)
    unseen_ood_plants = ["Banyan", "Eucalyptus", "Orchid", "Sunflower", "Okra", "Cotton"]

    non_leaf_cats = ["Signature", "Document", "Person", "Phone", "Laptop", "Building", "Animal", "Food", "Screenshot", "Random"]

    # 1. Build Leaf Detection Dataset (dataset_leaf/)
    for split, count in LEAF_SPLITS.items():
        leaf_dir = os.path.join(LEAF_DATASET_DIR, split, "LEAF")
        non_leaf_dir = os.path.join(LEAF_DATASET_DIR, split, "NON_LEAF")
        os.makedirs(leaf_dir, exist_ok=True)
        os.makedirs(non_leaf_dir, exist_ok=True)

        for i in range(count):
            seed = hash(f"{split}_leaf_{i}") & 0x7fffffff
            if i % 2 == 0:
                spec = supported[i % len(supported)]
                img = generate_crop_leaf(spec, seed, diseased=(i % 3 == 0))
            else:
                plant = train_unknown_plants[i % len(train_unknown_plants)]
                img = generate_unknown_plant_leaf(plant, seed)
            img.save(os.path.join(leaf_dir, f"leaf_{i:03d}.jpg"))

        for i in range(count):
            seed = hash(f"{split}_non_leaf_{i}") & 0x7fffffff
            cat = non_leaf_cats[i % len(non_leaf_cats)]
            img = generate_non_leaf_image(cat, seed)
            img.save(os.path.join(non_leaf_dir, f"non_leaf_{i:03d}.jpg"))

    print(f"[Leaf Dataset] Serialized at: {LEAF_DATASET_DIR}")

    # 2. Build Structured crop_identification/ Directory (Section 20 Layout)
    for crop in supported:
        crop_h_dir = os.path.join(CROP_IDENTIFICATION_DIR, crop, "healthy")
        crop_d_dir = os.path.join(CROP_IDENTIFICATION_DIR, crop, "diseased")
        os.makedirs(crop_h_dir, exist_ok=True)
        os.makedirs(crop_d_dir, exist_ok=True)

        for i in range(25):
            s_h = hash(f"struct_{crop}_healthy_{i}") & 0x7fffffff
            generate_crop_leaf(crop, s_h, diseased=False).save(os.path.join(crop_h_dir, f"{crop.lower()}_h_{i:03d}.jpg"))
            s_d = hash(f"struct_{crop}_diseased_{i}") & 0x7fffffff
            generate_crop_leaf(crop, s_d, diseased=True).save(os.path.join(crop_d_dir, f"{crop.lower()}_d_{i:03d}.jpg"))

    # Build UNKNOWN/ subfolders
    for unk_plant in train_unknown_plants:
        unk_sub = os.path.join(CROP_IDENTIFICATION_DIR, "UNKNOWN", unk_plant)
        os.makedirs(unk_sub, exist_ok=True)
        for i in range(10):
            s_u = hash(f"struct_unk_{unk_plant}_{i}") & 0x7fffffff
            generate_unknown_plant_leaf(unk_plant, s_u).save(os.path.join(unk_sub, f"{unk_plant.lower()}_{i:03d}.jpg"))

    print(f"[Crop Identification Structure] Section 20 folders built at: {CROP_IDENTIFICATION_DIR}")

    # 3. Build ML Train / Val / Test Splits (in crop_identification/ and dataset_crop/)
    target_dirs = [CROP_IDENTIFICATION_DIR, CROP_DATASET_DIR]
    crop_classes = ["Corn", "Potato", "Rice", "Tomato", "UNKNOWN"]

    for base_dir in target_dirs:
        for split, count in CROP_SPLITS.items():
            for c_name in crop_classes:
                target_split_dir = os.path.join(base_dir, split, c_name)
                os.makedirs(target_split_dir, exist_ok=True)

                for i in range(count):
                    seed = hash(f"{split}_{c_name}_{i}") & 0x7fffffff
                    if c_name in supported:
                        img = generate_crop_leaf(c_name, seed, diseased=(i % 2 == 0))
                    else:
                        plant = train_unknown_plants[i % len(train_unknown_plants)]
                        img = generate_unknown_plant_leaf(plant, seed)
                    img.save(os.path.join(target_split_dir, f"{c_name.lower()}_{i:03d}.jpg"))

    # 4. Build Dedicated Unseen OOD Test Split (ood_test/)
    for base_dir in target_dirs:
        ood_dir = os.path.join(base_dir, "ood_test")
        os.makedirs(ood_dir, exist_ok=True)
        for plant in unseen_ood_plants:
            plant_sub = os.path.join(ood_dir, plant)
            os.makedirs(plant_sub, exist_ok=True)
            for i in range(10):
                seed = hash(f"ood_test_{plant}_{i}") & 0x7fffffff
                img = generate_unknown_plant_leaf(plant, seed)
                img.save(os.path.join(plant_sub, f"{plant.lower()}_{i:03d}.jpg"))

    # 5. Build Dedicated Rice vs Corn Test Set (rice_corn_test/)
    for base_dir in target_dirs:
        rc_dir = os.path.join(base_dir, "rice_corn_test")
        rc_rice = os.path.join(rc_dir, "Rice")
        rc_corn = os.path.join(rc_dir, "Corn")
        os.makedirs(rc_rice, exist_ok=True)
        os.makedirs(rc_corn, exist_ok=True)

        for i in range(50):
            s_r = hash(f"rc_eval_rice_{i}") & 0x7fffffff
            generate_crop_leaf("Rice", s_r, diseased=(i % 2 == 0)).save(os.path.join(rc_rice, f"rice_eval_{i:03d}.jpg"))
            s_c = hash(f"rc_eval_corn_{i}") & 0x7fffffff
            generate_crop_leaf("Corn", s_c, diseased=(i % 2 == 0)).save(os.path.join(rc_corn, f"corn_eval_{i:03d}.jpg"))

    print(f"[Dedicated Test Sets] Unseen OOD and Rice-vs-Corn suites ready at: {CROP_IDENTIFICATION_DIR}")
    print("=" * 75)


if __name__ == "__main__":
    build_all_datasets()
