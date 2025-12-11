// src/services/api.ts

import axios from 'axios';

// URL del backend - Configuración dinámica
const getApiUrl = (): string => {
  // 1. Variable de entorno (más alta prioridad)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 2. Lógica según ambiente (fallback)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  
  // 3. Producción (último fallback)
  return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://api.lawcore.com';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT si existe
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores 401 (token expirado o inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token es inválido o expiró
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          // Solo limpiamos y redirigimos si había un token (para evitar bucles si el endpoint publico falla con 401 por error)
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
          // Redirigir al login o recargar la página para limpiar el estado
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const generateSummary = async (notariaId: number | string) => {
  return api.post(`/notarias/${notariaId}/generate-summary`);
};

export const getAnalyticsTrends = async () => {
  return api.get('/metricas/tendencias-busqueda');
};

export const getQualityAlerts = async () => {
  return api.get('/metricas/alertas-calidad');
};

export default api;
