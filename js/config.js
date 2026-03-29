/**
 * Eternal Realms - Configuración y Datos del Juego
 * Módulo de configuración con constantes, datos de items y configuraciones
 */

// Configuración de Elementos y Sistema de Combate
export const ELEMENTS = {
    FIRE: { name: 'Fuego', emoji: '🔥', color: '#ef4444' },
    WATER: { name: 'Agua', emoji: '💧', color: '#3b82f6' },
    EARTH: { name: 'Tierra', emoji: '🌍', color: '#84cc16' },
    AIR: { name: 'Aire', emoji: '💨', color: '#06b6d4' },
    LIGHT: { name: 'Luz', emoji: '✨', color: '#fbbf24' },
    DARK: { name: 'Oscuridad', emoji: '🌑', color: '#7c3aed' },
    VOID: { name: 'Vacío', emoji: '🌌', color: '#4c1d95' }
};

// Tabla de ventajas elementales (atacante vs defensor)
// > 1.5 = ventaja, < 0.75 = desventaja, 1.0 = neutral
export const ELEMENT_CHART = {
    [ELEMENTS.FIRE.name]: {
        [ELEMENTS.FIRE.name]: 1.0,
        [ELEMENTS.WATER.name]: 0.5,
        [ELEMENTS.EARTH.name]: 1.5,
        [ELEMENTS.AIR.name]: 1.5,
        [ELEMENTS.LIGHT.name]: 1.0,
        [ELEMENTS.DARK.name]: 1.0
    },
    [ELEMENTS.WATER.name]: {
        [ELEMENTS.FIRE.name]: 1.5,
        [ELEMENTS.WATER.name]: 1.0,
        [ELEMENTS.EARTH.name]: 0.5,
        [ELEMENTS.AIR.name]: 1.0,
        [ELEMENTS.LIGHT.name]: 1.5,
        [ELEMENTS.DARK.name]: 0.5
    },
    [ELEMENTS.EARTH.name]: {
        [ELEMENTS.FIRE.name]: 0.5,
        [ELEMENTS.WATER.name]: 1.5,
        [ELEMENTS.EARTH.name]: 1.0,
        [ELEMENTS.AIR.name]: 0.5,
        [ELEMENTS.LIGHT.name]: 1.0,
        [ELEMENTS.DARK.name]: 1.5
    },
    [ELEMENTS.AIR.name]: {
        [ELEMENTS.FIRE.name]: 0.5,
        [ELEMENTS.WATER.name]: 1.0,
        [ELEMENTS.EARTH.name]: 1.5,
        [ELEMENTS.AIR.name]: 1.0,
        [ELEMENTS.LIGHT.name]: 1.5,
        [ELEMENTS.DARK.name]: 0.5
    },
    [ELEMENTS.LIGHT.name]: {
        [ELEMENTS.FIRE.name]: 1.0,
        [ELEMENTS.WATER.name]: 0.5,
        [ELEMENTS.EARTH.name]: 1.0,
        [ELEMENTS.AIR.name]: 0.5,
        [ELEMENTS.LIGHT.name]: 1.0,
        [ELEMENTS.DARK.name]: 1.5
    },
    [ELEMENTS.DARK.name]: {
        [ELEMENTS.FIRE.name]: 1.0,
        [ELEMENTS.WATER.name]: 1.5,
        [ELEMENTS.EARTH.name]: 0.5,
        [ELEMENTS.AIR.name]: 1.5,
        [ELEMENTS.LIGHT.name]: 0.5,
        [ELEMENTS.DARK.name]: 1.0
    }
};

// Iconografía para tipos de items
export const ITEM_ICONS = {
    weapon: {
        sword: '⚔️',
        axe: '🪓',
        bow: '🏹',
        staff: '🪄',
        dagger: '🗡️',
        hammer: '🔨',
        default: '⚔️'
    },
    armor: {
        shield: '🛡️',
        chest: '🦺',
        helmet: '🪖',
        robe: '👘',
        default: '🛡️'
    },
    consumable: {
        potion: '🧪',
        scroll: '📜',
        food: '🍖',
        default: '🧪'
    },
    states: {
        hp: '❤️',
        energy: '⚡',
        mana: '✨',
        gold: '🪙',
        xp: '🏆',
        essence: '💎',
        level: '⭐'
    }
};

// Mapeo de nombres de items a iconos
export function getItemIcon(item) {
    const name = item.name.toLowerCase();
    
    // Determinar tipo
    if (item.atk !== undefined) {
        // Es arma
        if (name.includes('espada') || name.includes('blade') || name.includes('hoja')) return ITEM_ICONS.weapon.sword;
        if (name.includes('hacha') || name.includes('axe')) return ITEM_ICONS.weapon.axe;
        if (name.includes('arco') || name.includes('bow')) return ITEM_ICONS.weapon.bow;
        if (name.includes('bastón') || name.includes('staff')) return ITEM_ICONS.weapon.staff;
        if (name.includes('daga') || name.includes('dagger')) return ITEM_ICONS.weapon.dagger;
        if (name.includes('martillo') || name.includes('hammer')) return ITEM_ICONS.weapon.hammer;
        return ITEM_ICONS.weapon.default;
    } else if (item.def !== undefined) {
        // Es armadura
        if (name.includes('escudo') || name.includes('shield')) return ITEM_ICONS.armor.shield;
        if (name.includes('coraza') || name.includes('placa') || name.includes('chest')) return ITEM_ICONS.armor.chest;
        if (name.includes('yelmo') || name.includes('casco') || name.includes('helm')) return ITEM_ICONS.armor.helmet;
        if (name.includes('túnica') || name.includes('manto') || name.includes('robe')) return ITEM_ICONS.armor.robe;
        return ITEM_ICONS.armor.default;
    } else if (item.type === 'consumable') {
        if (item.effect === 'heal' || name.includes('poción')) return ITEM_ICONS.consumable.potion;
        if (name.includes('pergamino') || name.includes('scroll')) return ITEM_ICONS.consumable.scroll;
        return ITEM_ICONS.consumable.default;
    }
    
    return '📦';
}

