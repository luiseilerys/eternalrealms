/**
 * Eternal Realms - Sistema de Juego
 * Módulo con la lógica principal del juego, comandos y mecánicas
 */

import { 
    tierConfig, possibleWeapons, possibleArmors, 
    questFlavors, emptyQuestFlavors, merchantNames,
    getTierColor, getTierName, createInitialPlayer, initialWorldState
} from './config.js';

// Estado del jugador
let myPlayer = createInitialPlayer();

// Estado del mundo
let worldState = { ...initialWorldState };

// Estado del juego
let gameStarted = false;
let currentMerchant = null;

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
    let msg = '🛡️ <strong>Equipo actual</strong><br>';
    const weaponTierName = getTierName(myPlayer.weapon.tier);
    const armorTierName = getTierName(myPlayer.armor.tier);
    
    msg += `⚔️ Arma: <span style="color:${getTierColor(myPlayer.weapon.tier)}">${myPlayer.weapon.name}</span> [${weaponTierName}] (+${myPlayer.weapon.atk} Ataque)<br>`;
    msg += `🛡️ Armadura: <span style="color:${getTierColor(myPlayer.armor.tier)}">${myPlayer.armor.name}</span> [${armorTierName}] (+${myPlayer.armor.def} Defensa)<br><br>`;
    
    if (myPlayer.inventory.length === 0) {
        msg += '<em>Inventario vacío</em>';
    } else {
        msg += '🎒 <strong>Inventario:</strong><br>';
        myPlayer.inventory.forEach((item, i) => {
            const type = item.atk !== undefined ? '⚔️' : '🛡️';
            const bonus = item.atk !== undefined ? `+${item.atk} Ataque` : `+${item.def} Defensa`;
            const tierColor = getTierColor(item.tier);
            const tierName = getTierName(item.tier);
            const canEquip = myPlayer.level >= item.minLevel;
            
            msg += `${i+1}. <span style="color:${tierColor}">${type} ${item.name}</span> [${tierName}] - ${bonus}`;
            msg += canEquip ? '' : ` | <em style="color:#ef4444">(Nvl ${item.minLevel} requerido)</em>`;
            msg += '<br>';
        });
    }
    
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
        processQuest(addMessage, safeSendUpdate, isWebxdc);
    }
    else if (lower === '/dungeon') {
        processDungeon(addMessage);
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
                  '/rest — Descansar completamente<br>' +
                  '/equip — Ver equipo e inventario<br>' +
                  '/equip N — Equipar ítem número N<br>' +
                  '/merchant — Ver mercader actual<br>' +
                  '/buy N — Comprar ítem del mercader<br>' +
                  '/world — Ver estado global<br>' +
                  '/help — Esta ayuda<br><br>' +
                  '<strong>Sistema de Tiers:</strong><br>' +
                  '<span style="color:#94a3b8">⚪ Común</span> | ' +
                  '<span style="color:#22c55e">🟢 Poco Común</span> | ' +
                  '<span style="color:#3b82f6">🔵 Raro</span> | ' +
                  '<span style="color:#a855f7">🟣 Épico</span> | ' +
                  '<span style="color:#f59e0b">🟠 Legendario</span>');
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
            if (Math.random() < 0.55) {
                const newWeapon = {...possibleWeapons[Math.floor(Math.random() * possibleWeapons.length)]};
                myPlayer.inventory.push(newWeapon);
                const tierColor = getTierColor(newWeapon.tier);
                const tierName = getTierName(newWeapon.tier);
                addMessage(`⚔️ ¡Encontraste un arma! <span style="color:${tierColor}"><strong>${newWeapon.name}</strong></span> [${tierName}] (+${newWeapon.atk} Ataque)`);
            } else {
                const newArmor = {...possibleArmors[Math.floor(Math.random() * possibleArmors.length)]};
                myPlayer.inventory.push(newArmor);
                const tierColor = getTierColor(newArmor.tier);
                const tierName = getTierName(newArmor.tier);
                addMessage(`🛡️ ¡Encontraste una armadura! <span style="color:${tierColor}"><strong>${newArmor.name}</strong></span> [${tierName}] (+${newArmor.def} Defensa)`);
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
 * Procesa el comando /dungeon
 */
function processDungeon(addMessage) {
    if (myPlayer.stamina < 3) {
        addMessage("❌ No tienes suficiente energía para una Mazmorra.");
        return;
    }
    myPlayer.stamina -= 3;
    const dmg = Math.floor(22 + Math.random() * 38);
    myPlayer.hp = Math.max(1, myPlayer.hp - dmg);
    const reward = Math.floor(75 + Math.random() * 125);
    myPlayer.gold += reward;

    addMessage(`🕳️ <strong>Mazmorra explorada</strong><br>❤️ Daño: ${dmg}<br>💎 Recompensa: +${reward} Cristales`);

    // 10% chance de drop
    if (Math.random() < 0.10) {
        if (Math.random() < 0.5) {
            const newWeapon = {...possibleWeapons[Math.floor(Math.random() * possibleWeapons.length)]};
            myPlayer.inventory.push(newWeapon);
            const tierColor = getTierColor(newWeapon.tier);
            const tierName = getTierName(newWeapon.tier);
            addMessage(`⚔️ ¡Encontraste un arma en la mazmorra! <span style="color:${tierColor}"><strong>${newWeapon.name}</strong></span> [${tierName}]`);
        } else {
            const newArmor = {...possibleArmors[Math.floor(Math.random() * possibleArmors.length)]};
            myPlayer.inventory.push(newArmor);
            const tierColor = getTierColor(newArmor.tier);
            const tierName = getTierName(newArmor.tier);
            addMessage(`🛡️ ¡Encontraste una armadura en la mazmorra! <span style="color:${tierColor}"><strong>${newArmor.name}</strong></span> [${tierName}]`);
        }
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
