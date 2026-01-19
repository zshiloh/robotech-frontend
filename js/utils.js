// ================================
// UTILS - ROBOTECH
// Funciones utilitarias y helpers
// ================================

/**
 * Formatear fecha ISO a formato legible
 */
function formatearFecha(fechaISO, incluirHora = false) {
  if (!fechaISO) return 'N/A';

  try {
    const fecha = new Date(fechaISO);

    if (isNaN(fecha.getTime())) {
      return 'Fecha inválida';
    }

    const opciones = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    if (incluirHora) {
      opciones.hour = '2-digit';
      opciones.minute = '2-digit';
    }

    return fecha.toLocaleDateString('es-PE', opciones);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error en fecha';
  }
}

/**
 * Formatear fecha corta (DD/MM/YYYY)
 * @param {string} fechaISO 
 * @returns {string}
 */
function formatearFechaCorta(fechaISO) {
  if (!fechaISO) return 'N/A';

  try {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Validar formato de email
 * @param {string} email 
 * @returns {boolean}
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validar formato de teléfono peruano
 * @param {string} telefono 
 * @returns {boolean}
 */
function validarTelefono(telefono) {
  // Acepta: 987654321 o +51987654321
  const regex = /^(\+51)?9\d{8}$/;
  return regex.test(telefono);
}

/**
 * Validar formato de dimensiones (LxWxH)
 * @param {string} dimensiones 
 * @returns {boolean}
 */
function validarDimensiones(dimensiones) {
  return VALIDACIONES.PATRON_DIMENSIONES.test(dimensiones);
}

/**
 * Validar longitud de password
 * @param {string} password 
 * @returns {boolean}
 */
function validarPassword(password) {
  return password && password.length >= VALIDACIONES.MIN_PASSWORD;
}

/**
 * Validar fortaleza de password (requisitos del backend)
 * @param {string} password 
 * @returns {boolean}
 */
function validarPasswordFuerte(password) {
  // Mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

/**
 * Validar que dos passwords coincidan
 * @param {string} password 
 * @param {string} confirmarPassword 
 * @returns {boolean}
 */
function validarPasswordsCoinciden(password, confirmarPassword) {
  return password === confirmarPassword;
}

/**
 * Mostrar indicador de carga
 */
function mostrarLoading() {
  let loadingDiv = document.getElementById('loading-overlay');

  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    `;
    document.body.appendChild(loadingDiv);
  }

  loadingDiv.style.display = 'flex';
}

/**
 * Ocultar indicador de carga
 */
function ocultarLoading() {
  const loadingDiv = document.getElementById('loading-overlay');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

/**
 * Mostrar alerta/mensaje
 * @param {string} mensaje 
 * @param {string} tipo - 'success', 'error', 'warning', 'info'
 * @param {number} duracion - Duración en milisegundos (0 = no auto-cerrar)
 */
function mostrarAlerta(mensaje, tipo = 'info', duracion = 5000) {
  const tiposMap = {
    'success': 'alert-success',
    'error': 'alert-danger',
    'warning': 'alert-warning',
    'info': 'alert-info'
  };

  const claseAlerta = tiposMap[tipo] || 'alert-info';

  const alertaDiv = document.createElement('div');
  alertaDiv.className = `alert ${claseAlerta} alert-dismissible fade show custom-alert`;
  alertaDiv.setAttribute('role', 'alert');
  alertaDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Contenedor de alertas
  let contenedor = document.getElementById('alert-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'alert-container';
    contenedor.className = 'alert-container';
    document.body.appendChild(contenedor);
  }

  contenedor.appendChild(alertaDiv);

  // Auto-cerrar después de la duración especificada
  if (duracion > 0) {
    setTimeout(() => {
      alertaDiv.classList.remove('show');
      setTimeout(() => alertaDiv.remove(), 150);
    }, duracion);
  }
}

/**
 * Confirmar acción con el usuario
 * @param {string} mensaje 
 * @returns {boolean}
 */
function confirmar(mensaje) {
  return confirm(mensaje);
}

/**
 * Capitalizar primera letra
 * @param {string} texto 
 * @returns {string}
 */
function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Truncar texto largo
 * @param {string} texto 
 * @param {number} maxLength 
 * @returns {string}
 */
function truncarTexto(texto, maxLength = 50) {
  if (!texto) return '';
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength) + '...';
}

/**
 * Escapar HTML para prevenir XSS
 * @param {string} texto 
 * @returns {string}
 */
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Obtener valor de parámetro de URL
 * @param {string} param - Nombre del parámetro
 * @returns {string|null}
 */
function getURLParameter(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Redirigir a otra página
 * @param {string} url 
 */
function redirigir(url) {
  window.location.href = url;
}

/**
 * Deshabilitar botón y cambiar texto
 * @param {HTMLElement} boton 
 * @param {string} textoLoading 
 */
function deshabilitarBoton(boton, textoLoading = 'Cargando...') {
  if (!boton) return;

  boton.disabled = true;
  boton.dataset.originalText = boton.innerHTML;
  boton.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    ${textoLoading}
  `;
}

/**
 * Habilitar botón y restaurar texto
 * @param {HTMLElement} boton 
 */
function habilitarBoton(boton) {
  if (!boton) return;

  boton.disabled = false;
  if (boton.dataset.originalText) {
    boton.innerHTML = boton.dataset.originalText;
  }
}

/**
 * Validar formulario
 * @param {HTMLFormElement} form 
 * @returns {boolean}
 */
function validarFormulario(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  return true;
}

/**
 * Limpiar formulario
 * @param {HTMLFormElement} form 
 */
function limpiarFormulario(form) {
  form.reset();
  form.classList.remove('was-validated');
}

/**
 * Obtener nombre del estado por ID
 * @param {number} estadoId 
 * @returns {string}
 */
function obtenerNombreEstado(estadoId) {
  const estadosMap = {
    [ESTADOS.PENDIENTE]: 'Pendiente',
    [ESTADOS.VALIDADO]: 'Validado',
    [ESTADOS.RECHAZADO]: 'Rechazado',
    [ESTADOS.ELIMINADO]: 'Eliminado',
    [ESTADOS.ELIMINADO_AUTO]: 'Eliminado (Auto)',
    [ESTADOS.ACEPTADA]: 'Aceptada',
    [ESTADOS.RECHAZADA]: 'Rechazada',
    [ESTADOS.CONFIGURACION]: 'En Configuración',
    [ESTADOS.EN_CURSO]: 'En Curso',
    [ESTADOS.FINALIZADO]: 'Finalizado',
    [ESTADOS.ACTIVA]: 'Activa',
    [ESTADOS.INACTIVA]: 'Inactiva',
    [ESTADOS.CERRADA]: 'Cerrada',
    [ESTADOS.CANCELADA]: 'Cancelada',
    [ESTADOS.FINALIZADA]: 'Finalizada'
  };

  return estadosMap[estadoId] || 'Desconocido';
}

/**
 * Obtener clase de badge según estado
 * @param {number} estadoId 
 * @returns {string}
 */
function obtenerClaseBadgeEstado(estadoId) {
  const clasesMap = {
    [ESTADOS.PENDIENTE]: 'bg-warning',
    [ESTADOS.VALIDADO]: 'bg-success',
    [ESTADOS.RECHAZADO]: 'bg-danger',
    [ESTADOS.ELIMINADO]: 'bg-secondary',
    [ESTADOS.ELIMINADO_AUTO]: 'bg-secondary',
    [ESTADOS.ACEPTADA]: 'bg-success',
    [ESTADOS.RECHAZADA]: 'bg-danger',
    [ESTADOS.CONFIGURACION]: 'bg-info',
    [ESTADOS.EN_CURSO]: 'bg-primary',
    [ESTADOS.FINALIZADO]: 'bg-success',
    [ESTADOS.ACTIVA]: 'bg-success',
    [ESTADOS.INACTIVA]: 'bg-secondary',
    [ESTADOS.CERRADA]: 'bg-danger',
    [ESTADOS.CANCELADA]: 'bg-secondary',
    [ESTADOS.FINALIZADA]: 'bg-success'
  };

  return clasesMap[estadoId] || 'bg-secondary';
}

/**
 * Formatear número con separadores de miles
 * @param {number} numero 
 * @returns {string}
 */
function formatearNumero(numero) {
  if (numero === null || numero === undefined) return '0';
  return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Debounce - Limitar la frecuencia de ejecución de una función
 * @param {function} func 
 * @param {number} wait 
 * @returns {function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copiar texto al portapapeles
 * @param {string} texto 
 * @returns {Promise<boolean>}
 */
async function copiarAlPortapapeles(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarAlerta('Copiado al portapapeles', 'success', 2000);
    return true;
  } catch (error) {
    console.error('Error al copiar:', error);
    mostrarAlerta('Error al copiar al portapapeles', 'error', 3000);
    return false;
  }
}

/**
 * Scroll suave a elemento
 * @param {string} elementId 
 */
function scrollToElement(elementId) {
  const elemento = document.getElementById(elementId);
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Generar ID aleatorio
 * @returns {string}
 */
function generarIdAleatorio() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Verificar si es un número par
 * @param {number} numero 
 * @returns {boolean}
 */
function esNumeroPar(numero) {
  return numero % 2 === 0;
}

/**
 * Descargar datos como archivo JSON
 * @param {object} datos 
 * @param {string} nombreArchivo 
 */
function descargarJSON(datos, nombreArchivo = 'datos.json') {
  const dataStr = JSON.stringify(datos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Mostrar modal de confirmación personalizado
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} textoConfirmar - Texto del botón confirmar (default: "Aceptar")
 * @param {string} textoCancelar - Texto del botón cancelar (default: "Cancelar")
 * @returns {Promise<boolean>}
 */
function confirmarModal(titulo, mensaje, textoConfirmar = 'Aceptar', textoCancelar = 'Cancelar') {
  return new Promise((resolve) => {
    // Crear modal dinámicamente
    const modalId = 'modalConfirmacion_' + Date.now();
    const modalHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" style="border-radius: 16px; border: none;">
            <div class="modal-header" style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); color: white; border-radius: 16px 16px 0 0;">
              <h5 class="modal-title">${titulo}</h5>
            </div>
            <div class="modal-body" style="padding: 2rem;">
              <p style="margin: 0; white-space: pre-line;">${mensaje}</p>
            </div>
            <div class="modal-footer" style="border: none; padding: 1rem 2rem;">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${textoCancelar}</button>
              <button type="button" class="btn btn-primary" id="btnConfirmar_${modalId}">${textoConfirmar}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insertar modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    const btnConfirmar = document.getElementById(`btnConfirmar_${modalId}`);

    // Evento confirmar
    btnConfirmar.addEventListener('click', () => {
      modal.hide();
      resolve(true);
    });

    // Evento cancelar/cerrar
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
      resolve(false);
    });

    modal.show();
  });
}

/**
 * Mostrar modal de alerta personalizado con formato HTML
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje (puede incluir HTML)
 * @param {string} tipo - 'success', 'error', 'warning', 'info'
 * @param {string} textoBoton - Texto del botón (default: "Aceptar")
 * @returns {Promise<void>}
 */
function mostrarModalAlerta(titulo, mensaje, tipo = 'info', textoBoton = 'Aceptar') {
  return new Promise((resolve) => {
    // Configuración por tipo
    const config = {
      success: {
        icono: 'fa-check-circle',
        color: '#4caf50',
        gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
      },
      error: {
        icono: 'fa-times-circle',
        color: '#f44336',
        gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
      },
      warning: {
        icono: 'fa-exclamation-triangle',
        color: '#ff9800',
        gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
      },
      info: {
        icono: 'fa-info-circle',
        color: '#2196f3',
        gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
      }
    };

    const conf = config[tipo] || config.info;
    const modalId = 'modalAlerta_' + Date.now();

    // Convertir saltos de línea a <br>
    const mensajeHTML = mensaje.replace(/\n/g, '<br>');

    const modalHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 600px;">
          <div class="modal-content" style="border-radius: 16px; border: none;">
            <div class="modal-header" style="background: ${conf.gradient}; color: white; border-radius: 16px 16px 0 0; padding: 1.5rem 2rem;">
              <h5 class="modal-title">
                <i class="fas ${conf.icono} me-2"></i>${titulo}
              </h5>
            </div>
            <div class="modal-body" style="padding: 2rem; font-size: 1rem; line-height: 1.6;">
              ${mensajeHTML}
            </div>
            <div class="modal-footer" style="border: none; padding: 1rem 2rem;">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" style="background: ${conf.color}; border-color: ${conf.color};">${textoBoton}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insertar modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);

    // Limpiar modal cuando se cierre
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
      resolve();
    });

    modal.show();
  });
}