// Asignar elemento aleatorio a un item
export function assignElementToItem(item) {
    const elementKeys = Object.keys(ELEMENTS);
    const randomElement = elementKeys[Math.floor(Math.random() * elementKeys.length)];
    item.element = ELEMENTS[randomElement].name;
    item.elementEmoji = ELEMENTS[randomElement].emoji;
    return item;
}

// Calcular multiplicador elemental
export function getElementMultiplier(attackerElement, defenderElement) {
    if (!attackerElement || !defenderElement) return 1.0;
    return ELEMENT_CHART[attackerElement]?.[defenderElement] || 1.0;
}

// Obtener texto de ventaja/desventaja elemental
export function getElementEffectText(multiplier) {
    if (multiplier >= 1.5) return { text: '¡SUPER EFECTIVO!', color: '#fbbf24', bold: true };
    if (multiplier <= 0.5) return { text: 'Poco efectivo...', color: '#94a3b8', bold: false };
    return null;
}

// Configuración del juego
export const MAX_INVENTORY_SIZE = 10; // Límite máximo de objetos en inventario

// Configuración de Crafteo y Fusión
export const FUSION_RECIPES = {
    // Fusión de 3 items del mismo tier para crear uno de tier superior
    comun_to_poco_comun: { resultTier: 'poco-comun', successRate: 0.8, materialCount: 3 },
    poco_comun_to_raro: { resultTier: 'raro', successRate: 0.7, materialCount: 3 },
    raro_to_epico: { resultTier: 'epico', successRate: 0.6, materialCount: 3 },
    epico_to_legendario: { resultTier: 'legendario', successRate: 0.5, materialCount: 3 }
};

export const DISENCHANT_VALUES = {
    comun: 5,
    'poco-comun': 15,
    raro: 40,
    epico: 100,
    legendario: 250
};

export const CRAFTING_RECIPES = {
    // Pociones básicas
    'health_potion_small': {
        name: 'Poción de Vida Menor',
        type: 'consumable',
        effect: 'heal',
        value: 50,
        cost: { essence: 100, gold: 50 },
        description: 'Restaura 50 HP instantáneamente'
    },
    'health_potion_large': {
        name: 'Poción de Vida Mayor',
        type: 'consumable',
        effect: 'heal',
        value: 150,
        cost: { essence: 300, gold: 150 },
        description: 'Restaura 150 HP instantáneamente'
    },
    'stamina_potion': {
        name: 'Poción de Energía',
        type: 'consumable',
        effect: 'stamina',
        value: 10,
        cost: { essence: 150, gold: 75 },
        description: 'Restaura 10 puntos de energía'
    },
    'damage_boost': {
        name: 'Elixir de Fuerza',
        type: 'buff',
        effect: 'damage_boost',
        value: 1.2,
        duration: 5, // número de acciones
        cost: { essence: 200, gold: 100 },
        description: 'Aumenta el daño en 20% por 5 acciones'
    }
};

// Configuración de Reinos
export const realms = ["Aetherion", "Sylvandar"];

// Configuración de Tiers
export const tierConfig = {
    comun: { name: "Común", color: "#94a3b8", mult: 1.0 },
    "poco-comun": { name: "Poco Común", color: "#22c55e", mult: 1.5 },
    raro: { name: "Raro", color: "#3b82f6", mult: 2.2 },
    epico: { name: "Épico", color: "#a855f7", mult: 3.5 },
    legendario: { name: "Legendario", color: "#f59e0b", mult: 5.0 }
};

