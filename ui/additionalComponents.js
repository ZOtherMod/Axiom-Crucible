// Additional UI Components - WeaponDisplay and WeaponSummary

// Weapon Display Component - Shows the weapon construction area
class WeaponDisplay extends BaseComponent {
    getDefaultConfig() {
        return {
            enableDropZones: true,
            showSlotUtilization: true,
            enableCardPreview: true
        };
    }

    async render() {
        this.container.innerHTML = `
            <div class="weapon-display-header">
                <h3>3. Your Weapon Design</h3>
                <div class="display-controls">
                    <button class="control-btn" id="reset-weapon">
                        🗑️ Clear Design
                    </button>
                </div>
            </div>
            <div class="weapon-canvas" id="weapon-canvas">
                <div class="no-shell-message">
                    <div class="empty-state">
                        <h4>No Shell Selected</h4>
                        <p>Choose a shell above to begin building your weapon</p>
                    </div>
                </div>
            </div>
        `;
    }

    async bindEvents() {
        // Reset button
        const resetBtn = this.container.querySelector('#reset-weapon');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.handleResetWeapon.bind(this));
        }

        // Listen for weapon state changes
        this.core.eventBus.on('weapon:shell:selected', this.handleShellSelected.bind(this));
        this.core.eventBus.on('weapon:card:installed', this.handleCardInstalled.bind(this));
        this.core.eventBus.on('weapon:card:removed', this.handleCardRemoved.bind(this));
        this.core.eventBus.on('weapon:reset', this.handleWeaponReset.bind(this));
        this.core.eventBus.on('weapon:restored', this.handleWeaponRestored.bind(this));
    }

    handleShellSelected({ shell, weapon }) {
        this.renderWeaponShell(shell, weapon);
    }

    handleCardInstalled({ weapon }) {
        this.updateWeaponDisplay(weapon);
    }

    handleCardRemoved({ weapon }) {
        this.updateWeaponDisplay(weapon);
    }

    handleWeaponReset() {
        this.renderEmptyState();
    }

    handleWeaponRestored({ weapon }) {
        if (weapon.shell) {
            this.renderWeaponShell(weapon.shell, weapon);
        } else {
            this.renderEmptyState();
        }
    }

    handleResetWeapon() {
        if (confirm('Are you sure you want to clear your weapon design? This cannot be undone.')) {
            this.core.eventBus.emit('weapon:reset');
        }
    }

    renderEmptyState() {
        const canvas = this.container.querySelector('#weapon-canvas');
        canvas.innerHTML = `
            <div class="no-shell-message">
                <div class="empty-state">
                    <h4>No Shell Selected</h4>
                    <p>Choose a shell above to begin building your weapon</p>
                </div>
            </div>
        `;
    }

    renderWeaponShell(shell, weapon) {
        const canvas = this.container.querySelector('#weapon-canvas');
        const availableLayers = [...shell.requirements.mandatory, ...shell.requirements.optional];
        
        canvas.innerHTML = `
            <div class="weapon-shell-display">
                <div class="shell-header">
                    <h4>${shell.name}</h4>
                    <div class="shell-stats-compact">
                        <span class="stat-item">
                            Slots: <span class="stat-value">${this.getUsedSlots(weapon)}/${shell.stats.slots}</span>
                        </span>
                        <span class="stat-item">
                            Risk: <span class="stat-value risk-${this.getRiskLevel(weapon)}">${this.capitalizeFirst(this.getRiskLevel(weapon))}</span>
                        </span>
                    </div>
                </div>
                
                <div class="layer-slots-grid">
                    ${availableLayers.map(layerId => this.renderLayerSlot(layerId, shell, weapon)).join('')}
                </div>
                
                <div class="weapon-status">
                    ${this.renderWeaponStatus(shell, weapon)}
                </div>
            </div>
        `;

        this.bindDropZones();
    }

    renderLayerSlot(layerId, shell, weapon) {
        const layer = this.core.gameData.getLayer(layerId);
        const isRequired = shell.requirements.mandatory.includes(layerId);
        const installedCard = weapon.layers.get(layerId);
        
        let slotClass = 'layer-slot';
        if (isRequired) slotClass += ' required';
        if (installedCard) slotClass += ' occupied';

        return `
            <div class="${slotClass}" data-layer="${layerId}" data-component="drop-zone">
                <div class="slot-header">
                    <h5 style="color: ${layer.ui.color}">${layer.name} Layer</h5>
                    <span class="slot-requirement">${isRequired ? 'Required' : 'Optional'}</span>
                </div>
                
                ${installedCard ? this.renderInstalledCard(installedCard) : this.renderEmptySlot(layer)}
            </div>
        `;
    }

    renderInstalledCard(layerData) {
        const card = layerData.card;
        return `
            <div class="installed-card">
                <button class="remove-card-btn" data-layer="${card.layerId}" title="Remove card">
                    ×
                </button>
                <div class="card-content">
                    <div class="card-title">${card.name}</div>
                    <div class="card-role">${card.mechanics.role}</div>
                    <div class="card-stats">
                        <span class="risk-indicator risk-${card.stats.risk}">${this.capitalizeFirst(card.stats.risk)} Risk</span>
                        <span class="slot-indicator">${card.cost.slots} slot${card.cost.slots !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptySlot(layer) {
        return `
            <div class="empty-slot">
                <div class="slot-hint">
                    <span class="drop-icon">⬇️</span>
                    <span class="drop-text">Drop ${layer.name.toLowerCase()} card here</span>
                </div>
                <div class="layer-question">"${layer.question}"</div>
            </div>
        `;
    }

    renderWeaponStatus(shell, weapon) {
        const validation = this.validateWeapon(shell, weapon);
        const statusClass = validation.valid ? 'status-complete' : 'status-incomplete';
        
        return `
            <div class="status-display ${statusClass}">
                <div class="status-header">
                    <span class="status-icon">${validation.valid ? '✅' : '⚠️'}</span>
                    <span class="status-text">${validation.valid ? 'Weapon Complete' : 'Needs Attention'}</span>
                </div>
                ${validation.issues.length > 0 ? `
                    <div class="status-issues">
                        <ul>
                            ${validation.issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    bindDropZones() {
        const dropZones = this.container.querySelectorAll('[data-component="drop-zone"]');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
            zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });

        // Bind remove buttons
        const removeButtons = this.container.querySelectorAll('.remove-card-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', this.handleRemoveCard.bind(this));
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(event) {
        event.preventDefault();
        const zone = event.currentTarget;
        if (!zone.classList.contains('occupied')) {
            zone.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        const zone = event.currentTarget;
        if (!zone.contains(event.relatedTarget)) {
            zone.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const zone = event.currentTarget;
        zone.classList.remove('drag-over');
        
        try {
            const cardData = JSON.parse(event.dataTransfer.getData('application/json'));
            const layerId = zone.dataset.layer;
            
            this.core.eventBus.emit('drag:drop', { layerId, cardData });
        } catch (error) {
            console.error('Failed to handle drop:', error);
        }
    }

    handleRemoveCard(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const layerId = event.currentTarget.dataset.layer;
        this.core.eventBus.emit('weapon:card:remove', { layerId });
    }

    updateWeaponDisplay(weapon) {
        if (!weapon.shell) return;
        this.renderWeaponShell(weapon.shell, weapon);
    }

    // Utility methods
    getUsedSlots(weapon) {
        let total = 0;
        for (const layerData of weapon.layers.values()) {
            total += layerData.card.cost.slots;
        }
        return total;
    }

    getRiskLevel(weapon) {
        const risks = Array.from(weapon.layers.values()).map(layer => layer.card.stats.risk);
        if (risks.includes('high')) return 'high';
        if (risks.includes('medium')) return 'medium';
        if (risks.length > 0) return 'low';
        return 'none';
    }

    validateWeapon(shell, weapon) {
        const issues = [];
        const installedLayers = Array.from(weapon.layers.keys());
        
        // Check mandatory layers
        const missing = shell.requirements.mandatory.filter(
            layer => !installedLayers.includes(layer)
        );
        if (missing.length > 0) {
            issues.push(`Missing required: ${missing.map(this.capitalizeFirst).join(', ')}`);
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Weapon Summary Component
class WeaponSummary extends BaseComponent {
    getDefaultConfig() {
        return {
            showDetailedStats: true,
            enableExport: true,
            showDescription: true
        };
    }

    async render() {
        this.container.innerHTML = `
            <div class="summary-header">
                <h3>Weapon Summary</h3>
            </div>
            <div class="summary-content hidden" id="summary-content">
                <div class="stats-section">
                    <h4>Configuration</h4>
                    <div class="stat-grid" id="stat-grid">
                        <!-- Stats will be populated dynamically -->
                    </div>
                </div>
                
                <div class="layers-section">
                    <h4>Installed Components</h4>
                    <div class="layer-list" id="layer-list">
                        <!-- Layers will be populated dynamically -->
                    </div>
                </div>
                
                <div class="description-section">
                    <h4>Description</h4>
                    <div class="weapon-description" id="weapon-description-text">
                        <!-- Description will be populated dynamically -->
                    </div>
                </div>
                
                <div class="actions-section">
                    <button class="action-btn primary" id="export-btn">📄 Export Weapon</button>
                    <button class="action-btn secondary" id="save-btn">💾 Save Design</button>
                </div>
            </div>
            <div class="summary-empty" id="summary-empty">
                <p>Build your weapon to see the summary</p>
            </div>
        `;
    }

    async bindEvents() {
        // Action buttons
        const exportBtn = this.container.querySelector('#export-btn');
        const saveBtn = this.container.querySelector('#save-btn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', this.handleExport.bind(this));
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', this.handleSave.bind(this));
        }

        // Listen for weapon changes
        this.core.eventBus.on('weapon:shell:selected', this.handleWeaponChange.bind(this));
        this.core.eventBus.on('weapon:card:installed', this.handleWeaponChange.bind(this));
        this.core.eventBus.on('weapon:card:removed', this.handleWeaponChange.bind(this));
        this.core.eventBus.on('weapon:reset', this.handleWeaponReset.bind(this));
        this.core.eventBus.on('weapon:restored', this.handleWeaponChange.bind(this));
    }

    handleWeaponChange({ weapon }) {
        this.updateSummary(weapon);
    }

    handleWeaponReset() {
        this.showEmptyState();
    }

    handleExport() {
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        if (!weaponBuilder) return;

        try {
            const exportData = weaponBuilder.exportWeapon();
            this.downloadWeapon(exportData);
        } catch (error) {
            console.error('Export failed:', error);
            this.core.uiManager.showToast('Export failed', 'error');
        }
    }

    handleSave() {
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        if (!weaponBuilder) return;

        weaponBuilder.autoSave();
        this.core.uiManager.showToast('Design saved locally', 'success');
    }

    updateSummary(weapon) {
        if (!weapon.shell) {
            this.showEmptyState();
            return;
        }

        this.showSummaryContent();
        this.updateStats(weapon);
        this.updateLayers(weapon);
        this.updateDescription(weapon);
    }

    showEmptyState() {
        this.container.querySelector('#summary-content').classList.add('hidden');
        this.container.querySelector('#summary-empty').classList.remove('hidden');
    }

    showSummaryContent() {
        this.container.querySelector('#summary-content').classList.remove('hidden');
        this.container.querySelector('#summary-empty').classList.add('hidden');
    }

    updateStats(weapon) {
        const shell = weapon.shell;
        const usedSlots = this.getUsedSlots(weapon);
        const riskLevel = this.getRiskLevel(weapon);
        const status = this.getWeaponStatus(weapon);
        
        const statGrid = this.container.querySelector('#stat-grid');
        statGrid.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Shell Type:</span>
                <span class="stat-value">${shell.name}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Slots Used:</span>
                <span class="stat-value">${usedSlots}/${shell.stats.slots}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Risk Level:</span>
                <span class="stat-value risk-${riskLevel}">${this.capitalizeFirst(riskLevel)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Status:</span>
                <span class="stat-value">${status}</span>
            </div>
        `;
    }

    updateLayers(weapon) {
        const layerList = this.container.querySelector('#layer-list');
        
        if (weapon.layers.size === 0) {
            layerList.innerHTML = '<p class="no-layers">No components installed</p>';
            return;
        }

        const layerItems = Array.from(weapon.layers.entries()).map(([layerId, layerData]) => {
            const layer = this.core.gameData.getLayer(layerId);
            const card = layerData.card;
            
            return `
                <div class="layer-item">
                    <div class="layer-info">
                        <span class="layer-name" style="color: ${layer.ui.color}">${layer.name}:</span>
                        <span class="card-name">${card.name}</span>
                    </div>
                    <div class="layer-stats">
                        <span class="risk-badge risk-${card.stats.risk}">${this.capitalizeFirst(card.stats.risk)}</span>
                        <span class="slot-badge">${card.cost.slots} slot${card.cost.slots !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `;
        });

        layerList.innerHTML = layerItems.join('');
    }

    updateDescription(weapon) {
        const descriptionEl = this.container.querySelector('#weapon-description-text');
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        
        if (weaponBuilder) {
            const description = weaponBuilder.generateDescription();
            descriptionEl.innerHTML = `<p>${description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
        }
    }

    downloadWeapon(exportData) {
        const fileName = exportData.weapon.name || 
            `${exportData.weapon.shell.name}_weapon`;
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Utility methods
    getUsedSlots(weapon) {
        let total = 0;
        for (const layerData of weapon.layers.values()) {
            total += layerData.card.cost.slots;
        }
        return total;
    }

    getRiskLevel(weapon) {
        const risks = Array.from(weapon.layers.values()).map(layer => layer.card.stats.risk);
        if (risks.includes('high')) return 'high';
        if (risks.includes('medium')) return 'medium';
        if (risks.length > 0) return 'low';
        return 'none';
    }

    getWeaponStatus(weapon) {
        const shell = weapon.shell;
        const installedLayers = Array.from(weapon.layers.keys());
        const missing = shell.requirements.mandatory.filter(
            layer => !installedLayers.includes(layer)
        );
        
        if (missing.length > 0) {
            return `Missing: ${missing.map(this.capitalizeFirst).join(', ')}`;
        }
        
        return 'Complete';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Modal and Toast Components for UI feedback
class Modal extends BaseComponent {
    async render() {
        this.modalEl = this.createElement('div', {
            className: 'modal-overlay hidden',
            id: 'modal-overlay'
        });

        this.modalEl.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="modal-close" id="modal-close">×</button>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Content will be inserted here -->
                </div>
            </div>
        `;

        document.body.appendChild(this.modalEl);
    }

    async bindEvents() {
        const closeBtn = this.modalEl.querySelector('#modal-close');
        const overlay = this.modalEl;

        closeBtn.addEventListener('click', this.hide.bind(this));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modalEl.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    show(content, options = {}) {
        const body = this.modalEl.querySelector('#modal-body');
        body.innerHTML = content;
        
        this.modalEl.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    hide() {
        this.modalEl.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

class Toast extends BaseComponent {
    async render() {
        this.toastContainer = this.createElement('div', {
            className: 'toast-container',
            id: 'toast-container'
        });

        document.body.appendChild(this.toastContainer);
    }

    show(message, type = 'info', duration = 5000) {
        const toast = this.createElement('div', {
            className: `toast toast-${type}`
        });

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        this.toastContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('removing');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
}

// Export additional components
window.WeaponDisplay = WeaponDisplay;
window.WeaponSummary = WeaponSummary;
window.Modal = Modal;
window.Toast = Toast;
