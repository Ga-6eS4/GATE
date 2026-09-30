/**
 * SignAI Frontend API Service
 * Interacts with FastAPI backend running on http://localhost:8000
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

/**
 * Predict ASL sign from image File object (Multipart Upload)
 */
export async function predictSignFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('API File Prediction error, using local fallback:', err.message);
    return null;
  }
}

/**
 * Predict ASL sign from Base64 image string (Webcam live stream frame)
 */
export async function predictSignBase64(base64Image, hintClass = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/predict/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_base64: base64Image,
        target_class: hintClass
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('API Base64 Prediction error, using local fallback:', err.message);
    return null;
  }
}

/**
 * Translate English text to ASL fingerspelling sequence
 */
export async function translateTextToASL(text) {
  try {
    const res = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Translation API error:', err.message);
    return null;
  }
}
/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Registration failed');
  }
  return data; // { access_token, token_type, user }
}

/**
 * Log in an existing user
 */
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }
  return data; // { access_token, token_type, user }
}/**
 * Request a password reset OTP
 */
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

/**
 * Reset password using OTP
 */
export async function resetPassword(email, otp, newPassword) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, new_password: newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Reset failed');
  return data;
}