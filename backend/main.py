"""
=============================================================================
G.A.T.E - Gesture And Text Engine
American Sign Language (ASL) Alphabet Recognition - FastAPI Backend
TensorFlow / Keras Model Inference Server + PostgreSQL User Auth
=============================================================================
"""

import os
import io
import time
import base64
from typing import Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import tensorflow as tf

from database import engine, get_db, Base
from models import User, PasswordResetOTP
from auth import hash_password, verify_password, create_access_token, decode_access_token, generate_otp
from datetime import datetime, timedelta, timezone
from mailer import send_otp_email
# -----------------------------------------------------------------------------
# App setup
# -----------------------------------------------------------------------------

app = FastAPI(
    title="G.A.T.E - ASL Recognition Backend",
    description="REST API for real-time American Sign Language alphabet "
                 "recognition, powered by a from-scratch TensorFlow CNN, "
                 "with PostgreSQL-backed user accounts.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten this to your frontend's exact URL before deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creates the users / practice_sessions / prediction_logs tables if they
# don't already exist in your Neon database. Safe to run every startup -
# it does nothing if the tables are already there.
Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# -----------------------------------------------------------------------------
# Constants - must match how the model was trained
# -----------------------------------------------------------------------------

IMG_SIZE = (64, 64)


ASL_CLASSES = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
]

SERVER_START_TIME = time.time()

OTP_EXPIRE_MINUTES = 10

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
# Request / response schemas
# -----------------------------------------------------------------------------

class Base64PredictRequest(BaseModel):
    image_base64: str
    target_class: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# -----------------------------------------------------------------------------
# Auth dependency - use in any route that needs a logged-in user
# -----------------------------------------------------------------------------

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_access_token(token)
    if payload is None or "user_id" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# -----------------------------------------------------------------------------
# Auth routes
# -----------------------------------------------------------------------------

@app.post("/auth/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"user_id": new_user.id})
    return TokenResponse(access_token=token, user=UserOut.model_validate(new_user))


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"user_id": user.id})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
ADMIN_EMAILS = {"bhandariganesh2059@gmail.com"}  # add more emails here if needed


@app.get("/admin/users", response_model=list[UserOut])
def list_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Not authorized to view this resource.")

    users = db.query(User).order_by(User.id).all()
    return users
@app.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return the same generic message, whether or not the email exists -
    # this avoids leaking which emails are registered in the system.
    if user:
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
        otp_entry = PasswordResetOTP(user_id=user.id, otp_code=otp_code, expires_at=expires_at)
        db.add(otp_entry)
        db.commit()
        send_otp_email(user.email, otp_code, user.name)

    return {"message": "If an account with that email exists, a reset code has been sent."}


@app.post("/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    otp_entry = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp_code == payload.otp,
            PasswordResetOTP.used == False,
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )

    if not otp_entry or otp_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    user.hashed_password = hash_password(payload.new_password)
    otp_entry.used = True
    db.commit()

    return {"message": "Password has been reset successfully."}

# -----------------------------------------------------------------------------
# Helpers for ASL prediction
# -----------------------------------------------------------------------------

def preprocess_pil_image(image_bytes: bytes) -> Image.Image:
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
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model is not loaded on the server.")

    t0 = time.time()

    img_resized = pil_img.resize(IMG_SIZE)
    img_array = np.array(img_resized, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    probabilities = MODEL.predict(img_array, verbose=0)[0]

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
# Core routes
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
    contents = await file.read()
    pil_img = preprocess_pil_image(contents)
    return classify_image(pil_img)


@app.post("/predict/base64")
async def predict_base64(payload: Base64PredictRequest):
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
    cleaned_chars = [c.upper() for c in payload.text if c.isalpha()]
    return {
        "original_text": payload.text,
        "tokens": cleaned_chars,
        "token_count": len(cleaned_chars)
    }


@app.get("/dictionary")
def get_dictionary():
    return {
        "total": len(ASL_CLASSES),
        "classes": ASL_CLASSES
    }
