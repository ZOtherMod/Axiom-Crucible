// Global state for weapon selection
let selectedPlatform = null;
let selectedModule = null;

// Weapon data structure
const weaponData = {
    platforms: {
        ranged: {
            name: "Ranged Platform",
            range: "Medium",
            role: "Safe pressure, positioning, sustained fire",
            features: [
                "Attacks against Engaged targets: +2 Difficulty",
                "Cannot Critically Succeed against Engaged targets",
                "Move + Attack in same turn: +1 Difficulty"
            ]
        },
        melee: {
            name: "Melee Platform",
            range: "Engaged",
            role: "Control, disruption, decisive engagement",
            features: [
                "Close Control: On Clean Success, modify target Instability by ±1",
                "Opportunity Pressure: Free attack at +2 Difficulty on disengagement"
            ]
        }
    },
    modules: {
        stability: {
            name: "Stability Module",
            flavor: "We don't spike. We converge.",
            effect: "Replace d20 with 2d10 for attack rolls",
            category: "universal"
        },
        calibration: {
            name: "Calibration Module",
            flavor: "Every miss tells us something.",
            effect: "On Partial Failure, reduce next attack Difficulty by 1 (stacking). Resets on successful hit.",
            category: "universal"
        },
        "heat-sink": {
            name: "Heat Sink Module",
            flavor: "The system bleeds pressure.",
            effect: "Once per round, reduce Instability gained by 1 (minimum 0)",
            category: "universal"
        },
        "safety-interlock": {
            name: "Safety Interlock",
            flavor: "The system refuses to die.",
            effect: "Once per scene, downgrade Hard Failure to Partial Failure",
            category: "universal"
        },
        "targeting-gyroscope": {
            name: "Targeting Gyroscope",
            flavor: "Hold still. Or don't.",
            effect: "Ignore the +1 Difficulty penalty for moving and attacking in the same turn",
            category: "ranged"
        },
        "focus-lens": {
            name: "Focus Lens",
            flavor: "Depth over force.",
            effect: "On Critical Success, increase Severity by 1 tier (max Severe). Cannot increase Severity on Partial Failures.",
            category: "ranged"
        },
        "momentum-actuator": {
            name: "Momentum Actuator",
            flavor: "Once contact is made, it doesn't stop.",
            effect: "On hit, gain 1 Momentum. Spend Momentum to reduce next attack Difficulty by 1 or add +1 Strain to target. Momentum clears if you miss or disengage.",
            category: "melee"
        },
        "force-lock-servo": {
            name: "Force-Lock Servo",
            flavor: "They don't get to choose anymore.",
            effect: "On Clean Success, target cannot disengage next turn without spending an action",
            category: "melee"
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    restoreSelectionFromLocalStorage(); // Restore previous selection
    updateModuleAvailability();
});

// Restore weapon selection from localStorage - Windows compatible
function restoreSelectionFromLocalStorage() {
    try {
        // Check localStorage support
        if (typeof(Storage) === "undefined") {
            console.warn('localStorage not supported in this browser');
            return;
        }
        
        let weaponData = localStorage.getItem('axiom-crucible-weapon');
        
        // Try fallback storage if main storage failed
        if (!weaponData) {
            const fallbackData = sessionStorage.getItem('axiom-crucible-weapon-fallback');
            if (fallbackData) {
                const fallback = JSON.parse(fallbackData);
                selectedPlatform = fallback.platform;
                selectedModule = fallback.module;
                console.log('Restored from fallback storage');
            }
            return;
        }
        
        if (weaponData && weaponData !== 'null' && weaponData.length > 0) {
            const weapon = JSON.parse(weaponData);
            console.log('Restoring weapon selection:', weapon);
            
            if (weapon.platform && weapon.platform.id) {
                selectedPlatform = weapon.platform.id;
                const platformCard = document.querySelector(`[data-id="${selectedPlatform}"]`);
                if (platformCard) {
                    // Remove any existing selections first
                    document.querySelectorAll('[data-type="platform"]').forEach(card => {
                        card.classList.remove('selected');
                    });
                    platformCard.classList.add('selected');
                    updatePlatformDisplay();
                }
            }
            
            if (weapon.module && weapon.module.id) {
                selectedModule = weapon.module.id;
                const moduleCard = document.querySelector(`[data-id="${selectedModule}"]`);
                if (moduleCard && !moduleCard.classList.contains('disabled')) {
                    // Remove any existing selections first
                    document.querySelectorAll('[data-type="module"]').forEach(card => {
                        card.classList.remove('selected');
                    });
                    moduleCard.classList.add('selected');
                    updateModuleDisplay();
                }
            }
            
            updateExportButton();
            console.log('Selection restored successfully');
        }
        
    } catch (error) {
        console.error('Could not restore weapon selection:', error);
        console.log('Clearing corrupted data and starting fresh');
        try {
            localStorage.removeItem('axiom-crucible-weapon');
            sessionStorage.removeItem('axiom-crucible-weapon-fallback');
        } catch (e) {
            console.error('Could not clear corrupted data:', e);
        }
    }
}

function initializeEventListeners() {
    // Platform selection
    document.querySelectorAll('[data-type="platform"]').forEach(card => {
        card.addEventListener('click', () => selectPlatform(card.dataset.id));
    });

    // Module selection
    document.querySelectorAll('[data-type="module"]').forEach(card => {
        card.addEventListener('click', () => {
            if (!card.classList.contains('disabled')) {
                selectModule(card.dataset.id);
            }
        });
    });

    // Export button
    document.getElementById('export-build').addEventListener('click', exportBuild);
}

function selectPlatform(platformId) {
    // Remove previous selection
    document.querySelectorAll('[data-type="platform"]').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    document.querySelector(`[data-id="${platformId}"]`).classList.add('selected');
    
    selectedPlatform = platformId;
    updatePlatformDisplay();
    updateModuleAvailability();
    updateExportButton();
    
    // Auto-save selection for persistence
    autoSaveSelection();
}

function selectModule(moduleId) {
    // Remove previous selection
    document.querySelectorAll('[data-type="module"]').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    document.querySelector(`[data-id="${moduleId}"]`).classList.add('selected');
    
    selectedModule = moduleId;
    updateModuleDisplay();
    updateExportButton();
    
    // Auto-save selection for persistence
    autoSaveSelection();
}

// Auto-save current selection to localStorage - Windows compatible
function autoSaveSelection() {
    if (selectedPlatform && selectedModule) {
        try {
            // Check if localStorage is available (Windows IE compatibility)
            if (typeof(Storage) === "undefined") {
                console.warn('localStorage not available');
                return;
            }
            
            const platform = weaponData.platforms[selectedPlatform];
            const module = weaponData.modules[selectedModule];
            
            if (!platform || !module) {
                console.error('Platform or module data missing');
                return;
            }
            
            const buildData = {
                platform: {
                    id: selectedPlatform,
                    name: platform.name || selectedPlatform,
                    range: platform.range || '',
                    role: platform.role || '',
                    features: platform.features || [],
                    description: platform.description || '',
                    ...platform
                },
                module: {
                    id: selectedModule,
                    name: module.name || selectedModule,
                    effect: module.effect || '',
                    description: module.description || module.effect || '',
                    ...module
                },
                exportDate: new Date().toISOString(),
                gameSystem: "Axiom & Crucible",
                tier: "Tier 0"
            };
            
            // Windows-safe JSON stringify
            const jsonString = JSON.stringify(buildData);
            localStorage.setItem('axiom-crucible-weapon', jsonString);
            
            // Verify the save worked
            const verification = localStorage.getItem('axiom-crucible-weapon');
            if (!verification) {
                console.error('localStorage save verification failed');
            } else {
                console.log('Weapon data auto-saved successfully');
            }
            
        } catch (error) {
            console.error('Auto-save failed:', error);
            // Try alternative storage method for older Windows browsers
            try {
                sessionStorage.setItem('axiom-crucible-weapon-fallback', JSON.stringify({
                    platform: selectedPlatform,
                    module: selectedModule
                }));
            } catch (e) {
                console.error('Fallback storage also failed:', e);
            }
        }
    }
}

function updatePlatformDisplay() {
    const display = document.getElementById('platform-display');
    
    if (selectedPlatform) {
        const platform = weaponData.platforms[selectedPlatform];
        display.innerHTML = `
            <h4>${platform.name}</h4>
            <p><strong>Range:</strong> ${platform.range}</p>
            <p><strong>Role:</strong> ${platform.role}</p>
            <div class="features">
                <strong>Features:</strong>
                <ul>
                    ${platform.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        display.innerHTML = '<p class="placeholder">Select a platform above</p>';
    }
}

function updateModuleDisplay() {
    const display = document.getElementById('module-display');
    
    if (selectedModule) {
        const module = weaponData.modules[selectedModule];
        display.innerHTML = `
            <h4>${module.name}</h4>
            <p class="flavor">"${module.flavor}"</p>
            <p><strong>Effect:</strong> ${module.effect}</p>
            <p><strong>Category:</strong> ${module.category.charAt(0).toUpperCase() + module.category.slice(1)}</p>
        `;
    } else {
        display.innerHTML = '<p class="placeholder">Select a module above</p>';
    }
}

function updateModuleAvailability() {
    // Show/hide platform-specific modules
    const rangedModules = document.getElementById('ranged-modules');
    const meleeModules = document.getElementById('melee-modules');
    
    if (selectedPlatform === 'ranged') {
        rangedModules.style.display = 'block';
        meleeModules.style.display = 'none';
        // Disable melee modules
        document.querySelectorAll('[data-category="melee"]').forEach(card => {
            card.classList.add('disabled');
        });
        document.querySelectorAll('[data-category="ranged"]').forEach(card => {
            card.classList.remove('disabled');
        });
    } else if (selectedPlatform === 'melee') {
        rangedModules.style.display = 'none';
        meleeModules.style.display = 'block';
        // Disable ranged modules
        document.querySelectorAll('[data-category="ranged"]').forEach(card => {
            card.classList.add('disabled');
        });
        document.querySelectorAll('[data-category="melee"]').forEach(card => {
            card.classList.remove('disabled');
        });
    } else {
        rangedModules.style.display = 'none';
        meleeModules.style.display = 'none';
        // Disable all platform-specific modules
        document.querySelectorAll('[data-category="ranged"], [data-category="melee"]').forEach(card => {
            card.classList.add('disabled');
        });
    }

    // Clear module selection if it's no longer valid
    if (selectedModule) {
        const moduleCard = document.querySelector(`[data-id="${selectedModule}"]`);
        if (moduleCard && moduleCard.classList.contains('disabled')) {
            moduleCard.classList.remove('selected');
            selectedModule = null;
            updateModuleDisplay();
            updateExportButton();
        }
    }
}

function updateExportButton() {
    const exportButton = document.getElementById('export-build');
    exportButton.disabled = !(selectedPlatform && selectedModule);
}

function exportBuild() {
    if (!selectedPlatform || !selectedModule) {
        alert('Please select both a platform and a module before exporting.');
        return;
    }

    const platform = weaponData.platforms[selectedPlatform];
    const module = weaponData.modules[selectedModule];

    const buildData = {
        platform: {
            id: selectedPlatform,
            ...platform
        },
        module: {
            id: selectedModule,
            ...module
        },
        exportDate: new Date().toISOString(),
        gameSystem: "Axiom & Crucible",
        tier: "Tier 0"
    };

    // Save weapon data to localStorage for character sheet import
    localStorage.setItem('axiom-crucible-weapon', JSON.stringify(buildData));

    // Create export text
    const exportText = `
# Axiom & Crucible - Weapon Build Export

**Export Date:** ${new Date().toLocaleDateString()}
**Game System:** Axiom & Crucible
**Tier:** Tier 0

## Platform: ${platform.name}
- **Range:** ${platform.range}
- **Role:** ${platform.role}

### Platform Features:
${platform.features.map(feature => `- ${feature}`).join('\n')}

## Module: ${module.name}
- **Category:** ${module.category.charAt(0).toUpperCase() + module.category.slice(1)}
- **Flavor:** "${module.flavor}"

### Module Effect:
${module.effect}

## Core Combat Stats
- **Base Damage:** 1d6
- **Base Difficulty:** 10
- **Base Instability:** 0

*Note: Damage is converted to Severity, not subtracted from HP*

---
Generated by Axiom & Crucible Weapon Selection Tool
    `.trim();

    // Create and download file
    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom-crucible-${selectedPlatform}-${selectedModule}-build.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also copy to clipboard
    navigator.clipboard.writeText(exportText).then(() => {
        // Show success message
        showNotification('Build exported and saved for character sheet import!');
    }).catch(() => {
        showNotification('Build exported to file and saved for character sheet import!');
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00d4ff, #0099cc);
        color: #000;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Clear selections
        document.querySelectorAll('.weapon-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        selectedPlatform = null;
        selectedModule = null;
        updatePlatformDisplay();
        updateModuleDisplay();
        updateModuleAvailability();
        updateExportButton();
    }
});

// Add hover effects for better UX
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.weapon-card') && !e.target.closest('.weapon-card').classList.contains('disabled')) {
        e.target.closest('.weapon-card').style.transform = 'translateY(-2px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.closest('.weapon-card')) {
        const card = e.target.closest('.weapon-card');
        if (!card.classList.contains('selected')) {
            card.style.transform = '';
        }
    }
});
