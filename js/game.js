/**
 * Eternal Realms - Sistema de Juego
 * Módulo con la lógica principal del juego, comandos y mecánicas
 */

import { 
    tierConfig, possibleWeapons, possibleArmors, 
    questFlavors, emptyQuestFlavors, merchantNames,
    getTierColor, getTierName, createInitialPlayer, initialWorldState,
    dungeonBosses, worldEvents, eventRewards,
    MAX_INVENTORY_SIZE, FUSION_RECIPES, DISENCHANT_VALUES, CRAFTING_RECIPES,
    ELEMENTS, ELEMENT_CHART, ITEM_ICONS, getItemIcon, assignElementToItem,
    getElementMultiplier, getElementEffectText, dungeonEnemies, getRandomEnemy
} from './config.js';

// Estado del jugador
let myPlayer = createInitialPlayer();

// Estado del mundo
let worldState = { ...initialWorldState };

// Estado del juego
let gameStarted = false;
let currentMerchant = null;

// Configuración de tiempos de acción (en milisegundos)
const ACTION_TIMES = {
    quest: 3 * 60 * 1000,    // 3 minutos para quests
    dungeon: 5 * 60 * 1000,  // 5 minutos para dungeons
    raid: 7 * 60 * 1000      // 7 minutos para raids
};

/**
 * Formatea un tiempo restante en formato legible
 * @param {number} ms - Milisegundos restantes
 * @returns {string} Tiempo formateado
 */
