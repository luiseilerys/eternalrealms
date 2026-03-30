/**
 * Eternal Realms - Módulo de UI
 * Maneja la interfaz de usuario, mensajes y elementos del DOM
 */

import { realms } from './config.js';

/**
 * Agrega un mensaje al contenedor del chat
 * @param {string} content - Contenido HTML del mensaje
 * @param {boolean} isBot - true si es mensaje del sistema/bot
 */
export function addMessage(content, isBot = true) {
    const container = document.getElementById('chat-container');
    const msg = document.createElement('div');
    msg.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
    const time = new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
    msg.innerHTML = content + '<div class="timestamp">' + time + '</div>';
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

/**
 * Crea los botones de selección de reinos en el welcome screen
 */
export function createRealmButtons() {
    const grid = document.getElementById('realm-grid');
    grid.innerHTML = '';
    
    realms.forEach(r => {
        const btn = document.createElement('div');
        btn.className = 'realm-btn';
        btn.textContent = `🌌 ${r}`;
        btn.onclick = () => {
            // Guardar reino seleccionado en un atributo data para acceso posterior
            grid.dataset.selectedRealm = r;
            document.querySelectorAll('.realm-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        // Seleccionar primer reino por defecto
        if (!grid.dataset.selectedRealm) {
            grid.dataset.selectedRealm = r;
            btn.classList.add('selected');
        }
        grid.appendChild(btn);
    });
}

/**
 * Obtiene el reino seleccionado
 * @returns {string|null} Nombre del reino seleccionado o null
 */
export function getSelectedRealm() {
    const grid = document.getElementById('realm-grid');
    return grid?.dataset.selectedRealm || null;
}

/**
 * Ejecuta un comando rápido desde la quick-bar
 * @param {string} cmd - Comando a ejecutar
 * @param {Function} sendCommandFn - Función para enviar comandos
 */
export function quickCommand(cmd, sendCommandFn) {
    document.getElementById('command-input').value = cmd;
    sendCommandFn();
}

/**
 * Inicializa los listeners de la UI
 * @param {Function} sendCommandFn - Función para enviar comandos
 */
export function initUIListeners(sendCommandFn) {
    // Listener para tecla Enter en el input
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendCommandFn();
    });

    // Auto-guardar al cambiar visibilidad
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // La función saveProgress se importará desde game.js en main.js
            window.saveProgress?.();
        }
    });
    
    // Mostrar/ocultar indicador de acción cuando hay cambios
    setInterval(() => {
        const timerElement = document.getElementById('action-timer');
        if (!timerElement) return;
        
        const playerData = localStorage.getItem('eternalRealmsPlayer');
        if (!playerData) {
            timerElement.style.display = 'none';
            return;
        }
        
        try {
            const player = JSON.parse(playerData);
            const now = Date.now();
            
            if (!player.currentAction || now >= player.currentAction.endTime) {
                timerElement.style.display = 'none';
            } else {
                timerElement.style.display = 'block';
            }
        } catch (e) {
            timerElement.style.display = 'none';
        }
    }, 500);
    
    // Actualizar estado del botón de inicio según selección de reino
    setInterval(() => {
        const startBtn = document.getElementById('start-btn');
        const grid = document.getElementById('realm-grid');
        if (startBtn && grid) {
            const selectedRealm = grid.dataset.selectedRealm;
            if (selectedRealm) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
                startBtn.style.cursor = 'pointer';
            } else {
                startBtn.disabled = true;
                startBtn.style.opacity = '0.6';
                startBtn.style.cursor = 'not-allowed';
            }
        }
    }, 300);
}

/**
 * Muestra u oculta la pantalla de bienvenida
 * @param {boolean} show - true para mostrar, false para ocultar
 */
export function setWelcomeVisible(show) {
    const welcome = document.getElementById('welcome');
    if (welcome) {
        welcome.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Limpia el contenedor del chat
 */
export function clearChat() {
    const container = document.getElementById('chat-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Obtiene el valor del input de comandos
 * @returns {string} Valor del input trimmeado
 */
export function getInputValue() {
    const input = document.getElementById('command-input');
    return input ? input.value.trim() : '';
}

/**
 * Limpia el input de comandos
 */
export function clearInput() {
    const input = document.getElementById('command-input');
    if (input) {
        input.value = '';
    }
}

/**
 * Obtiene el nombre del jugador desde el input
 * @returns {string} Nombre ingresado o valor por defecto
 */
export function getPlayerNameInput() {
    const input = document.getElementById('player-name');
    return input && input.value.trim() ? input.value.trim() : 'Elyndor';
}

/**
 * Obtiene la clase seleccionada desde el dropdown
 * @returns {string} Clase seleccionada
 */
export function getSelectedClass() {
    const select = document.getElementById('class-select');
    return select ? select.value : 'Arcane Weaver';
}