// Armas disponibles - 90 armas únicas con diversidad elemental
export const possibleWeapons = [
    // Nivel 1-10: Básicas
    { name: "Daga Oxidada", atk: 2, tier: "comun", minLevel: 1, price: 30 },
    { name: "Espada de Madera", atk: 3, tier: "comun", minLevel: 1, price: 40 },
    { name: "Bastón Novato", atk: 4, tier: "comun", minLevel: 1, price: 50 },
    { name: "Hacha de Piedra", atk: 5, tier: "comun", minLevel: 2, price: 60 },
    { name: "Arco de Cazador", atk: 6, tier: "comun", minLevel: 3, price: 75 },
    { name: "Martillo de Hierro", atk: 7, tier: "comun", minLevel: 4, price: 85 },
    { name: "Lanza de Soldado", atk: 8, tier: "comun", minLevel: 5, price: 95 },
    { name: "Guadaña Pequeña", atk: 9, tier: "comun", minLevel: 6, price: 105 },
    { name: "Cetro de Aprendiz", atk: 10, tier: "comun", minLevel: 7, price: 115 },
    { name: "Daga de Sombra", atk: 11, tier: "poco-comun", minLevel: 8, price: 130 },
    
    // Nivel 8-15: Poco Comunes
    { name: "Espada Rúnica", atk: 13, tier: "poco-comun", minLevel: 8, price: 150 },
    { name: "Arco de Viento", atk: 14, tier: "poco-comun", minLevel: 9, price: 165 },
    { name: "Martillo de Trueno", atk: 15, tier: "poco-comun", minLevel: 10, price: 180 },
    { name: "Hacha de Batalla", atk: 16, tier: "poco-comun", minLevel: 11, price: 195 },
    { name: "Lanza de Acero", atk: 17, tier: "poco-comun", minLevel: 12, price: 210 },
    { name: "Bastón de Roble", atk: 18, tier: "poco-comun", minLevel: 13, price: 225 },
    { name: "Daga Venenosa", atk: 19, tier: "poco-comun", minLevel: 14, price: 240 },
    { name: "Espada Corta", atk: 20, tier: "poco-comun", minLevel: 15, price: 255 },
    
    // Nivel 15-25: Raras
    { name: "Cuchilla Obsidiana", atk: 24, tier: "raro", minLevel: 15, price: 350 },
    { name: "Bastón de Cristal", atk: 26, tier: "raro", minLevel: 16, price: 380 },
    { name: "Espada de Fuego", atk: 28, tier: "raro", minLevel: 17, price: 410 },
    { name: "Arco de Hielo", atk: 30, tier: "raro", minLevel: 18, price: 440 },
    { name: "Martillo Sísmico", atk: 32, tier: "raro", minLevel: 19, price: 470 },
    { name: "Hacha de Mithril", atk: 34, tier: "raro", minLevel: 20, price: 500 },
    { name: "Lanza del Dragón", atk: 36, tier: "raro", minLevel: 21, price: 530 },
    { name: "Guadaña Lunar", atk: 38, tier: "raro", minLevel: 22, price: 560 },
    { name: "Cetro Solar", atk: 40, tier: "raro", minLevel: 23, price: 590 },
    { name: "Daga del Vacío", atk: 42, tier: "raro", minLevel: 24, price: 620 },
    { name: "Espada Fantasma", atk: 44, tier: "raro", minLevel: 25, price: 650 },
    
    // Nivel 25-40: Épicas
    { name: "Hoja del Vacío", atk: 50, tier: "epico", minLevel: 25, price: 800 },
    { name: "Martillo del Titán", atk: 54, tier: "epico", minLevel: 27, price: 880 },
    { name: "Arco Estelar", atk: 58, tier: "epico", minLevel: 29, price: 960 },
    { name: "Bastón Arcano", atk: 62, tier: "epico", minLevel: 31, price: 1040 },
    { name: "Hacha Demoníaca", atk: 66, tier: "epico", minLevel: 33, price: 1120 },
    { name: "Lanza Celestial", atk: 70, tier: "epico", minLevel: 35, price: 1200 },
    { name: "Guadaña del Segador", atk: 74, tier: "epico", minLevel: 37, price: 1280 },
    { name: "Cetro del Rey", atk: 78, tier: "epico", minLevel: 39, price: 1360 },
    { name: "Daga Nocturna", atk: 82, tier: "epico", minLevel: 40, price: 1440 },
    
    // Nivel 40-60: Legendarias
    { name: "Excalibur Eterna", atk: 95, tier: "legendario", minLevel: 40, price: 2500 },
    { name: "Bastón de los Ancianos", atk: 100, tier: "legendario", minLevel: 42, price: 2700 },
    { name: "Guadaña del Alma", atk: 105, tier: "legendario", minLevel: 44, price: 2900 },
    { name: "Arco del Fénix", atk: 110, tier: "legendario", minLevel: 46, price: 3100 },
    { name: "Martillo de Dioses", atk: 115, tier: "legendario", minLevel: 48, price: 3300 },
    { name: "Espada del Caos", atk: 120, tier: "legendario", minLevel: 50, price: 3500 },
    { name: "Hacha del Abismo", atk: 125, tier: "legendario", minLevel: 52, price: 3700 },
    { name: "Lanza Cósmica", atk: 130, tier: "legendario", minLevel: 54, price: 3900 },
    { name: "Cetro Infinito", atk: 135, tier: "legendario", minLevel: 56, price: 4100 },
    { name: "Daga Dimensional", atk: 140, tier: "legendario", minLevel: 58, price: 4300 },
    
    // Nivel 60-80+: Artefactos Únicos
    { name: "Vorpal Blade", atk: 150, tier: "legendario", minLevel: 60, price: 4800 },
    { name: "Staff of Aether", atk: 155, tier: "legendario", minLevel: 62, price: 5000 },
    { name: "Scythe of Death", atk: 160, tier: "legendario", minLevel: 64, price: 5200 },
    { name: "Bow of Apollo", atk: 165, tier: "legendario", minLevel: 66, price: 5400 },
    { name: "Hammer of Thor", atk: 170, tier: "legendario", minLevel: 68, price: 5600 },
    { name: "Sword of Damocles", atk: 175, tier: "legendario", minLevel: 70, price: 5800 },
    { name: "Axe of Perun", atk: 180, tier: "legendario", minLevel: 72, price: 6000 },
    { name: "Spear of Odin", atk: 185, tier: "legendario", minLevel: 74, price: 6200 },
    { name: "Scepter of Ra", atk: 190, tier: "legendario", minLevel: 76, price: 6400 },
    { name: "Dagger of Loki", atk: 195, tier: "legendario", minLevel: 78, price: 6600 },
    { name: "Blade of Eternity", atk: 200, tier: "legendario", minLevel: 80, price: 7000 }
];

