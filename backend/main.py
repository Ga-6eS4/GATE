"""
=============================================================================
G.A.T.E - Gesture And Text Engine
American Sign Language (ASL) Alphabet Recognition - FastAPI Backend
TensorFlow / Keras Model Inference Server
=============================================================================
"""

import os
import io
import time
import base64
from typing import Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf

# -----------------------------------------------------------------------------
# App setup
# -----------------------------------------------------------------------------

app = FastAPI(
    title="G.A.T.E - ASL Recognition Backend",
    description="REST + WebSocket API for real-time American Sign Language "
                 "alphabet recognition, powered by a from-scratch TensorFlow CNN.",
    version="1.0.0"
)

# Allow the React frontend (different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten this to your frontend's exact URL before deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Constants - must match how the model was trained
# -----------------------------------------------------------------------------

IMG_SIZE = (64, 64)  # matches training: img_size = (64, 64)

# Alphabetical order - matches image_dataset_from_directory's default sorting
# when space/del/nothing were excluded during training
ASL_CLASSES = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
]

SERVER_START_TIME = time.time()

# -----------------------------------------------------------------------------
# Model loading
# -----------------------------------------------------------------------------

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "asl_model.keras")
MODEL = None
MODEL_LOADED = False

try:
    MODEL = tf.keras.models.load_model(MODEL_PATH)
    MODEL_LOADED = True
    print(f"TensorFlow ASL model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"WARNING: Failed to load model from {MODEL_PATH}: {e}")

# -----------------------------------------------------------------------------
# Request schemas
# -----------------------------------------------------------------------------

class Base64PredictRequest(BaseModel):
    image_base64: str
    target_class: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------

def preprocess_pil_image(image_bytes: bytes) -> Image.Image:
    """Decode raw bytes into a clean RGB PIL image."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            img = img.convert("RGBA")
            bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
            bg.paste(img, (0, 0), img)
            return bg.convert("RGB")
        return img.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image payload: {str(e)}")


def classify_image(pil_img: Image.Image, hint_class: Optional[str] = None) -> dict:
    """Run a PIL image through the TensorFlow model and return prediction info."""
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model is not loaded on the server.")

    t0 = time.time()

    # Resize to training input size, normalize 0-255 -> 0-1, add batch dimension
    img_resized = pil_img.resize(IMG_SIZE)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # shape: (1, 64, 64, 3)

    probabilities = MODEL.predict(img_array, verbose=0)[0]  # softmax output, shape: (26,)

    inference_ms = round((time.time() - t0) * 1000.0, 1)

    top_idx = int(np.argmax(probabilities))
    top_class = ASL_CLASSES[top_idx]
    top_prob = float(probabilities[top_idx]) * 100.0

    top_indices = np.argsort(probabilities)[::-1][:3]
    predictions = [
        {"class": ASL_CLASSES[idx], "probability": round(float(probabilities[idx]) * 100.0, 1)}
        for idx in top_indices
    ]

    result = {
        "topClass": top_class,
        "confidence": round(top_prob, 1),
        "inferenceMs": inference_ms,
        "preprocessedShape": [IMG_SIZE[0], IMG_SIZE[1], 3],
        "framework": "TensorFlow",
        "predictions": predictions
    }

    if hint_class:
        result["hintMatch"] = (top_class.upper() == hint_class.upper())

    return result


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "G.A.T.E ASL TensorFlow Backend",
        "version": "1.0.0",
        "model_loaded": MODEL_LOADED,
        "num_classes": len(ASL_CLASSES)
    }


@app.get("/health")
def health_check():
    uptime_seconds = round(time.time() - SERVER_START_TIME, 1)
    return {
        "status": "online",
        "model_loaded": MODEL_LOADED,
        "target_classes_count": len(ASL_CLASSES),
        "classes": ASL_CLASSES,
        "uptime_seconds": uptime_seconds,
        "input_shape": [IMG_SIZE[0], IMG_SIZE[1], 3]
    }


@app.post("/predict")
async def predict_file(file: UploadFile = File(...)):
    """Predict ASL letter from an uploaded image file (multipart/form-data)."""
    contents = await file.read()
    pil_img = preprocess_pil_image(contents)
    return classify_image(pil_img)


@app.post("/predict/base64")
async def predict_base64(payload: Base64PredictRequest):
    """Predict ASL letter from a base64 image (used for the live webcam stream)."""
    try:
        raw_data = payload.image_base64
        if "," in raw_data:
            raw_data = raw_data.split(",")[1]
        image_bytes = base64.b64decode(raw_data)
        pil_img = preprocess_pil_image(image_bytes)
        return classify_image(pil_img, payload.target_class)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process base64 image: {str(e)}")


@app.post("/translate")
def translate_text(payload: TranslateRequest):
    """Turn an English phrase into a sequence of ASL fingerspelling letters."""
    cleaned_chars = [c.upper() for c in payload.text if c.isalpha()]
    return {
        "original_text": payload.text,
        "tokens": cleaned_chars,
        "token_count": len(cleaned_chars)
    }


@app.get("/dictionary")
def get_dictionary():
    """Return the list of ASL letters this model can recognize."""
    return {
        "total": len(ASL_CLASSES),
        "classes": ASL_CLASSES
    }
