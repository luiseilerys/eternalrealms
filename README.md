# Eternal Realms

A multiplayer RPG (Role-Playing Game) built as a webxdc application, designed to run in browsers and messaging platforms that support the webxdc standard (such as Delta Chat).

## Features

- 🎮 **Classic RPG Mechanics**: Level up, gain XP, collect gold, and manage energy
- ⚔️ **Equipment System**: 30 unique items across 5 rarity tiers (Common to Legendary)
- 🌍 **Multiple Kingdoms**: Choose from 5 distinct realms with unique identities
- 🧙 **Character Classes**: 5 specialized classes with different playstyles
- 👹 **Boss Raids**: Epic dungeon bosses that spawn randomly and require cooperation to defeat
- 🌟 **World Events**: Time-limited global events where all players contribute to shared goals
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
| `/raid attack` | Attack current world boss | Free |
| `/boss` | View current boss status | Free |
| `/event` | Check active world event progress | Free |
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
- **Boss Raid alerts**: Worldwide notifications when epic bosses spawn
- **Boss defeat celebrations**: See which players defeated major threats
- **World event progress**: Track global contribution to time-limited events
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

## Boss Raids & World Events

### Boss Raids
Epic dungeon bosses spawn randomly when exploring dungeons (`/dungeon`). These powerful enemies require multiple attacks to defeat and offer substantial rewards:

- **4 Unique Bosses**: Each with different difficulty levels (10-50)
- **Shared Health Pool**: All players contribute damage to the same boss
- **Level Requirements**: Players must be within 5 levels of the boss to participate
- **High Drop Rates**: 40-75% chance for epic/legendary items
- **Global Notifications**: Everyone is alerted when a boss spawns or is defeated

**Boss Commands:**
- `/boss` - View current boss stats and health
- `/raid attack` - Attack the active boss
- `/raid flee` - Flee from the raid (keeps boss alive for others)

### World Events
Time-limited global events where all players work together toward a common goal:

- **4 Event Types**: Invasion, Convergence, Awakening, Crystal Rain
- **Shared Progress Bar**: Track global contribution percentage
- **Reward Multipliers**: Earn 1.5x-2.5x rewards during events
- **Exclusive Items**: Special event-only equipment as completion rewards
- **Auto-Scheduling**: New events automatically start after completion

**Event Commands:**
- `/event` - Check current event status and progress

### How They Work Together
- Defeating bosses contributes significantly to world event progress
- Completing dungeons and quests also adds small contributions
- When an event completes, ALL participating players receive exclusive rewards
- Boss spawn rate increases during certain event types