// Armaduras disponibles - 45 sets diversificados por clase y elemento
export const possibleArmors = [
    // Nivel 1-10: Básicas
    { name: "Túnica de Lino", def: 2, tier: "comun", minLevel: 1, price: 35 },
    { name: "Cota de Malla Ligera", def: 3, tier: "comun", minLevel: 1, price: 45 },
    { name: "Armadura de Cuero", def: 4, tier: "comun", minLevel: 2, price: 55 },
    { name: "Yelmo de Hierro", def: 5, tier: "comun", minLevel: 3, price: 65 },
    { name: "Botas de Viajero", def: 6, tier: "comun", minLevel: 4, price: 75 },
    { name: "Guanteletes de Cuero", def: 7, tier: "comun", minLevel: 5, price: 85 },
    { name: "Peto Reforzado", def: 8, tier: "comun", minLevel: 6, price: 95 },
    { name: "Casco de Soldado", def: 9, tier: "comun", minLevel: 7, price: 105 },
    { name: "Manto Simple", def: 10, tier: "comun", minLevel: 8, price: 115 },
    { name: "Coraza de Escamas", def: 11, tier: "poco-comun", minLevel: 9, price: 130 },
    
    // Nivel 9-18: Poco Comunes
    { name: "Armadura de Escamas", def: 13, tier: "poco-comun", minLevel: 9, price: 150 },
    { name: "Capa del Guardián", def: 14, tier: "poco-comun", minLevel: 10, price: 165 },
    { name: "Peto de Hierro", def: 15, tier: "poco-comun", minLevel: 11, price: 180 },
    { name: "Yelmo Alado", def: 16, tier: "poco-comun", minLevel: 12, price: 195 },
    { name: "Botas de Velocidad", def: 17, tier: "poco-comun", minLevel: 13, price: 210 },
    { name: "Guanteletes de Acero", def: 18, tier: "poco-comun", minLevel: 14, price: 225 },
    { name: "Túnica Reforzada", def: 19, tier: "poco-comun", minLevel: 15, price: 240 },
    { name: "Casco de Batalla", def: 20, tier: "poco-comun", minLevel: 16, price: 255 },
    { name: "Manto Nocturno", def: 21, tier: "poco-comun", minLevel: 17, price: 270 },
    { name: "Coraza de Mithril", def: 22, tier: "poco-comun", minLevel: 18, price: 285 },
    
    // Nivel 18-30: Raras
    { name: "Armadura de Mithril", def: 26, tier: "raro", minLevel: 18, price: 380 },
    { name: "Túnica Arcana", def: 28, tier: "raro", minLevel: 19, price: 410 },
    { name: "Placas de Dragón", def: 30, tier: "raro", minLevel: 20, price: 440 },
    { name: "Yelmo Real", def: 32, tier: "raro", minLevel: 21, price: 470 },
    { name: "Botas Demoníacas", def: 34, tier: "raro", minLevel: 22, price: 500 },
    { name: "Guanteletes Rúnicos", def: 36, tier: "raro", minLevel: 23, price: 530 },
    { name: "Coraza de Cristal", def: 38, tier: "raro", minLevel: 24, price: 560 },
    { name: "Casco Ancestral", def: 40, tier: "raro", minLevel: 25, price: 590 },
    { name: "Manto Estelar", def: 42, tier: "raro", minLevel: 26, price: 620 },
    { name: "Armadura de Hielo", def: 44, tier: "raro", minLevel: 27, price: 650 },
    { name: "Túnica de Fuego", def: 46, tier: "raro", minLevel: 28, price: 680 },
    { name: "Placas de Trueno", def: 48, tier: "raro", minLevel: 29, price: 710 },
    { name: "Coraza Sombría", def: 50, tier: "raro", minLevel: 30, price: 740 },
    
    // Nivel 30-50: Épicas
    { name: "Armadura del Vacío", def: 58, tier: "epico", minLevel: 30, price: 850 },
    { name: "Manto de las Estrellas", def: 62, tier: "epico", minLevel: 32, price: 920 },
    { name: "Coraza Ancestral", def: 66, tier: "epico", minLevel: 34, price: 990 },
    { name: "Yelmo del Titán", def: 70, tier: "epico", minLevel: 36, price: 1060 },
    { name: "Botas Cósmicas", def: 74, tier: "epico", minLevel: 38, price: 1130 },
    { name: "Guanteletes Divinos", def: 78, tier: "epico", minLevel: 40, price: 1200 },
    { name: "Armadura del Fénix", def: 82, tier: "epico", minLevel: 42, price: 1270 },
    { name: "Túnica del Vacío", def: 86, tier: "epico", minLevel: 44, price: 1340 },
    { name: "Placas del Dragón Anciano", def: 90, tier: "epico", minLevel: 46, price: 1410 },
    { name: "Casco de la Muerte", def: 94, tier: "epico", minLevel: 48, price: 1480 },
    { name: "Manto del Archimago", def: 98, tier: "epico", minLevel: 50, price: 1550 },
    
    // Nivel 50-80+: Legendarias
    { name: "Armadura de los Dioses", def: 110, tier: "legendario", minLevel: 50, price: 2700 },
    { name: "Túnica del Archimago", def: 115, tier: "legendario", minLevel: 52, price: 2900 },
    { name: "Coraza del Dragón Anciano", def: 120, tier: "legendario", minLevel: 54, price: 3100 },
    { name: "Yelmo de Odin", def: 125, tier: "legendario", minLevel: 56, price: 3300 },
    { name: "Botas de Hermes", def: 130, tier: "legendario", minLevel: 58, price: 3500 },
    { name: "Guanteletes de Zeus", def: 135, tier: "legendario", minLevel: 60, price: 3700 },
    { name: "Armadura de Atenea", def: 140, tier: "legendario", minLevel: 62, price: 3900 },
    { name: "Manto de Hades", def: 145, tier: "legendario", minLevel: 64, price: 4100 },
    { name: "Placas de Ares", def: 150, tier: "legendario", minLevel: 66, price: 4300 },
    { name: "Casco de Poseidón", def: 155, tier: "legendario", minLevel: 68, price: 4500 },
    { name: "Coraza Celestial", def: 160, tier: "legendario", minLevel: 70, price: 4800 },
    { name: "Armadura del Vacío Eterno", def: 165, tier: "legendario", minLevel: 72, price: 5000 },
    { name: "Túnica de la Luz Divina", def: 170, tier: "legendario", minLevel: 74, price: 5200 },
    { name: "Placas del Caos Primordial", def: 175, tier: "legendario", minLevel: 76, price: 5400 },
    { name: "Manto de la Eternidad", def: 180, tier: "legendario", minLevel: 78, price: 5600 },
    { name: "Armadura Infinita", def: 185, tier: "legendario", minLevel: 80, price: 6000 }
];

