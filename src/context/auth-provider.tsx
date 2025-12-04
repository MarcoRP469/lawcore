"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

// Tipo de usuario basado en el esquema de BD
export type User = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  es_admin?: boolean;
  // Agrega otros campos si es necesario
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Hook de compatibilidad para reemplazar useUser de Firebase fácilmente
export const useUser = () => {
    const { user } = useAuth();
    return user;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setUser(null);
    router.push("/");
  }, [router]);

  const checkUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Opcional: Endpoint /auth/me para obtener datos del usuario con el token
      // Por ahora simulamos decodificando o simplemente asumiendo sesión activa si el token no expira.
      // Lo ideal es tener un endpoint 'get_current_user' en backend
      // Vamos a asumir que si hay token, intentamos hacer una llamada para validar.
      // Si falla (401), hacemos logout.
      
      // Como no cree el endpoint /auth/me en el plan anterior, lo inferiremos o lo añadiremos después.
      // Por ahora, decodificar el token es inseguro en cliente para datos, pero válido para estado básico.
      // Mejor estrategia: Intentar leer algo protegido o simplemente persistir el usuario en localStorage al login.
      
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
          setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error verificando sesión", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    void checkUser();
  }, [checkUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      
      // Simular datos de usuario o obtenerlos de otra llamada. 
      // El login de Python devuelve token.
      // Hack temporal: guardar datos básicos. En prod, llamar a /users/me
      const userData: User = { 
          id: email, // Temporal hasta tener endpoint /me
          email, 
          displayName: email.split('@')[0], 
          photoURL: null 
      };
      
      setUser(userData);
      localStorage.setItem("user_data", JSON.stringify(userData));
      
      router.refresh();
    } catch (error) {
      console.error("Login error", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post("/auth/register", { 
          email, 
          password, 
          nombre: name // Mapeo al esquema backend 
      });
      const { access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      
      const userData: User = { 
          id: email, 
          email, 
          displayName: name, 
          photoURL: null 
      };
      
      setUser(userData);
      localStorage.setItem("user_data", JSON.stringify(userData));
      
      router.refresh();
    } catch (error) {
      console.error("Register error", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
