import cv2
import os

VIDEO_PATH = "public/character.mp4"
OUTPUT_DIR = "public/frames"
TOTAL_FRAMES = 64

os.makedirs(OUTPUT_DIR, exist_ok=True)

video = cv2.VideoCapture(VIDEO_PATH)

if not video.isOpened():
    print("ERROR: Could not open character.mp4")
    exit()

total_video_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

print("Video frames:", total_video_frames)

# Pick 64 evenly spaced frames from the video
frame_positions = [
    round(i * (total_video_frames - 1) / (TOTAL_FRAMES - 1))
    for i in range(TOTAL_FRAMES)
]

for i, position in enumerate(frame_positions):
    video.set(cv2.CAP_PROP_POS_FRAMES, position)

    success, frame = video.read()

    if not success:
        print(f"Could not read frame {position}")
        continue

    filename = os.path.join(
        OUTPUT_DIR,
        f"frame_{i:02d}.webp"
    )

    cv2.imwrite(
        filename,
        frame,
        [cv2.IMWRITE_WEBP_QUALITY, 95]
    )

    print(f"Created {filename}")

video.release()

print("\nDone! 64 frames extracted.")