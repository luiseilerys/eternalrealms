/**
 * Eternal Realms - Configuración y Datos del Juego
 * Módulo de configuración con constantes, datos de items y configuraciones
 */

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
export const realms = ["Aetherion", "Sylvandar", "Obsidian Reach", "Celestara", "Emberforge"];

// Configuración de Tiers
export const tierConfig = {
    comun: { name: "Común", color: "#94a3b8", mult: 1.0 },
    "poco-comun": { name: "Poco Común", color: "#22c55e", mult: 1.5 },
    raro: { name: "Raro", color: "#3b82f6", mult: 2.2 },
    epico: { name: "Épico", color: "#a855f7", mult: 3.5 },
    legendario: { name: "Legendario", color: "#f59e0b", mult: 5.0 }
};

// Armas disponibles
export const possibleWeapons = [
    { name: "Daga de Sombra", atk: 3, tier: "comun", minLevel: 1, price: 50 },
    { name: "Bastón Arcano", atk: 4, tier: "comun", minLevel: 1, price: 60 },
    { name: "Espada Corta", atk: 5, tier: "comun", minLevel: 3, price: 80 },
    { name: "Espada Rúnica", atk: 8, tier: "poco-comun", minLevel: 5, price: 150 },
    { name: "Arco de Viento", atk: 9, tier: "poco-comun", minLevel: 6, price: 170 },
    { name: "Martillo de Piedra", atk: 10, tier: "poco-comun", minLevel: 7, price: 190 },
    { name: "Cuchilla Obsidiana", atk: 15, tier: "raro", minLevel: 10, price: 350 },
    { name: "Bastón de Cristal", atk: 17, tier: "raro", minLevel: 12, price: 400 },
    { name: "Espada de Fuego", atk: 20, tier: "raro", minLevel: 15, price: 500 },
    { name: "Hoja del Vacío", atk: 30, tier: "epico", minLevel: 20, price: 800 },
    { name: "Martillo del Trueno", atk: 35, tier: "epico", minLevel: 25, price: 1000 },
    { name: "Arco Estelar", atk: 38, tier: "epico", minLevel: 28, price: 1200 },
    { name: "Excalibur Eterna", atk: 55, tier: "legendario", minLevel: 35, price: 2500 },
    { name: "Bastón de los Ancianos", atk: 60, tier: "legendario", minLevel: 40, price: 3000 },
    { name: "Guadaña del Alma", atk: 65, tier: "legendario", minLevel: 45, price: 3500 }
];

// Armaduras disponibles
export const possibleArmors = [
    { name: "Cota de Malla Ligera", def: 3, tier: "comun", minLevel: 1, price: 50 },
    { name: "Túnica Reforzada", def: 4, tier: "comun", minLevel: 2, price: 65 },
    { name: "Armadura de Cuero", def: 5, tier: "comun", minLevel: 4, price: 85 },
    { name: "Armadura de Escamas", def: 8, tier: "poco-comun", minLevel: 5, price: 160 },
    { name: "Capa del Guardián", def: 10, tier: "poco-comun", minLevel: 7, price: 185 },
    { name: "Peto de Hierro", def: 12, tier: "poco-comun", minLevel: 9, price: 210 },
    { name: "Armadura de Mithril", def: 18, tier: "raro", minLevel: 10, price: 380 },
    { name: "Túnica Arcana", def: 20, tier: "raro", minLevel: 13, price: 430 },
    { name: "Placas de Dragón", def: 24, tier: "raro", minLevel: 16, price: 550 },
    { name: "Armadura del Vacío", def: 35, tier: "epico", minLevel: 20, price: 850 },
    { name: "Manto de las Estrellas", def: 40, tier: "epico", minLevel: 25, price: 1050 },
    { name: "Coraza Ancestral", def: 45, tier: "epico", minLevel: 30, price: 1300 },
    { name: "Armadura de los Dioses", def: 65, tier: "legendario", minLevel: 35, price: 2700 },
    { name: "Túnica del Archimago", def: 70, tier: "legendario", minLevel: 40, price: 3200 },
    { name: "Coraza del Dragón Anciano", def: 80, tier: "legendario", minLevel: 50, price: 4000 }
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
        activeBuffs: [] // Buffs activos temporales
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
export const dungeonBosses = [
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
        tier: "raro"
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
        tier: "epico"
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
        tier: "legendario"
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
        tier: "legendario"
    }
];

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