export function formatTimeRemaining(ms) {
    if (ms <= 0) return '0s';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

/**
 * Verifica si el jugador puede realizar una acción
 * @param {string} actionType - Tipo de acción ('quest', 'dungeon', 'raid')
 * @returns {object} { canAct: boolean, remainingTime: number, actionType: string }
 */
export function checkActionReady(actionType) {
    const now = Date.now();
    
    // Si no hay acción en curso, puede actuar
    if (!myPlayer.currentAction) {
        return { canAct: true, remainingTime: 0, actionType: null };
    }
    
    // Verificar si la acción actual ya terminó
    if (now >= myPlayer.currentAction.endTime) {
        myPlayer.currentAction = null;
        return { canAct: true, remainingTime: 0, actionType: null };
    }
    
    // Calcular tiempo restante
    const remainingTime = myPlayer.currentAction.endTime - now;
    return { 
        canAct: false, 
        remainingTime: remainingTime,
        actionType: myPlayer.currentAction.type
    };
}

/**
 * Inicia una nueva acción con tiempo
 * @param {string} actionType - Tipo de acción ('quest', 'dungeon', 'raid')
 * @returns {boolean} true si se inició correctamente
 */
export function startAction(actionType) {
    const status = checkActionReady(actionType);
    
    if (!status.canAct) {
        return false;
    }
    
    const actionTime = ACTION_TIMES[actionType];
    myPlayer.currentAction = {
        type: actionType,
        endTime: Date.now() + actionTime
    };
    myPlayer.actionStartTime = Date.now();
    
    return true;
}

/**
 * Finaliza la acción actual y retorna los resultados
 * @param {Function} addMessage - Función para agregar mensajes
 * @param {Function} safeSendUpdate - Función para enviar actualizaciones webxdc
 * @param {boolean} isWebxdc - Indica si está en entorno webxdc
 * @returns {boolean} true si la acción se completó
 */
export function completeCurrentAction(addMessage, safeSendUpdate, isWebxdc, originalCommand) {
    const now = Date.now();
    
    if (!myPlayer.currentAction) {
        return false;
    }
    
    if (now < myPlayer.currentAction.endTime) {
        return false;
    }
    
    const completedAction = myPlayer.currentAction;
    myPlayer.currentAction = null;
    
    // Ejecutar el comando original que estaba pendiente
    addMessage(`✅ <strong>¡Acción completada!</strong><br>${getActionCompleteMessage(completedAction.type)}`);
    
    // Re-ejecutar el comando original
    processCommand(originalCommand, addMessage, safeSendUpdate, isWebxdc);
    
    return true;
}

/**
 * Obtiene mensaje de completado según tipo de acción
 * @param {string} actionType - Tipo de acción
 * @returns {string} Mensaje descriptivo
 */
function getActionCompleteMessage(actionType) {
    const messages = {
        quest: '🌿 Tu exploración ha terminado. Los resultados están listos.',
        dungeon: '🕳️ Has emergido de la mazmorra. Las recompensas te esperan.',
        raid: '⚔️ El combate contra el jefe ha concluido.'
    };
    return messages[actionType] || '¡Tu acción ha completado!';
}

/**
 * Procesa el comando con sistema de tiempo
 * @param {string} cmd - Comando original
 * @param {Function} addMessage - Función para agregar mensajes
 * @param {Function} safeSendUpdate - Función para enviar actualizaciones webxdc
 * @param {boolean} isWebxdc - Indica si está en entorno webxdc
 * @param {string} actionType - Tipo de acción asociada
 * @returns {boolean} true si se inició el tiempo, false si se ejecutó inmediatamente
 */
export function processCommandWithTimer(cmd, addMessage, safeSendUpdate, isWebxdc, actionType) {
    const now = Date.now();
    
    // Verificar si hay una acción pendiente que ya completó
    if (myPlayer.currentAction && now >= myPlayer.currentAction.endTime) {
        myPlayer.currentAction = null;
    }
    
    // Si hay una acción en curso, mostrar estado
    if (myPlayer.currentAction) {
        const remaining = myPlayer.currentAction.endTime - now;
        const actionName = getActionName(myPlayer.currentAction.type);
        
        addMessage(`⏳ <strong>${actionName} en progreso...</strong><br>` +
                  `Tiempo restante: <span style="color:#fbbf24">${formatTimeRemaining(remaining)}</span><br>` +
                  `<em>Debes esperar a que termine esta acción antes de iniciar otra.</em>`);
        return false;
    }
    
    // Iniciar nueva acción
    const actionTime = ACTION_TIMES[actionType];
    myPlayer.currentAction = {
        type: actionType,
        endTime: now + actionTime
    };
    myPlayer.actionStartTime = now;
    
    const actionName = getActionName(actionType);
    addMessage(`⏳ <strong>Iniciando ${actionName}...</strong><br>` +
              `Tiempo estimado: <span style="color:#fbbf24">${formatTimeRemaining(actionTime)}</span><br>` +
              `<em>Vuelve cuando el temporizador haya terminado para ver los resultados.</em>`);
    
    saveProgress();
    return true;
}

/**
 * Obtiene nombre legible de la acción
 * @param {string} actionType - Tipo de acción
 * @returns {string} Nombre de la acción
 */
function getActionName(actionType) {
    const names = {
        quest: 'Exploración',
        dungeon: 'Mazmorra',
        raid: 'Combate contra Jefe'
    };
    return names[actionType] || 'Acción';
}

/**
 * Guarda el progreso en localStorage
 */
export function saveProgress() {
    localStorage.setItem('eternalRealmsPlayer', JSON.stringify(myPlayer));
}

/**
 * Carga el progreso desde localStorage
 * @returns {boolean} true si se encontró un guardado
 */
export function loadProgress() {
    const saved = localStorage.getItem('eternalRealmsPlayer');
    if (saved) {
        myPlayer = JSON.parse(saved);
        return true;
    }
    return false;
}

/**
 * Reinicia el personaje al estado inicial
 */
export function resetToNewHero() {
    myPlayer = createInitialPlayer();
    localStorage.removeItem('eternalRealmsPlayer');
    currentMerchant = null;
}

/**
 * Calcula las estadísticas de ataque y defensa basadas en nivel y equipo
 */
export function calculateStats() {
    myPlayer.atk = 1 + (myPlayer.level - 1) * 0.6 + myPlayer.weapon.atk;
    myPlayer.def = 1 + (myPlayer.level - 1) * 0.6 + myPlayer.armor.def;
    myPlayer.atk = Math.floor(myPlayer.atk);
    myPlayer.def = Math.floor(myPlayer.def);
}

/**
 * Aplica los bonus de subida de nivel
 * @param {boolean} isMilestone - true si es nivel múltiplo de 5
 */
export function levelUpStats(isMilestone = false) {
    myPlayer.maxHp = Math.floor(myPlayer.maxHp * 1.08);
    myPlayer.maxStamina = Math.floor(myPlayer.maxStamina * 1.05);
    myPlayer.maxMana = Math.floor(myPlayer.maxMana * 1.07);

    if (isMilestone) {
        myPlayer.atk += 1;
        myPlayer.def += 1;
        myPlayer.maxHp = Math.floor(myPlayer.maxHp * 1.55);
    }

    myPlayer.hp = myPlayer.maxHp;
    myPlayer.stamina = myPlayer.maxStamina;
    myPlayer.mana = myPlayer.maxMana;
    calculateStats();
}

/**
 * Muestra el equipo actual e inventario del jugador
 * @param {Function} addMessage - Función para agregar mensajes al chat
 */
export function showEquipment(addMessage) {
    const weaponIcon = getItemIcon(myPlayer.weapon);
    const armorIcon = getItemIcon(myPlayer.armor);
    const weaponTierName = getTierName(myPlayer.weapon.tier);
    const armorTierName = getTierName(myPlayer.armor.tier);
    
    let msg = '🛡️ <strong>Equipo actual</strong><br>';
    msg += `${weaponIcon} Arma: <span style="color:${getTierColor(myPlayer.weapon.tier)}">${myPlayer.weapon.name}</span> [${weaponTierName}] (+${myPlayer.weapon.atk} Ataque)`;
    if (myPlayer.weapon.element) {
        msg += ` ${myPlayer.weapon.elementEmoji}`;
    }
    msg += '<br>';
    
    msg += `${armorIcon} Armadura: <span style="color:${getTierColor(myPlayer.armor.tier)}">${myPlayer.armor.name}</span> [${armorTierName}] (+${myPlayer.armor.def} Defensa)`;
    if (myPlayer.armor.element) {
        msg += ` ${myPlayer.armor.elementEmoji}`;
    }
    msg += '<br><br>';
    
    // Mostrar esencia y buffs
    msg += `${ITEM_ICONS.states.essence} Esencia Mágica: ${myPlayer.essence}<br>`;
    if (myPlayer.activeBuffs.length > 0) {
        msg += '🔮 <strong>Buffs Activos:</strong><br>';
        myPlayer.activeBuffs.forEach(buff => {
            msg += `   • ${buff.name} (${buff.remaining} acciones restantes)<br>`;
        });
    }
    msg += '<br>';
    
    // Mostrar límite de inventario
    msg += `🎒 <strong>Inventario:</strong> (${myPlayer.inventory.length}/${MAX_INVENTORY_SIZE})<br>`;
    
    if (myPlayer.inventory.length === 0) {
        msg += '<em>Inventario vacío</em>';
    } else {
        myPlayer.inventory.forEach((item, i) => {
            const icon = getItemIcon(item);
            const type = item.atk !== undefined ? '⚔️' : '🛡️';
            const bonus = item.atk !== undefined ? `+${item.atk} Ataque` : `+${item.def} Defensa`;
            const tierColor = getTierColor(item.tier);
            const tierName = getTierName(item.tier);
            const canEquip = myPlayer.level >= item.minLevel;
            
            let itemLine = `${i+1}. ${icon} <span style="color:${tierColor}">${type} ${item.name}</span> [${tierName}] - ${bonus}`;
            if (item.element) {
                itemLine += ` ${item.elementEmoji}`;
            }
            if (!canEquip) {
                itemLine += ` | <em style="color:#ef4444">(Nvl ${item.minLevel} requerido)</em>`;
            }
            msg += itemLine + '<br>';
        });
    }
    
    msg += '<br><strong>Comandos de Crafteo:</strong><br>';
    msg += '/fuse N1 N2 N3 — Fusionar 3 items<br>';
    msg += '/disenchant N — Destruir item por esencia<br>';
    msg += '/craft — Ver recetas disponibles<br>';
    msg += '/use N — Usar consumible (poción/buff)';
    
    addMessage(msg);
}

/**
 * Muestra los items disponibles en el mercader actual
 * @param {Function} addMessage - Función para agregar mensajes al chat
 */
export function showMerchant(addMessage) {
    if (!currentMerchant) {
        addMessage('❌ No hay ningún mercader cerca. Explora más para encontrar uno.');
        return;
    }

    let msg = `🏪 <strong>${currentMerchant.name}</strong> te saluda<br>`;
    msg += '<em>"¡Bienvenido! Tengo artículos especiales para ti..."</em><br><br>';

    currentMerchant.items.forEach((item, i) => {
        const type = item.atk !== undefined ? '⚔️' : '🛡️';
        const bonus = item.atk !== undefined ? `+${item.atk} Ataque` : `+${item.def} Defensa`;
        const tierColor = getTierColor(item.tier);
        const tierName = getTierName(item.tier);
        const canEquip = myPlayer.level >= item.minLevel;

        msg += `${i+1}. <span style="color:${tierColor}">${type} ${item.name}</span> [${tierName}]<br>`;
        msg += `   ${bonus} | 💎 ${item.price} Cristales`;
        msg += canEquip ? '' : ` | <em style="color:#ef4444">(Nvl ${item.minLevel} requerido)</em>`;
        msg += '<br>';
    });
    msg += '<br>Escribe <strong>/buy N</strong> para comprar un ítem (ej: /buy 1)';
    addMessage(msg);
}

/**
 * Procesa un comando del jugador
 * @param {string} cmd - Comando a procesar
 * @param {Function} addMessage - Función para agregar mensajes al chat
 * @param {Function} safeSendUpdate - Función para enviar actualizaciones webxdc
 * @param {boolean} isWebxdc - Indica si está en entorno webxdc
 */
export function processCommand(cmd, addMessage, safeSendUpdate, isWebxdc) {
    const lower = cmd.toLowerCase().trim();

    if (lower === '/me') {
        calculateStats();
        const weaponTierName = getTierName(myPlayer.weapon.tier);
        const armorTierName = getTierName(myPlayer.armor.tier);

        addMessage(
            `🌌 <strong>${myPlayer.name}</strong> — ${myPlayer.class}<br>` +
            `🏛️ Reino: ${myPlayer.realm}<br>` +
            `📈 Nivel ${myPlayer.level} • ✨ Esencia: ${myPlayer.exp}/${myPlayer.expMax}<br>` +
            `💎 Cristales: ${myPlayer.gold}<br>` +
            `⚡ Energía: ${myPlayer.stamina}/${myPlayer.maxStamina}<br>` +
            `🔮 Maná: ${myPlayer.mana}/${myPlayer.maxMana}<br>` +
            `🗡️ Poder: ${myPlayer.atk} • 🛡️ Resistencia: ${myPlayer.def}<br>` +
            `❤️ Vida: ${myPlayer.hp}/${myPlayer.maxHp}<br>` +
            `⚔️ Arma: ${myPlayer.weapon.name} [${weaponTierName}] (+${myPlayer.weapon.atk})<br>` +
            `🛡️ Armadura: ${myPlayer.armor.name} [${armorTierName}] (+${myPlayer.armor.def})`
        );
    }
    else if (lower.includes('quest')) {
        // Verificar si la acción ya completó y ejecutar resultados
        const now = Date.now();
        if (myPlayer.currentAction && myPlayer.currentAction.type === 'quest' && now >= myPlayer.currentAction.endTime) {
            const completedAction = myPlayer.currentAction;
            myPlayer.currentAction = null;
            addMessage(`✅ <strong>¡Exploración completada!</strong><br>🌿 Tu exploración ha terminado. Los resultados están listos.`);
            processQuest(addMessage, safeSendUpdate, isWebxdc);
        } else {
            processCommandWithTimer(cmd, addMessage, safeSendUpdate, isWebxdc, 'quest');
        }
    }
    else if (lower === '/dungeon') {
        // Verificar si la acción ya completó y ejecutar resultados
        const now = Date.now();
        if (myPlayer.currentAction && myPlayer.currentAction.type === 'dungeon' && now >= myPlayer.currentAction.endTime) {
            const completedAction = myPlayer.currentAction;
            myPlayer.currentAction = null;
            addMessage(`✅ <strong>¡Mazmorra completada!</strong><br>🕳️ Has emergido de la mazmorra. Las recompensas te esperan.`);
            processDungeon(addMessage, safeSendUpdate, isWebxdc);
        } else {
            processCommandWithTimer(cmd, addMessage, safeSendUpdate, isWebxdc, 'dungeon');
        }
    }
    else if (lower.startsWith('/raid')) {
        const now = Date.now();
        // Para raids, verificar si es ataque o info
        const raidParts = lower.split(' ');
        const raidAction = raidParts[1] || 'info';
        
        // Comandos de información no requieren tiempo
        if (raidAction === 'info' || raidAction === 'status' || raidAction === 'flee') {
            processBossRaid(lower, addMessage, safeSendUpdate, isWebxdc);
        }
        // Verificar si la acción ya completó y ejecutar resultados
        else if (myPlayer.currentAction && myPlayer.currentAction.type === 'raid' && now >= myPlayer.currentAction.endTime) {
            const completedAction = myPlayer.currentAction;
            myPlayer.currentAction = null;
            addMessage(`✅ <strong>¡Combate completado!</strong><br>⚔️ El combate contra el jefe ha concluido.`);
            processBossRaid(lower, addMessage, safeSendUpdate, isWebxdc);
        } else {
            processCommandWithTimer(cmd, addMessage, safeSendUpdate, isWebxdc, 'raid');
        }
    }
    else if (lower === '/event') {
        processWorldEvent(addMessage);
    }
    else if (lower === '/boss') {
        showCurrentBoss(addMessage);
    }
    else if (lower === '/rest') {
        processRest(addMessage);
    }
    else if (lower === '/equip') {
        showEquipment(addMessage);
    }
    else if (lower.startsWith('/equip ')) {
        processEquipItem(lower, addMessage);
    }
    else if (lower === '/merchant') {
        showMerchant(addMessage);
    }
    else if (lower.startsWith('/buy ')) {
        processBuyItem(lower, addMessage);
    }
    else if (lower === '/world') {
        addMessage(`🌍 <strong>Estado del Mundo Compartido</strong><br>` +
                  `✨ Esencia global: ${worldState.globalEssence}<br>` +
                  `🌀 Próxima Convergencia: ${worldState.nextConvergence}<br>` +
                  `👥 Guardianes activos: ${worldState.totalGuardians}`);
    }
    else if (lower === '/help') {
        addMessage('🌠 <strong>Comandos disponibles:</strong><br>' +
                  '/me — Ver tus estadísticas<br>' +
                  '/quest — Explorar las tierras (5% drop, 5% mercader)<br>' +
                  '/dungeon — Entrar en mazmorra (10% drop)<br>' +
                  '/raid — Atacar jefe de mazmorra /raid attack<br>' +
                  '/boss — Ver jefe actual en raid<br>' +
                  '/event — Ver evento mundial activo<br>' +
                  '/rest — Descansar completamente<br>' +
                  '/equip — Ver equipo e inventario<br>' +
                  '/equip N — Equipar ítem número N<br>' +
                  '/merchant — Ver mercader actual<br>' +
                  '/buy N — Comprar ítem del mercader<br>' +
                  '/world — Ver estado global<br>' +
                  '/fuse N1 N2 N3 — Fusionar 3 items para crear uno mejor<br>' +
                  '/disenchant N — Destruir item por esencia mágica<br>' +
                  '/craft — Ver recetas de crafteo<br>' +
                  '/use N — Usar consumible (poción/buff)<br>' +
                  '/help — Esta ayuda<br><br>' +
                  '<strong>Sistema de Tiers:</strong><br>' +
                  '<span style="color:#94a3b8">⚪ Común</span> | ' +
                  '<span style="color:#22c55e">🟢 Poco Común</span> | ' +
                  '<span style="color:#3b82f6">🔵 Raro</span> | ' +
                  '<span style="color:#a855f7">🟣 Épico</span> | ' +
                  '<span style="color:#f59e0b">🟠 Legendario</span>');
    }
    else if (lower.startsWith('/fuse')) {
        processFusion(lower, addMessage);
    }
    else if (lower.startsWith('/disenchant')) {
        processDisenchant(lower, addMessage);
    }
    else if (lower === '/craft') {
        showCraftingRecipes(addMessage);
    }
    else if (lower.startsWith('/craft ')) {
        processCrafting(lower, addMessage);
    }
    else if (lower.startsWith('/use ')) {
        processUseItem(lower, addMessage);
    }
    else if (lower === '/reset') {
        addMessage('⚠️ <strong>Reiniciando personaje...</strong><br>Se borrará todo el progreso.');
        resetToNewHero();
        gameStarted = false;
        document.getElementById('welcome').style.display = 'flex';
        document.getElementById('chat-container').innerHTML = '';
        addMessage('🌌 El mundo se ha reiniciado. Crea un nuevo guardián.', true);
        return;
    }
    else {
        addMessage(`🌫️ Comando recibido: <strong>${cmd}</strong>`);
    }

    saveProgress();
}

/**
 * Procesa el comando /quest
 */
function processQuest(addMessage, safeSendUpdate, isWebxdc) {
    // Verificar si el jugador está al borde de la muerte
    if (myPlayer.hp <= 1) {
        addMessage("❌ <strong>¡Estás gravemente herido!</strong><br>" +
                  "Con solo 1 HP no puedes explorar. Usa /rest para recuperarte.");
        return;
    }
    
    if (myPlayer.stamina < 1) {
        addMessage("❌ ⚠️ Tu energía vital está agotada.");
        return;
    }
    myPlayer.stamina -= 1;

    // 5% chance de encontrar mercader (nivel 3+)
    if (Math.random() < 0.05 && myPlayer.level >= 3) {
        const merchantName = merchantNames[Math.floor(Math.random() * merchantNames.length)];
        const numItems = 2 + Math.floor(Math.random() * 2);
        const items = [];

        for (let i = 0; i < numItems; i++) {
            const isWeapon = Math.random() < 0.5;
            const pool = isWeapon ? possibleWeapons : possibleArmors;
            const filteredPool = pool.filter(item =>
                item.tier !== 'comun' &&
                item.minLevel <= myPlayer.level + 5 &&
                item.minLevel >= Math.max(1, myPlayer.level - 2)
            );

            if (filteredPool.length > 0) {
                const item = {...filteredPool[Math.floor(Math.random() * filteredPool.length)]};
                items.push(item);
            }
        }

        if (items.length > 0) {
            currentMerchant = { name: merchantName, items: items };
            addMessage(`🏪 <strong>¡Encontraste a ${merchantName}!</strong><br>` +
                      'Un mercader ambulante ofrece artículos especiales.<br>' +
                      'Escribe <strong>/merchant</strong> para ver sus productos.');

            if (isWebxdc) {
                safeSendUpdate(
                    { type: 'merchant_found', merchant: merchantName, player: myPlayer.name },
                    `${myPlayer.name} encontró a ${merchantName}`,
                    `Mercader disponible`
                );
            }

            saveProgress();
            return;
        }
    }

    // 60% chance de éxito
    if (Math.random() < 0.40) {
        const emptyText = emptyQuestFlavors[Math.floor(Math.random() * emptyQuestFlavors.length)];
        addMessage('🌫️ ' + emptyText);
    } else {
        const flavor = questFlavors[Math.floor(Math.random() * questFlavors.length)];
        const expG = Math.floor(95 + Math.random() * 170);
        const goldG = Math.floor(18 + Math.random() * 32);

        myPlayer.exp += expG;
        myPlayer.gold += goldG;

        addMessage(`🌿 ${flavor}<br>✨ +${expG} Esencia • 💎 +${goldG} Cristales`);

        // 5% chance de drop
        if (Math.random() < 0.05) {
            // Verificar límite de inventario
            if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
                addMessage(`🎒 <strong>¡Mochila llena!</strong><br>` +
                          `Tienes ${myPlayer.inventory.length}/${MAX_INVENTORY_SIZE} objetos.<br>` +
                          `No puedes recoger el item. Usa /fuse o /disenchant para liberar espacio.`);
            } else {
                if (Math.random() < 0.55) {
                    const newWeapon = {...possibleWeapons[Math.floor(Math.random() * possibleWeapons.length)]};
                    assignElementToItem(newWeapon);
                    myPlayer.inventory.push(newWeapon);
                    const tierColor = getTierColor(newWeapon.tier);
                    const tierName = getTierName(newWeapon.tier);
                    const weaponIcon = getItemIcon(newWeapon);
                    addMessage(`${weaponIcon} ¡Encontraste un arma! <span style="color:${tierColor}"><strong>${newWeapon.name}</strong></span> [${tierName}] ${newWeapon.elementEmoji} (+${newWeapon.atk} Ataque)`);
                } else {
                    const newArmor = {...possibleArmors[Math.floor(Math.random() * possibleArmors.length)]};
                    assignElementToItem(newArmor);
                    myPlayer.inventory.push(newArmor);
                    const tierColor = getTierColor(newArmor.tier);
                    const tierName = getTierName(newArmor.tier);
                    const armorIcon = getItemIcon(newArmor);
                    addMessage(`${armorIcon} ¡Encontraste una armadura! <span style="color:${tierColor}"><strong>${newArmor.name}</strong></span> [${tierName}] ${newArmor.elementEmoji} (+${newArmor.def} Defensa)`);
                }
            }
        }

        // Check level up
        if (myPlayer.exp >= myPlayer.expMax) {
            const newLevel = myPlayer.level + 1;
            const isMilestone = (newLevel % 5 === 0);

            myPlayer.level = newLevel;
            myPlayer.exp = 0;
            myPlayer.expMax = Math.floor(myPlayer.expMax * 1.55);

            levelUpStats(isMilestone);
            const milestoneMsg = isMilestone ? '<br><strong>¡Hito alcanzado!</strong> Poder y Resistencia +1 • Vida aumentada significativamente.' : '';
            addMessage(`🌟 <strong>¡Ascensión!</strong> Nivel ${myPlayer.level} alcanzado ✨${milestoneMsg}`);

            if (isWebxdc) {
                safeSendUpdate(
                    { type: 'level_up', player: myPlayer.name, level: myPlayer.level, milestone: isMilestone },
                    `${myPlayer.name} alcanzó nivel ${myPlayer.level}`,
                    `Nivel ${myPlayer.level}${isMilestone ? ' ⭐' : ''}`
                );
            }
        }
    }
}

