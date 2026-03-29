/**
 * Eternal Realms - Sistema de Juego
 * Módulo con la lógica principal del juego, comandos y mecánicas
 */

import { 
    tierConfig, possibleWeapons, possibleArmors, 
    questFlavors, emptyQuestFlavors, merchantNames,
    getTierColor, getTierName, createInitialPlayer, initialWorldState,
    dungeonBosses, worldEvents, eventRewards
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
        processDungeon(addMessage, safeSendUpdate, isWebxdc);
    }
    else if (lower.startsWith('/raid')) {
        processBossRaid(lower, addMessage, safeSendUpdate, isWebxdc);
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
 * Procesa el comando /dungeon con posibilidad de encontrar boss
 */
function processDungeon(addMessage, safeSendUpdate, isWebxdc) {
    if (myPlayer.stamina < 3) {
        addMessage("❌ No tienes suficiente energía para una Mazmorra.");
        return;
    }
    myPlayer.stamina -= 3;
    const dmg = Math.floor(22 + Math.random() * 38);
    myPlayer.hp = Math.max(1, myPlayer.hp - dmg);
    let reward = Math.floor(75 + Math.random() * 125);
    
    // Aplicar multiplicador de evento mundial si está activo
    if (worldState.worldEvent) {
        reward = Math.floor(reward * worldState.worldEvent.rewardMultiplier);
    }
    
    myPlayer.gold += reward;

    addMessage(`🕳️ <strong>Mazmorra explorada</strong><br>❤️ Daño: ${dmg}<br>💎 Recompensa: +${reward} Cristales`);

    // 10% chance de drop normal
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
        
        // Calcular daño del jugador
        const playerDmg = Math.floor(myPlayer.atk * (0.8 + Math.random() * 0.4));
        const bossDmg = Math.floor(boss.atk * (0.7 + Math.random() * 0.3));
        
        // Aplicar defensa
        const actualDmgToBoss = Math.max(1, playerDmg - Math.floor(boss.def * 0.3));
        const actualDmgToPlayer = Math.max(1, bossDmg - Math.floor(myPlayer.def * 0.3));
        
        // Aplicar daño
        boss.currentHp -= actualDmgToBoss;
        myPlayer.hp -= actualDmgToPlayer;
        
        let msg = `⚔️ <strong>¡Combate contra ${boss.name}!</strong><br>`;
        msg += `🗡️ Infliges <strong>${actualDmgToBoss}</strong> de daño<br>`;
        msg += `💥 Recibes <strong>${actualDmgToPlayer}</strong> de daño<br>`;
        
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
                
                myPlayer.inventory.push(dropItem);
                const tierColor = getTierColor(dropItem.tier);
                const tierName = getTierName(dropItem.tier);
                const type = dropItem.atk !== undefined ? '⚔️' : '🛡️';
                const bonus = dropItem.atk !== undefined ? `+${dropItem.atk} Ataque` : `+${dropItem.def} Defensa`;
                
                msg += `<br>🎁 <strong>¡DROP LEGENDARIO!</strong><br>`;
                msg += `<span style="color:${tierColor}">${type} ${dropItem.name}</span> [${tierName}] - ${bonus}`;
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
    myPlayer.inventory.push(reward);
    
    const tierColor = getTierColor(reward.tier);
    const tierName = getTierName(reward.tier);
    const type = reward.atk !== undefined ? '⚔️' : '🛡️';
    const bonus = reward.atk !== undefined ? `+${reward.atk} Ataque` : `+${reward.def} Defensa`;
    
    addMessage(`<br>🎁 <strong>Recompensa de Evento:</strong><br>` +
              `<span style="color:${tierColor}">${type} ${reward.name}</span> [${tierName}] - ${bonus}`);
    
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
