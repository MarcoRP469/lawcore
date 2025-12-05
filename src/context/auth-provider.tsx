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
      const response = await api.get("/auth/me");
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem("user_data", JSON.stringify(userData));
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
      
      // Obtener datos reales del usuario
      const meResponse = await api.get("/auth/me");
      const userData = meResponse.data;
      
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
      
      // Obtener datos reales del usuario
      const meResponse = await api.get("/auth/me");
      const userData = meResponse.data;
      
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