// Textos de misiones exitosas
export const questFlavors = [
    "Caminaste por los bosques etéreos y recolectaste hierbas luminosas.",
    "Encontraste ruinas antiguas cubiertas de runas brillantes.",
    "Ayudaste a un espíritu perdido a encontrar el camino a casa.",
    "Descubriste una fuente de energía ancestral.",
    "Exploraste una cueva oculta llena de cristales flotantes.",
    "Observaste cómo las estrellas caían cerca del horizonte.",
    "Encontraste un campamento abandonado de antiguos guardianes.",
    "Recogiste frutos mágicos en un claro encantado.",
    "Seguiste el rastro de un animal mítico hasta su guarida.",
    "Descubriste un altar olvidado que aún conserva algo de poder."
];

// Textos de misiones fallidas
export const emptyQuestFlavors = [
    "La zona estaba extrañamente silenciosa... no encontraste nada útil.",
    "Solo viento y niebla. Tu búsqueda no dio frutos esta vez.",
    "El terreno era peligroso y decidiste regresar con las manos vacías.",
    "No hallaste ningún recurso valioso en esta exploración.",
    "Todo parecía normal, pero no había recompensa alguna."
];

// Nombres de mercaderes
export const merchantNames = [
    "Thoron el Mercader",
    "Lyra la Comerciante",
    "Grom el Herrero",
    "Elara la Encantadora",
    "Vex el Coleccionista",
    "Mira la Viajera"
];

// Estado inicial del jugador
export function createInitialPlayer() {
    return {
        name: "Elyndor",
        realm: "Aetherion",
        class: "Arcane Weaver",
        level: 1,
        exp: 0,
        expMax: 100,
        gold: 0,
        stamina: 23,
        maxStamina: 23,
        mana: 10,
        maxMana: 10,
        atk: 1,
        def: 1,
        hp: 10,
        maxHp: 10,
        weapon: { name: "Bastón de Novato", atk: 0, tier: "comun", minLevel: 1 },
        armor: { name: "Túnica Gastada", def: 0, tier: "comun", minLevel: 1 },
        inventory: [],
        essence: 0, // Esencia mágica para crafteo
        activeBuffs: [], // Buffs activos temporales
        // Sistema de tiempos de acción
        currentAction: null, // { type: 'quest'|'dungeon'|'raid', endTime: timestamp }
        actionStartTime: 0 // Timestamp cuando inició la acción actual
    };
}

// Estado inicial del mundo
export const initialWorldState = {
    globalEssence: 12480,
    nextConvergence: "2h 45min",
    activeRealms: ["Aetherion", "Sylvandar", "Obsidian Reach"],
    totalGuardians: 1,
    // Estado del Boss Raid actual
    currentBoss: null,
    bossDefeatedCount: 0,
    // Estado del Evento Mundial
    worldEvent: null,
    eventProgress: 0,
    eventTarget: 100000
};

// Jefes de Mazmorra (Boss Raids)
// Jefes de Mazmorra - 12 jefes épicos y mitológicos con elementos únicos
export const dungeonBosses = [
    // Jefes originales (Nivel 10-50)
    {
        name: "Zarathul el Corrupto",
        level: 10,
        hp: 500,
        atk: 25,
        def: 15,
        expReward: 800,
        goldReward: 400,
        dropChance: 0.40,
        description: "Un antiguo hechicero consumido por la oscuridad",
        tier: "raro",
        element: ELEMENTS.DARK.name,
        emoji: "🧙"
    },
    {
        name: "Ignis el Devorador",
        level: 20,
        hp: 1200,
        atk: 45,
        def: 30,
        expReward: 1800,
        goldReward: 900,
        dropChance: 0.50,
        description: "Un dragón de fuego que emerge de las profundidades",
        tier: "epico",
        element: ELEMENTS.FIRE.name,
        emoji: "🐉"
    },
    {
        name: "Malakor el Eterno",
        level: 35,
        hp: 2500,
        atk: 75,
        def: 55,
        expReward: 4000,
        goldReward: 2000,
        dropChance: 0.65,
        description: "Un señor demoníaco que ha conquistado mil reinos",
        tier: "legendario",
        element: ELEMENTS.DARK.name,
        emoji: "👿"
    },
    {
        name: "Vorax el Quebrantamundos",
        level: 50,
        hp: 5000,
        atk: 120,
        def: 90,
        expReward: 8000,
        goldReward: 4500,
        dropChance: 0.75,
        description: "Una entidad cósmica que amenaza con destruir la realidad",
        tier: "legendario",
        element: ELEMENTS.VOID.name,
        emoji: "🌌"
    },
    
    // Nuevos Jefes Épicos (Nivel 5-75)
    {
        name: "Cthulhu el Soñador",
        level: 60,
        hp: 8000,
        atk: 150,
        def: 110,
        expReward: 12000,
        goldReward: 6000,
        dropChance: 0.80,
        description: "El antiguo dios dormido en las profundidades del océano",
        tier: "legendario",
        element: ELEMENTS.WATER.name,
        emoji: "🐙"
    },
    {
        name: "Ragnarok el Lobo Fenrir",
        level: 55,
        hp: 6500,
        atk: 140,
        def: 95,
        expReward: 10000,
        goldReward: 5500,
        dropChance: 0.78,
        description: "El lobo gigante destinado a devorar a los dioses",
        tier: "legendario",
        element: ELEMENTS.ICE.name,
        emoji: "🐺"
    },
    {
        name: "Medusa la Gorgona",
        level: 40,
        hp: 3500,
        atk: 85,
        def: 60,
        expReward: 5500,
        goldReward: 2800,
        dropChance: 0.68,
        description: "Su mirada convierte a los valientes en piedra",
        tier: "epico",
        element: ELEMENTS.POISON.name,
        emoji: "🐍"
    },
    {
        name: "El Rey Licántropo",
        level: 30,
        hp: 2800,
        atk: 70,
        def: 50,
        expReward: 4200,
        goldReward: 2200,
        dropChance: 0.62,
        description: "Se transforma bajo la luna llena para cazar",
        tier: "epico",
        element: ELEMENTS.DARK.name,
        emoji: "🐺"
    },
    {
        name: "Titanus el Colosal",
        level: 65,
        hp: 9500,
        atk: 160,
        def: 130,
        expReward: 14000,
        goldReward: 7000,
        dropChance: 0.82,
        description: "Un gigante de piedra que camina entre montañas",
        tier: "legendario",
        element: ELEMENTS.EARTH.name,
        emoji: "🗿"
    },
    {
        name: "Sylphide Reina del Viento",
        level: 45,
        hp: 4000,
        atk: 95,
        def: 65,
        expReward: 6000,
        goldReward: 3200,
        dropChance: 0.70,
        description: "Espíritu elemental que controla las tormentas",
        tier: "epico",
        element: ELEMENTS.AIR.name,
        emoji: "🌪️"
    },
    {
        name: "Prometheus el Portador",
        level: 70,
        hp: 11000,
        atk: 170,
        def: 120,
        expReward: 16000,
        goldReward: 8000,
        dropChance: 0.85,
        description: "El titán que robó el fuego sagrado de los dioses",
        tier: "legendario",
        element: ELEMENTS.FIRE.name,
        emoji: "🔥"
    },
    {
        name: "Luna la Hechicera",
        level: 25,
        hp: 2000,
        atk: 60,
        def: 40,
        expReward: 3200,
        goldReward: 1700,
        dropChance: 0.58,
        description: "Una bruja poderosa que invoca magia lunar",
        tier: "raro",
        element: ELEMENTS.LIGHT.name,
        emoji: "🌙"
    }
];

