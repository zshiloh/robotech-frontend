// ================================
// CONSTANTES DEL SISTEMA - ROBOTECH
// ================================

const API_URL = (() => {
  const hostname = window.location.hostname;

  // Desarrollo local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }

  return 'https://api.robotech.com/api';
})();

// ================================
// ESTADOS (cat_estado)
// ================================
const ESTADOS = {
  PENDIENTE: 1,
  VALIDADO: 2,
  RECHAZADO: 3,
  ELIMINADO: 4,
  ELIMINADO_AUTO: 5,
  ACEPTADA: 6,
  RECHAZADA: 7,
  CONFIGURACION: 8,
  EN_CURSO: 9,
  FINALIZADO: 10,
  ACTIVA: 11,
  INACTIVA: 12,
  CERRADA: 13,
  CANCELADA: 14,
  FINALIZADA: 15
};

// ================================
// ROLES (cat_rol)
// ================================
const ROLES = {
  USUARIO: 1,
  COMPETIDOR: 2,
  REPRESENTANTE: 3,
  JURADO: 4,
  ORGANIZADOR: 5,
  ADMINISTRADOR: 6
};

// Nombres de roles (para comparación con strings)
// IMPORTANTE: Deben coincidir exactamente con lo que envía el backend
const NOMBRES_ROLES = {
  USUARIO: "Usuario",
  COMPETIDOR: "Competidor",
  REPRESENTANTE: "Representante",
  JURADO: "Jurado",
  ORGANIZADOR: "Organizador",
  ADMINISTRADOR: "Administrador"
};

// ================================
// TIPOS DE NOTIFICACIONES
// ================================
const NOTIFICACIONES = {
  // Competidor
  INVITACION_CLUB: "INVITACION_CLUB",
  RESULTADO_REGISTRADO: "RESULTADO_REGISTRADO",
  EXPULSADO_CLUB: "EXPULSADO_CLUB",
  CLUB_REACTIVADO: "CLUB_REACTIVADO",
  TORNEO_FINALIZADO: "TORNEO_FINALIZADO",
  INSCRIPCION_TORNEO: "INSCRIPCION_TORNEO",
  SOLICITUD_ACEPTADA: "SOLICITUD_ACEPTADA",
  SOLICITUD_RECHAZADA: "SOLICITUD_RECHAZADA",
  COMPETIDOR_INACTIVO_30D: "COMPETIDOR_INACTIVO_30D",

  // Representante
  CLUB_VALIDADO: "CLUB_VALIDADO",
  CLUB_RECHAZADO: "CLUB_RECHAZADO",
  INVITACION_ACEPTADA: "INVITACION_ACEPTADA",
  SOLICITUD_RECIBIDA: "SOLICITUD_RECIBIDA",
  REPRESENTANTE_INACTIVO_7D: "REPRESENTANTE_INACTIVO_7D",
  CLUB_MARCADO_INACTIVO: "CLUB_MARCADO_INACTIVO",

  // Organizador
  TORNEO_LISTO_FINALIZAR: "TORNEO_LISTO_FINALIZAR",

  // Jurado
  TORNEO_INICIADO: "TORNEO_INICIADO",

  // Admin
  NUEVO_CLUB: "NUEVO_CLUB",

  // General
  PASSWORD_CAMBIADA: "PASSWORD_CAMBIADA"
};

// ================================
// LÍMITES DE CLUBES
// ================================
const LIMITES_CLUB = {
  MAX_COMPETIDORES: 6,
  MAX_INVITACIONES_PENDIENTES: 16
};

// ================================
// CAMBIOS DE CLUB (RST06)
// ================================
const CAMBIOS_CLUB = {
  MAX_CAMBIOS_TRIMESTRE: 5,
  DIAS_ESPERA_ENTRE_CAMBIOS: 7
};

// ================================
// SISTEMA DE INACTIVIDAD
// ================================
const INACTIVIDAD = {
  DIAS_COMPETIDOR: 30,
  DIAS_REPRESENTANTE_ALERTA: 7,
  DIAS_REPRESENTANTE_CRITICA: 30
};

