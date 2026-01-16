// Character Sheet JavaScript
document.addEventListener('DOMContentLoaded', function() {
    detectWindowsPlatform(); // Add Windows detection
    initializeCharacterSheet();
    forceWindowsColorFix(); // Add Windows color fix
});

// Windows platform detection and specific handling
function detectWindowsPlatform() {
    const isWindows = navigator.platform.indexOf('Win') > -1 || 
                     navigator.userAgent.indexOf('Windows') > -1 ||
                     navigator.userAgent.indexOf('Edge') > -1 ||
                     navigator.userAgent.indexOf('Trident') > -1;
    
    if (isWindows) {
        console.log('Windows platform detected - applying compatibility fixes');
        document.body.classList.add('windows-platform');
        
        // Force immediate style application for Windows
        setTimeout(() => {
            forceWindowsColorFix();
            checkWindowsLocalStorage();
        }, 100);
    }
}

// Windows-specific localStorage check
function checkWindowsLocalStorage() {
    try {
        const testKey = 'test-storage-' + Date.now();
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        if (retrieved !== 'test') {
            console.warn('Windows localStorage may not be functioning properly');
            showNotification('Browser storage may not work properly. Try refreshing or check browser settings.');
        } else {
            console.log('Windows localStorage verified working');
        }
    } catch (e) {
        console.error('Windows localStorage test failed:', e);
        showNotification('Browser storage is blocked. Please check privacy settings.');
    }
}

// Force white text colors for Windows compatibility
function forceWindowsColorFix() {
    // Force weapon section colors
    const weaponSection = document.querySelector('.weapon-section');
    if (weaponSection) {
        weaponSection.style.color = '#ffffff';
        const h2 = weaponSection.querySelector('h2');
        if (h2) h2.style.color = '#00d4ff';
    }
    
    // Force weapon platform/module colors
    const weaponPlatform = document.querySelector('.weapon-platform');
    const weaponModule = document.querySelector('.weapon-module');
    
    if (weaponPlatform) {
        weaponPlatform.style.color = '#ffffff';
        const h4 = weaponPlatform.querySelector('h4');
        if (h4) h4.style.color = '#00d4ff';
    }
    
    if (weaponModule) {
        weaponModule.style.color = '#ffffff';
        const h4 = weaponModule.querySelector('h4');
        if (h4) h4.style.color = '#00d4ff';
    }
    
    // Force all text in character sheet to be white
    const characterSheet = document.querySelector('.character-sheet-page');
    if (characterSheet) {
        characterSheet.style.color = '#ffffff';
        
        // Force all headings to cyan
        const headings = characterSheet.querySelectorAll('h1, h2, h3, h4');
        headings.forEach(heading => {
            heading.style.color = '#00d4ff';
        });
    }
}

function initializeCharacterSheet() {
    setupStatCalculations();
    setupHealthTracks();
    setupWeaponInstability();
    setupEventListeners();
    
    // Initial calculations
    updateDerivedValues();
    generateStrainTrack();
    generateInjuryTrack();
    generateInstabilityTrack();
}

function setupStatCalculations() {
    const statInputs = ['force', 'resilience', 'precision', 'adaptation', 'cognition'];
    
    statInputs.forEach(stat => {
        document.getElementById(stat).addEventListener('input', updateDerivedValues);
    });
}

function updateDerivedValues() {
    const resilience = parseInt(document.getElementById('resilience').value) || 0;
    
    // Calculate Max Strain: 6 + Resilience
    const maxStrain = 6 + resilience;
    document.getElementById('max-strain-display').textContent = maxStrain;
    
    // Calculate Max Injuries: 2 + floor(Resilience/2)
    const maxInjuries = 2 + Math.floor(resilience / 2);
    document.getElementById('max-injuries-display').textContent = maxInjuries;
    
    // Regenerate health tracks if values changed
    generateStrainTrack();
    generateInjuryTrack();
    updateInstabilityStatus();
}

