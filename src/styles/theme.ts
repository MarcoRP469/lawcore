/**
 * Sistema de Tokens de Estilos - LawCore Frontend
 * 
 * Este archivo centraliza todos los tokens de diseño (colores, tamaños, espaciado)
 * Úsalo en tus componentes en lugar de clases Tailwind hardcodeadas
 * 
 * Ejemplo:
 * import { COLORS, SIZES, COMPONENTS } from '@/styles/theme';
 * 
 * <Card className={COMPONENTS.filtros.container}>
 *   <Icon className={SIZES.icon.md + ' text-[' + COLORS.primary + ']'} />
 * </Card>
 */

// ============================================
// COLORES
// ============================================
export const COLORS = {
  // Colores primarios (del tema actual)
  primary: 'hsl(42, 78%, 53%)',           // Amarillo dorado
  primaryDark: 'hsl(222, 47%, 11%)',      // Azul muy oscuro
  
  // Colores de fondo y foreground
  background: 'hsl(222, 47%, 11%)',
  foreground: 'hsl(210, 40%, 98%)',
  card: 'hsl(210, 20%, 96%)',
  cardForeground: 'hsl(215, 28%, 17%)',
  
  // Colores secundarios
  secondary: 'hsl(217, 33%, 17%)',
  secondaryForeground: 'hsl(210, 40%, 98%)',
  
  // Colores de acento
  accent: 'hsl(42, 78%, 45%)',
  accentForeground: 'hsl(210, 40%, 98%)',
  
  // Colores de estado
  muted: 'hsl(217, 33%, 17%)',
  mutedForeground: 'hsl(215, 28%, 30%)',
  destructive: 'hsl(0, 63%, 31%)',
  destructiveForeground: 'hsl(210, 40%, 98%)',
  
  // Colores fronterizos e input
  border: 'hsl(217, 33%, 25%)',
  input: 'hsl(217, 33%, 25%)',
  ring: 'hsl(42, 78%, 53%)',
  
  // Colores de popover
  popover: 'hsl(222, 47%, 11%)',
  popoverForeground: 'hsl(210, 40%, 98%)',
  
  // Específicos de la aplicación
  distritosText: '#F3F5F7',     // Color personalizado para "Todos los Distritos"
  
  // Colores para gráficos
  chart: {
    '1': 'hsl(220, 70%, 50%)',
    '2': 'hsl(160, 60%, 45%)',
    '3': 'hsl(30, 80%, 55%)',
    '4': 'hsl(280, 65%, 60%)',
    '5': 'hsl(340, 75%, 55%)',
  },
};

// ============================================
// TAMAÑOS
// ============================================
export const SIZES = {
  // Tamaños de iconos
  icon: {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',        // Defecto para iconos pequeños
    md: 'h-5 w-5',        // Iconos medianos
    lg: 'h-6 w-6',        // Iconos grandes
    xl: 'h-8 w-8',
  },
  
  // Tamaños de fuente
  fontSize: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  },
  
  // Pesos de fuente
  fontWeight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  
  // Radio de bordes
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // Sombras
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
};

// ============================================
// ESPACIADO
// ============================================
export const SPACING = {
  // Gaps entre elementos
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    base: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
  
  // Padding (relleno interior)
  padding: {
    compact: 'p-2',
    normal: 'p-4',
    comfortable: 'p-6',
    spacious: 'p-8',
  },
  
  // Margin (espaciado exterior)
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-3',
    base: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
  
  // Espaciado vertical
  spaceY: {
    tight: 'space-y-1',
    snug: 'space-y-2',
    normal: 'space-y-3',
    base: 'space-y-4',
    loose: 'space-y-6',
    relaxed: 'space-y-8',
  },
  
  // Espaciado horizontal
  spaceX: {
    tight: 'space-x-1',
    snug: 'space-x-2',
    normal: 'space-x-3',
    base: 'space-x-4',
    loose: 'space-x-6',
  },
};

// ============================================
// COMPONENTES (Clases Predefinidas)
// ============================================
export const COMPONENTS = {
  // Contenedor de tarjeta base
  card: {
    base: 'rounded-lg shadow-md bg-card text-card-foreground',
    hover: 'rounded-lg shadow-md bg-card text-card-foreground hover:shadow-lg transition-shadow',
  },

  // Componente: Filtros
  filtros: {
    container: 'sticky top-8 shadow-md bg-card text-card-foreground',
    title: 'text-2xl font-bold text-foreground',
    header: 'flex-row items-center justify-between',
    label: 'text-sm font-medium text-foreground',
    separator: 'my-4',
    sectionTitle: 'font-semibold text-primary',
    serviceIcon: 'h-4 w-4 text-primary',
    selectItem: 'text-[#F3F5F7]',  // Específico para "Todos los Distritos"
  },

  // Componente: Tarjeta de Notaría
  tarjeta: {
    container: 'rounded-lg shadow-md bg-card hover:shadow-lg transition-shadow',
    title: 'text-xl font-bold text-card-foreground',
    description: 'text-sm text-muted-foreground',
    badge: 'rounded-full bg-accent text-accent-foreground text-xs px-2 py-1',
    rating: 'flex items-center gap-1 text-sm',
    contact: 'flex items-center gap-2 text-sm text-muted-foreground',
    button: 'w-full bg-primary text-primary-foreground hover:bg-opacity-90',
  },

  // Componente: Buttons
  button: {
    primary: 'px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-opacity-90 transition-colors',
    secondary: 'px-4 py-2 rounded-md border border-border bg-card text-card-foreground font-semibold hover:bg-muted',
    ghost: 'px-4 py-2 text-primary hover:bg-accent hover:bg-opacity-10 transition-colors',
    outline: 'px-4 py-2 border border-ring rounded-md text-foreground hover:bg-accent hover:text-accent-foreground',
  },

  // Componente: Input/Select
  input: {
    base: 'rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
  },

  // Componente: Encabezado (Header)
  header: {
    container: 'w-full bg-card shadow-md',
    nav: 'flex items-center justify-between px-6 py-4',
    logo: 'text-2xl font-bold text-primary',
  },

  // Componente: Pie de página (Footer)
  footer: {
    container: 'bg-secondary text-secondary-foreground py-8',
    section: 'mb-4',
    title: 'font-semibold text-lg mb-2',
    link: 'text-sm hover:text-primary transition-colors',
  },
};

// ============================================
// UTILIDADES Y HELPERS
// ============================================

/**
 * Combina múltiples clases de manera segura
 * @example combineClasses(SIZES.icon.md, 'text-primary')
 */
export const combineClasses = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Obtiene un color CSS válido
 * @example getColor('primary') -> 'hsl(42, 78%, 53%)'
 */
export const getColor = (colorKey: keyof typeof COLORS): string => {
  const color = COLORS[colorKey];
  return typeof color === 'string' ? color : '';
};

/**
 * Obtiene múltiples clases de un componente predefinido
 * @example getComponentClasses('filtros', 'container') -> 'sticky top-8 shadow-md ...'
 */
export const getComponentClasses = (component: keyof typeof COMPONENTS, variant: string): string => {
  const comp = COMPONENTS[component] as any;
  return comp?.[variant] || '';
};

// ============================================
// CONSTANTES PARA VALIDACIÓN
// ============================================
export const VALID_SIZES = Object.keys(SIZES.icon);
export const VALID_COLORS = Object.keys(COLORS);
export const VALID_COMPONENTS = Object.keys(COMPONENTS);