/**
 * Procesa el comando /dungeon con posibilidad de encontrar boss
 */
function processDungeon(addMessage, safeSendUpdate, isWebxdc) {
    // Verificar si el jugador está al borde de la muerte
    if (myPlayer.hp <= 1) {
        addMessage("❌ <strong>¡Estás gravemente herido!</strong><br>" +
                  "Con solo 1 HP no puedes entrar a una mazmorra. Usa /rest para recuperarte.");
        return;
    }
    
    if (myPlayer.stamina < 3) {
        addMessage("❌ No tienes suficiente energía para una Mazmorra.");
        return;
    }
    myPlayer.stamina -= 3;
    // Calcular daño con causa específica
    // Sistema de enemigos por bioma implementado en config.js
    const enemy = getRandomEnemy(myPlayer.level);
    const damageCauses = [
        { name: "Trampa oculta", minDmg: 15, maxDmg: 25 },
        { name: "Ataque de esbirros", minDmg: 18, maxDmg: 30 },
        { name: "Magia oscura", minDmg: 20, maxDmg: 35 },
        { name: "Derrumbe", minDmg: 22, maxDmg: 40 }
    ];
    
    const cause = damageCauses[Math.floor(Math.random() * damageCauses.length)];
    let dmg = Math.floor(cause.minDmg + Math.random() * (cause.maxDmg - cause.minDmg));
    
    // Limitar el daño para que nunca baje de 1 HP
    const maxDamage = myPlayer.hp - 1;
    if (dmg > maxDamage) {
        dmg = maxDamage;
        addMessage(`⚠️ <strong>¡Casi mueres!</strong><br>${cause.name} te habría hecho ${Math.floor(22 + Math.random() * 38)} de daño, pero sobreviviste con 1 HP.`);
    } else {
        addMessage(`🕳️ <strong>Mazmorra explorada</strong><br>${enemy.emoji} <strong>${enemy.name}</strong> (${enemy.element})<br>${cause.name}<br>❤️ Daño recibido: ${dmg}`);
    }
    
    myPlayer.hp = Math.max(1, myPlayer.hp - dmg);
    let reward = Math.floor(75 + Math.random() * 125);
    
    // Aplicar multiplicador de evento mundial si está activo
    if (worldState.worldEvent) {
        reward = Math.floor(reward * worldState.worldEvent.rewardMultiplier);
    }
    
    myPlayer.gold += reward;
    addMessage(`💎 Recompensa: +${reward} Cristales`);

    // 10% chance de drop normal
    if (Math.random() < 0.10) {
        // Verificar límite de inventario
        if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
            addMessage(`🎒 <strong>¡Mochila llena!</strong><br>` +
                      `Tienes ${myPlayer.inventory.length}/${MAX_INVENTORY_SIZE} objetos.<br>` +
                      `No puedes recoger el item. Usa /fuse o /disenchant para liberar espacio.`);
        } else {
            if (Math.random() < 0.5) {
                const newWeapon = {...possibleWeapons[Math.floor(Math.random() * possibleWeapons.length)]};
                assignElementToItem(newWeapon);
                myPlayer.inventory.push(newWeapon);
                const tierColor = getTierColor(newWeapon.tier);
                const tierName = getTierName(newWeapon.tier);
                const weaponIcon = getItemIcon(newWeapon);
                addMessage(`${weaponIcon} ¡Encontraste un arma en la mazmorra! <span style="color:${tierColor}"><strong>${newWeapon.name}</strong></span> [${tierName}] ${newWeapon.elementEmoji}`);
            } else {
                const newArmor = {...possibleArmors[Math.floor(Math.random() * possibleArmors.length)]};
                assignElementToItem(newArmor);
                myPlayer.inventory.push(newArmor);
                const tierColor = getTierColor(newArmor.tier);
                const tierName = getTierName(newArmor.tier);
                const armorIcon = getItemIcon(newArmor);
                addMessage(`${armorIcon} ¡Encontraste una armadura en la mazmorra! <span style="color:${tierColor}"><strong>${newArmor.name}</strong></span> [${tierName}] ${newArmor.elementEmoji}`);
            }
        }
    }
    
    // 15% chance de encontrar un jefe (si no hay uno activo)
    if (!worldState.currentBoss && Math.random() < 0.15) {
        spawnBoss(addMessage, safeSendUpdate, isWebxdc);
    }
    
    // Contribuir al evento mundial si está activo
    if (worldState.worldEvent) {
        contributeToEvent(500, addMessage, safeSendUpdate, isWebxdc);
    }
}

