/**
 * CROPWISE AI - Centralized Frontend API Service
 * Connects React pages to FastAPI endpoints with structured error handling.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to handle fetch responses and parse error details gracefully
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // Body was not JSON
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  // 1. Crop Disease Detection
  async predictDisease(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(`${API_BASE}/disease/predict`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async getDiseaseClasses() {
    const res = await fetch(`${API_BASE}/disease/classes`);
    return handleResponse(res);
  },

  async getDiseaseHistory() {
    const res = await fetch(`${API_BASE}/disease/history`);
    return handleResponse(res);
  },

  // 2. Crop Yield Optimization
  async predictYield(payload) {
    const res = await fetch(`${API_BASE}/yield/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getYieldModelComparison() {
    const res = await fetch(`${API_BASE}/yield/models-comparison`);
    return handleResponse(res);
  },

  async getYieldHistory() {
    const res = await fetch(`${API_BASE}/yield/history`);
    return handleResponse(res);
  },

  async getFarmerProfile() {
    const res = await fetch(`${API_BASE}/farm/profile`);
    return handleResponse(res);
  },

  async updateFarmerProfile(profile) {
    const res = await fetch(`${API_BASE}/farm/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  // 3. Agricultural Weather
  async getWeather(location = 'Central Valley Farm') {
    const res = await fetch(`${API_BASE}/weather?location=${encodeURIComponent(location)}`);
    return handleResponse(res);
  },

  // 4. Farm Analytics & Insights
  async getFarmInsights(params = {}) {
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.location) query.append('location', params.location);
    if (params.season) query.append('season', params.season);

    const res = await fetch(`${API_BASE}/farm/insights?${query.toString()}`);
    return handleResponse(res);
  },

  // 5. Agronomic Recommendations
  async getRecommendations(params = {}) {
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.soil_moisture !== undefined) query.append('soil_moisture', params.soil_moisture);
    if (params.soil_ph !== undefined) query.append('soil_ph', params.soil_ph);

    const res = await fetch(`${API_BASE}/recommendations?${query.toString()}`);
    return handleResponse(res);
  },

  // 6. ML Models & System Status
  async getModelStatus() {
    const res = await fetch(`${API_BASE}/model/status`);
    return handleResponse(res);
  },

  // 7. CropWise AI Conversational Assistant
  async chatWithAI(messages, context = null) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    return handleResponse(res);
  },

  async getAIContext() {
    const res = await fetch(`${API_BASE}/ai/context`);
    return handleResponse(res);
  }
};
