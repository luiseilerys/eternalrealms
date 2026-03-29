/**
 * Eternal Realms - Módulo de UI
 * Maneja la interfaz de usuario, mensajes y elementos del DOM
 */

import { realms } from './config.js';

let selectedRealm = null;

/**
 * Agrega un mensaje al contenedor del chat
 * @param {string} content - Contenido HTML del mensaje
 * @param {boolean} isBot - true si es mensaje del sistema/bot
 */
export function addMessage(content, isBot = true) {
    const container = document.getElementById('chat-container');
    if (!container) return;
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
    if (!grid) return;
    grid.innerHTML = '';
    selectedRealm = null;
    
    realms.forEach((r, index) => {
        const btn = document.createElement('div');
        btn.className = 'realm-btn';
        btn.textContent = `🌌 ${r}`;
        btn.onclick = () => {
            selectedRealm = r;
            document.querySelectorAll('.realm-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            updateStartButton();
        };
        grid.appendChild(btn);
        
        // Seleccionar primer reino por defecto
        if (index === 0) {
            selectedRealm = r;
            btn.classList.add('selected');
        }
    });
    
    updateStartButton();
}

/**
 * Actualiza el estado del botón de inicio
 */
function updateStartButton() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.disabled = !selectedRealm;
        startBtn.style.opacity = selectedRealm ? '1' : '0.6';
        startBtn.style.cursor = selectedRealm ? 'pointer' : 'not-allowed';
    }
}

/**
 * Obtiene el reino seleccionado
 * @returns {string|null} Nombre del reino seleccionado o null
 */
export function getSelectedRealm() {
    return selectedRealm;
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
