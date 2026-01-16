# Axiom & Crucible - Weapon Selection Tool

An interactive web application for creating Tier 0 weapon configurations in the Axiom & Crucible tabletop RPG system.

## Features

- **Interactive Weapon Selection**: Choose from Ranged or Melee platforms
- **Dynamic Module System**: Select from Universal, Ranged-only, or Melee-only modules
- **Real-time Validation**: Smart filtering of compatible combinations
- **Export Functionality**: Download your build as a formatted markdown file
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Sleek cyberpunk aesthetic with smooth animations

## Weapon Platforms

### Ranged Platform
- **Range**: Medium
- **Role**: Safe pressure, positioning, sustained fire
- **Constraints**: Penalties when engaging close targets and when moving

### Melee Platform
- **Range**: Engaged
- **Role**: Control, disruption, decisive engagement
- **Features**: Close control and opportunity pressure mechanics

## Module Categories

### Universal Modules
- **Stability Module**: Replace d20 with 2d10 for more consistent results
- **Calibration Module**: Learn from misses to improve accuracy
- **Heat Sink Module**: Better instability management
- **Safety Interlock**: Emergency failure mitigation

### Platform-Specific Modules
- **Ranged**: Targeting Gyroscope, Focus Lens
- **Melee**: Momentum Actuator, Force-Lock Servo

## Deployment to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save the settings

2. **Access Your Site**:
   - Your site will be available at: `https://[username].github.io/[repository-name]`
   - For this repo: `https://zothermod.github.io/axiom-crucible`

3. **Custom Domain** (Optional):
   - Add a `CNAME` file with your custom domain
   - Configure DNS settings with your domain provider

## File Structure

```
/
├── index.html          # Main weapon selection interface
├── styles.css          # All styling and responsive design
├── script.js           # Interactive functionality
├── rules.html          # Placeholder for game rules
├── character-sheet.html # Placeholder for character sheet
├── combat.html         # Placeholder for combat guide
└── README.md           # This file
```

## Core Combat Assumptions

- **Base Damage**: 1d6
- **Base Difficulty**: 10
- **Base Instability**: 0
- Damage converts to Severity rather than HP reduction

## Navigation

The site features a top navigation bar connecting to:
- **Weapon Selection** (Main tool)
- **Rules** (Coming soon)
- **Character Sheet** (Coming soon)
- **Combat Guide** (Coming soon)

## Technical Features

- Pure HTML/CSS/JavaScript (no dependencies)
- Local storage for session persistence
- Clipboard integration for easy sharing
- Keyboard shortcuts (ESC to clear selections)
- Accessibility considerations
- Mobile-responsive design

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

This is part of the Axiom & Crucible game system. Feel free to submit issues or pull requests for:
- Bug fixes
- UI/UX improvements
- Additional features
- Mobile optimization
- Accessibility enhancements

## License

Part of the Axiom & Crucible game system.