function generateStrainTrack() {
    const maxStrain = parseInt(document.getElementById('max-strain-display').textContent);
    const strainTrack = document.getElementById('strain-track');
    
    strainTrack.innerHTML = '';
    
    for (let i = 1; i <= maxStrain; i++) {
        const box = document.createElement('div');
        box.className = 'strain-box';
        box.innerHTML = `
            <input type="checkbox" id="strain-${i}" name="strain">
            <label for="strain-${i}">${i}</label>
        `;
        strainTrack.appendChild(box);
    }
}

function generateInjuryTrack() {
    const maxInjuries = parseInt(document.getElementById('max-injuries-display').textContent);
    const injuryTrack = document.getElementById('injury-track');
    
    injuryTrack.innerHTML = '';
    
    for (let i = 1; i <= maxInjuries; i++) {
        const slot = document.createElement('div');
        slot.className = 'injury-slot';
        slot.innerHTML = `
            <div class="injury-checkbox">
                <input type="checkbox" id="injury-${i}">
                <label for="injury-${i}">Injury ${i}</label>
            </div>
            <input type="text" placeholder="Description (e.g., Burned Arm)" class="injury-description">
        `;
        injuryTrack.appendChild(slot);
    }
}

function setupWeaponInstability() {
    const instabilityGauge = document.getElementById('instability-gauge');
    instabilityGauge.addEventListener('input', generateInstabilityTrack);
}

function generateInstabilityTrack() {
    const gauge = parseInt(document.getElementById('instability-gauge').value) || 3;
    const track = document.getElementById('weapon-instability-track');
    
    track.innerHTML = '';
    
    for (let i = 1; i <= gauge; i++) {
        const box = document.createElement('div');
        box.className = 'instability-box';
        box.innerHTML = `
            <input type="checkbox" id="instability-${i}" name="instability">
            <label for="instability-${i}">${i}</label>
        `;
        track.appendChild(box);
    }
    
    updateInstabilityStatus();
}

function updateInstabilityStatus() {
    const force = parseInt(document.getElementById('force').value) || 0;
    const instabilityBoxes = document.querySelectorAll('input[name="instability"]:checked');
    const currentInstability = instabilityBoxes.length;
    const gauge = parseInt(document.getElementById('instability-gauge').value) || 3;
    
    let status = 'Stable';
    let statusClass = 'stable';
    
    if (currentInstability > force) {
        status = 'Unstable - Consequences escalate on failure';
        statusClass = 'unstable';
    }
    
    if (currentInstability > gauge) {
        status = 'Critical - Major malfunction risk';
        statusClass = 'critical';
    }
    
    if (currentInstability >= gauge * 2) {
        status = 'CATASTROPHIC - Extreme failure risk';
        statusClass = 'catastrophic';
    }
    
    const statusElement = document.getElementById('instability-status');
    statusElement.textContent = status;
    statusElement.className = statusClass;
}

function setupHealthTracks() {
    // Monitor instability changes
    document.addEventListener('change', function(e) {
        if (e.target.name === 'instability') {
            updateInstabilityStatus();
        }
    });
}

function setupEventListeners() {
    // Weapon instability controls
    document.getElementById('clear-instability').addEventListener('click', clearInstability);
    document.getElementById('add-instability').addEventListener('click', addInstability);
    
    // Import weapon configuration
    document.getElementById('import-weapon').addEventListener('click', importWeaponConfig);
    
    // Dice rolling functionality
    setupDiceRoller();
    
    // Character actions
    document.getElementById('save-character').addEventListener('click', saveCharacter);
    document.getElementById('load-character').addEventListener('click', loadCharacter);
    document.getElementById('export-pdf').addEventListener('click', exportPDF);
    document.getElementById('reset-sheet').addEventListener('click', resetSheet);
}

function clearInstability() {
    document.querySelectorAll('input[name="instability"]').forEach(box => {
        box.checked = false;
    });
    updateInstabilityStatus();
}

function addInstability() {
    const unchecked = document.querySelector('input[name="instability"]:not(:checked)');
    if (unchecked) {
        unchecked.checked = true;
        updateInstabilityStatus();
    }
}

