
import type { Notaria, Comentario, Usuario } from '@/core/types';

export const mockUsers: Usuario[] = [
  {
    id: 'user-1',
    displayName: 'Marco Administrador',
    email: 'marco@admin.com',
    photoURL: 'https://i.pravatar.cc/150?u=marco',
    createdAt: new Date('2023-01-15T09:30:00Z'),
  },
  {
    id: 'user-2',
    displayName: 'Ana García',
    email: 'ana@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=ana',
    createdAt: new Date('2023-02-20T14:00:00Z'),
  },
  {
    id: 'user-3',
    displayName: 'Carlos Ruiz',
    email: 'carlos@example.com',
    photoURL: 'https://i.pravatar.cc/150?u=carlos',
    createdAt: new Date('2023-03-10T18:45:00Z'),
  },
];

export const mockAdmins = [
    { id: 'user-1' } // El ID del usuario que es administrador
]

export const mockNotaries: Notaria[] = [
  {
    id: 1,
    name: 'Notaría Estacio',
    address: 'Av. Luzuriaga 588',
    district: 'Huaraz',
    phone: '987654321',
    landline: '043-421234',
    email: 'contacto@nestacio.com',
    website: 'https://www.notariaestacio.com',
    available: true,
    services: ['Derecho Inmobiliario', 'Testamentos', 'Contratos', 'Asesoría Legal'],
    avatarUrl: 'https://www.abogadosdeherencias.pe/wp-content/uploads/2021/04/notaria-barba.jpg',
    rating: 4.8,
    observations: 'Atención preferencial para adultos mayores.',
    commentSummary: 'Los clientes elogian la rapidez y la excelente atención del personal.',
    createdAt: new Date('2023-01-10T10:00:00Z'),
    detailedServices: [
        {
            slug: 'compraventa-inmueble',
            name: 'Compraventa de Inmueble',
            price: 500,
            requisitos: ['Copia DNI de compradores y vendedores', 'Partida registral del inmueble (CRI)', 'HR y PU del año en curso', 'Minuta autorizada por abogado'],
            images: ['https://picsum.photos/seed/compraventa/400/300'],
            videoUrl: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        },
        {
            slug: 'constitucion-empresa',
            name: 'Constitución de Empresa',
            price: 650,
            requisitos: ['Reserva de nombre en SUNARP', 'Minuta de constitución', 'DNI de los socios', 'Declaración jurada de bienes aportados'],
            images: ['https://picsum.photos/seed/empresa/400/300'],
        }
    ]
  },
  {
    id: 2,
    name: 'Notaría Gonzales',
    address: 'Jr. Sucre 789',
    district: 'Independencia',
    phone: '912345678',
    email: 'info@notariagonzales.pe',
    website: 'https://www.notariagonzales.pe',
    available: false,
    services: ['Derecho Corporativo', 'Poderes', 'Autenticación de firmas'],
    avatarUrl: 'https://infomercado.pe/wp-content/uploads/2023/12/notaria-paino-Fachada-1170x780.jpg',
    rating: 4.2,
    commentSummary: 'Opiniones mixtas, algunos aprecian la experiencia mientras que otros mencionan demoras.',
    createdAt: new Date('2023-02-15T11:00:00Z'),
    detailedServices: [
         {
            slug: 'poder-amplio',
            name: 'Poder Amplio y General',
            price: 250,
            requisitos: ['DNI vigente del poderdante', 'Datos completos del apoderado', 'Descripción de las facultades a otorgar'],
            images: ['https://picsum.photos/seed/poder/400/300'],
        }
    ]
  },
  {
    id: 3,
    name: 'Notaría Mejía',
    address: 'Av. Confraternidad 123',
    district: 'Huaraz',
    phone: '998877665',
    email: 'consultas@notariamejia.com',
    available: true,
    services: ['Testamentos', 'Actas notariales', 'Protocolización de escrituras'],
    avatarUrl: 'https://iuslatin.pe/wp-content/uploads/2021/04/Notaria-Fernandez-Dávila-Fachada.png',
    rating: 3.5,
    observations: 'Se requiere cita previa para todos los trámites.',
    commentSummary: 'El servicio es considerado correcto, aunque un poco lento en horas punta.',
    createdAt: new Date('2023-03-20T12:00:00Z'),
  },
];


export const mockComments: Comentario[] = [
    {
        id: 1,
        notaryId: 1,
        userId: 'user-2',
        userDisplayName: 'Ana García',
        userPhotoURL: 'https://i.pravatar.cc/150?u=ana',
        rating: 5,
        text: '¡Excelente servicio! Fueron muy rápidos y amables durante todo el proceso de mi trámite. Totalmente recomendado.',
        createdAt: new Date('2023-10-26T10:00:00Z'),
    },
    {
        id: 2,
        notaryId: 1,
        userId: 'user-3',
        userDisplayName: 'Carlos Ruiz',
        userPhotoURL: 'https://i.pravatar.cc/150?u=carlos',
        rating: 4,
        text: 'Buena atención, aunque el local es un poco pequeño y se llena rápido. Los documentos estuvieron listos en el tiempo prometido.',
        createdAt: new Date('2023-10-25T14:30:00Z'),
    },
    {
        id: 3,
        notaryId: 2,
        userId: 'user-2',
        userDisplayName: 'Ana García',
        userPhotoURL: 'https://i.pravatar.cc/150?u=ana',
        rating: 3,
        text: 'El proceso fue más largo de lo que esperaba. El personal es conocedor pero parecían tener mucha carga de trabajo.',
        createdAt: new Date('2023-09-15T11:00:00Z'),
    }
];