/**
 * Procesa el comando /rest
 */
function processRest(addMessage) {
    const restoredHp = myPlayer.maxHp - myPlayer.hp;
    const restoredStamina = myPlayer.maxStamina - myPlayer.stamina;

    myPlayer.hp = myPlayer.maxHp;
    myPlayer.stamina = myPlayer.maxStamina;

    addMessage(`🌙 <strong>Descanso completo</strong><br>` +
              `❤️ Vida restaurada: +${restoredHp}<br>` +
              `⚡ Energía restaurada: +${restoredStamina}`);
}

/**
 * Procesa el comando /equip N
 */
function processEquipItem(cmd, addMessage) {
    const num = parseInt(cmd.split(' ')[1]);
    if (!isNaN(num) && num > 0 && num <= myPlayer.inventory.length) {
        const item = myPlayer.inventory[num - 1];

        if (myPlayer.level < item.minLevel) {
            addMessage(`❌ <strong>¡Nivel insuficiente!</strong> Necesitas nivel ${item.minLevel} para equipar ${item.name}.`);
            return;
        }

        if (item.atk !== undefined) {
            myPlayer.weapon = item;
            const tierColor = getTierColor(item.tier);
            const tierName = getTierName(item.tier);
            addMessage(`⚔️ Equipaste: <span style="color:${tierColor}"><strong>${item.name}</strong></span> [${tierName}] (+${item.atk} Ataque)`);
        } else {
            myPlayer.armor = item;
            const tierColor = getTierColor(item.tier);
            const tierName = getTierName(item.tier);
            addMessage(`🛡️ Equipaste: <span style="color:${tierColor}"><strong>${item.name}</strong></span> [${tierName}] (+${item.def} Defensa)`);
        }
        myPlayer.inventory.splice(num - 1, 1);
        calculateStats();
    } else {
        addMessage('❌ Número inválido. Usa /equip seguido del número del ítem.');
    }
}

