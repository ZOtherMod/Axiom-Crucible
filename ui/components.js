// UI Components - Modular UI components for the weapon builder

// Shell Selector Component
class ShellSelector extends BaseComponent {
    getDefaultConfig() {
        return {
            allowMultipleSelection: false,
            showDetailedInfo: true,
            sortBy: 'displayOrder'
        };
    }

    async render() {
        const shells = this.core.gameData.getShellsByTier(this.core.config.get('game.tier'));
        
        this.container.innerHTML = `
            <div class="shell-selector-header">
                <h3>1. Choose Your Weapon Shell</h3>
                <p class="instruction-text">Select the type of weapon you want to create</p>
            </div>
            <div class="shell-grid" id="shell-grid">
                ${shells.map(shell => this.renderShellCard(shell)).join('')}
            </div>
        `;
    }

    renderShellCard(shell) {
        return `
            <div class="shell-card" data-shell="${shell.id}" data-component="shell-card">
                <div class="shell-header">
                    <h4>${shell.name}</h4>
                    <span class="shell-type">Shell ${shell.id.charAt(0).toUpperCase()}</span>
                </div>
                <div class="shell-description">
                    <p>${shell.description}</p>
                    ${this.config.showDetailedInfo ? this.renderShellDetails(shell) : ''}
                </div>
            </div>
        `;
    }

