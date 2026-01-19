// ================================
// API - ROBOTECH
// Funciones para comunicarse con el backend
// ================================

/**
 * Función principal para hacer llamadas al backend
 */
async function fetchAPI(
  endpoint,
  method = "GET",
  body = null,
  customHeaders = {}
) {
  const token = localStorage.getItem("token");

  const config = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };

  // Agregar body si existe
  if (body && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(body);
  }

  // Agregar token si existe (excepto en endpoints públicos y de auth)
  if (
    token &&
    !endpoint.includes("/api/auth/") &&
    !endpoint.includes("/api/public/")
  ) {
    config.headers["Authorization"] = TOKEN_PREFIX + token;
  }

  try {
    const response = await fetch(API_CONFIG.URL_BASE + endpoint, config);

    // Si el token expiró (401), limpiar y redirigir a login
    if (
      response.status === HTTP_STATUS.UNAUTHORIZED &&
      !endpoint.includes("/api/auth/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("roles");
      window.location.href = "login.html";
      return { success: false, message: "Sesión expirada", status: 401 };
    }

    // Intentar parsear la respuesta
    let data = null;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { mensaje: text };
    }

    // CORRECCIÓN CRÍTICA: El backend Spring Boot devuelve "mensaje" (con tilde) no "message"
    let message = "";
    if (!response.ok) {
      // Prioridad: data.mensaje (con tilde) > data.message > data.error
      message =
        data.mensaje ||
        data.message ||
        data.error ||
        `Error ${response.status}`;
    } else {
      message = data.mensaje || data.message || "Operación exitosa";
    }

    return {
      success: response.ok,
      data: data,
      message: message, // Este ahora captura correctamente "Email o contraseña incorrectos. Intentos restantes: 4"
      status: response.status,
    };
  } catch (error) {
    console.error("Error en API:", error);
    return {
      success: false,
      message: "Error de conexión con el servidor",
      error: error.message,
      status: 500,
    };
  }
}

// ================================
// AUTH ENDPOINTS
// ================================

/**
 * Registro de usuario sin club
 */
async function registrarUsuario(datos) {
  return await fetchAPI("/api/auth/registro", "POST", datos);
}

/**
 * Registro de usuario con club
 */
async function registrarUsuarioConClub(datos) {
  return await fetchAPI("/api/auth/registro-con-club", "POST", datos);
}

/**
 * Login
 */
async function login(email, password) {
  return await fetchAPI("/api/auth/login", "POST", { email, password });
}

/**
 * Verificar email para recuperación de contraseña
 */
async function verificarEmailRecuperacion(email) {
  return await fetchAPI("/api/auth/verificar-email-recuperacion", "POST", {
    email,
  });
}

/**
 * Verificar respuesta de seguridad
 */
async function verificarRespuestaSeguridad(email, respuesta) {
  return await fetchAPI("/api/auth/verificar-respuesta-seguridad", "POST", {
    email,
    respuesta,
  });
}

/**
 * Resetear contraseña
 */
async function resetearPassword(email, token, passwordNueva) {
  return await fetchAPI("/api/auth/resetear-password", "POST", {
    email,
    token,
    passwordNueva,
  });
}

// ================================
// USUARIO ENDPOINTS
// ================================

/**
 * Obtener información del usuario actual
 */
async function obtenerMiInformacion() {
  return await fetchAPI("/api/usuario/mi-informacion", "GET");
}

/**
 * Editar perfil del usuario
 */
async function editarPerfil(datos) {
  return await fetchAPI("/api/usuario/perfil", "PUT", datos);
}

/**
 * Cambiar contraseña
 */
async function cambiarPassword(datos) {
  return await fetchAPI("/api/usuario/cambiar-password", "PUT", datos);
}

// ================================
// ADMIN ENDPOINTS
// ================================

/**
 * Obtener clubes pendientes de validación
 */
async function obtenerClubesPendientes() {
  return await fetchAPI("/api/admin/clubes/pendientes", "GET");
}

/**
 * Validar club (aprobar o rechazar)
 */
async function validarClub(idClub, datos) {
  return await fetchAPI(`/api/admin/clubes/${idClub}/validar`, "POST", datos);
}

/**
 * Asignar rol a usuario
 */
async function asignarRol(idUsuario, idRol) {
  return await fetchAPI(
    `/api/admin/usuarios/${idUsuario}/roles/${idRol}/asignar`,
    "POST"
  );
}

/**
 * Eliminar rol de usuario
 */
async function eliminarRol(idUsuario, idRol) {
  return await fetchAPI(
    `/api/admin/usuarios/${idUsuario}/roles/${idRol}`,
    "DELETE"
  );
}

// ================================
// ORGANIZADOR ENDPOINTS
// ================================

/**
 * Obtener torneos del organizador
 */
async function obtenerTorneos() {
  return await fetchAPI("/api/organizador/torneos", "GET");
}

