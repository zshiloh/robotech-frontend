// ================================
// SISTEMA DE NOTIFICACIONES - ROBOTECH
// Versión PRODUCCIÓN - SIN LOGS
// ================================

(function limpiarIntervalosFantasma() {
    for (let i = 1; i < 99999; i++) {
        try { clearInterval(i); } catch (e) { }
    }
})();

if (!window.NOTIFICACIONES_SISTEMA) {
    window.NOTIFICACIONES_SISTEMA = {
        intervalPolling: null,
        notificacionesCache: [],
        cargandoNotificaciones: false,
        sistemaIniciado: false
    };
} else {
    if (window.NOTIFICACIONES_SISTEMA.intervalPolling) {
        clearInterval(window.NOTIFICACIONES_SISTEMA.intervalPolling);
        window.NOTIFICACIONES_SISTEMA.intervalPolling = null;
    }
    window.NOTIFICACIONES_SISTEMA.sistemaIniciado = false;
}

const NOTIF = window.NOTIFICACIONES_SISTEMA;

function iniciarSistemaNotificaciones() {
    if (NOTIF.sistemaIniciado) return;
    if (typeof isAuthenticated !== 'function' || !isAuthenticated()) return;

    NOTIF.sistemaIniciado = true;

    if (NOTIF.intervalPolling) {
        clearInterval(NOTIF.intervalPolling);
        NOTIF.intervalPolling = null;
    }

    cargarNotificaciones();
    NOTIF.intervalPolling = setInterval(() => cargarNotificaciones(), 60000);
}

function detenerSistemaNotificaciones() {
    if (NOTIF.intervalPolling) {
        clearInterval(NOTIF.intervalPolling);
        NOTIF.intervalPolling = null;
        NOTIF.sistemaIniciado = false;
    }
}

async function cargarNotificaciones() {
    if (NOTIF.cargandoNotificaciones) return;

    NOTIF.cargandoNotificaciones = true;

    try {
        const resultNoLeidas = await obtenerNotificaciones(false, 10);
        const resultLeidas = await obtenerNotificaciones(true, 5);

        let todasLasNotificaciones = [];

        if (resultNoLeidas.success && resultNoLeidas.data) {
            todasLasNotificaciones = [...resultNoLeidas.data];
        }

        if (resultLeidas.success && resultLeidas.data) {
            todasLasNotificaciones = [...todasLasNotificaciones, ...resultLeidas.data];
        }

        todasLasNotificaciones.sort((a, b) => {
            const fechaA = new Date(a.fechaCreacion);
            const fechaB = new Date(b.fechaCreacion);
            return fechaB - fechaA;
        });

        NOTIF.notificacionesCache = todasLasNotificaciones;
        actualizarUINotificaciones(NOTIF.notificacionesCache);

    } catch (error) {
        // Silencioso en producción
    } finally {
        NOTIF.cargandoNotificaciones = false;
    }
}

