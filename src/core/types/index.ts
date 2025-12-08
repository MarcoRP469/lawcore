// Definimos un tipo Timestamp compatible sin Firebase
export type Timestamp = string | Date;

import type { LucideIcon } from "lucide-react";

export type ServicioGeneral = {
  name: string;
  icon: LucideIcon;
};

export type ServicioDetallado = {
  slug: string;
  name: string;
  price?: number;
  requisitos: string[];
  images?: string[];
  videoUrl?: string;
};

export type Notaria = {
  id: number;
  name: string;
  address: string;
  district: string;
  phone: string;
  landline?: string;
  email: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  available: boolean;
  services: string[];
  avatarUrl: string;
  rating: number;
  observations?: string;
  detailedServices?: ServicioDetallado[];
  commentSummary?: string;
  createdAt?: Timestamp;
};

export type Comentario = {
  id: number;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string | null;
  notaryId: number;
  rating: number;
  text: string;
  createdAt: Timestamp;
};

export type Usuario = {
  id: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  createdAt?: Timestamp;
  es_admin?: boolean;
  role?: 'superadmin' | 'client' | 'public';
  bio?: string;
  phoneNumber?: string;
};

export type Visita = {
  date: string;
  visits: number;
};

export type ComentarioReciente = {
  id: number;
  userName: string;
  userEmail: string;
  notaryName: string;
  rating: number;
  date: string;
};

export type Metrica = {
  totalVisitas: number;
  cambioVisitas: number;
  nuevosUsuarios: number;
  cambioNuevosUsuarios: number;
  comentariosPublicados: number;
  cambioComentarios: number;
  activosAhora: number;
  cambioActivosAhora: number;
};

export type FuenteTrafico = {
    source: string;
    visitors: number;
    fill: string;
}

export type MetricasDashboard = {
    kpi: Metrica;
    visitas: Visita[];
    topNotarias: { name: string; views: number }[];
    comentariosRecientes: ComentarioReciente[];
    fuentesTrafico: FuenteTrafico[];
}
