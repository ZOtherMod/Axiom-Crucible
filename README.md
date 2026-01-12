# Axiom & Crucible - Tier-0 Weapon Builder

A modular drag-and-drop weapon builder for the Axiom & Crucible tabletop RPG system. This tool helps players create Tier-0 weapons by selecting shells and combining layer cards according to the game's engineering mechanics.

## Features

- **Shell Selection**: Choose from three different weapon shell types (Hand Tool, Static Device, Simple Automaton)
- **Drag & Drop Interface**: Intuitive layer card system with visual feedback
- **Validation**: Automatic checking of slot limits, required layers, and compatibility
- **Real-time Summary**: Live updates of weapon stats, risk assessment, and descriptions
- **Export Functionality**: Save weapon designs as JSON files
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Game System Overview

This tool implements the Tier-0 mechanics from Axiom & Crucible, where:

- Players choose a **Shell** (physical category) that defines the weapon's basic structure
- **Layer Cards** are added to provide functionality (Structure, Power, Control, Sense, Safety)
- Each shell has mandatory and optional layers with slot limitations
- Risk management is crucial as Tier-0 technology is intentionally unstable

## How to Use

1. **Select a Shell**: Choose the type of weapon you want to create
2. **Add Layer Cards**: Drag cards from the layer pool to the appropriate slots
3. **Review Summary**: Check your weapon's stats, risk level, and generated description
4. **Export**: Save your design or clear to start over

## Shell Types

### Hand Tool
- **Concept**: Manually operated weapon
- **Slots**: 2
- **Required**: Structure, Power
- **Optional**: Control, Safety

### Static Device  
- **Concept**: Stationary weapon mechanism
- **Slots**: 3
- **Required**: Structure, Power
- **Optional**: Control, Sense, Safety

### Simple Automaton
- **Concept**: Semi-autonomous weapon
- **Slots**: 3
- **Required**: Structure, Power, Control
- **Optional**: Sense, Safety

## Layer Types

- **Structure**: Physical framework and mounting
- **Power**: Energy source and transmission
- **Control**: Decision-making and triggering
- **Sense**: Detection and awareness systems  
- **Safety**: Failure prevention and damage mitigation

## Deployment to GitHub Pages

### Option 1: Upload Files Directly

1. Create a new repository on GitHub
2. Upload the following files:
   - `index.html`
   - `styles.css` 
   - `script.js`
   - `README.md`
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/" (root) folder
6. Click Save

### Option 2: Using Git Commands

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Axiom & Crucible weapon builder"

# Connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/yourusername/axiom-crucible-builder.git
git branch -M main
git push -u origin main

# Enable GitHub Pages in repository settings
```

### Option 3: Fork and Deploy

1. Fork this repository
2. Enable GitHub Pages in your fork's settings
3. Your site will be available at: `https://yourusername.github.io/axiom-crucible-builder`

## File Structure

```
axiom-crucible-builder/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and game logic
└── README.md           # This documentation file
```

## Technical Details

- **Pure Frontend**: No backend required, works entirely in the browser
- **Responsive**: Mobile-first design with CSS Grid and Flexbox
- **Accessible**: Semantic HTML with proper ARIA labels
- **Modern JavaScript**: ES6+ features with class-based architecture
- **No Dependencies**: Vanilla HTML/CSS/JavaScript only

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Feel free to submit issues or pull requests to improve the weapon builder. Some potential enhancements:

- Additional shell types for higher tiers
- More layer card options
- Save/load functionality with localStorage
- Weapon gallery/sharing features
- Animation improvements
- Combat simulation features

## License

This project is released under the MIT License. See the game system documentation for specific rules and mechanics licensing.

## Related Links

- [Axiom & Crucible Official Documentation](link-to-game-docs)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Built with ❤️ for the Axiom & Crucible community
