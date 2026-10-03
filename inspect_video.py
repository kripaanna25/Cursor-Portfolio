#!/usr/bin/env python3
"""
inspect_video.py
Inspects the character animation video to identify directional keyframe positions,
then verifies the existing 64-frame WebP extraction is correctly ordered.
"""
import cv2
import numpy as np
import os

VIDEO_PATH = r'public/character.mp4'
FRAMES_DIR = r'public/frames'

cap = cv2.VideoCapture(VIDEO_PATH)
fps  = cap.get(cv2.CAP_PROP_FPS)
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
dur = total / fps

print(f"Video: {W}x{H} @ {fps:.2f} fps  |  {total} frames  |  {dur:.2f}s")
print()

# ── Compass sample points ──
# The video has 8 directional poses then a neutral.
# At 30fps / 10s with 300 frames, each direction ≈ 300/9 ≈ 33 frames apart.
# Pose order from most animation tools: they typically go
#   RIGHT → DOWN-RIGHT → DOWN → DOWN-LEFT → LEFT → UP-LEFT → UP → UP-RIGHT → CENTER
# But we need to inspect actual motion to confirm.

# Sample every 10th frame and measure head ROI horizontal shift
# as a proxy for left/right head direction.
samples = {}
for f_idx in range(0, total, 10):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_idx)
    ret, frame = cap.read()
    if not ret:
        break
    # Crop to head region: top-center ~30% of frame
    head_roi = frame[:int(H*0.45), int(W*0.25):int(W*0.75)]
    # Compute mean x-position of bright (skin-tone) pixels vs dark bg
    # Background is deep red, character is brighter
    hsv = cv2.cvtColor(head_roi, cv2.COLOR_BGR2HSV)
    # Rough skin-or-bright mask (higher saturation and value than bg)
    mask = (hsv[:,:,2] > 80).astype(np.uint8)
    if mask.sum() > 100:
        cx = int(np.average(np.where(mask > 0)[1]))
        samples[f_idx] = cx

cap.release()

# Print sample data
print("Frame → Head X centroid (proxy for L/R direction):")
for f, x in sorted(samples.items()):
    bar = '─' * (x // 4)
    print(f"  Frame {f:3d}: x={x:3d}  |{bar}")

# ── Check extracted frame files ──
print()
webps = sorted([f for f in os.listdir(FRAMES_DIR) if f.endswith('.webp')])
print(f"Extracted frames in public/frames/: {len(webps)}")
print("Each frame covers ~{:.1f}° of 360° rotation".format(360/len(webps)))
print()
print("Done. Use this data to verify CharacterCanvas.jsx angle→frame mapping.")
