# Eternal Realms

Un juego de rol (RPG) multijugador basado en navegador, diseñado como aplicación **webxdc** para integración con plataformas de mensajería como Delta Chat.

## 🎮 Características

- **Sistema de Personaje**: Estadísticas completas (Nivel, XP, Oro, Energía, Maná, HP, Ataque, Defensa)
- **Progresión**: Sistema de niveles con multiplicadores y bonus cada 5 niveles
- **Equipamiento**: 5 tiers de items (Común → Legendario) con 30 objetos únicos
- **Combate y Exploración**: Misiones, mazmorras y encuentros aleatorios
- **Economía**: Sistema de oro con tienda de mercaderes
- **Multijugador**: Estado global compartido y notificaciones en tiempo real vía webxdc
- **Persistencia**: Auto-guardado automático del progreso
- **5 Reinos y 5 Clases**: Personalización inicial del personaje

## 🏗️ Estructura del Proyecto

```
eternalrealms/
├── index.html          # Estructura HTML principal
├── css/
│   └── styles.css      # Estilos y diseño responsive
├── js/
│   ├── config.js       # Configuración, datos de items y constantes
│   ├── game.js         # Lógica del juego y comandos
│   ├── ui.js           # Gestión de interfaz de usuario
│   └── main.js         # Punto de entrada y coordinación
└── README.md           # Documentación
```

## 🚀 Comandos Disponibles

| Comando | Descripción | Costo |
|---------|-------------|-------|
| `/me` | Ver estadísticas del personaje | - |
| `/quest` | Explorar territorios | 1 Energía |
| `/dungeon` | Entrar a mazmorra | 3 Energía |
| `/rest` | Restaurar HP y energía | - |
| `/equip` | Ver equipo e inventario | - |
| `/equip N` | Equipar item número N | - |
| `/merchant` | Ver tienda del mercader | - |
| `/buy N` | Comprar item del mercader | Oro variable |
| `/world` | Ver estado global compartido | - |
| `/help` | Mostrar lista de comandos | - |
| `/reset` | Reiniciar personaje | ⚠️ Borra progreso |

## 🎯 Mecánicas de Juego

### Sistema de Combate
- **Quest**: 40% tasa de éxito, 5% chance de encontrar mercader
- **Dungeon**: 10% tasa de drop de items, mayor riesgo/recompensa
- **Descanso**: Restaura HP y energía al máximo

### Tiers de Equipamiento
1. **Común** (Gris) - Stats básicos
2. **Poco Común** (Verde) - Stats mejorados
3. **Raro** (Azul) - Stats superiores
4. **Épico** (Morado) - Stats excepcionales
5. **Legendario** (Dorado) - Stats máximos

### Reinos Disponibles
- 🌟 **Aetherion** - Reino de los cielos
- 🌲 **Sylvandar** - Bosques ancestrales
- 🖤 **Obsidian Reach** - Tierras oscuras
- ✨ **Celestara** - Dominio celestial
- 🔥 **Emberforge** - Forjas ardientes

### Clases Disponibles
- 🔮 **Arcane Weaver** - Maestro de las artes arcanas
- 🗡️ **Shadowblade** - Asesino de las sombras
- ⚡ **Stormcaller** - Invocador de tormentas
- 🌿 **Verdant Warden** - Guardián de la naturaleza
- 🛡️ **Rune Knight** - Caballero rúnico

## 💻 Instalación y Uso

### Como Aplicación Web Estándar
1. Clona el repositorio
2. Abre `index.html` en cualquier navegador moderno
3. ¡Comienza a jugar!

### Como Aplicación webxdc (Delta Chat)
1. Empaqueta los archivos en un `.zip`
2. Renombra a `.xdc`
3. Envía como adjunto en Delta Chat
4. Los jugadores pueden interactuar desde la app

## 🔧 Desarrollo

El proyecto está construido con:
- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive con Flexbox
- **JavaScript ES6+** - Módulos nativos, sin frameworks
- **localStorage** - Persistencia de datos
- **webxdc API** - Funcionalidad multijugador

### Ejecutar en Desarrollo
```bash
# Usar un servidor local para evitar restricciones de CORS
npx serve .
# o
python3 -m http.server 8000
```

## 📁 Arquitectura de Código

- **config.js**: Datos estáticos (items, reinos, clases, constantes)
- **game.js**: Lógica de negocio (combate, progresión, economía)
- **ui.js**: Renderizado y manipulación del DOM
- **main.js**: Inicialización y coordinación de módulos

## 🌐 Multijugador

El juego utiliza la API **webxdc** para:
- Notificar subidas de nivel de otros jugadores
- Compartir descubrimientos de mercaderes
- Mantener un estado global (Esencia, Guardianes)
- Sincronizar eventos entre participantes

*Nota: En modo standalone (sin webxdc), el juego funciona completamente pero sin características multijugador.*

## 💾 Persistencia

- Auto-guardado automático al cambiar de pestaña
- Guardado manual después de acciones importantes
- Datos almacenados en `localStorage` del navegador
- Key: `eternalRealmsSave`

## 🎨 Diseño UI/UX

- Tema oscuro moderno (#0a0f1a, #1e2937, #a78bfa)
- Interfaz tipo chat para inmersión
- Barra de acceso rápido con botones
- Colores por tier de items
- Timestamps en todos los mensajes
- Totalmente responsive (móvil y desktop)

## 📝 Licencia

MIT License - Siéntete libre de usar, modificar y distribuir.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para issues o preguntas, abre un issue en el repositorio.

---

**¡Que comience la aventura en Eternal Realms!** ⚔️🛡️✨