// Enemigos de Mazmorra organizados por Bioma - 45 monstruos únicos
export const dungeonEnemies = [
    // BIOMA: BOSQUE (Nivel 1-15)
    { name: "Araña Gigante", level: 2, hp: 30, atk: 8, exp: 15, gold: 10, element: ELEMENTS.POISON.name, emoji: "🕷️", biome: "bosque" },
    { name: "Lobo Feral", level: 3, hp: 40, atk: 10, exp: 20, gold: 12, element: ELEMENTS.EARTH.name, emoji: "🐺", biome: "bosque" },
    { name: "Ent Corrupto", level: 5, hp: 60, atk: 12, exp: 30, gold: 18, element: ELEMENTS.EARTH.name, emoji: "🌳", biome: "bosque" },
    { name: "Dríade Oscura", level: 7, hp: 50, atk: 15, exp: 35, gold: 22, element: ELEMENTS.DARK.name, emoji: "🧚", biome: "bosque" },
    { name: "Oso de las Sombras", level: 9, hp: 80, atk: 18, exp: 45, gold: 28, element: ELEMENTS.DARK.name, emoji: "🐻", biome: "bosque" },
    { name: "Serpiente Venenosa", level: 11, hp: 55, atk: 20, exp: 50, gold: 32, element: ELEMENTS.POISON.name, emoji: "🐍", biome: "bosque" },
    { name: "Golem de Musgo", level: 13, hp: 90, atk: 16, exp: 55, gold: 35, element: ELEMENTS.EARTH.name, emoji: "🗿", biome: "bosque" },
    { name: "Espíritu del Bosque", level: 15, hp: 70, atk: 22, exp: 65, gold: 40, element: ELEMENTS.LIGHT.name, emoji: "✨", biome: "bosque" },
    
    // BIOMA: CUEVA (Nivel 5-20)
    { name: "Murciélago Vampiro", level: 5, hp: 45, atk: 12, exp: 25, gold: 15, element: ELEMENTS.DARK.name, emoji: "🦇", biome: "cueva" },
    { name: "Esqueleto Guerrero", level: 7, hp: 55, atk: 14, exp: 32, gold: 20, element: ELEMENTS.DARK.name, emoji: "💀", biome: "cueva" },
    { name: "Troll de Cueva", level: 10, hp: 100, atk: 20, exp: 55, gold: 35, element: ELEMENTS.EARTH.name, emoji: "🧌", biome: "cueva" },
    { name: "Gárgola de Piedra", level: 12, hp: 85, atk: 22, exp: 60, gold: 40, element: ELEMENTS.EARTH.name, emoji: "🗿", biome: "cueva" },
    { name: "Minero No-Muerto", level: 14, hp: 70, atk: 18, exp: 50, gold: 30, element: ELEMENTS.DARK.name, emoji: "⛏️", biome: "cueva" },
    { name: "Cangrejo Gigante", level: 16, hp: 95, atk: 24, exp: 70, gold: 45, element: ELEMENTS.WATER.name, emoji: "🦀", biome: "cueva" },
    { name: "Elemental de Roca", level: 18, hp: 110, atk: 26, exp: 80, gold: 50, element: ELEMENTS.EARTH.name, emoji: "🪨", biome: "cueva" },
    { name: "Rey Esqueleto", level: 20, hp: 130, atk: 30, exp: 95, gold: 60, element: ELEMENTS.DARK.name, emoji: "👑", biome: "cueva" },
    
    // BIOMA: VOLCÁN (Nivel 15-35)
    { name: "Salamandra de Fuego", level: 15, hp: 75, atk: 25, exp: 60, gold: 38, element: ELEMENTS.FIRE.name, emoji: "🦎", biome: "volcan" },
    { name: "Golem de Magma", level: 18, hp: 120, atk: 30, exp: 80, gold: 50, element: ELEMENTS.FIRE.name, emoji: "🌋", biome: "volcan" },
    { name: "Diablillo Infernal", level: 20, hp: 65, atk: 28, exp: 70, gold: 45, element: ELEMENTS.FIRE.name, emoji: "👿", biome: "volcan" },
    { name: "Dragón Whelp", level: 25, hp: 150, atk: 38, exp: 110, gold: 70, element: ELEMENTS.FIRE.name, emoji: "🐲", biome: "volcan" },
    { name: "Fénix Menor", level: 28, hp: 140, atk: 42, exp: 125, gold: 80, element: ELEMENTS.FIRE.name, emoji: "🔥", biome: "volcan" },
    { name: "Elemental de Lava", level: 30, hp: 160, atk: 45, exp: 140, gold: 90, element: ELEMENTS.FIRE.name, emoji: "🌋", biome: "volcan" },
    { name: "Demonio de Fuego", level: 33, hp: 180, atk: 50, exp: 160, gold: 100, element: ELEMENTS.FIRE.name, emoji: "🔥", biome: "volcan" },
    { name: "Señor del Volcán", level: 35, hp: 200, atk: 55, exp: 180, gold: 120, element: ELEMENTS.FIRE.name, emoji: "👹", biome: "volcan" },
    
    // BIOMA: CRIPTA (Nivel 20-45)
    { name: "Zombi Putrefacto", level: 20, hp: 90, atk: 25, exp: 65, gold: 40, element: ELEMENTS.DARK.name, emoji: "🧟", biome: "cripta" },
    { name: "Espectro Llorón", level: 23, hp: 70, atk: 30, exp: 75, gold: 48, element: ELEMENTS.DARK.name, emoji: "👻", biome: "cripta" },
    { name: "Necromante Oscuro", level: 26, hp: 85, atk: 38, exp: 95, gold: 60, element: ELEMENTS.DARK.name, emoji: "🧙", biome: "cripta" },
    { name: "Banshee Aullante", level: 29, hp: 75, atk: 42, exp: 105, gold: 68, element: ELEMENTS.DARK.name, emoji: "👻", biome: "cripta" },
    { name: "Caballero de la Muerte", level: 32, hp: 140, atk: 48, exp: 130, gold: 85, element: ELEMENTS.DARK.name, emoji: "💀", biome: "cripta" },
    { name: "Momia Maldita", level: 35, hp: 130, atk: 45, exp: 120, gold: 78, element: ELEMENTS.DARK.name, emoji: "🤕", biome: "cripta" },
    { name: "Rey Momia", level: 38, hp: 160, atk: 52, exp: 150, gold: 95, element: ELEMENTS.DARK.name, emoji: "👑", biome: "cripta" },
    { name: "Señor de los No-Muertos", level: 42, hp: 190, atk: 58, exp: 175, gold: 110, element: ELEMENTS.DARK.name, emoji: "☠️", biome: "cripta" },
    { name: "Dios Oscuro", level: 45, hp: 220, atk: 65, exp: 200, gold: 130, element: ELEMENTS.DARK.name, emoji: "🌑", biome: "cripta" },
    
    // BIOMA: CIELO (Nivel 30-55)
    { name: "Arpía Veloz", level: 30, hp: 80, atk: 35, exp: 90, gold: 55, element: ELEMENTS.AIR.name, emoji: "🦅", biome: "cielo" },
    { name: "Grifo Majestuoso", level: 35, hp: 140, atk: 45, exp: 130, gold: 80, element: ELEMENTS.AIR.name, emoji: "🦁", biome: "cielo" },
    { name: "Elemental de Aire", level: 38, hp: 100, atk: 48, exp: 140, gold: 90, element: ELEMENTS.AIR.name, emoji: "💨", biome: "cielo" },
    { name: "Dragón de Nube", level: 42, hp: 170, atk: 55, exp: 165, gold: 105, element: ELEMENTS.AIR.name, emoji: "☁️", biome: "cielo" },
    { name: "Fénix Dorado", level: 46, hp: 190, atk: 62, exp: 190, gold: 120, element: ELEMENTS.LIGHT.name, emoji: "🔥", biome: "cielo" },
    { name: "Ángel Caído", level: 50, hp: 210, atk: 68, exp: 215, gold: 135, element: ELEMENTS.DARK.name, emoji: "😇", biome: "cielo" },
    { name: "Titán de las Nubes", level: 53, hp: 240, atk: 72, exp: 240, gold: 150, element: ELEMENTS.AIR.name, emoji: "⛈️", biome: "cielo" },
    { name: "Rey de los Cielos", level: 55, hp: 260, atk: 78, exp: 265, gold: 165, element: ELEMENTS.LIGHT.name, emoji: "👑", biome: "cielo" },
    
    // BIOMA: ABISMO (Nivel 40-70+)
    { name: "Observador Ocular", level: 40, hp: 110, atk: 50, exp: 140, gold: 85, element: ELEMENTS.DARK.name, emoji: "👁️", biome: "abismo" },
    { name: "Demonio Menor", level: 44, hp: 145, atk: 58, exp: 165, gold: 100, element: ELEMENTS.DARK.name, emoji: "👿", biome: "abismo" },
    { name: "Tentáculo Cósmico", level: 48, hp: 175, atk: 65, exp: 195, gold: 120, element: ELEMENTS.VOID.name, emoji: "🐙", biome: "abismo" },
    { name: "Horror Lovecraftiano", level: 52, hp: 200, atk: 72, exp: 225, gold: 140, element: ELEMENTS.VOID.name, emoji: "👾", biome: "abismo" },
    { name: "Devorador de Almas", level: 56, hp: 230, atk: 78, exp: 255, gold: 160, element: ELEMENTS.DARK.name, emoji: "💀", biome: "abismo" },
    { name: "Príncipe Demonio", level: 60, hp: 260, atk: 85, exp: 285, gold: 180, element: ELEMENTS.DARK.name, emoji: "👹", biome: "abismo" },
    { name: "Entidad del Vacío", level: 64, hp: 290, atk: 92, exp: 315, gold: 200, element: ELEMENTS.VOID.name, emoji: "🌌", biome: "abismo" },
    { name: "Dios Antiguo", level: 68, hp: 320, atk: 98, exp: 345, gold: 220, element: ELEMENTS.VOID.name, emoji: "🌑", biome: "abismo" },
    { name: "Destructor de Mundos", level: 70, hp: 350, atk: 105, exp: 375, gold: 240, element: ELEMENTS.VOID.name, emoji: "💥", biome: "abismo" }
];

