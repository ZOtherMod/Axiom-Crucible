// Axiom & Crucible - Weapon Builder JavaScript

class WeaponBuilder {
    constructor() {
        this.selectedShell = null;
        this.installedLayers = {};
        this.shellData = {
            'hand-tool': {
                name: 'Hand Tool',
                slots: 2,
                stressLimit: 'Low',
                mandatory: ['structure', 'power'],
                optional: ['control', 'safety'],
                specialRule: 'If Stress exceeds limit, the operator suffers consequences.'
            },
            'static-device': {
                name: 'Static Device',
                slots: 3,
                stressLimit: 'Moderate',
                mandatory: ['structure', 'power'],
                optional: ['control', 'sense', 'safety'],
                specialRule: 'Stationary weapon mechanism.'
            },
            'simple-automaton': {
                name: 'Simple Automaton',
                slots: 3,
                stressLimit: 'Low',
                mandatory: ['structure', 'power', 'control'],
                optional: ['sense', 'safety'],
                specialRule: 'Control failures cause erratic behavior.'
            }
        };

        this.cardData = {
            'basic-frame': {
                name: 'Basic Frame',
                layer: 'structure',
                role: 'Holds all other layers together',
                slots: 0,
                risk: 'low',
                failure: 'The device bends, cracks, or collapses'
            },
            'manual-drive': {
                name: 'Manual Drive',
                layer: 'power',
                role: 'Converts your effort into motion or force',
                slots: 1,
                risk: 'low',
                failure: 'The device locks up or kicks back'
            },
            'stored-motion': {
                name: 'Stored Motion',
                layer: 'power',
                role: 'Releases stored kinetic force',
                slots: 1,
                risk: 'medium',
                failure: 'Power releases all at once'
            },
            'simple-trigger': {
                name: 'Simple Trigger',
                layer: 'control',
                role: 'On/Off behavior based on one condition',
                slots: 1,
                risk: 'low',
                failure: 'The trigger sticks or misfires'
            },
            'fixed-sequence': {
                name: 'Fixed Sequence',
                layer: 'control',
                role: 'Executes a set series of actions',
                slots: 1,
                risk: 'medium',
                failure: 'Steps occur out of order'
            },
            'physical-contact': {
                name: 'Physical Contact',
                layer: 'sense',
                role: 'Detects direct contact',
                slots: 1,
                risk: 'low',
                failure: 'Missed contact or false signals'
            },
            'stress-motion': {
                name: 'Stress & Motion',
                layer: 'sense',
                role: 'Detects sustained force or motion',
                slots: 1,
                risk: 'medium',
                failure: 'Overreaction or total silence'
            },
            'emergency-release': {
                name: 'Emergency Release',
                layer: 'safety',
                role: 'Reduces damage when something goes wrong',
                slots: 1,
                risk: 'low',
                failure: 'The release jams or works partially'
            },
            'shock-dampening': {
                name: 'Shock Dampening',
                layer: 'safety',
                role: 'Absorbs violent force',
                slots: 1,
                risk: 'low',
                failure: 'Protection degrades or stops working'
            }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        // Shell selection
        document.querySelectorAll('.shell-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const shellType = e.currentTarget.dataset.shell;
                this.selectShell(shellType);
            });
        });

        // Drag and drop for layer cards
        document.querySelectorAll('.layer-card').forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        // Export and clear buttons
        document.getElementById('export-weapon').addEventListener('click', this.exportWeapon.bind(this));
        document.getElementById('clear-weapon').addEventListener('click', this.clearWeapon.bind(this));
    }

    selectShell(shellType) {
        // Remove previous selection
        document.querySelectorAll('.shell-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new shell
        document.querySelector(`[data-shell="${shellType}"]`).classList.add('selected');
        this.selectedShell = shellType;

        // Clear installed layers when changing shells
        this.installedLayers = {};
        this.markAllCardsAvailable();

        this.renderWeaponDisplay();
        this.updateSummary();
    }

    renderWeaponDisplay() {
        const weaponDisplay = document.getElementById('weapon-display');
        
        if (!this.selectedShell) {
            weaponDisplay.innerHTML = `
                <div class="no-shell-message">
                    <p>Select a shell above to begin building your weapon</p>
                </div>
            `;
            return;
        }

        const shell = this.shellData[this.selectedShell];
        const allLayers = [...shell.mandatory, ...shell.optional];
        
        weaponDisplay.innerHTML = `
            <div class="weapon-shell">
                <h4>${shell.name} Configuration</h4>
                <div class="shell-info">
                    <div class="info-item">
                        <span class="info-label">Shell Type:</span>
                        <span class="info-value">${shell.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Slot Capacity:</span>
                        <span class="info-value">${this.getUsedSlots()}/${shell.slots}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Stress Limit:</span>
                        <span class="info-value">${shell.stressLimit}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value">${this.getWeaponStatus()}</span>
                    </div>
                </div>
                <div class="layer-slots">
                    ${allLayers.map(layer => this.renderLayerSlot(layer)).join('')}
                </div>
            </div>
        `;

        // Add drop event listeners
        document.querySelectorAll('.slot-area').forEach(slot => {
            slot.addEventListener('dragover', this.handleDragOver.bind(this));
            slot.addEventListener('drop', this.handleDrop.bind(this));
            slot.addEventListener('dragenter', this.handleDragEnter.bind(this));
            slot.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });

        // Add remove button listeners
        document.querySelectorAll('.remove-card').forEach(btn => {
            btn.addEventListener('click', this.handleRemoveCard.bind(this));
        });
    }

    renderLayerSlot(layerType) {
        const shell = this.shellData[this.selectedShell];
        const isRequired = shell.mandatory.includes(layerType);
        const installedCard = this.installedLayers[layerType];
        
        let slotClass = 'slot-area';
        if (isRequired) slotClass += ' required';
        if (installedCard) slotClass += ' occupied';

        let content = `
            <div class="slot-label">
                ${this.capitalizeFirst(layerType)} Layer
                ${isRequired ? ' (Required)' : ' (Optional)'}
            </div>
        `;

        if (installedCard) {
            const cardInfo = this.cardData[installedCard];
            content += `
                <div class="installed-card">
                    <button class="remove-card" data-layer="${layerType}">×</button>
                    <div class="card-header">
                        <h5>${cardInfo.name}</h5>
                        <div class="card-badges">
                            <span class="risk-badge risk-${cardInfo.risk}">${this.capitalizeFirst(cardInfo.risk)} Risk</span>
                            <span class="slot-badge">${cardInfo.slots} Slots</span>
                        </div>
                    </div>
                    <p class="card-role">${cardInfo.role}</p>
                </div>
            `;
        } else {
            content += `
                <div class="slot-hint">
                    Drop a ${layerType} layer card here
                </div>
            `;
        }

        return `<div class="${slotClass}" data-layer="${layerType}">${content}</div>`;
    }

    handleDragStart(e) {
        const card = e.target.closest('.layer-card');
        if (card.classList.contains('used')) {
            e.preventDefault();
            return;
        }

        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.card);
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.slot-area').forEach(slot => {
            slot.classList.remove('drag-over', 'drop-zone-active', 'drop-zone-invalid');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        const slot = e.target.closest('.slot-area');
        if (slot && !slot.classList.contains('occupied')) {
            slot.classList.add('drop-zone-active');
        }
    }

    handleDragLeave(e) {
        const slot = e.target.closest('.slot-area');
        if (slot && !slot.contains(e.relatedTarget)) {
            slot.classList.remove('drop-zone-active', 'drop-zone-invalid');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.slot-area');
        const cardId = e.dataTransfer.getData('text/plain');
        const card = this.cardData[cardId];
        const layerType = slot.dataset.layer;

        // Remove visual feedback
        slot.classList.remove('drop-zone-active', 'drop-zone-invalid');

        // Check if this is a valid drop
        if (card.layer !== layerType || this.installedLayers[layerType]) {
            return;
        }

        // Check if we have enough slots
        if (this.getUsedSlots() + card.slots > this.shellData[this.selectedShell].slots) {
            alert(`Not enough slots! This card requires ${card.slots} slots, but you only have ${this.shellData[this.selectedShell].slots - this.getUsedSlots()} slots remaining.`);
            return;
        }

        // Install the card
        this.installCard(layerType, cardId);
    }

    handleRemoveCard(e) {
        e.preventDefault();
        e.stopPropagation();
        const layerType = e.target.dataset.layer;
        this.removeCard(layerType);
    }

    installCard(layerType, cardId) {
        this.installedLayers[layerType] = cardId;
        
        // Mark card as used
        const cardElement = document.querySelector(`[data-card="${cardId}"]`);
        cardElement.classList.add('used');
        cardElement.draggable = false;

        this.renderWeaponDisplay();
        this.updateSummary();
    }

    removeCard(layerType) {
        const cardId = this.installedLayers[layerType];
        delete this.installedLayers[layerType];

        // Mark card as available
        const cardElement = document.querySelector(`[data-card="${cardId}"]`);
        cardElement.classList.remove('used');
        cardElement.draggable = true;

        this.renderWeaponDisplay();
        this.updateSummary();
    }

    getUsedSlots() {
        return Object.values(this.installedLayers).reduce((total, cardId) => {
            return total + this.cardData[cardId].slots;
        }, 0);
    }

    getWeaponStatus() {
        if (!this.selectedShell) return 'No shell selected';
        
        const shell = this.shellData[this.selectedShell];
        const installedLayerTypes = Object.keys(this.installedLayers);
        const missingRequired = shell.mandatory.filter(layer => !installedLayerTypes.includes(layer));
        
        if (missingRequired.length > 0) {
            return `Missing: ${missingRequired.map(this.capitalizeFirst).join(', ')}`;
        }
        
        return 'Complete';
    }

    getTotalRisk() {
        const risks = Object.values(this.installedLayers).map(cardId => this.cardData[cardId].risk);
        const riskCounts = { low: 0, medium: 0, high: 0 };
        
        risks.forEach(risk => riskCounts[risk]++);
        
        if (riskCounts.high > 0) return 'High';
        if (riskCounts.medium > 0) return 'Medium';
        if (riskCounts.low > 0) return 'Low';
        return 'None';
    }

    generateWeaponDescription() {
        if (!this.selectedShell || Object.keys(this.installedLayers).length === 0) {
            return 'Build your weapon to see its description';
        }

        const shell = this.shellData[this.selectedShell];
        const installedCards = Object.entries(this.installedLayers).map(([layer, cardId]) => {
            const card = this.cardData[cardId];
            return { layer, card };
        });

        let description = `This ${shell.name.toLowerCase()} `;
        
        // Describe structure
        const structure = installedCards.find(item => item.layer === 'structure');
        if (structure) {
            description += `uses a ${structure.card.name.toLowerCase()} that ${structure.card.role.toLowerCase()}. `;
        }

        // Describe power
        const power = installedCards.find(item => item.layer === 'power');
        if (power) {
            description += `It is powered by ${power.card.name.toLowerCase()} which ${power.card.role.toLowerCase()}. `;
        }

        // Describe control
        const control = installedCards.find(item => item.layer === 'control');
        if (control) {
            description += `Control is handled by ${control.card.name.toLowerCase()} that ${control.card.role.toLowerCase()}. `;
        }

        // Describe sensing
        const sense = installedCards.find(item => item.layer === 'sense');
        if (sense) {
            description += `It can detect threats using ${sense.card.name.toLowerCase()} which ${sense.card.role.toLowerCase()}. `;
        }

        // Describe safety
        const safety = installedCards.find(item => item.layer === 'safety');
        if (safety) {
            description += `Safety is provided by ${safety.card.name.toLowerCase()} that ${safety.card.role.toLowerCase()}. `;
        }

        // Add special rule
        if (shell.specialRule) {
            description += `\n\nSpecial Rule: ${shell.specialRule}`;
        }

        // Add failure warnings
        const failures = installedCards.map(item => `${item.card.name}: ${item.card.failure}`);
        if (failures.length > 0) {
            description += `\n\nPotential Failures:\n• ${failures.join('\n• ')}`;
        }

        return description;
    }

    updateSummary() {
        const summaryElement = document.getElementById('weapon-stats');
        
        if (!this.selectedShell) {
            summaryElement.classList.add('hidden');
            return;
        }

        summaryElement.classList.remove('hidden');
        
        // Update basic stats
        const shell = this.shellData[this.selectedShell];
        document.getElementById('summary-shell').textContent = shell.name;
        document.getElementById('summary-slots').textContent = `${this.getUsedSlots()}/${shell.slots}`;
        document.getElementById('summary-risk').textContent = this.getTotalRisk();

        // Update installed layers
        const layersList = document.getElementById('summary-layers');
        const installedEntries = Object.entries(this.installedLayers);
        
        if (installedEntries.length === 0) {
            layersList.innerHTML = '<p class="no-layers">No layers installed</p>';
        } else {
            layersList.innerHTML = installedEntries.map(([layer, cardId]) => {
                const card = this.cardData[cardId];
                return `
                    <div class="layer-item">
                        <span class="layer-name">${this.capitalizeFirst(layer)}: ${card.name}</span>
                        <div class="layer-details">
                            <span class="risk-badge risk-${card.risk}">${this.capitalizeFirst(card.risk)}</span>
                            <span class="slot-badge">${card.slots} slots</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update description
        document.getElementById('weapon-description').innerHTML = 
            `<p>${this.generateWeaponDescription().replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }

    updateDisplay() {
        this.renderWeaponDisplay();
        this.updateSummary();
    }

    exportWeapon() {
        if (!this.selectedShell) {
            alert('Please select a shell first!');
            return;
        }

        const shell = this.shellData[this.selectedShell];
        const weaponData = {
            shell: this.selectedShell,
            shellName: shell.name,
            layers: this.installedLayers,
            stats: {
                slotsUsed: this.getUsedSlots(),
                totalSlots: shell.slots,
                risk: this.getTotalRisk(),
                status: this.getWeaponStatus()
            },
            description: this.generateWeaponDescription()
        };

        const dataStr = JSON.stringify(weaponData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${shell.name.replace(/\s+/g, '_')}_weapon.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    clearWeapon() {
        if (confirm('Are you sure you want to clear your weapon design?')) {
            this.selectedShell = null;
            this.installedLayers = {};
            
            // Reset shell selection
            document.querySelectorAll('.shell-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Reset all cards
            this.markAllCardsAvailable();
            
            this.updateDisplay();
        }
    }

    markAllCardsAvailable() {
        document.querySelectorAll('.layer-card').forEach(card => {
            card.classList.remove('used');
            card.draggable = true;
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the weapon builder when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeaponBuilder();
});
