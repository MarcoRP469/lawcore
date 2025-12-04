
import { Briefcase, Gavel, Landmark, PenSquare, Scale, ScrollText, FileSignature } from 'lucide-react';

export const DISTRITOS = ["Huaraz", "Independencia", "Tarica", "Jangas", "Pariacoto"];

export const TODOS_LOS_SERVICIOS = {
  "Derecho Inmobiliario": { name: "Derecho Inmobiliario", icon: Landmark },
  "Derecho Corporativo": { name: "Derecho Corporativo", icon: Briefcase },
  "Testamentos": { name: "Testamentos", icon: ScrollText },
  "Contratos": { name: "Contratos", icon: PenSquare },
  "Asesoría Legal": { name: "Asesoría Legal", icon: Gavel },
  "Protocolización de escrituras": { name: "Protocolización de escrituras", icon: ScrollText },
  "Autenticación de firmas": { name: "Autenticación de firmas", icon: FileSignature },
  "Actas notariales": { name: "Actas notariales", icon: FileSignature },
  "Poderes": { name: "Poderes", icon: Scale },
};
