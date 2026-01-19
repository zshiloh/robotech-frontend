// ================================
// AUTH - ROBOTECH
// Manejo de autenticación, sesión y protección de páginas
// ================================

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
  const token = localStorage.getItem("token");
  return token !== null && token !== undefined && token !== "";
}

/**
 * Obtener usuario actual del localStorage
 * @returns {object|null}
 */
function getCurrentUser() {
  const usuarioStr = localStorage.getItem("usuario");
  if (!usuarioStr) return null;

  try {
    return JSON.parse(usuarioStr);
  } catch (error) {
    console.error("Error al parsear usuario:", error);
    return null;
  }
}

/**
 * Obtener roles del usuario actual
 * @returns {array}
 */
function getUserRoles() {
  const rolesStr = localStorage.getItem("roles");
  if (!rolesStr) return [];

  try {
    return JSON.parse(rolesStr);
  } catch (error) {
    console.error("Error al parsear roles:", error);
    return [];
  }
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param {string} roleName - Nombre del rol (ej: 'Administrador')
 * @returns {boolean}
 */
function hasRole(roleName) {
  const roles = getUserRoles();
  return roles.includes(roleName);
}

/**
 * Verificar si el usuario tiene alguno de los roles especificados
 * @param {array} roleNames - Array de nombres de roles
 * @returns {boolean}
 */
function hasAnyRole(roleNames) {
  const roles = getUserRoles();
  return roleNames.some((roleName) => roles.includes(roleName));
}

/**
 * Cerrar sesión
 */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("roles");
  window.location.href = "index.html";
}

/**
 * Redirigir al dashboard según el rol del usuario
 */
function redirectToDashboard() {
  const roles = getUserRoles();

  // Prioridad: Admin > Organizador > Jurado > Representante > Competidor > Usuario Base
  if (roles.includes(NOMBRES_ROLES.ADMINISTRADOR)) {
    window.location.href = "admin-dashboard.html";
  } else if (roles.includes(NOMBRES_ROLES.ORGANIZADOR)) {
    window.location.href = "organizador-dashboard.html";
  } else if (roles.includes(NOMBRES_ROLES.JURADO)) {
    window.location.href = "jurado-dashboard.html";
  } else if (roles.includes(NOMBRES_ROLES.REPRESENTANTE)) {
    window.location.href = "representante-dashboard.html";
  } else if (roles.includes(NOMBRES_ROLES.COMPETIDOR)) {
    window.location.href = "competidor-dashboard.html";
  } else if (roles.includes(NOMBRES_ROLES.USUARIO)) {
    // Usuario solo con rol base - mostrar dashboard básico
    window.location.href = "usuario-dashboard.html";
  } else {
    // Sin roles (usuario recién registrado sin roles asignados)
    window.location.href = "usuario-dashboard.html";
  }
}

/**
 * Redirigir al dashboard según jerarquía de roles
 */
function redirectToHome() {
  const roles = getUserRoles();

  // Jerarquía: Administrador > Organizador > Jurado > Representante > Competidor > Usuario
  if (roles.includes("Administrador")) {
    window.location.href = "admin-dashboard.html";
  } else if (roles.includes("Organizador")) {
    window.location.href = "organizador-dashboard.html";
  } else if (roles.includes("Jurado")) {
    window.location.href = "jurado-dashboard.html";
  } else if (roles.includes("Representante")) {
    window.location.href = "representante-dashboard.html";
  } else if (roles.includes("Competidor")) {
    window.location.href = "competidor-dashboard.html";
  } else {
    window.location.href = "usuario-dashboard.html";
  }
}

/**
 * Proteger página - Solo usuarios autenticados pueden acceder
 * @param {string|array} requiredRole - Rol(es) requerido(s) para acceder (opcional)
 */
function protectPage(requiredRole = null) {
  // Verificar si está autenticado
  if (!isAuthenticated()) {
    window.location.href = "login.html";
    return;
  }

  // Si no se requiere un rol específico, permitir acceso
  if (!requiredRole) {
    return;
  }

  // Si se requiere un rol específico, verificar
  if (typeof requiredRole === "string") {
    if (!hasRole(requiredRole)) {
      alert("No tienes permisos para acceder a esta página");
      redirectToDashboard();
      return;
    }
  } else if (Array.isArray(requiredRole)) {
    if (!hasAnyRole(requiredRole)) {
      alert("No tienes permisos para acceder a esta página");
      redirectToDashboard();
      return;
    }
  }
}