/**
 * Procesa el comando /buy N
 */
function processBuyItem(cmd, addMessage) {
    if (!currentMerchant) {
        addMessage('❌ No hay ningún mercader cerca. Usa /quest para encontrar uno.');
        return;
    }

    const num = parseInt(cmd.split(' ')[1]);
    if (!isNaN(num) && num > 0 && num <= currentMerchant.items.length) {
        const item = currentMerchant.items[num - 1];

        if (myPlayer.level < item.minLevel) {
            addMessage(`❌ <strong>¡Nivel insuficiente!</strong> Necesitas nivel ${item.minLevel} para comprar ${item.name}.`);
            return;
        }

        if (myPlayer.gold < item.price) {
            addMessage(`❌ <strong>¡No tienes suficientes cristales!</strong> Necesitas ${item.price} 💎 pero tienes ${myPlayer.gold} 💎`);
            return;
        }

        // Verificar límite de inventario
        if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
            addMessage(`🎒 <strong>¡Mochila llena!</strong><br>` +
                      `Tienes ${myPlayer.inventory.length}/${MAX_INVENTORY_SIZE} objetos.<br>` +
                      `Libera espacio antes de comprar.`);
            return;
        }

        myPlayer.gold -= item.price;
        myPlayer.inventory.push(item);
        const tierColor = getTierColor(item.tier);
        const tierName = getTierName(item.tier);
        addMessage(`✅ <strong>¡Compra exitosa!</strong> Adquiriste <span style="color:${tierColor}">${item.name}</span> [${tierName}] por ${item.price} 💎`);

        currentMerchant = null;
        saveProgress();
    } else {
        addMessage('❌ Número inválido. Usa /buy seguido del número del ítem.');
    }
}

/**
 * Muestra el jefe actual en raid
 */
function showCurrentBoss(addMessage) {
    if (!worldState.currentBoss) {
        addMessage('👹 <strong>No hay ningún jefe activo</strong><br>' +
                  'Explora mazmorras (/dungeon) para tener chance de encontrar uno.<br>' +
                  'Los jefes aparecen aleatoriamente y todos los jugadores pueden participar.');
        return;
    }
    
    const boss = worldState.currentBoss;
    const hpPercent = Math.floor((boss.currentHp / boss.maxHp) * 100);
    const hpBar = '█'.repeat(Math.floor(hpPercent / 10)) + '░'.repeat(10 - Math.floor(hpPercent / 10));
    
    let msg = `👹 <strong>${boss.name}</strong> — Nivel ${boss.level}<br>`;
    msg += `<em>"${boss.description}"</em><br><br>`;
    msg += `❤️ <strong>Salud:</strong> [${hpBar}] ${boss.currentHp}/${boss.maxHp} (${hpPercent}%)<br>`;
    msg += `⚔️ <strong>Ataque:</strong> ${boss.atk} | 🛡️ <strong>Defensa:</strong> ${boss.def}<br>`;
    msg += `💎 <strong>Recompensa:</strong> ${boss.goldReward} Cristales<br>`;
    msg += `✨ <strong>Experiencia:</strong> ${boss.expReward} Esencia<br>`;
    msg += `🎁 <strong>Drop Chance:</strong> ${(boss.dropChance * 100).toFixed(0)}%<br><br>`;
    msg += `📊 <strong>Jefes derrotados globalmente:</strong> ${worldState.bossDefeatedCount}<br><br>`;
    msg += '<strong>Comandos de Raid:</strong><br>';
    msg += '/raid attack — Atacar al jefe<br>';
    msg += '/raid info — Ver información detallada<br>';
    msg += '/raid flee — Huir del raid (pierdes oportunidad de recompensa)';
    
    addMessage(msg);
}

/**
 * Procesa comandos de raid
 */
