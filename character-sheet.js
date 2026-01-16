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