    renderShellDetails(shell) {
        return `
            <div class="shell-stats">
                ${Object.entries(shell.stats).map(([key, value]) => `
                    <div class="stat">
                        <span class="label">${this.formatLabel(key)}:</span>
                        <span class="value">${value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="shell-requirements">
                <div class="mandatory-layers">
                    <strong>Required:</strong> ${shell.requirements.mandatory.map(this.capitalizeFirst).join(', ')}
                </div>
                <div class="optional-layers">
                    <strong>Optional:</strong> ${shell.requirements.optional.map(this.capitalizeFirst).join(', ')}
                </div>
            </div>
        `;
    }

    async bindEvents() {
        const shellCards = this.container.querySelectorAll('.shell-card');
        
        shellCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleShellSelection(e));
            card.addEventListener('mouseenter', (e) => this.handleShellHover(e));
            card.addEventListener('mouseleave', (e) => this.handleShellUnhover(e));
        });

        // Listen for external shell selection events
        this.core.eventBus.on('weapon:shell:selected', this.handleExternalSelection.bind(this));
        this.core.eventBus.on('weapon:reset', this.handleWeaponReset.bind(this));
    }

    handleShellSelection(event) {
        const shellCard = event.currentTarget;
        const shellId = shellCard.dataset.shell;
        const shell = this.core.gameData.getShell(shellId);

        if (!shell) {
            console.error('Shell not found:', shellId);
            return;
        }

        // Update visual state
        this.clearSelections();
        shellCard.classList.add('selected');

        // Emit selection event
        this.core.eventBus.emit('weapon:shell:selected', { 
            shellId, 
            shell,
            source: 'user-interaction'
        });
    }

    handleShellHover(event) {
        const shellCard = event.currentTarget;
        const shellId = shellCard.dataset.shell;
        
        this.core.eventBus.emit('weapon:shell:hover', { shellId });
    }

    handleShellUnhover(event) {
        this.core.eventBus.emit('weapon:shell:unhover');
    }

    handleExternalSelection({ shellId, source }) {
        if (source === 'user-interaction') return; // Avoid infinite loops
        
        this.clearSelections();
        const shellCard = this.container.querySelector(`[data-shell="${shellId}"]`);
        if (shellCard) {
            shellCard.classList.add('selected');
        }
    }

    handleWeaponReset() {
        this.clearSelections();
    }

    clearSelections() {
        const selectedCards = this.container.querySelectorAll('.shell-card.selected');
        selectedCards.forEach(card => card.classList.remove('selected'));
    }

    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Layer Card Pool Component
class LayerCardPool extends BaseComponent {
    getDefaultConfig() {
        return {
            groupByLayer: true,
            showAvailabilityIndicator: true,
            enableFiltering: true,
            enableSorting: true
        };
    }

    async render() {
        const layers = Array.from(this.core.gameData.layers.values())
            .sort((a, b) => a.ui.displayOrder - b.ui.displayOrder);

        this.container.innerHTML = `
            <div class="layer-cards-header">
                <h3>2. Select Layer Cards</h3>
                <p class="instruction-text">Drag cards to your weapon slots below. Each layer can only be used once.</p>
                ${this.config.enableFiltering ? this.renderFilters() : ''}
            </div>
            <div class="layer-categories" id="layer-categories">
                ${layers.map(layer => this.renderLayerCategory(layer)).join('')}
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="card-filters">
                <div class="filter-group">
                    <label for="risk-filter">Risk Level:</label>
                    <select id="risk-filter" data-filter="risk">
                        <option value="">All</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="slot-filter">Slot Cost:</label>
                    <select id="slot-filter" data-filter="slots">
                        <option value="">All</option>
                        <option value="0">0 Slots</option>
                        <option value="1">1 Slot</option>
                        <option value="2">2+ Slots</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderLayerCategory(layer) {
        const cards = this.core.gameData.getCardsByLayer(layer.id);
        
        return `
            <div class="layer-category" data-layer="${layer.id}" style="border-left-color: ${layer.ui.color}">
                <h4 class="layer-title" style="color: ${layer.ui.color}">
                    ${layer.name} Layer - "${layer.question}"
                </h4>
                <div class="cards-row" id="cards-${layer.id}">
                    ${cards.map(card => this.renderLayerCard(card)).join('')}
                </div>
            </div>
        `;
    }

    renderLayerCard(card) {
        return `
            <div class="layer-card" 
                 data-card="${card.id}" 
                 data-layer="${card.layerId}" 
                 data-slots="${card.cost.slots}" 
                 data-risk="${card.stats.risk}"
                 draggable="true"
                 data-component="layer-card">
                <div class="card-header">
                    <h5>${card.name}</h5>
                    <div class="card-badges">
                        <span class="risk-badge risk-${card.stats.risk}">${this.capitalizeFirst(card.stats.risk)} Risk</span>
                        <span class="slot-badge">${card.cost.slots} Slot${card.cost.slots !== 1 ? 's' : ''}</span>
                        ${card.rarity !== 'common' ? `<span class="rarity-badge rarity-${card.rarity}">${this.capitalizeFirst(card.rarity)}</span>` : ''}
                    </div>
                </div>
                <p class="card-role">${card.mechanics.role}</p>
                <div class="card-failure">
                    <strong>Failure:</strong> ${card.mechanics.failure}
                </div>
                ${this.config.showAvailabilityIndicator ? '<div class="availability-indicator"></div>' : ''}
            </div>
        `;
    }

    async bindEvents() {
        // Drag and drop events
        const layerCards = this.container.querySelectorAll('.layer-card');
        layerCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Filter events
        if (this.config.enableFiltering) {
            const filters = this.container.querySelectorAll('[data-filter]');
            filters.forEach(filter => {
                filter.addEventListener('change', (e) => this.handleFilterChange(e));
            });
        }

        // Listen for weapon state changes
        this.core.eventBus.on('weapon:card:installed', this.handleCardInstalled.bind(this));
        this.core.eventBus.on('weapon:card:removed', this.handleCardRemoved.bind(this));
        this.core.eventBus.on('weapon:shell:selected', this.handleShellSelected.bind(this));
        this.core.eventBus.on('weapon:reset', this.handleWeaponReset.bind(this));
    }

    handleDragStart(event) {
        const card = event.currentTarget;
        
        if (card.classList.contains('unavailable')) {
            event.preventDefault();
            return;
        }

        card.classList.add('dragging');
        
        const cardData = {
            cardId: card.dataset.card,
            layerId: card.dataset.layer,
            slots: parseInt(card.dataset.slots),
            risk: card.dataset.risk
        };

        event.dataTransfer.setData('application/json', JSON.stringify(cardData));
        event.dataTransfer.effectAllowed = 'move';

        this.core.eventBus.emit('drag:started', { cardData, element: card });
    }

    handleDragEnd(event) {
        const card = event.currentTarget;
        card.classList.remove('dragging');
        
        this.core.eventBus.emit('drag:ended');
    }

    handleFilterChange(event) {
        const filterType = event.target.dataset.filter;
        const filterValue = event.target.value;
        
        this.applyFilters();
    }

    applyFilters() {
        const riskFilter = this.container.querySelector('#risk-filter')?.value || '';
        const slotFilter = this.container.querySelector('#slot-filter')?.value || '';
        
        const cards = this.container.querySelectorAll('.layer-card');
        
        cards.forEach(card => {
            let visible = true;
            
            // Risk filter
            if (riskFilter && card.dataset.risk !== riskFilter) {
                visible = false;
            }
            
            // Slot filter
            if (slotFilter) {
                const cardSlots = parseInt(card.dataset.slots);
                if (slotFilter === '2' && cardSlots < 2) {
                    visible = false;
                } else if (slotFilter !== '2' && cardSlots.toString() !== slotFilter) {
                    visible = false;
                }
            }
            
            card.style.display = visible ? '' : 'none';
        });
    }

    handleCardInstalled({ cardId }) {
        const cardElement = this.container.querySelector(`[data-card="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.add('unavailable');
            cardElement.draggable = false;
        }
    }

    handleCardRemoved({ cardId }) {
        const cardElement = this.container.querySelector(`[data-card="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.remove('unavailable');
            cardElement.draggable = true;
        }
    }

    handleShellSelected({ shell }) {
        // Update card availability based on shell requirements
        const cards = this.container.querySelectorAll('.layer-card');
        
        cards.forEach(card => {
            const cardData = this.core.gameData.getCard(card.dataset.card);
            const compatibility = this.core.gameData.validateShellCardCompatibility(shell.id, cardData.id);
            
            if (compatibility.valid) {
                card.classList.remove('incompatible');
                card.title = '';
            } else {
                card.classList.add('incompatible');
                card.title = compatibility.reason;
            }
        });
    }

    handleWeaponReset() {
        // Reset all card states
        const cards = this.container.querySelectorAll('.layer-card');
        cards.forEach(card => {
            card.classList.remove('unavailable', 'incompatible');
            card.draggable = true;
            card.title = '';
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export components
window.ShellSelector = ShellSelector;
window.LayerCardPool = LayerCardPool;