// ================================
// SEGURIDAD Y LOGIN
// ================================
const SEGURIDAD = {
  MAX_INTENTOS_LOGIN: 5,
  MINUTOS_BLOQUEO_LOGIN: 15
};

// ================================
// VALIDACIONES DE TAMAÑO
// ================================
const VALIDACIONES = {
  // Robot
  MIN_NOMBRE_ROBOT: 2,
  MAX_NOMBRE_ROBOT: 100,
  MIN_PESO_ROBOT: 1,
  MAX_PESO_ROBOT: 5000,
  MAX_DESCRIPCION_ROBOT: 500,
  PATRON_DIMENSIONES: /^\d+x\d+x\d+$/,

  // Usuario
  MIN_NOMBRE_COMPLETO: 3,
  MAX_NOMBRE_COMPLETO: 100,
  MIN_APODO: 2,
  MAX_APODO: 50,
  MIN_PASSWORD: 8,

  // Club
  MIN_NOMBRE_CLUB: 3,
  MAX_NOMBRE_CLUB: 100,
  MAX_DESCRIPCION_CLUB: 500,

  // Sede
  MIN_NOMBRE_SEDE: 3,
  MAX_NOMBRE_SEDE: 100,
  MAX_DIRECCION_SEDE: 200
};

// ================================
// PREGUNTAS DE SEGURIDAD
// ================================
const PREGUNTAS_SEGURIDAD = [
  "¿Nombre de tu primera mascota?",
  "¿Ciudad donde naciste?",
  "¿Nombre de tu mejor amigo/a de la infancia?",
  "¿Nombre de tu escuela primaria?",
  "¿Marca de tu primer auto?",
  "¿Apodo de tu infancia?",
  "¿Nombre de tu personaje favorito?",
  "¿Comida favorita?"
];

// ================================
// CATEGORÍAS DE PESO
// ================================
const CATEGORIAS_PESO = [
  { id: 1, nombre: "Peso Pluma", pesoMinimo: 501, pesoMaximo: 1000 },
  { id: 2, nombre: "Peso Medio", pesoMinimo: 1001, pesoMaximo: 5000 },
  { id: 3, nombre: "Peso Pesado", pesoMinimo: 5001, pesoMaximo: 15000 }
];

// ================================
// ESTADOS DEL ROBOT
// ================================
const ESTADO_ROBOT = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO"
};

// ================================
// ESTADOS DE ACTIVIDAD DEL CLUB
// ================================
const ESTADO_ACTIVIDAD = {
  ACTIVO: "ACTIVO",
  INACTIVO_7D: "INACTIVO_7D",
  INACTIVO: "INACTIVO"
};

// ================================
// ESTADOS DEL COMBATE
// ================================
const ESTADO_COMBATE = {
  PENDIENTE: "Pendiente",
  FINALIZADO: "Finalizado"
};

// ================================
// FASES DE ENFRENTAMIENTO
// ================================
const FASES = {
  CUARTOS: "Cuartos de Final",
  SEMIFINAL: "Semifinal",
  FINAL: "Final"
};

// ================================
// FORMATO DE FECHAS
// ================================
const FORMATO_FECHA = {
  ISO: "YYYY-MM-DDTHH:mm:ss",
  TIMEZONE: "America/Lima"
};

// ================================
// CÓDIGOS HTTP
// ================================
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};

// ================================
// CONFIGURACIÓN DE API (⭐ ACTUALIZADO para usar API_URL dinámico)
// ================================
const API_CONFIG = {
  PUERTO_BACKEND: 8080,
  URL_BASE: API_URL.replace('/api', ''),  // Sin el /api al final
  TIMEOUT: 30000
};

// ================================
// HEADERS HTTP
// ================================
const HEADERS = {
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  CONTENT_TYPE_JSON: "application/json"
};

const TOKEN_PREFIX = "Bearer ";