/**
 * Manejar el proceso de login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function handleLogin(email, password) {
  try {
    const result = await login(email, password);

    if (result.success && result.data) {
      // Guardar token y datos del usuario
      localStorage.setItem("token", result.data.token);
      localStorage.setItem("usuario", JSON.stringify(result.data.usuario));
      localStorage.setItem("roles", JSON.stringify(result.data.roles));

      return {
        success: true,
        message: "Login exitoso",
        data: result.data,
      };
    } else {
      // Login falló - extraer mensaje de error con intentos restantes
      let errorMessage =
        result.message || result.data?.message || "Error al iniciar sesión";

      return {
        success: false,
        message: errorMessage,
        data: result.data,
      };
    }
  } catch (error) {
    console.error("Error en handleLogin:", error);

    // Intentar extraer mensaje de error del servidor
    let errorMessage = "Error de conexión con el servidor";

    if (error.response) {
      // Error HTTP con respuesta del servidor
      const serverMessage =
        error.response.data?.message || error.response.data?.error;
      if (serverMessage) {
        errorMessage = serverMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Inicializar la protección de página cuando carga el DOM
 */
function initPageProtection(requiredRole = null) {
  document.addEventListener("DOMContentLoaded", () => {
    protectPage(requiredRole);
  });
}

/**
 * Verificar si el usuario debe cambiar contraseña
 * (útil para primer login o contraseñas temporales)
 * @returns {boolean}
 */
function shouldChangePassword() {
  // Esta función puede extenderse más adelante
  return false;
}

/**
 * Obtener nombre completo del usuario actual
 * @returns {string}
 */
function getCurrentUserName() {
  const usuario = getCurrentUser();
  return usuario ? usuario.nombreCompleto : "Usuario";
}

/**
 * Obtener email del usuario actual
 * @returns {string}
 */
function getCurrentUserEmail() {
  const usuario = getCurrentUser();
  return usuario ? usuario.email : "";
}

/**
 * Obtener ID del usuario actual
 * @returns {number|null}
 */
function getCurrentUserId() {
  const usuario = getCurrentUser();
  return usuario ? usuario.idUsuario : null;
}

/**
 * Verificar si la sesión está próxima a expirar
 * (Esta función requerirá lógica adicional con JWT)
 * @returns {boolean}
 */
function isSessionExpiringSoon() {
  // TODO: Implementar verificación de expiración de JWT
  return false;
}

/**
 * Renovar token de sesión
 * (Función para implementar más adelante si se necesita)
 */
async function refreshToken() {
  // TODO: Implementar renovación de token
  console.log("Renovación de token no implementada aún");
}

/**
 * Limpiar sesión (usado en logout o cuando expira)
 */
function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("roles");
}

/**
 * Verificar permisos antes de realizar una acción
 * @param {string|array} requiredRole - Rol(es) requerido(s)
 * @param {function} callback - Función a ejecutar si tiene permisos
 * @param {function} errorCallback - Función a ejecutar si no tiene permisos (opcional)
 */
function checkPermissionAndExecute(
  requiredRole,
  callback,
  errorCallback = null
) {
  let hasPermission = false;

  if (typeof requiredRole === "string") {
    hasPermission = hasRole(requiredRole);
  } else if (Array.isArray(requiredRole)) {
    hasPermission = hasAnyRole(requiredRole);
  }

  if (hasPermission) {
    callback();
  } else {
    if (errorCallback) {
      errorCallback();
    } else {
      alert("No tienes permisos para realizar esta acción");
    }
  }
}

/**
 * Formatear roles para mostrar en UI
 * @returns {string}
 */
function getRolesDisplayText() {
  const roles = getUserRoles();
  if (roles.length === 0) return "Sin roles";

  const rolesMap = {
    Usuario: "Usuario",
    Competidor: "Competidor",
    Representante: "Representante",
    Jurado: "Jurado",
    Organizador: "Organizador",
    Administrador: "Administrador",
  };

  return roles
    .filter((rol) => rol !== "Usuario") // No mostrar rol base
    .map((rol) => rolesMap[rol] || rol)
    .join(", ");
}
