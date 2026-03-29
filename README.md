# Eternal Realms

A multiplayer RPG (Role-Playing Game) built as a webxdc application, designed to run in browsers and messaging platforms that support the webxdc standard (such as Delta Chat).

## Features

- 🎮 **Classic RPG Mechanics**: Level up, gain XP, collect gold, and manage energy
- ⚔️ **Equipment System**: 30 unique items across 5 rarity tiers (Common to Legendary)
- 🌍 **Multiple Kingdoms**: Choose from 5 distinct realms with unique identities
- 🧙 **Character Classes**: 5 specialized classes with different playstyles
- 💾 **Persistent Progress**: Auto-save functionality using localStorage
- 🌐 **Multiplayer Support**: Real-time notifications and shared global state via webxdc
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices
- 💬 **Command-Based Interface**: Intuitive chat-style command system

## Project Structure

```
eternalrealms/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # All styling rules
├── js/
│   ├── config.js       # Game configuration, items, constants
│   ├── game.js         # Core game logic and command processing
│   ├── ui.js           # UI rendering and management
│   └── main.js         # Application entry point and initialization
└── README.md           # This file
```

## Available Commands

| Command | Description | Cost |
|---------|-------------|------|
| `/me` | View character statistics | Free |
| `/quest` | Explore and find rewards | 1 Energy |
| `/dungeon` | Challenge dungeons for better loot | 3 Energy |
| `/rest` | Restore HP and energy to maximum | Free |
| `/equip` | View current equipment and inventory | Free |
| `/equip N` | Equip item number N from inventory | Free |
| `/merchant` | View merchant's available items | Free |
| `/buy N` | Purchase item number N from merchant | Gold |
| `/world` | View global shared state | Free |
| `/help` | Display command help | Free |
| `/reset` | Reset character progress | - |

## Installation & Usage

### Standard Web Mode
Simply open `index.html` in any modern web browser. The game will run in standalone mode with local storage persistence.

### Webxdc Mode
For full multiplayer functionality, deploy as a webxdc app in a compatible platform like Delta Chat.

### Development
No build process required. The project uses vanilla JavaScript ES6 modules. Just serve the files with any local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

Then open `http://localhost:8000` in your browser.

## Code Architecture

The codebase is modularized using ES6 modules for better maintainability:

- **config.js**: Contains all game data including items (weapons and armor), kingdoms, classes, drop rates, and game constants. Easy to modify for balancing or adding new content.
- **game.js**: Implements core game mechanics including command parsing, combat calculations, leveling system, economy, and inventory management.
- **ui.js**: Handles all DOM manipulation, message rendering, screen transitions, and dynamic UI updates. Separates presentation logic from game logic.
- **main.js**: Application entry point that initializes the game state, handles webxdc integration, sets up event listeners, and coordinates between modules.

## Multiplayer Functionality

When running in a webxdc-compatible environment, the game enables:
- Real-time notifications when other players level up
- Alerts when merchants appear for other players
- Shared global state including total essence and active guardians
- Player join notifications

In standalone mode (regular browser), these features are disabled but the game remains fully playable.

## Persistence

Player progress is automatically saved to localStorage on:
- Every significant action (level up, purchase, equipment change)
- When the page loses visibility (visibilitychange event)
- When closing the application

Data includes: character stats, inventory, equipped items, gold, kingdom/class selection, and merchant stock.

## UI/UX Design

- **Dark Theme**: Modern color palette optimized for extended play sessions
- **Chat Interface**: Familiar command-based interaction style
- **Quick Access Bar**: Buttons for frequently used commands
- **Color-Coded Items**: Visual rarity indicators (Gray → Green → Blue → Purple → Gold)
- **Timestamped Messages**: All game events include timestamps for tracking
- **Responsive Layout**: Adapts seamlessly to different screen sizes

## Technologies Used

- HTML5
- CSS3 (Flexbox, Custom Properties)
- Vanilla JavaScript (ES6 Modules)
- Web Storage API (localStorage)
- WebXDC API (optional)

## License

MIT License - Feel free to use, modify, and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or suggestions, please open an issue in the repository.
