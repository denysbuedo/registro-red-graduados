/**
 * Configuración de Versión — Red de Egresados Internacionales
 * 
 * Permite alternar entre la versión "Full" (Red Social Completa)
 * y la versión "Light" (Gestión de Registros y Directorio Institucional).
 */

export const APP_CONFIG = {
  // Se determina por la variable de entorno NEXT_PUBLIC_APP_VERSION o forzado a true para esta iteración
  isLightVersion: process.env.NEXT_PUBLIC_APP_VERSION === 'light' || true,

  // Funcionalidades activas/inactivas
  features: {
    socialFeed: false,
    events: false,
    groups: false,
    connections: false,
    notifications: false,
    individualProfiles: true, // Permitir ver perfiles en versión Light
  },

  // Roles que pueden iniciar sesión en la versión Light
  allowedLightRoles: ['admin', 'institution', 'dri', 'user'],
};