function processBossRaid(cmd, addMessage, safeSendUpdate, isWebxdc) {
    const parts = cmd.toLowerCase().trim().split(' ');
    const action = parts[1] || 'info';
    
    if (action === 'info' || action === 'status') {
        showCurrentBoss(addMessage);
        return;
    }
    
    if (action === 'flee') {
        if (!worldState.currentBoss) {
            addMessage('❌ No hay ningún jefe del que huir.');
            return;
        }
        addMessage('🏃 Has huido del raid. El jefe permanece activo para otros jugadores.');
        return;
    }
    
    if (action === 'attack') {
        // Verificar si el jugador está al borde de la muerte
        if (myPlayer.hp <= 1) {
            addMessage("❌ <strong>¡Estás gravemente herido!</strong><br>" +
                      "Con solo 1 HP no puedes atacar a un jefe. Usa /rest para recuperarte.");
            return;
        }
        
        if (!worldState.currentBoss) {
            addMessage('❌ No hay ningún jefe activo. Explora mazmorras (/dungeon) para encontrar uno.');
            return;
        }
        
        const boss = worldState.currentBoss;
        
        // Verificar si el jugador tiene nivel suficiente
        if (myPlayer.level < boss.level - 5) {
            addMessage(`❌ <strong>¡Jefe demasiado poderoso!</strong><br>` +
                      `Necesitas al menos nivel ${boss.level - 5} para enfrentar a ${boss.name}.<br>` +
                      `Tu nivel actual: ${myPlayer.level}`);
            return;
        }
        
        // Asignar elemento al jugador y al jefe si no tienen
        if (!myPlayer.weapon.element) assignElementToItem(myPlayer.weapon);
        if (!boss.element) assignElementToItem(boss);
        
        // Calcular multiplicador elemental
        const elementMultiplier = getElementMultiplier(myPlayer.weapon.element, boss.element);
        const elementEffect = getElementEffectText(elementMultiplier);
        
        // Calcular daño del jugador con elemento
        let playerDmg = Math.floor(myPlayer.atk * (0.8 + Math.random() * 0.4));
        playerDmg = Math.floor(playerDmg * elementMultiplier);
        
        const bossDmg = Math.floor(boss.atk * (0.7 + Math.random() * 0.3));
        
        // Aplicar defensa
        const actualDmgToBoss = Math.max(1, playerDmg - Math.floor(boss.def * 0.3));
        const actualDmgToPlayer = Math.max(1, bossDmg - Math.floor(myPlayer.def * 0.3));
        
        // Aplicar buffs de daño
        let finalDmgToBoss = actualDmgToBoss;
        if (myPlayer.activeBuffs.some(buff => buff.effect === 'damage_boost')) {
            const boostBuff = myPlayer.activeBuffs.find(buff => buff.effect === 'damage_boost');
            finalDmgToBoss = Math.floor(actualDmgToBoss * boostBuff.value);
        }
        
        // Aplicar daño
        boss.currentHp -= finalDmgToBoss;
        myPlayer.hp -= actualDmgToPlayer;
        
        // Construir mensaje de combate estilo RPG clásico
        let msg = `⚔️ <strong>¡Combate contra ${boss.name} ${boss.elementEmoji || ''}</strong>!<br>`;
        msg += `<span style="color:#ef4444">━━━━━━━━━━━━━━━━━━━━━━</span><br>`;
        
        // Mensaje de daño con icono y color
        msg += `🗡️ Tu ataque (${myPlayer.weapon.elementEmoji || '⚔️'} ${myPlayer.weapon.element || 'Normal'}): <strong style="color:#fbbf24">${finalDmgToBoss}</strong> de daño`;
        
        if (elementEffect) {
            msg += `<br><span style="color:${elementEffect.color}"><strong>${elementEffect.text}</strong></span> (${myPlayer.weapon.element} vs ${boss.element})`;
        }
        msg += '<br>';
        
        msg += `💥 Contraataque: <strong style="color:#ef4444">${actualDmgToPlayer}</strong> de daño recibido<br>`;
        msg += `<span style="color:#ef4444">━━━━━━━━━━━━━━━━━━━━━━</span><br>`;
        
        // Verificar muerte del jugador
        if (myPlayer.hp <= 0) {
            myPlayer.hp = 1;
            msg += `<br>☠️ <strong>¡Has sido derrotado!</strong><br>`;
            msg += 'Te has teleportado fuera de la mazmorra con 1 HP.<br>';
            msg += 'El jefe permanece activo para otros jugadores.';
            addMessage(msg);
            saveProgress();
            return;
        }
        
        // Verificar muerte del jefe
        if (boss.currentHp <= 0) {
            // ¡Jefe derrotado!
            worldState.bossDefeatedCount++;
            
            // Recompensas
            myPlayer.gold += boss.goldReward;
            myPlayer.exp += boss.expReward;
            
            msg += `<br>🎉 <strong>¡JEFE DERROTADO!</strong><br>`;
            msg += `💎 +${boss.goldReward} Cristales<br>`;
            msg += `✨ +${boss.expReward} Esencia<br>`;
            
            // Drop de item
            if (Math.random() < boss.dropChance) {
                const isWeapon = Math.random() < 0.5;
                const pool = isWeapon ? possibleWeapons : possibleArmors;
                const filteredPool = pool.filter(item => 
                    item.tier === boss.tier || 
                    (item.tier === 'epico' && boss.tier === 'legendario') ||
                    (item.tier === 'raro' && boss.tier === 'epico')
                );
                
                let dropItem;
                if (filteredPool.length > 0) {
                    dropItem = {...filteredPool[Math.floor(Math.random() * filteredPool.length)]};
                } else {
                    dropItem = {...pool[Math.floor(Math.random() * pool.length)]};
                }
                
                // Asignar elemento al drop del jefe
                assignElementToItem(dropItem);
                
                // Verificar límite de inventario para drop de jefe
                if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
                    msg += `<br>🎒 <strong>¡Mochila llena!</strong><br>`;
                    msg += `Perdiste el item legendario por no tener espacio.`;
                } else {
                    myPlayer.inventory.push(dropItem);
                    const tierColor = getTierColor(dropItem.tier);
                    const tierName = getTierName(dropItem.tier);
                    const icon = getItemIcon(dropItem);
                    const type = dropItem.atk !== undefined ? '⚔️' : '🛡️';
                    const bonus = dropItem.atk !== undefined ? `+${dropItem.atk} Ataque` : `+${dropItem.def} Defensa`;
                    
                    msg += `<br>🎁 <strong>¡DROP LEGENDARIO!</strong><br>`;
                    msg += `${icon} <span style="color:${tierColor}">${type} ${dropItem.name}</span> [${tierName}] ${dropItem.elementEmoji} - ${bonus}`;
                }
            }
            
            // Notificación mundial
            if (isWebxdc) {
                safeSendUpdate(
                    { type: 'boss_defeated', boss: boss.name, player: myPlayer.name, level: boss.level },
                    `${myPlayer.name} derrotó a ${boss.name}`,
                    `👹 Jefe derrotado!`
                );
            }
            
            // Limpiar jefe
            worldState.currentBoss = null;
            
            // Check level up
            if (myPlayer.exp >= myPlayer.expMax) {
                const newLevel = myPlayer.level + 1;
                const isMilestone = (newLevel % 5 === 0);
                myPlayer.level = newLevel;
                myPlayer.exp = 0;
                myPlayer.expMax = Math.floor(myPlayer.expMax * 1.55);
                levelUpStats(isMilestone);
                const milestoneMsg = isMilestone ? '<br><strong>¡Hito alcanzado!</strong>' : '';
                msg += `<br>🌟 <strong>¡Ascensión!</strong> Nivel ${myPlayer.level}${milestoneMsg}`;
            }
            
            addMessage(msg);
            saveProgress();
            return;
        }
        
        // Jefe aún vivo
        const hpPercent = Math.floor((boss.currentHp / boss.maxHp) * 100);
        const hpBar = '█'.repeat(Math.floor(hpPercent / 10)) + '░'.repeat(10 - Math.floor(hpPercent / 10));
        
        msg += `<br>❤️ <strong>Salud del jefe:</strong> [${hpBar}] ${hpPercent}%<br>`;
        msg += `❤️ <strong>Tu vida:</strong> ${myPlayer.hp}/${myPlayer.maxHp}<br><br>`;
        msg += '<em>Continúa atacando con /raid attack</em>';
        
        // Contribuir al evento mundial
        contributeToEvent(1000, addMessage, safeSendUpdate, isWebxdc);
        
        addMessage(msg);
        saveProgress();
        return;
    }
    
    addMessage('❌ Comando de raid no reconocido. Usa:<br>' +
              '/raid attack — Atacar al jefe<br>' +
              '/raid info — Ver información<br>' +
              '/raid flee — Huir del raid');
}

/**
 * Genera un nuevo jefe de mazmorra
 */
function spawnBoss(addMessage, safeSendUpdate, isWebxdc) {
    // Seleccionar boss basado en nivel promedio de jugadores (simplificado: nivel del jugador actual)
    const eligibleBosses = dungeonBosses.filter(b => myPlayer.level >= b.level - 5);
    
    let boss;
    if (eligibleBosses.length > 0) {
        boss = {...eligibleBosses[Math.floor(Math.random() * eligibleBosses.length)]};
    } else {
        boss = {...dungeonBosses[0]}; // Boss más débil por defecto
    }
    
    boss.currentHp = boss.hp;
    boss.maxHp = boss.hp;
    
    worldState.currentBoss = boss;
    
    addMessage(`🚨 <strong>¡ALERTA MUNDIAL!</strong><br>` +
              `👹 <strong>${boss.name}</strong> ha aparecido en las mazmorras!<br>` +
              `<em>"${boss.description}"</em><br><br>` +
              `Nivel requerido: ${Math.max(1, boss.level - 5)}+<br>` +
              `Usa /boss para ver detalles y /raid attack para combatir.`);
    
    if (isWebxdc) {
        safeSendUpdate(
            { type: 'boss_spawned', boss: boss.name, level: boss.level },
            `${boss.name} ha aparecido!`,
            `👹 ¡Jefe Mundial!`
        );
    }
}

/**
 * Muestra el estado del evento mundial actual
 */
function processWorldEvent(addMessage) {
    if (!worldState.worldEvent) {
        addMessage('🌍 <strong>No hay eventos mundiales activos</strong><br>' +
                  'Los eventos se activan aleatoriamente y todos los jugadores pueden contribuir.<br>' +
                  'Participa en mazmorras y raids para ayudar cuando haya un evento activo.');
        return;
    }
    
    const event = worldState.worldEvent;
    const progressPercent = Math.floor((worldState.eventProgress / worldState.eventTarget) * 100);
    const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
    
    let msg = `🌟 <strong>Evento Mundial: ${event.name}</strong><br>`;
    msg += `<em>"${event.description}"</em><br><br>`;
    msg += `📊 <strong>Progreso:</strong> [${progressBar}] ${worldState.eventProgress}/${worldState.eventTarget} (${progressPercent}%)<br>`;
    msg += `⏱️ <strong>Duración:</strong> ${event.durationMinutes} minutos<br>`;
    msg += `✨ <strong>Multiplicador:</strong> x${event.rewardMultiplier} recompensas<br><br>`;
    msg += '<strong>Cómo contribuir:</strong><br>';
    msg += '• Completa mazmorras (/dungeon)<br>';
    msg += '• Derrota jefes (/raid attack)<br>';
    msg += '• Explora tierras (/quest)<br><br>';
    msg += '¡Todos los jugadores contribuyen al mismo objetivo global!';
    
    addMessage(msg);
}

