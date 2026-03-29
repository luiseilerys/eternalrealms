/**
 * Eternal Realms - Configuración y Datos del Juego
 * Módulo de configuración con constantes, datos de items y configuraciones
 */

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
        inventory: []
    };
}

// Estado inicial del mundo
export const initialWorldState = {
    globalEssence: 12480,
    nextConvergence: "2h 45min",
    activeRealms: ["Aetherion", "Sylvandar", "Obsidian Reach"],
    totalGuardians: 1
};

// Utilidades de Tier
export function getTierColor(tier) {
    return tierConfig[tier] ? tierConfig[tier].color : "#94a3b8";
}

export function getTierName(tier) {
    return tierConfig[tier] ? tierConfig[tier].name : "Desconocido";
}