function importWeaponConfig() {
    console.log('Import weapon config called');
    
    // Windows-specific localStorage access with error handling
    let weaponData = null;
    try {
        if (typeof(Storage) !== "undefined") {
            weaponData = localStorage.getItem('axiom-crucible-weapon');
        } else {
            console.error('localStorage not supported');
            showNotification('Browser storage not supported. Please use a modern browser.');
            return;
        }
    } catch (e) {
        console.error('localStorage access failed:', e);
        showNotification('Storage access failed. Check browser permissions.');
        return;
    }
    
    console.log('Weapon data from localStorage:', weaponData);
    
    if (weaponData && weaponData !== 'null' && weaponData.length > 0) {
        try {
            const weapon = JSON.parse(weaponData);
            console.log('Parsed weapon data:', weapon);
            
            // Windows-specific DOM element access with validation
            const platformInput = document.getElementById('weapon-platform');
            const platformFeatures = document.getElementById('platform-features');
            const moduleInput = document.getElementById('weapon-module');
            const moduleEffect = document.getElementById('module-effect');
            
            if (!platformInput || !platformFeatures || !moduleInput || !moduleEffect) {
                console.error('Form elements not found');
                showNotification('Character sheet form not properly loaded. Please refresh the page.');
                return;
            }
            
            // Populate weapon fields with Windows-compatible data extraction
            platformInput.value = weapon.platform?.name || weapon.platform || '';
            
            // Handle platform features - try multiple data sources
            let features = '';
            if (weapon.platform?.features) {
                if (Array.isArray(weapon.platform.features)) {
                    features = weapon.platform.features.join('\n');
                } else {
                    features = weapon.platform.features;
                }
            } else if (weapon.platform?.description) {
                features = weapon.platform.description;
            }
            platformFeatures.value = features;
            
            moduleInput.value = weapon.module?.name || weapon.module || '';
            
            // Handle module effect - try multiple data sources
            let effect = '';
            if (weapon.module?.effect) {
                effect = weapon.module.effect;
            } else if (weapon.module?.description) {
                effect = weapon.module.description;
            }
            moduleEffect.value = effect;
            
            showNotification('Weapon configuration imported successfully!');
            console.log('Weapon imported successfully');
        } catch (error) {
            console.error('Error parsing weapon data:', error);
            console.error('Raw data:', weaponData);
            showNotification('Error importing weapon configuration. Data may be corrupted.');
        }
    } else {
        console.log('No weapon data found in localStorage');
        console.log('localStorage contents:', Object.keys(localStorage));
        showNotification('No weapon configuration found. Please use the Weapon Selection tool first.');
    }
}