// Función para obtener enemigo aleatorio según nivel del jugador y bioma
export function getRandomEnemy(playerLevel) {
    // Determinar bioma basado en el nivel del jugador
    let possibleBiomes = [];
    if (playerLevel <= 15) possibleBiomes.push("bosque");
    if (playerLevel >= 5 && playerLevel <= 25) possibleBiomes.push("cueva");
    if (playerLevel >= 15 && playerLevel <= 40) possibleBiomes.push("volcan");
    if (playerLevel >= 20 && playerLevel <= 50) possibleBiomes.push("cripta");
    if (playerLevel >= 30 && playerLevel <= 60) possibleBiomes.push("cielo");
    if (playerLevel >= 40) possibleBiomes.push("abismo");
    
    // Si no hay biomas disponibles (nivel muy bajo), usar bosque por defecto
    if (possibleBiomes.length === 0) possibleBiomes = ["bosque"];
    
    const selectedBiome = possibleBiomes[Math.floor(Math.random() * possibleBiomes.length)];
    
    // Filtrar enemigos del bioma seleccionado que sean apropiados para el nivel
    const suitableEnemies = dungeonEnemies.filter(
        enemy => enemy.biome === selectedBiome && 
                 enemy.level >= Math.max(1, playerLevel - 5) && 
                 enemy.level <= playerLevel + 3
    );
    
    // Si no hay enemigos adecuados, tomar cualquiera del bioma
    const finalPool = suitableEnemies.length > 0 ? suitableEnemies : dungeonEnemies.filter(e => e.biome === selectedBiome);
    
    // Si aún no hay, tomar cualquier enemigo
    const enemyPool = finalPool.length > 0 ? finalPool : dungeonEnemies;
    
    return JSON.parse(JSON.stringify(enemyPool[Math.floor(Math.random() * enemyPool.length)]));
}