function actualizarUINotificaciones(notificaciones) {
    const badge = document.getElementById('notificacionesBadge');
    const menu = document.getElementById('notificacionesDropdownMenu');

    if (!menu) return;

    const noLeidasReales = notificaciones.filter(n => !n.leida && !n.leido).length;

    if (badge) {
        if (noLeidasReales > 0) {
            badge.textContent = noLeidasReales;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    if (!notificaciones || notificaciones.length === 0) {
        menu.innerHTML = `
            <li class="empty-notifications">
                <i class="fas fa-bell-slash"></i>
                <p class="mb-0">No tienes notificaciones</p>
            </li>
        `;
        return;
    }

    let html = `
        <li class="notifications-header">
            <span class="notifications-title">Notificaciones</span>
            <span style="color: #718096; font-size: 0.9rem;">${notificaciones.length > 5 ? '5+' : notificaciones.length}</span>
        </li>
    `;

    notificaciones.slice(0, 5).forEach(notif => {
        const leida = notif.leida || notif.leido;
        const iconClass = leida ? '' : 'unread';
        const notifId = notif.id || notif.idNotificacion;

        html += `
            <li class="notification-item ${iconClass}" data-notif-id="${notifId}" data-notif-info='${JSON.stringify(notif).replace(/'/g, "&#39;")}' style="cursor: pointer;">
                <div class="d-flex gap-2 align-items-start">
                    <div class="notification-icon flex-shrink-0">
                        <i class="fas fa-${notif.tipo === 'INFO' ? 'info-circle' : notif.tipo === 'EXITO' ? 'check-circle' : 'exclamation-triangle'}"></i>
                    </div>
                    <div class="notification-content flex-grow-1" style="min-width: 0;">
                        <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
                            <div class="notification-title" style="flex: 1; min-width: 0;">${escaparHTML(notif.titulo)}</div>
                            ${!leida ? '<span class="notification-badge-new flex-shrink-0">Nueva</span>' : ''}
                        </div>
                        <div class="notification-message">${escaparHTML(notif.mensaje)}</div>
                        <div class="notification-time">
                            <i class="fas fa-clock me-1"></i>${obtenerTiempoRelativo(notif.fechaCreacion)}
                        </div>
                    </div>
                </div>
            </li>
        `;
    });

    html += `
        <li class="notifications-footer">
            <a href="notificaciones.html">
                <i class="fas fa-bell me-2"></i>Ver todas las notificaciones
            </a>
        </li>
    `;

    menu.innerHTML = html;
    agregarEventListenersNotificaciones();
}

function agregarEventListenersNotificaciones() {
    const items = document.querySelectorAll('.notification-item');

    items.forEach(item => {
        item.addEventListener('click', async function () {
            const notifData = this.dataset.notifInfo;
            if (!notifData) return;

            try {
                const notif = JSON.parse(notifData);
                await manejarClickNotificacion(notif);
            } catch (error) {
                // Silencioso
            }
        });
    });
}

async function manejarClickNotificacion(notificacion) {
    const titulo = notificacion.titulo || '';
    const tipo = notificacion.tipo || '';
    const mensaje = notificacion.mensaje || '';

    // 1. Invitación recibida (COMPETIDOR)
    if (tipo === 'INVITACION_RECIBIDA' ||
        tipo === 'INVITACION_CLUB' ||
        titulo.toLowerCase().includes('invitación a club') ||
        mensaje.toLowerCase().includes('te ha invitado')) {
        await manejarInvitacionRecibida(notificacion);
        return;
    }

    // 2. Club disponible
    if (tipo === 'CLUB_DISPONIBLE' || titulo.toLowerCase().includes('club disponible')) {
        try {
            const result = await fetchAPI('/api/clubes/sin-reclamar', 'GET');
            if (result.success && result.data) {
                const club = result.data;
                window.location.href = `reclamar-club.html?id=${club.idClub}`;
            } else {
                await mostrarModalAlerta('Club No Disponible', 'No se encontró el club para reclamar', 'error');
            }
        } catch (error) {
            await mostrarModalAlerta('Error', 'Error al obtener el club', 'error');
        }
        return;
    }

    // 3. Club rechazado
    if (tipo === 'CLUB_RECHAZADO' || titulo.toLowerCase().includes('club rechazado')) {
        window.location.href = 'editar-club-rechazado.html';
        return;
    }

    // 4. Club pendiente (admin)
    if (tipo === 'CLUB_PENDIENTE' || tipo === 'NUEVO_CLUB' ||
        titulo.toLowerCase().includes('club pendiente') ||
        titulo.toLowerCase().includes('nuevo club pendiente')) {
        window.location.href = 'admin-clubes.html?tab=pendientes';
        return;
    }

    // 5. Invitación aceptada/rechazada (REPRESENTANTE)
    if (tipo === 'INVITACION_ACEPTADA' || tipo === 'INVITACION_RECHAZADA') {
        await mostrarModalAlerta(
            titulo,
            mensaje,
            tipo === 'INVITACION_ACEPTADA' ? 'success' : 'info'
        );
        const notifId = notificacion.id || notificacion.idNotificacion;
        if (notifId) await marcarNotificacionLeida(notifId);
        return;
    }

    // 6. ✅ NUEVO: Solicitud recibida (REPRESENTANTE)
    if (tipo === 'SOLICITUD_RECIBIDA' ||
        titulo.toLowerCase().includes('solicitud recibida') ||
        titulo.toLowerCase().includes('nueva solicitud') ||
        mensaje.toLowerCase().includes('ha solicitado unirse')) {
        window.location.href = 'representante-solicitudes.html';
        return;
    }

    // 7. Solicitud aceptada/rechazada (COMPETIDOR)
    if (tipo === 'SOLICITUD_ACEPTADA' || tipo === 'SOLICITUD_RECHAZADA') {
        await mostrarModalAlerta(
            titulo,
            mensaje,
            tipo === 'SOLICITUD_ACEPTADA' ? 'success' : 'info'
        );
        const notifId = notificacion.id || notificacion.idNotificacion;
        if (notifId) await marcarNotificacionLeida(notifId);
        return;
    }

    // 8. Club validado (REPRESENTANTE)
    if (tipo === 'CLUB_VALIDADO') {
        await mostrarModalAlerta(titulo, mensaje, 'success');
        const notifId = notificacion.id || notificacion.idNotificacion;
        if (notifId) await marcarNotificacionLeida(notifId);
        return;
    }

    // 9. Otras notificaciones
    const notifId = notificacion.id || notificacion.idNotificacion;
    if (notifId) await marcarNotificacionLeida(notifId);

    await mostrarModalAlerta(titulo || 'Notificación', mensaje, 'info');
}

// ========================================
// SISTEMA DE INVITACIONES INTERACTIVAS
// ========================================

async function manejarInvitacionRecibida(notificacion) {
    let idInvitacion = notificacion.idInvitacion ||
        notificacion.metadata?.idInvitacion ||
        extraerIdDeNotificacion(notificacion);

    if (!idInvitacion) {
        try {
            const result = await fetchAPI('/api/competidor/invitaciones', 'GET');

            if (result.success && result.data && result.data.length > 0) {
                const pendientes = result.data.filter(inv => {
                    const estado = inv.estado?.toUpperCase?.() || inv.estado;
                    return estado === 'PENDIENTE' || estado === 'Pendiente';
                });

                if (pendientes.length > 0) {
                    idInvitacion = pendientes[0].idInvitacion;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    if (!idInvitacion) {
        await mostrarModalAlerta(
            'Error',
            'No se pudo procesar la invitación. Por favor, ve a la sección de invitaciones directamente.',
            'error'
        );
        return;
    }

    const nombreClub = extraerNombreClub(notificacion.mensaje);
    mostrarModalInvitacion(idInvitacion, nombreClub, notificacion.mensaje);
}

function mostrarModalInvitacion(idInvitacion, nombreClub, mensaje) {
    const modalHTML = `
        <div class="modal fade" id="modalInvitacion_${idInvitacion}" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered" style="max-width: 550px;">
                <div class="modal-content" style="border-radius: 20px; border: none; overflow: hidden;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border: none; padding: 2rem;">
                        <div class="w-100 text-center">
                            <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                <i class="fas fa-envelope-open-text" style="font-size: 2.5rem;"></i>
                            </div>
                            <h4 class="modal-title mb-0" style="font-weight: 900;">Invitación a Club</h4>
                        </div>
                    </div>
                    <div class="modal-body" style="padding: 2.5rem;">
                        <div class="text-center mb-3">
                            <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 1.5rem; border-radius: 16px; border-left: 4px solid #2196f3;">
                                <div style="font-size: 1.1rem; color: #1976d2; font-weight: 600; margin-bottom: 0.5rem;">
                                    <i class="fas fa-shield-alt me-2"></i>${escaparHTML(nombreClub)}
                                </div>
                                <div style="color: #546e7a; line-height: 1.6;">
                                    ${escaparHTML(mensaje)}
                                </div>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;">
                            <div style="font-size: 0.9rem; color: #6c757d;">
                                <i class="fas fa-info-circle me-2"></i>
                                Al aceptar, te unirás al club y podrás participar en torneos representándolos.
                            </div>
                        </div>
                        <div style="font-weight: 600; text-align: center; color: #495057; margin-bottom: 1rem;">
                            ¿Deseas unirte a este club?
                        </div>
                    </div>
                    <div class="modal-footer" style="border: none; padding: 1.5rem 2.5rem; background: #f8f9fa;">
                        <button type="button" class="btn btn-lg" 
                                onclick="responderInvitacion(${idInvitacion}, 'rechazar')"
                                style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; border: none; border-radius: 12px; padding: 0.75rem 2rem; font-weight: 600; flex: 1;">
                            <i class="fas fa-times me-2"></i>Rechazar
                        </button>
                        <button type="button" class="btn btn-lg" 
                                onclick="responderInvitacion(${idInvitacion}, 'aceptar')"
                                style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; border: none; border-radius: 12px; padding: 0.75rem 2rem; font-weight: 600; flex: 1;">
                            <i class="fas fa-check me-2"></i>Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById(`modalInvitacion_${idInvitacion}`);
    const modal = new bootstrap.Modal(modalElement);

    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });

    modal.show();
}

async function responderInvitacion(idInvitacion, accion) {
    const modal = document.getElementById(`modalInvitacion_${idInvitacion}`);
    const modalInstance = bootstrap.Modal.getInstance(modal);

    try {
        mostrarLoading();

        const endpoint = `/api/competidor/invitaciones/${idInvitacion}/${accion}`;
        const result = await fetchAPI(endpoint, accion === 'aceptar' ? 'POST' : 'PUT');

        ocultarLoading();

        if (result.success) {
            modalInstance.hide();

            const mensaje = accion === 'aceptar'
                ? '¡Te has unido al club exitosamente! Recargando tu sesión...'
                : 'Has rechazado la invitación al club.';

            await mostrarModalAlerta(
                accion === 'aceptar' ? '¡Bienvenido al Club!' : 'Invitación Rechazada',
                mensaje,
                accion === 'aceptar' ? 'success' : 'info'
            );

            cargarNotificaciones();

            // RECARGAR LA PÁGINA SIEMPRE para actualizar roles
            setTimeout(() => window.location.reload(), 1500);

        } else {
            throw new Error(result.message || 'Error al procesar invitación');
        }

    } catch (error) {
        ocultarLoading();

        await mostrarModalAlerta(
            'Error',
            error.message || 'No se pudo procesar tu respuesta. Por favor, intenta nuevamente.',
            'error'
        );
    }
}

function extraerIdDeNotificacion(notificacion) {
    if (notificacion.metadata && notificacion.metadata.idInvitacion) {
        return notificacion.metadata.idInvitacion;
    }

    const match = notificacion.mensaje.match(/invitación\s+#?(\d+)/i);
    if (match && match[1]) {
        return parseInt(match[1]);
    }

    return null;
}

function extraerNombreClub(mensaje) {
    const match = mensaje.match(/club\s+'([^']+)'/i) ||
        mensaje.match(/club\s+"([^"]+)"/i) ||
        mensaje.match(/club\s+(\w+)/i);

    if (match && match[1]) {
        return match[1];
    }

    return 'un club';
}

// ========================================
// FIN SISTEMA DE INVITACIONES
// ========================================

async function marcarNotificacionesVisiblesComoLeidas() {
    if (!NOTIF.notificacionesCache || NOTIF.notificacionesCache.length === 0) return;

    const noLeidas = NOTIF.notificacionesCache
        .filter(n => !n.leida && !n.leido)
        .map(n => n.id || n.idNotificacion);

    if (noLeidas.length === 0) return;

    try {
        await Promise.all(noLeidas.map(id => marcarNotificacionLeida(id)));

        NOTIF.notificacionesCache = NOTIF.notificacionesCache.map(n => {
            if (noLeidas.includes(n.id || n.idNotificacion)) {
                return { ...n, leida: true, leido: true };
            }
            return n;
        });

    } catch (error) {
        // Silencioso
    }
}

function quitarFondosAzules() {
    const items = document.querySelectorAll('.notification-item.unread');
    items.forEach(item => {
        item.style.transition = 'all 0.3s ease';
        item.classList.remove('unread');

        const badge = item.querySelector('.notification-badge-new');
        if (badge) {
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 300);
        }
    });

    const badge = document.getElementById('notificacionesBadge');
    if (badge) {
        badge.style.transition = 'all 0.3s ease';
        badge.style.opacity = '0';
        setTimeout(() => {
            badge.style.display = 'none';
            badge.style.opacity = '1';
        }, 300);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDropdownNotificaciones, { once: true });
} else {
    inicializarDropdownNotificaciones();
}

function inicializarDropdownNotificaciones() {
    const botonNotificaciones = document.getElementById('notificacionesBtn');
    const dropdownMenu = document.getElementById('notificacionesDropdownMenu');

    if (botonNotificaciones) {
        botonNotificaciones.addEventListener('click', () => {
            marcarNotificacionesVisiblesComoLeidas();
        });
    }

    if (dropdownMenu) {
        dropdownMenu.addEventListener('hidden.bs.dropdown', () => {
            quitarFondosAzules();
        });
    }
}

function obtenerTiempoRelativo(fechaISO) {
    if (!fechaISO) return 'Ahora';

    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diferencia = Math.floor((ahora - fecha) / 1000);

    if (diferencia < 60) return 'Hace un momento';

    const minutos = Math.floor(diferencia / 60);
    if (minutos < 60) return `Hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;

    return fecha.toLocaleDateString();
}

function escaparHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function formatearFechaRelativa(fechaISO) {
    return obtenerTiempoRelativo(fechaISO);
}

(function () {
    if (window.NOTIFICACIONES_AUTO_INICIADO) return;

    window.NOTIFICACIONES_AUTO_INICIADO = true;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarSistemaNotificaciones, { once: true });
    } else {
        iniciarSistemaNotificaciones();
    }
})();

window.addEventListener('beforeunload', detenerSistemaNotificaciones, { once: true });
window.addEventListener('pagehide', detenerSistemaNotificaciones, { once: true });