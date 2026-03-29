/**
 * Eternal Realms - Punto de Entrada Principal
 * Inicializa el juego y coordina todos los módulos
 */

import { 
    saveProgress, loadProgress, resetToNewHero, calculateStats, 
    processCommand, getPlayer, setPlayer, setGameStarted, isGameStarted,
    getCurrentMerchant, setCurrentMerchant
} from './game.js';
import { 
    addMessage, createRealmButtons, getSelectedRealm, quickCommand,
    initUIListeners, setWelcomeVisible, clearChat, getInputValue, 
    clearInput, getPlayerNameInput, getSelectedClass 
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
    const playerName = getPlayerNameInput();
    const playerClass = getSelectedClass();
    const selectedRealm = getSelectedRealm() || 'Aetherion';

    let isNewGame = false;
    
    if (!loadProgress()) {
        resetToNewHero();
        isNewGame = true;
        
        // Aplicar selección del usuario para nuevo personaje
        const player = getPlayer();
        player.name = playerName;
        player.class = playerClass;
        player.realm = selectedRealm;
        setPlayer(player);
    } else {
        // Si ya existe progreso, actualizar con las selecciones actuales del usuario
        const player = getPlayer();
        player.name = playerName;
        player.class = playerClass;
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
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
