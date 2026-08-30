"""
G.A.T.E - Webcam Data Collection Script
=========================================
Captures your own labeled hand-sign images through the webcam, so the model
can be fine-tuned on images that actually match your real camera, lighting,
and background - closing the gap between the clean Kaggle training data and
real-world webcam conditions.

Controls:
- The script walks you through each letter A-Z one at a time.
- Position your hand inside the green box.
- Press SPACE to capture a burst of images for the current letter.
- Press N to skip to the next letter early.
- Press Q to quit at any time.

Images are saved to: ml/webcam_data/<LETTER>/img_*.jpg
"""

import os
import time
import cv2

# ----------------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------------

SAVE_DIR = "webcam_data"
LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
IMAGES_PER_LETTER = 40          # aim for 30-50 per letter
CROP_SIZE = 300                 # size (in pixels) of the square capture box on screen
CAPTURE_INTERVAL = 0.15         # seconds between captures during a burst

os.makedirs(SAVE_DIR, exist_ok=True)
for letter in LETTERS:
    os.makedirs(os.path.join(SAVE_DIR, letter), exist_ok=True)

# ----------------------------------------------------------------------------
# Webcam setup
# ----------------------------------------------------------------------------

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError("Could not open webcam. Check that it's not in use by another app.")

print("=" * 60)
print("G.A.T.E Webcam Data Collection")
print("=" * 60)
print("For each letter: position your hand in the green box.")
print("Press SPACE to capture a burst, N to skip, Q to quit.\n")

letter_idx = 0

while letter_idx < len(LETTERS):
    letter = LETTERS[letter_idx]
    save_path = os.path.join(SAVE_DIR, letter)
    existing = len(os.listdir(save_path))

    ret, frame = cap.read()
    if not ret:
        print("Failed to read from webcam.")
        break

    frame = cv2.flip(frame, 1)  # mirror, so it feels natural (matches the React app's preview)
    h, w, _ = frame.shape
    x1 = w // 2 - CROP_SIZE // 2
    y1 = h // 2 - CROP_SIZE // 2
    x2 = x1 + CROP_SIZE
    y2 = y1 + CROP_SIZE

    display = frame.copy()
    cv2.rectangle(display, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(display, f"Letter: {letter}  ({existing}/{IMAGES_PER_LETTER} saved)",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
    cv2.putText(display, "SPACE=capture burst | N=next letter | Q=quit",
                (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

    cv2.imshow("G.A.T.E - Webcam Data Collection", display)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('q'):
        print("Quitting early.")
        break

    elif key == ord('n'):
        letter_idx += 1
        continue

    elif key == ord(' '):
        print(f"Capturing burst for '{letter}'...")
        count = existing
        while count < IMAGES_PER_LETTER:
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            crop = frame[y1:y2, x1:x2]
            if crop.size == 0:
                continue
            crop_resized = cv2.resize(crop, (64, 64))  # matches model's IMG_SIZE

            filename = os.path.join(save_path, f"img_{count:03d}.jpg")
            cv2.imwrite(filename, crop_resized)
            count += 1

            # show live progress
            preview = frame.copy()
            cv2.rectangle(preview, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(preview, f"Capturing {letter}: {count}/{IMAGES_PER_LETTER}",
                        (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            cv2.imshow("G.A.T.E - Webcam Data Collection", preview)
            cv2.waitKey(1)
            time.sleep(CAPTURE_INTERVAL)

        print(f"Done: {count} images saved for '{letter}'.")
        letter_idx += 1

cap.release()
cv2.destroyAllWindows()
print("\nData collection finished. Images saved under:", os.path.abspath(SAVE_DIR))