/**
 * Crear torneo
 */
async function crearTorneo(datos) {
  return await fetchAPI("/api/organizador/torneos", "POST", datos);
}

/**
 * Iniciar torneo
 */
async function iniciarTorneo(idTorneo) {
  return await fetchAPI(`/api/organizador/torneos/${idTorneo}/iniciar`, "POST");
}

/**
 * Finalizar torneo
 */
async function finalizarTorneo(idTorneo) {
  return await fetchAPI(
    `/api/organizador/torneos/${idTorneo}/finalizar`,
    "POST"
  );
}

/**
 * Obtener categorías de un torneo
 */
async function obtenerCategoriasTorneo(idTorneo) {
  return await fetchAPI(
    `/api/organizador/torneos/${idTorneo}/categorias`,
    "GET"
  );
}

/**
 * Crear categoría
 */
async function crearCategoria(datos) {
  return await fetchAPI("/api/organizador/categorias", "POST", datos);
}

/**
 * Editar categoría
 */
async function editarCategoria(idCategoria, datos) {
  return await fetchAPI(
    `/api/organizador/categorias/${idCategoria}`,
    "PUT",
    datos
  );
}

/**
 * Eliminar categoría
 */
async function eliminarCategoria(idCategoria) {
  return await fetchAPI(`/api/organizador/categorias/${idCategoria}`, "DELETE");
}

/**
 * Cambiar estado de categoría
 */
async function cambiarEstadoCategoria(idCategoria, nuevoEstadoId) {
  return await fetchAPI(
    `/api/organizador/categorias/${idCategoria}/estado?nuevoEstadoId=${nuevoEstadoId}`,
    "PUT"
  );
}

// ================================
// PUBLIC ENDPOINTS
// ================================

/**
 * Obtener todas las sedes
 */
async function obtenerSedes() {
  return await fetchAPI("/api/public/sedes", "GET");
}

/**
 * Obtener categorías de peso
 */
async function obtenerCategoriasPeso() {
  return await fetchAPI("/api/public/categorias-peso", "GET");
}

/**
 * Obtener torneos públicos
 */
async function obtenerTorneosPublicos() {
  return await fetchAPI("/api/public/torneos", "GET");
}

/**
 * Obtener torneos finalizados
 */
async function obtenerTorneosFinalizados() {
  return await fetchAPI("/api/public/torneos/finalizados", "GET");
}

/**
 * Obtener detalle de torneo público
 */
async function obtenerDetalleTorneo(idTorneo) {
  return await fetchAPI(`/api/public/torneos/${idTorneo}`, "GET");
}

/**
 * Obtener categorías de torneo público
 */
async function obtenerCategoriasTorneoPublico(idTorneo) {
  return await fetchAPI(`/api/public/torneos/${idTorneo}/categorias`, "GET");
}

// ================================
// NOTIFICACIONES ENDPOINTS
// ================================

/**
 * Obtener notificaciones del usuario
 */
async function obtenerNotificaciones(leidas = false, limit = 20) {
  return await fetchAPI(
    `/api/notificaciones?leidas=${leidas}&limit=${limit}`,
    "GET"
  );
}

/**
 * Obtener count de notificaciones no leídas
 */
async function obtenerCountNotificaciones() {
  return await fetchAPI("/api/notificaciones/count", "GET");
}

/**
 * Marcar notificación como leída
 */
async function marcarNotificacionLeida(idNotificacion) {
  return await fetchAPI(
    `/api/notificaciones/${idNotificacion}/marcar-leida`,
    "PUT"
  );
}

/**
 * Marcar todas las notificaciones como leídas
 */
async function marcarTodasLasNotificacionesLeidas() {
  return await fetchAPI("/api/notificaciones/marcar-todas-leidas", "PUT");
}

/**
 * Crear categoría de peso
 */
async function crearCategoriaPeso(datos) {
  return await fetchAPI('/api/organizador/categorias-peso', 'POST', datos);
}

/**
 * Editar categoría de peso
 */
async function editarCategoriaPeso(id, datos) {
  return await fetchAPI(`/api/organizador/categorias-peso/${id}`, 'PUT', datos);
}

/**
 * Activar categoría de peso
 */
async function activarCategoriaPeso(id) {
  return await fetchAPI(`/api/organizador/categorias-peso/${id}/activar`, 'PUT');
}

/**
 * Desactivar categoría de peso
 */
async function desactivarCategoriaPeso(id) {
  return await fetchAPI(`/api/organizador/categorias-peso/${id}/desactivar`, 'PUT');
}

/**
 * Eliminar categoría de peso
 */
async function eliminarCategoriaPeso(id) {
  return await fetchAPI(`/api/organizador/categorias-peso/${id}`, 'DELETE');
}

/**
 * Obtener categorías activas (público)
 */
async function obtenerCategoriasPublicas() {
  return await fetchAPI('/api/public/categorias-peso/activas', 'GET');
}