/**
 * Contribuye al progreso del evento mundial
 */
function contributeToEvent(amount, addMessage, safeSendUpdate, isWebxdc) {
    // Verificar si el jugador está al borde de la muerte
    if (myPlayer.hp <= 1) {
        addMessage("❌ <strong>¡Estás gravemente herido!</strong><br>" +
                  "Con solo 1 HP no puedes contribuir al evento mundial. Usa /rest para recuperarte.");
        return;
    }
    
    if (!worldState.worldEvent) return;
    
    worldState.eventProgress += amount;
    
    // Verificar si el evento ha completado
    if (worldState.eventProgress >= worldState.eventTarget) {
        completeWorldEvent(addMessage, safeSendUpdate, isWebxdc);
    }
}

/**
 * Completa el evento mundial y distribuye recompensas
 */
function completeWorldEvent(addMessage, safeSendUpdate, isWebxdc) {
    const event = worldState.worldEvent;
    
    addMessage(`🎉 <strong>¡EVENTO MUNDIAL COMPLETADO!</strong><br>` +
              `✨ ${event.name} ha terminado exitosamente.<br>` +
              `Todos los jugadores reciben recompensas especiales!`);
    
    // Dar recompensa basada en participación (simplificado: todos reciben algo)
    const rewardType = Math.random() < 0.5 ? 'common' : 'rare';
    const reward = {...eventRewards[event.eventType][rewardType]};
    
    // Verificar límite de inventario para recompensa de evento
    if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
        addMessage(`🎒 <strong>¡Mochila llena!</strong><br>` +
                  `Perdiste la recompensa del evento por no tener espacio.`);
    } else {
        myPlayer.inventory.push(reward);
        
        const tierColor = getTierColor(reward.tier);
        const tierName = getTierName(reward.tier);
        const type = reward.atk !== undefined ? '⚔️' : '🛡️';
        const bonus = reward.atk !== undefined ? `+${reward.atk} Ataque` : `+${reward.def} Defensa`;
        
        addMessage(`<br>🎁 <strong>Recompensa de Evento:</strong><br>` +
                  `<span style="color:${tierColor}">${type} ${reward.name}</span> [${tierName}] - ${bonus}`);
    }
    
    if (isWebxdc) {
        safeSendUpdate(
            { type: 'event_completed', event: event.name, reward: reward.name },
            `Evento ${event.name} completado!`,
            `🎉 ¡Victoria Global!`
        );
    }
    
    // Limpiar evento
    worldState.worldEvent = null;
    worldState.eventProgress = 0;
    
    // Programar próximo evento (simulado)
    scheduleNextEvent();
}

/**
 * Programa el próximo evento mundial (simulado)
 */
function scheduleNextEvent() {
    // En una implementación real, esto usaría timers o sincronización webxdc
    // Aquí simplemente establecemos un nuevo evento aleatorio después de un tiempo
    setTimeout(() => {
        const randomEvent = {...worldEvents[Math.floor(Math.random() * worldEvents.length)]};
        worldState.worldEvent = randomEvent;
        worldState.eventProgress = 0;
        worldState.eventTarget = randomEvent.targetContribution;
    }, 300000); // 5 minutos para demo
}

/**
 * Inicia un evento mundial aleatorio
 */
export function startRandomWorldEvent() {
    const randomEvent = {...worldEvents[Math.floor(Math.random() * worldEvents.length)]};
    worldState.worldEvent = randomEvent;
    worldState.eventProgress = 0;
    worldState.eventTarget = randomEvent.targetContribution;
}

// Getters y setters para acceso externo
export function getPlayer() {
    return myPlayer;
}

export function setPlayer(player) {
    myPlayer = player;
}

export function getWorldState() {
    return worldState;
}

export function setWorldState(state) {
    worldState = state;
}

export function isGameStarted() {
    return gameStarted;
}

export function setGameStarted(started) {
    gameStarted = started;
}

export function getCurrentMerchant() {
    return currentMerchant;
}

export function setCurrentMerchant(merchant) {
    currentMerchant = merchant;
}

/**
 * Procesa la fusión de 3 items del mismo tier
 */
function processFusion(cmd, addMessage) {
    const parts = cmd.trim().split(/\s+/);
    
    if (parts.length !== 4) {
        addMessage('❌ <strong>Uso incorrecto:</strong><br>/fuse N1 N2 N3<br>Fusiona 3 items del mismo tier para crear uno de tier superior.');
        return;
    }
    
    const indices = [parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3])].sort((a, b) => a - b);
    
    // Validar índices
    for (let idx of indices) {
        if (isNaN(idx) || idx < 1 || idx > myPlayer.inventory.length) {
            addMessage(`❌ Índice inválido: ${idx}. El inventario tiene ${myPlayer.inventory.length} items.`);
            return;
        }
    }
    
    // Verificar que no haya índices repetidos
    if (indices[0] === indices[1] || indices[1] === indices[2]) {
        addMessage('❌ Debes seleccionar 3 items diferentes.');
        return;
    }
    
    // Obtener los items
    const item1 = myPlayer.inventory[indices[0] - 1];
    const item2 = myPlayer.inventory[indices[1] - 1];
    const item3 = myPlayer.inventory[indices[2] - 1];
    
    // Verificar que sean del mismo tier
    if (item1.tier !== item2.tier || item2.tier !== item3.tier) {
        addMessage('❌ Los 3 items deben ser del mismo tier para fusionarlos.');
        return;
    }
    
    // Determinar receta de fusión
    let recipe = null;
    if (item1.tier === 'comun') recipe = FUSION_RECIPES.comun_to_poco_comun;
    else if (item1.tier === 'poco-comun') recipe = FUSION_RECIPES.poco_comun_to_raro;
    else if (item1.tier === 'raro') recipe = FUSION_RECIPES.raro_to_epico;
    else if (item1.tier === 'epico') recipe = FUSION_RECIPES.epico_to_legendario;
    else {
        addMessage('❌ No se pueden fusionar items legendarios (ya son el tier máximo).');
        return;
    }
    
    // Verificar espacio en inventario después de la fusión
    // Se eliminan 3 items y se añade 1 = -2 slots netos, siempre hay espacio
    
    // Eliminar los items del inventario (en orden inverso para no afectar índices)
    myPlayer.inventory.splice(indices[2] - 1, 1);
    myPlayer.inventory.splice(indices[1] - 1, 1);
    myPlayer.inventory.splice(indices[0] - 1, 1);
    
    // Intentar fusión
    const success = Math.random() < recipe.successRate;
    const tierName = getTierName(item1.tier);
    const nextTierName = getTierName(recipe.resultTier);
    
    if (success) {
        // Crear item de tier superior
        const isWeapon = item1.atk !== undefined;
        const pool = isWeapon ? possibleWeapons : possibleArmors;
        const filteredPool = pool.filter(item => 
            item.tier === recipe.resultTier && 
            item.minLevel <= myPlayer.level + 5
        );
        
        if (filteredPool.length > 0) {
            const newItem = {...filteredPool[Math.floor(Math.random() * filteredPool.length)]};
            myPlayer.inventory.push(newItem);
            const tierColor = getTierColor(newItem.tier);
            const bonus = newItem.atk !== undefined ? `+${newItem.atk} Ataque` : `+${newItem.def} Defensa`;
            addMessage(`✨ <strong>¡Fusión Exitosa!</strong><br>` +
                      `3 items [${tierName}] → <span style="color:${tierColor}">${newItem.name}</span> [${nextTierName}]<br>` +
                      `${bonus}`);
        } else {
            // Si no hay items disponibles, devolver esencia
            const essenceRefund = DISENCHANT_VALUES[item1.tier] * 3;
            myPlayer.essence += essenceRefund;
            addMessage(`✨ <strong>¡Fusión Exitosa!</strong><br>` +
                      `Obtuviste ${essenceRefund} de Esencia Mágica (no hay items de ${nextTierName} disponibles para tu nivel).`);
        }
    } else {
        // Fusión fallida - devolver algo de esencia
        const essenceRefund = Math.floor(DISENCHANT_VALUES[item1.tier] * 1.5);
        myPlayer.essence += essenceRefund;
        addMessage(`💥 <strong>Fusión Fallida</strong><br>` +
                  `Los items se destruyeron pero recuperaste ${essenceRefund} de Esencia Mágica.<br>` +
                  `Probabilidad de éxito: ${(recipe.successRate * 100).toFixed(0)}%`);
    }
}

