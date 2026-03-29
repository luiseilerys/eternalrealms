/**
 * Eternal Realms - Punto de Entrada Principal
 * Inicializa el juego y coordina todos los módulos
 */

import { 
    saveProgress, loadProgress, resetToNewHero, calculateStats, 
    processCommand, getPlayer, setPlayer, setGameStarted, isGameStarted,
    getCurrentMerchant, setCurrentMerchant, formatTimeRemaining
} from './game.js';
import { 
    addMessage, createRealmButtons, getSelectedRealm, quickCommand,
    initUIListeners, setWelcomeVisible, clearChat, getInputValue, 
    clearInput
} from './ui.js';

// ✅ INICIALIZACIÓN SEGURA DE WEBXDC
const isWebxdc = typeof window.webxdc !== 'undefined';

// Función wrapper segura para enviar actualizaciones
function safeSendUpdate(payload, info, summary) {
    if (isWebxdc) {
        window.webxdc.sendUpdate({ 
            payload,                     
            info: info || '', 
            summary: summary || '' 
        }, info || '');
    } else {
        // Modo standalone: solo loguear para debug
        console.log('[Webxdc mock]', { payload, info, summary });
    }
}

/**
 * Envía un comando para procesamiento
 */
export function sendCommand() {
    const cmd = getInputValue();
    if (!cmd || !isGameStarted()) return;

    addMessage(`<strong>${cmd}</strong>`, false);
    clearInput();
    processCommand(cmd, addMessage, safeSendUpdate, isWebxdc);
}

/**
 * Ejecuta un comando rápido desde la quick-bar
 */
export function handleQuickCommand(cmd) {
    quickCommand(cmd, sendCommand);
}

/**
 * Inicia el juego con las opciones seleccionadas
 */
export function startGame() {
    const selectedRealm = getSelectedRealm() || 'Aetherion';

    let isNewGame = false;
    
    if (!loadProgress()) {
        resetToNewHero();
        isNewGame = true;
        
        // Asignar clase y nombre automáticamente para nuevo personaje
        const player = getPlayer();
        const classes = ['Arcane Weaver', 'Shadowblade', 'Stormcaller', 'Verdant Warden', 'Rune Knight'];
        const names = ['Elyndor', 'Thalindra', 'Kaelith', 'Miraelyn', 'Feyrann'];
        player.name = names[Math.floor(Math.random() * names.length)];
        player.class = classes[Math.floor(Math.random() * classes.length)];
        player.realm = selectedRealm;
        setPlayer(player);
    }

    setWelcomeVisible(false);
    setGameStarted(true);
    calculateStats();

    const player = getPlayer();
    addMessage(`🌌 <strong>${player.name}</strong> se ha unido desde <strong>${player.realm}</strong> ✨`);

    // Notificación de inicio para otros jugadores (webxdc)
    if (isWebxdc && isNewGame) {
        safeSendUpdate(
            { type: 'player_join', player: player.name, realm: player.realm, class: player.class },
            `${player.name} se unió desde ${player.realm}`,
            `Nuevo guardián: ${player.name}`
        );
    }

    saveProgress();
}

/**
 * Inicializa el listener de webxdc para multijugador
 */
function initWebxdcListener() {
    if (isWebxdc && typeof window.webxdc.setUpdateListener === 'function') {
        window.webxdc.setUpdateListener((update) => {
            const { payload } = update;
            
            if (payload?.type === 'level_up') {
                addMessage(`🌟 <em>${payload.player} alcanzó nivel ${payload.level}${payload.milestone ? ' ⭐' : ''}</em>`, true);
            } else if (payload?.type === 'merchant_found') {
                addMessage(`🏪 <em>${payload.player} encontró a ${payload.merchant}</em>`, true);
            } else if (payload?.type === 'player_join' && payload.player !== getPlayer().name) {
                addMessage(`✨ <em>${payload.player} se unió desde ${payload.realm} como ${payload.class}</em>`, true);
            }
        }, 0);
    }
}

/**
 * Actualiza el temporizador de acción en la UI
 */
function updateActionTimer() {
    const player = getPlayer();
    
    if (!player.currentAction) {
        return;
    }
    
    const now = Date.now();
    
    // Verificar si la acción completó
    if (now >= player.currentAction.endTime) {
        player.currentAction = null;
        saveProgress();
        addMessage(`✅ <strong>¡Tu acción ha completado!</strong><br>Vuelve a usar el comando para ver los resultados.`, true);
        return;
    }
    
    const remaining = player.currentAction.endTime - now;
    const timeStr = formatTimeRemaining(remaining);
    
    // Actualizar indicador visual si existe
    const timerElement = document.getElementById('action-timer');
    if (timerElement) {
        timerElement.innerHTML = `⏳ Acción en curso: <span style="color:#fbbf24">${timeStr}</span>`;
    }
}

/**
 * Reinicia el juego al estado inicial
 */
export function resetGame() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego? Todo tu progreso se perderá.')) {
        // Limpiar localStorage
        localStorage.removeItem('eternalRealmsPlayer');
        
        // Recargar la página para volver al estado inicial
        window.location.reload();
    }
}

/**
 * Inicialización principal al cargar la página
 */
function init() {
    // Crear botones de reinos
    createRealmButtons();
    
    // Inicializar listeners de UI
    initUIListeners(sendCommand);
    
    // Inicializar listener de webxdc
    initWebxdcListener();

    // Hacer funciones disponibles globalmente para handlers HTML
    window.sendCommand = sendCommand;
    window.quickCommand = handleQuickCommand;
    window.startGame = startGame;
    window.saveProgress = saveProgress;
    window.resetGame = resetGame;
    window.isGameStarted = isGameStarted;
    window.getPlayer = getPlayer;

    // Verificar si hay progreso guardado
    if (loadProgress()) {
        setWelcomeVisible(false);
        setGameStarted(true);
        calculateStats();
        const player = getPlayer();
        addMessage(`🌌 Bienvenido de vuelta, <strong>${player.name}</strong> ✨`);
    } else {
        addMessage("🌠 <strong>Eternal Realms</strong><br>Mundo compartido listo. Crea tu guardián para comenzar.", true);
    }
    
    // Iniciar temporizador de actualización de acciones (cada segundo)
    setInterval(updateActionTimer, 1000);
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