function saveCharacter() {
    const characterData = {
        identity: {
            name: document.getElementById('char-name').value,
            callsign: document.getElementById('callsign').value,
            concept: document.getElementById('concept').value,
            background: document.getElementById('background').value
        },
        stats: {
            force: document.getElementById('force').value,
            resilience: document.getElementById('resilience').value,
            precision: document.getElementById('precision').value,
            adaptation: document.getElementById('adaptation').value,
            cognition: document.getElementById('cognition').value
        },
        health: {
            strain: Array.from(document.querySelectorAll('input[name="strain"]:checked')).map(cb => cb.id),
            injuries: Array.from(document.querySelectorAll('.injury-slot')).map(slot => ({
                checked: slot.querySelector('input[type="checkbox"]').checked,
                description: slot.querySelector('.injury-description').value
            })),
            trauma: [
                {
                    checked: document.getElementById('trauma-1').checked,
                    description: document.querySelector('#trauma-1').parentNode.querySelector('input[type="text"]').value
                },
                {
                    checked: document.getElementById('trauma-2').checked,
                    description: document.querySelector('#trauma-2').parentNode.querySelector('input[type="text"]').value
                }
            ]
        },
        weapon: {
            platform: document.getElementById('weapon-platform').value,
            platformFeatures: document.getElementById('platform-features').value,
            module: document.getElementById('weapon-module').value,
            moduleEffect: document.getElementById('module-effect').value,
            difficulty: document.getElementById('weapon-difficulty').value,
            damage: document.getElementById('weapon-damage').value,
            instabilityGauge: document.getElementById('instability-gauge').value,
            currentInstability: Array.from(document.querySelectorAll('input[name="instability"]:checked')).map(cb => cb.id)
        },
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('axiom-crucible-character', JSON.stringify(characterData));
    showNotification('Character saved successfully!');
}

function loadCharacter() {
    const characterData = localStorage.getItem('axiom-crucible-character');
    
    if (!characterData) {
        showNotification('No saved character found.');
        return;
    }
    
    try {
        const data = JSON.parse(characterData);
        
        // Load identity
        document.getElementById('char-name').value = data.identity?.name || '';
        document.getElementById('callsign').value = data.identity?.callsign || '';
        document.getElementById('concept').value = data.identity?.concept || '';
        document.getElementById('background').value = data.identity?.background || '';
        
        // Load stats
        Object.entries(data.stats || {}).forEach(([stat, value]) => {
            const element = document.getElementById(stat);
            if (element) element.value = value;
        });
        
        // Load weapon
        document.getElementById('weapon-platform').value = data.weapon?.platform || '';
        document.getElementById('platform-features').value = data.weapon?.platformFeatures || '';
        document.getElementById('weapon-module').value = data.weapon?.module || '';
        document.getElementById('module-effect').value = data.weapon?.moduleEffect || '';
        document.getElementById('weapon-difficulty').value = data.weapon?.difficulty || '10';
        document.getElementById('weapon-damage').value = data.weapon?.damage || '1d6';
        document.getElementById('instability-gauge').value = data.weapon?.instabilityGauge || '3';
        
        // Update derived values and regenerate tracks
        updateDerivedValues();
        generateInstabilityTrack();
        
        // Restore health states
        setTimeout(() => {
            // Restore strain
            data.health?.strain?.forEach(strainId => {
                const element = document.getElementById(strainId);
                if (element) element.checked = true;
            });
            
            // Restore injuries
            data.health?.injuries?.forEach((injury, index) => {
                const slot = document.querySelectorAll('.injury-slot')[index];
                if (slot) {
                    slot.querySelector('input[type="checkbox"]').checked = injury.checked;
                    slot.querySelector('.injury-description').value = injury.description || '';
                }
            });
            
            // Restore trauma
            data.health?.trauma?.forEach((trauma, index) => {
                const traumaId = `trauma-${index + 1}`;
                const element = document.getElementById(traumaId);
                if (element) {
                    element.checked = trauma.checked;
                    element.parentNode.querySelector('input[type="text"]').value = trauma.description || '';
                }
            });
            
            // Restore weapon instability
            data.weapon?.currentInstability?.forEach(instabilityId => {
                const element = document.getElementById(instabilityId);
                if (element) element.checked = true;
            });
            
            updateInstabilityStatus();
        }, 100);
        
        showNotification('Character loaded successfully!');
    } catch (error) {
        showNotification('Error loading character data.');
    }
}

function exportPDF() {
    showNotification('PDF export would be implemented here (requires additional libraries)');
}

function resetSheet() {
    if (confirm('Are you sure you want to reset the entire character sheet? This cannot be undone.')) {
        document.querySelectorAll('input, textarea').forEach(element => {
            if (element.type === 'checkbox') {
                element.checked = false;
            } else if (element.type === 'number') {
                element.value = element.defaultValue || '0';
            } else {
                element.value = '';
            }
        });
        
        // Reset specific defaults
        document.getElementById('weapon-difficulty').value = '10';
        document.getElementById('weapon-damage').value = '1d6';
        document.getElementById('instability-gauge').value = '3';
        
        updateDerivedValues();
        showNotification('Character sheet reset.');
    }
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
        max-width: 300px;
    `;

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

// Enhanced Dice Rolling System - Smart Combination Logic
function setupDiceRoller() {
    const rollBtn = document.getElementById('roll-dice');
    const modal = document.getElementById('dice-modal');
    const closeModal = document.querySelector('.close-modal');
    const executeDiceRoll = document.getElementById('execute-dice-roll');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    let dicePresets = [];
    
    // Load presets from localStorage
    loadDicePresets();
    
    // Windows-safe event listeners
    if (rollBtn) {
        rollBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            // Ensure modal is visible on Windows
            setTimeout(() => modal.style.opacity = '1', 10);
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside (Windows compatible)
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            switchTab(targetTab);
        });
    });
    
    // Dice roll execution
    if (executeDiceRoll) {
        executeDiceRoll.addEventListener('click', function() {
            const expression = document.getElementById('dice-expression').value.trim();
            if (expression) {
                performDiceRoll(expression);
            } else {
                showNotification('Please enter a dice expression (e.g., 1d20+5 or 1d6+1d4+2)');
            }
        });
    }
    
    // Smart dice addition buttons
    const quickDiceButtons = document.querySelectorAll('.quick-dice');
    quickDiceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const sides = parseInt(this.dataset.sides);
            addDiceToExpression(sides);
        });
    });
    
    // Modifier addition buttons
    const modifierButtons = document.querySelectorAll('.modifier-btn');
    modifierButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mod = this.dataset.mod;
            addModifierToExpression(mod);
        });
    });
    
    // Clear expression button
    const clearExprBtn = document.getElementById('clear-expression');
    if (clearExprBtn) {
        clearExprBtn.addEventListener('click', function() {
            document.getElementById('dice-expression').value = '';
        });
    }
    
    // Save preset from dice expression
    const savePresetFromDice = document.getElementById('save-preset-from-dice');
    if (savePresetFromDice) {
        savePresetFromDice.addEventListener('click', function() {
            const expression = document.getElementById('dice-expression').value.trim();
            if (expression) {
                const name = prompt('Enter a name for this preset:');
                if (name && name.trim()) {
                    saveNewPreset(name.trim(), expression);
                }
            } else {
                showNotification('Please enter a dice expression first');
            }
        });
    }
    
    // Preset creation
    const savePresetBtn = document.getElementById('save-preset');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', function() {
            const name = document.getElementById('preset-name').value.trim();
            const expression = document.getElementById('preset-expression').value.trim();
            
            if (name && expression) {
                saveNewPreset(name, expression);
                document.getElementById('preset-name').value = '';
                document.getElementById('preset-expression').value = '';
            } else {
                showNotification('Please enter both preset name and dice expression');
            }
        });
    }
    
    // Keyboard support (Windows compatible)
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            } else if (e.key === 'Enter') {
                const activeTab = document.querySelector('.tab-content.active').id;
                if (activeTab === 'dice-tab') {
                    const expression = document.getElementById('dice-expression').value.trim();
                    if (expression) {
                        performDiceRoll(expression);
                    }
                }
            }
        }
    });
    
    function switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const targetContent = document.getElementById(tabName + '-tab');
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetContent) targetContent.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    function addDiceToExpression(sides) {
        const expressionInput = document.getElementById('dice-expression');
        const currentExpression = expressionInput.value.trim();
        
        if (currentExpression === '') {
            // First dice
            expressionInput.value = `1d${sides}`;
        } else {
            // Parse current expression and smartly combine
            const newExpression = combineWithExistingDice(currentExpression, sides);
            expressionInput.value = newExpression;
        }
    }
    
    function addModifierToExpression(modifier) {
        const expressionInput = document.getElementById('dice-expression');
        const currentExpression = expressionInput.value.trim();
        
        if (currentExpression === '') {
            // Just a modifier makes no sense, add a d20 first
            expressionInput.value = `1d20${modifier}`;
        } else {
            expressionInput.value = currentExpression + modifier;
        }
    }
    
    function combineWithExistingDice(expression, newDiceSides) {
        try {
            // Parse the existing expression
            const parsed = parseDiceExpression(expression);
            if (!parsed.valid) {
                // If parsing fails, just append
                return expression + `+1d${newDiceSides}`;
            }
            
            // Look for existing dice of the same type
            let foundExisting = false;
            const combinedDiceTerms = parsed.diceTerms.map(term => {
                if (term.sides === newDiceSides && !foundExisting) {
                    foundExisting = true;
                    return {
                        ...term,
                        count: term.count + 1
                    };
                }
                return term;
            });
            
            // If no existing dice of this type, add new term
            if (!foundExisting) {
                combinedDiceTerms.push({
                    count: 1,
                    sides: newDiceSides
                });
            }
            
            // Rebuild the expression
            return buildExpressionFromTerms(combinedDiceTerms, parsed.modifier);
        } catch (e) {
            // Fallback to simple append
            return expression + `+1d${newDiceSides}`;
        }
    }
    
    function buildExpressionFromTerms(diceTerms, modifier) {
        let expression = '';
        
        // Add dice terms
        diceTerms.forEach((term, index) => {
            if (index > 0) expression += '+';
            expression += `${term.count}d${term.sides}`;
        });
        
        // Add modifier
        if (modifier > 0) {
            expression += `+${modifier}`;
        } else if (modifier < 0) {
            expression += `${modifier}`;
        }
        
        return expression;
    }
    
    function loadDicePresets() {
        try {
            const savedPresets = localStorage.getItem('axiom-crucible-dice-presets');
            if (savedPresets) {
                dicePresets = JSON.parse(savedPresets);
                renderPresets();
            }
        } catch (e) {
            console.error('Error loading dice presets:', e);
        }
    }
    
    function saveDicePresets() {
        try {
            localStorage.setItem('axiom-crucible-dice-presets', JSON.stringify(dicePresets));
        } catch (e) {
            console.error('Error saving dice presets:', e);
            showNotification('Failed to save presets. Check browser storage permissions.');
        }
    }
    
    function saveNewPreset(name, expression) {
        // Validate expression first
        const parsed = parseDiceExpression(expression);
        if (!parsed.valid) {
            showNotification(`Invalid dice expression: ${parsed.error}`);
            return;
        }
        
        // Check if name already exists
        const existingIndex = dicePresets.findIndex(preset => preset.name === name);
        
        if (existingIndex >= 0) {
            if (confirm(`Preset "${name}" already exists. Overwrite?`)) {
                dicePresets[existingIndex] = { name, expression };
            } else {
                return;
            }
        } else {
            dicePresets.push({ name, expression });
        }
        
        saveDicePresets();
        renderPresets();
        showNotification(`Preset "${name}" saved successfully!`);
    }
    
    function renderPresets() {
        const presetList = document.getElementById('preset-list');
        if (!presetList) return;
        
        if (dicePresets.length === 0) {
            presetList.innerHTML = '<p style="color: #ccc; text-align: center; padding: 1rem;">No presets saved yet</p>';
            return;
        }
        
        presetList.innerHTML = dicePresets.map((preset, index) => `
            <div class="preset-item">
                <div class="preset-info">
                    <h4>${preset.name}</h4>
                    <div class="preset-expression">${preset.expression}</div>
                </div>
                <div class="preset-actions">
                    <button onclick="rollPreset(${index})">Roll</button>
                    <button onclick="editPreset(${index})">Edit</button>
                    <button class="delete-btn" onclick="deletePreset(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    // Make preset functions globally accessible
    window.rollPreset = function(index) {
        if (dicePresets[index]) {
            performDiceRoll(dicePresets[index].expression);
        }
    };
    
    window.editPreset = function(index) {
        if (dicePresets[index]) {
            document.getElementById('preset-name').value = dicePresets[index].name;
            document.getElementById('preset-expression').value = dicePresets[index].expression;
            deletePreset(index, false); // Delete without confirmation for editing
        }
    };
    
    window.deletePreset = function(index, askConfirm = true) {
        if (dicePresets[index]) {
            if (!askConfirm || confirm(`Delete preset "${dicePresets[index].name}"?`)) {
                dicePresets.splice(index, 1);
                saveDicePresets();
                renderPresets();
                if (askConfirm) {
                    showNotification('Preset deleted');
                }
            }
        }
    };
}

function performDiceRoll(expression) {
    try {
        const parsedRoll = parseDiceExpression(expression);
        if (!parsedRoll.valid) {
            showNotification(`Invalid dice expression: ${parsedRoll.error}`);
            return;
        }
        
        const diceDisplay = document.getElementById('dice-display');
        const resultDisplay = document.getElementById('dice-result');
        
        // Clear previous results
        diceDisplay.innerHTML = '';
        resultDisplay.innerHTML = '';
        
        // Count total number of dice for animation sizing
        const totalDice = parsedRoll.diceTerms.reduce((sum, term) => sum + term.count, 0);
        const isSmallDice = totalDice > 4;
        
        // Show rolling animation for all dice
        let diceIndex = 0;
        parsedRoll.diceTerms.forEach(term => {
            for (let i = 0; i < term.count; i++) {
                const diceElement = document.createElement('div');
                diceElement.className = 'dice-cube';
                diceElement.textContent = '?';
                
                // Adjust size based on number of dice
                if (isSmallDice) {
                    diceElement.style.fontSize = '1.2rem';
                    diceElement.style.width = '40px';
                    diceElement.style.height = '40px';
                    diceElement.style.lineHeight = '40px';
                } else {
                    diceElement.style.fontSize = '2rem';
                    diceElement.style.width = '60px';
                    diceElement.style.height = '60px';
                    diceElement.style.lineHeight = '60px';
                }
                
                diceDisplay.appendChild(diceElement);
                diceIndex++;
            }
        });
        
        // Windows-compatible timeout for animation
        setTimeout(() => {
            let totalResult = 0;
            let rollBreakdown = [];
            let diceElementIndex = 0;
            let allRolls = [];
            
            // Roll each dice term
            parsedRoll.diceTerms.forEach(term => {
                const termRolls = [];
                let termTotal = 0;
                
                for (let i = 0; i < term.count; i++) {
                    const roll = Math.floor(Math.random() * term.sides) + 1;
                    termRolls.push(roll);
                    termTotal += roll;
                    allRolls.push(roll);
                    
                    // Update dice display
                    const diceElement = diceDisplay.children[diceElementIndex];
                    if (diceElement) {
                        diceElement.textContent = roll;
                        
                        // Color code based on result
                        if (roll === 1) {
                            diceElement.style.background = 'linear-gradient(45deg, #ff6b6b, #ff4444)';
                            diceElement.style.color = '#fff';
                        } else if (roll === term.sides) {
                            diceElement.style.background = 'linear-gradient(45deg, #2ed573, #20bf6b)';
                            diceElement.style.color = '#000';
                        } else {
                            diceElement.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
                            diceElement.style.color = '#000';
                        }
                    }
                    diceElementIndex++;
                }
                
                totalResult += termTotal;
                if (term.count === 1) {
                    rollBreakdown.push(`1d${term.sides}: ${termRolls[0]}`);
                } else {
                    rollBreakdown.push(`${term.count}d${term.sides}: [${termRolls.join(', ')}] = ${termTotal}`);
                }
            });
            
            // Add modifier
            const finalResult = totalResult + parsedRoll.modifier;
            
            // Display results
            let resultText = rollBreakdown.join(' + ');
            if (parsedRoll.modifier !== 0) {
                const modText = parsedRoll.modifier > 0 ? `+${parsedRoll.modifier}` : `${parsedRoll.modifier}`;
                resultText += ` ${modText}`;
            }
            resultText += ` = ${finalResult}`;
            
            resultDisplay.innerHTML = resultText;
            
            // Add to history
            const historyItem = {
                dice: expression,
                modifier: 0, // Already included in expression
                rolls: rollBreakdown,
                total: finalResult,
                timestamp: new Date().toLocaleTimeString()
            };
            
            addToRollHistory(historyItem);
            
        }, 1000);
    } catch (error) {
        console.error('Error in dice roll:', error);
        showNotification('Error rolling dice. Check your expression format.');
    }
}

function parseDiceExpression(expression) {
    // Clean and normalize the expression
    const cleanExpr = expression.toLowerCase().replace(/\s/g, '');
    
    // Validate basic format
    if (!cleanExpr || cleanExpr.length === 0) {
        return { valid: false, error: 'Empty expression' };
    }
    
    // Parse dice terms and modifier
    const diceTerms = [];
    let modifier = 0;
    
    try {
        // Split by + and - while preserving the operators
        const parts = cleanExpr.split(/([+\-])/);
        let currentSign = 1;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            if (part === '+') {
                currentSign = 1;
            } else if (part === '-') {
                currentSign = -1;
            } else if (part && part !== '') {
                if (part.includes('d')) {
                    // Dice term
                    const diceMatch = part.match(/^(\d*)d(\d+)$/);
                    if (diceMatch) {
                        const count = parseInt(diceMatch[1]) || 1;
                        const sides = parseInt(diceMatch[2]);
                        
                        if (count <= 0 || count > 50) {
                            return { valid: false, error: 'Dice count must be between 1-50' };
                        }
                        if (sides <= 0 || sides > 1000) {
                            return { valid: false, error: 'Dice sides must be between 1-1000' };
                        }
                        
                        if (currentSign < 0) {
                            return { valid: false, error: 'Cannot subtract dice (use negative modifiers instead)' };
                        }
                        
                        diceTerms.push({ 
                            count: count, 
                            sides: sides
                        });
                    } else {
                        return { valid: false, error: `Invalid dice format: ${part}` };
                    }
                } else {
                    // Modifier
                    const modValue = parseInt(part);
                    if (isNaN(modValue)) {
                        return { valid: false, error: `Invalid modifier: ${part}` };
                    }
                    modifier += modValue * currentSign;
                }
            }
        }
        
        if (diceTerms.length === 0) {
            return { valid: false, error: 'Expression must contain at least one dice term' };
        }
        
        // Check total dice limit
        const totalDice = diceTerms.reduce((sum, term) => sum + term.count, 0);
        if (totalDice > 50) {
            return { valid: false, error: 'Total dice count cannot exceed 50' };
        }
        
        return {
            valid: true,
            diceTerms: diceTerms,
            modifier: modifier
        };
    } catch (e) {
        return { valid: false, error: 'Invalid expression format' };
    }
}

