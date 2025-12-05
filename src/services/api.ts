// src/services/api.ts

import axios from 'axios';

// URL del backend Python. En desarrollo local es localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export default api;