// Eventos Mundiales
export const worldEvents = [
    {
        name: "Invasión de las Sombras",
        description: "Las fuerzas oscuras atacan los reinos. ¡Derrota enemigos para contribuir!",
        targetContribution: 50000,
        durationMinutes: 120,
        rewardMultiplier: 1.5,
        eventType: "invasion"
    },
    {
        name: "Convergencia Arcana",
        description: "La energía mágica se concentra. ¡Explora para recolectar esencia!",
        targetContribution: 75000,
        durationMinutes: 180,
        rewardMultiplier: 2.0,
        eventType: "convergence"
    },
    {
        name: "Despertar de los Antiguos",
        description: "Los guardianes ancestrales despiertan. ¡Completa mazmorras para ayudar!",
        targetContribution: 100000,
        durationMinutes: 240,
        rewardMultiplier: 2.5,
        eventType: "awakening"
    },
    {
        name: "Lluvia de Cristales",
        description: "Cristales celestiales caen del cielo. ¡Explora para encontrarlos!",
        targetContribution: 60000,
        durationMinutes: 90,
        rewardMultiplier: 1.75,
        eventType: "crystal_rain"
    }
];

// Recompensas de eventos mundiales
export const eventRewards = {
    invasion: {
        common: { name: "Espada de Sombra", atk: 28, tier: "epico", minLevel: 25, price: 0 },
        rare: { name: "Armadura de Vacío", def: 38, tier: "epico", minLevel: 25, price: 0 }
    },
    convergence: {
        common: { name: "Bastón de Convergencia", atk: 42, tier: "legendario", minLevel: 35, price: 0 },
        rare: { name: "Túnica Arcana Superior", def: 55, tier: "legendario", minLevel: 35, price: 0 }
    },
    awakening: {
        common: { name: "Hoja Ancestral", atk: 70, tier: "legendario", minLevel: 45, price: 0 },
        rare: { name: "Coraza de los Antiguos", def: 85, tier: "legendario", minLevel: 45, price: 0 }
    },
    crystal_rain: {
        common: { name: "Cristal Estelar", atk: 35, tier: "epico", minLevel: 30, price: 0 },
        rare: { name: "Manto de Cristal", def: 45, tier: "epico", minLevel: 30, price: 0 }
    }
};

// Utilidades de Tier
export function getTierColor(tier) {
    return tierConfig[tier] ? tierConfig[tier].color : "#94a3b8";
}

export function getTierName(tier) {
    return tierConfig[tier] ? tierConfig[tier].name : "Desconocido";
}