function addToRollHistory(rollData) {
    const historyList = document.getElementById('roll-history');
    if (!historyList) return;
    
    // Keep only last 10 rolls for Windows performance
    const maxHistory = 10;
    while (historyList.children.length >= maxHistory) {
        historyList.removeChild(historyList.lastChild);
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    let historyText = `${rollData.dice}: `;
    
    // Handle different roll types
    if (Array.isArray(rollData.rolls) && rollData.rolls.length > 0) {
        // Simple dice roll
        if (typeof rollData.rolls[0] === 'number') {
            if (rollData.rolls.length === 1) {
                historyText += `${rollData.total}`;
            } else {
                historyText += `[${rollData.rolls.join(', ')}]`;
                if (rollData.modifier !== 0) {
                    const modText = rollData.modifier > 0 ? `+${rollData.modifier}` : `${rollData.modifier}`;
                    historyText += ` ${modText}`;
                }
                historyText += ` = ${rollData.total}`;
            }
        } else {
            // Mixed dice roll (rollData.rolls contains breakdown strings)
            historyText = `${rollData.dice} = ${rollData.total}`;
        }
    } else {
        historyText += `${rollData.total}`;
    }
    
    historyText += ` (${rollData.timestamp})`;
    
    historyItem.textContent = historyText;
    historyList.insertBefore(historyItem, historyList.firstChild);
}
