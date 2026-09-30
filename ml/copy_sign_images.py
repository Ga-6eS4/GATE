"""
G.A.T.E - Copy one representative sign image per letter into the frontend.

Picks the ~50th image from each letter's Kaggle training folder (skipping
the very first few, which are sometimes edge-of-burst/blurry) and saves it
as frontend/public/asl_signs/<LETTER>.jpg for the Text Translator UI to use.
"""

import os
import shutil

LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

base_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
train_dir = os.path.join(base_dir, "data", "asl_alphabet_train", "asl_alphabet_train")
if not os.path.exists(train_dir):
    train_dir = "data/asl_alphabet_train/asl_alphabet_train"

out_dir = os.path.join(base_dir, "..", "frontend", "public", "asl_signs")
os.makedirs(out_dir, exist_ok=True)

PICK_INDEX = 50  # which image (by sorted order) to use from each folder

copied = []
missing = []

for letter in LETTERS:
    folder = os.path.join(train_dir, letter)
    if not os.path.isdir(folder):
        missing.append(letter)
        continue

    images = sorted(os.listdir(folder))
    if not images:
        missing.append(letter)
        continue

    idx = min(PICK_INDEX, len(images) - 1)
    src = os.path.join(folder, images[idx])
    dst = os.path.join(out_dir, f"{letter}.jpg")
    shutil.copy(src, dst)
    copied.append(letter)

print(f"Copied {len(copied)} images to {os.path.abspath(out_dir)}")
if missing:
    print(f"Missing/skipped letters: {missing}")
print("\nReview these images - if any look unclear/blurry, replace them manually")
print("by copying a better photo from ml/data/.../<LETTER>/ into frontend/public/asl_signs/<LETTER>.jpg")