/**
 * Procesa el desencantamiento de un item
 */
function processDisenchant(cmd, addMessage) {
    const parts = cmd.trim().split(/\s+/);
    
    if (parts.length !== 2) {
        addMessage('❌ <strong>Uso incorrecto:</strong><br>/disenchant N<br>Destruye un item para obtener esencia mágica.');
        return;
    }
    
    const idx = parseInt(parts[1]);
    
    if (isNaN(idx) || idx < 1 || idx > myPlayer.inventory.length) {
        addMessage(`❌ Índice inválido: ${idx}. El inventario tiene ${myPlayer.inventory.length} items.`);
        return;
    }
    
    const item = myPlayer.inventory[idx - 1];
    const essenceGain = DISENCHANT_VALUES[item.tier];
    const tierName = getTierName(item.tier);
    const tierColor = getTierColor(item.tier);
    
    // Remover item y añadir esencia
    myPlayer.inventory.splice(idx - 1, 1);
    myPlayer.essence += essenceGain;
    
    addMessage(`🔮 <strong>Item Desencantado</strong><br>` +
              `<span style="color:${tierColor}">${item.name}</span> [${tierName}] → ✨ +${essenceGain} Esencia Mágica`);
}

/**
 * Muestra las recetas de crafteo disponibles
 */
function showCraftingRecipes(addMessage) {
    let msg = '⚒️ <strong>Recetas de Crafteo Disponibles</strong><br>';
    msg += `✨ Tu Esencia Mágica: <strong>${myPlayer.essence}</strong><br><br>`;
    
    for (const [key, recipe] of Object.entries(CRAFTING_RECIPES)) {
        const canAfford = myPlayer.essence >= recipe.cost.essence && myPlayer.gold >= recipe.cost.gold;
        const status = canAfford ? '✅' : '❌';
        
        msg += `${status} <strong>${recipe.name}</strong><br>`;
        msg += `   ${recipe.description}<br>`;
        msg += `   Costo: ✨ ${recipe.cost.essence} Esencia + 💎 ${recipe.cost.gold} Cristales<br>`;
        msg += `   Comando: /craft ${key}<br><br>`;
    }
    
    msg += '<em>Nota: Los consumibles ocupan 1 slot de inventario.</em>';
    addMessage(msg);
}

/**
 * Procesa el crafteo de un item
 */
function processCrafting(cmd, addMessage) {
    const parts = cmd.trim().split(/\s+/);
    
    if (parts.length !== 2) {
        addMessage('❌ <strong>Uso incorrecto:</strong><br>/craft [receta]<br>Usa /craft para ver recetas disponibles.');
        return;
    }
    
    const recipeKey = parts[1];
    const recipe = CRAFTING_RECIPES[recipeKey];
    
    if (!recipe) {
        addMessage('❌ Receta no encontrada. Usa /craft para ver las disponibles.');
        return;
    }
    
    // Verificar recursos
    if (myPlayer.essence < recipe.cost.essence) {
        addMessage(`❌ No tienes suficiente Esencia Mágica. Necesitas ${recipe.cost.essence}, tienes ${myPlayer.essence}.`);
        return;
    }
    
    if (myPlayer.gold < recipe.cost.gold) {
        addMessage(`❌ No tienes suficientes Cristales. Necesitas ${recipe.cost.gold}, tienes ${myPlayer.gold}.`);
        return;
    }
    
    // Verificar espacio en inventario
    if (myPlayer.inventory.length >= MAX_INVENTORY_SIZE) {
        addMessage(`❌ Inventario lleno (${myPlayer.inventory.length}/${MAX_INVENTORY_SIZE}). Libera espacio antes de craftear.`);
        return;
    }
    
    // Consumir recursos
    myPlayer.essence -= recipe.cost.essence;
    myPlayer.gold -= recipe.cost.gold;
    
    // Crear item craftado
    const craftedItem = {
        name: recipe.name,
        type: recipe.type,
        effect: recipe.effect,
        value: recipe.value,
        tier: 'comun',
        minLevel: 1,
        description: recipe.description
    };
    
    if (recipe.duration) {
        craftedItem.duration = recipe.duration;
    }
    
    myPlayer.inventory.push(craftedItem);
    
    addMessage(`⚒️ <strong>¡Item Craftedo!</strong><br>` +
              `${recipe.name}<br>` +
              `${recipe.description}<br>` +
              `Costo: ✨ ${recipe.cost.essence} Esencia + 💎 ${recipe.cost.gold} Cristales`);
}

/**
 * Procesa el uso de un consumible
 */
function processUseItem(cmd, addMessage) {
    const parts = cmd.trim().split(/\s+/);
    
    if (parts.length !== 2) {
        addMessage('❌ <strong>Uso incorrecto:</strong><br>/use N<br>Usa un consumible del inventario.');
        return;
    }
    
    const idx = parseInt(parts[1]);
    
    if (isNaN(idx) || idx < 1 || idx > myPlayer.inventory.length) {
        addMessage(`❌ Índice inválido: ${idx}. El inventario tiene ${myPlayer.inventory.length} items.`);
        return;
    }
    
    const item = myPlayer.inventory[idx - 1];
    
    if (item.type !== 'consumable' && item.type !== 'buff') {
        addMessage('❌ Este item no es un consumible.');
        return;
    }
    
    let used = false;
    
    if (item.effect === 'heal') {
        const healAmount = Math.min(item.value, myPlayer.maxHp - myPlayer.hp);
        if (healAmount <= 0) {
            addMessage('❌ Tu vida ya está llena.');
            return;
        }
        myPlayer.hp += healAmount;
        addMessage(`🧪 <strong>Usaste ${item.name}</strong><br>` +
                  `❤️ Recuperaste ${healAmount} HP<br>` +
                  `Vida actual: ${myPlayer.hp}/${myPlayer.maxHp}`);
        used = true;
    }
    else if (item.effect === 'stamina') {
        const staminaAmount = Math.min(item.value, myPlayer.maxStamina - myPlayer.stamina);
        if (staminaAmount <= 0) {
            addMessage('❌ Tu energía ya está llena.');
            return;
        }
        myPlayer.stamina += staminaAmount;
        addMessage(`🧪 <strong>Usaste ${item.name}</strong><br>` +
                  `⚡ Recuperaste ${staminaAmount} Energía<br>` +
                  `Energía actual: ${myPlayer.stamina}/${myPlayer.maxStamina}`);
        used = true;
    }
    else if (item.effect === 'damage_boost') {
        myPlayer.activeBuffs.push({
            name: item.name,
            multiplier: item.value,
            remaining: item.duration
        });
        addMessage(`🧪 <strong>Usaste ${item.name}</strong><br>` +
                  `⚔️ Daño aumentado en ${(item.value * 100 - 100).toFixed(0)}% por ${item.duration} acciones`);
        used = true;
    }
    
    if (used) {
        // Remover item consumido
        myPlayer.inventory.splice(idx - 1, 1);
    }
}
