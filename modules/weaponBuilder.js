// Weapon Builder Module - Core weapon building logic and management

class WeaponBuilder {
    constructor(coreEngine, config = {}) {
        this.core = coreEngine;
        this.config = {
            enableAutoSave: true,
            autoSaveInterval: 30000,
            maxHistorySteps: 50,
            enableValidation: true,
            ...config
        };

        this.currentWeapon = {
            id: this.generateId(),
            name: '',
            shell: null,
            layers: new Map(),
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: '1.0.0'
            }
        };

        this.buildHistory = [];
        this.autoSaveTimer = null;
    }

    async initialize() {
        console.log('Initializing Weapon Builder...');
        
        this.bindEvents();
        this.startAutoSave();
        
        this.core.eventBus.emit('weaponbuilder:initialized');
    }

    bindEvents() {
        // Core weapon building events
        this.core.eventBus.on('weapon:shell:selected', this.handleShellSelection.bind(this));
        this.core.eventBus.on('weapon:card:install', this.handleCardInstall.bind(this));
        this.core.eventBus.on('weapon:card:remove', this.handleCardRemoval.bind(this));
        this.core.eventBus.on('weapon:reset', this.handleWeaponReset.bind(this));
        
        // Drag and drop events
        this.core.eventBus.on('drag:drop', this.handleCardDrop.bind(this));
        
        // Save/load events
        this.core.eventBus.on('app:save', this.saveWeapon.bind(this));
        this.core.eventBus.on('app:load', this.loadWeapon.bind(this));
        this.core.eventBus.on('app:undo', this.undo.bind(this));
        this.core.eventBus.on('app:redo', this.redo.bind(this));
    }

    // Core weapon building methods
    selectShell(shellId) {
        const shell = this.core.gameData.getShell(shellId);
        if (!shell) {
            throw new Error(`Shell not found: ${shellId}`);
        }

        this.pushHistory();
        
        // Clear existing layers when changing shells
        this.currentWeapon.layers.clear();
        this.currentWeapon.shell = shell;
        this.updateMetadata();

        this.core.eventBus.emit('weapon:shell:selected', { 
            shellId, 
            shell, 
            weapon: this.currentWeapon 
        });

        this.validateWeapon();
        return true;
    }

    installCard(layerId, cardId, options = {}) {
        const card = this.core.gameData.getCard(cardId);
        if (!card) {
            throw new Error(`Card not found: ${cardId}`);
        }

        // Validation
        if (this.config.enableValidation) {
            const validation = this.validateCardInstallation(layerId, cardId);
            if (!validation.valid) {
                throw new Error(`Cannot install card: ${validation.reason}`);
            }
        }

        this.pushHistory();

        // Install the card
        this.currentWeapon.layers.set(layerId, {
            cardId,
            card,
            installedAt: new Date().toISOString(),
            options
        });

        this.updateMetadata();

        this.core.eventBus.emit('weapon:card:installed', { 
            layerId, 
            cardId, 
            card, 
            weapon: this.currentWeapon 
        });

        this.validateWeapon();
        return true;
    }

    removeCard(layerId) {
        if (!this.currentWeapon.layers.has(layerId)) {
            return false;
        }

        this.pushHistory();

        const layerData = this.currentWeapon.layers.get(layerId);
        this.currentWeapon.layers.delete(layerId);
        this.updateMetadata();

        this.core.eventBus.emit('weapon:card:removed', { 
            layerId, 
            cardId: layerData.cardId, 
            weapon: this.currentWeapon 
        });

        this.validateWeapon();
        return true;
    }

    resetWeapon() {
        this.pushHistory();
        
        this.currentWeapon = {
            id: this.generateId(),
            name: '',
            shell: null,
            layers: new Map(),
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: '1.0.0'
            }
        };

        this.core.eventBus.emit('weapon:reset', { weapon: this.currentWeapon });
        return true;
    }

    // Validation methods
    validateCardInstallation(layerId, cardId) {
        if (!this.currentWeapon.shell) {
            return { valid: false, reason: 'No shell selected' };
        }

        const card = this.core.gameData.getCard(cardId);
        const shell = this.currentWeapon.shell;

        // Check if layer is already occupied
        if (this.currentWeapon.layers.has(layerId)) {
            return { valid: false, reason: 'Layer already occupied' };
        }

        // Check if card belongs to the correct layer
        if (card.layerId !== layerId) {
            return { valid: false, reason: 'Card does not belong to this layer' };
        }

        // Check shell compatibility
        const compatibility = this.core.gameData.validateShellCardCompatibility(shell.id, cardId);
        if (!compatibility.valid) {
            return compatibility;
        }

        // Check slot availability
        const usedSlots = this.getUsedSlots();
        const availableSlots = shell.stats.slots - usedSlots;
        
        if (card.cost.slots > availableSlots) {
            return { 
                valid: false, 
                reason: `Insufficient slots: need ${card.cost.slots}, have ${availableSlots}` 
            };
        }

        return { valid: true };
    }

    validateWeapon() {
        if (!this.currentWeapon.shell) {
            return { valid: false, issues: ['No shell selected'] };
        }

        const issues = [];
        const shell = this.currentWeapon.shell;
        const installedLayers = Array.from(this.currentWeapon.layers.keys());

        // Check mandatory layers
        const missingMandatory = shell.requirements.mandatory.filter(
            layer => !installedLayers.includes(layer)
        );
        
        if (missingMandatory.length > 0) {
            issues.push(`Missing required layers: ${missingMandatory.join(', ')}`);
        }

        // Check slot usage
        const usedSlots = this.getUsedSlots();
        if (usedSlots > shell.stats.slots) {
            issues.push(`Too many slots used: ${usedSlots}/${shell.stats.slots}`);
        }

        // Check forbidden layers
        const forbiddenInstalled = installedLayers.filter(
            layer => shell.requirements.forbidden.includes(layer)
        );
        
        if (forbiddenInstalled.length > 0) {
            issues.push(`Forbidden layers installed: ${forbiddenInstalled.join(', ')}`);
        }

        const isValid = issues.length === 0;
        const result = { valid: isValid, issues };

        this.core.eventBus.emit('weapon:validated', { 
            weapon: this.currentWeapon, 
            validation: result 
        });

        return result;
    }

    // Utility methods
    getUsedSlots() {
        let total = 0;
        for (const layerData of this.currentWeapon.layers.values()) {
            total += layerData.card.cost.slots;
        }
        return total;
    }

    getAvailableSlots() {
        if (!this.currentWeapon.shell) return 0;
        return this.currentWeapon.shell.stats.slots - this.getUsedSlots();
    }

    getRiskLevel() {
        const risks = [];
        for (const layerData of this.currentWeapon.layers.values()) {
            risks.push(layerData.card.stats.risk);
        }

        if (risks.includes('high')) return 'high';
        if (risks.includes('medium')) return 'medium';
        if (risks.length > 0) return 'low';
        return 'none';
    }

    getWeaponStatus() {
        const validation = this.validateWeapon();
        if (!validation.valid) {
            return validation.issues[0]; // Return first issue
        }
        return 'Complete';
    }

    generateDescription() {
        if (!this.currentWeapon.shell || this.currentWeapon.layers.size === 0) {
            return 'Design your weapon to see its description';
        }

        const shell = this.currentWeapon.shell;
        const layers = Array.from(this.currentWeapon.layers.entries());

        let description = `This ${shell.name.toLowerCase()} `;

        // Describe each layer
        layers.forEach(([layerId, layerData]) => {
            const layer = this.core.gameData.getLayer(layerId);
            const card = layerData.card;
            
            switch (layerId) {
                case 'structure':
                    description += `uses ${card.name.toLowerCase()} that ${card.mechanics.role.toLowerCase()}. `;
                    break;
                case 'power':
                    description += `It is powered by ${card.name.toLowerCase()} which ${card.mechanics.role.toLowerCase()}. `;
                    break;
                case 'control':
                    description += `Control is handled by ${card.name.toLowerCase()} that ${card.mechanics.role.toLowerCase()}. `;
                    break;
                case 'sense':
                    description += `It can detect threats using ${card.name.toLowerCase()} which ${card.mechanics.role.toLowerCase()}. `;
                    break;
                case 'safety':
                    description += `Safety is provided by ${card.name.toLowerCase()} that ${card.mechanics.role.toLowerCase()}. `;
                    break;
            }
        });

        // Add special rules
        if (shell.rules.specialRule) {
            description += `\n\nSpecial Rule: ${shell.rules.specialRule}`;
        }

        // Add failure scenarios
        const failures = layers.map(([_, layerData]) => 
            `${layerData.card.name}: ${layerData.card.mechanics.failure}`
        );
        
        if (failures.length > 0) {
            description += `\n\nPotential Failures:\n• ${failures.join('\n• ')}`;
        }

        return description;
    }

    // History management
    pushHistory() {
        const snapshot = this.createSnapshot();
        this.buildHistory.push(snapshot);
        
        if (this.buildHistory.length > this.config.maxHistorySteps) {
            this.buildHistory.shift();
        }
    }

    createSnapshot() {
        return {
            timestamp: Date.now(),
            weapon: {
                id: this.currentWeapon.id,
                name: this.currentWeapon.name,
                shell: this.currentWeapon.shell,
                layers: new Map(this.currentWeapon.layers),
                metadata: { ...this.currentWeapon.metadata }
            }
        };
    }

    undo() {
        if (this.buildHistory.length === 0) return false;
        
        const snapshot = this.buildHistory.pop();
        this.currentWeapon = snapshot.weapon;
        
        this.core.eventBus.emit('weapon:restored', { weapon: this.currentWeapon });
        return true;
    }

    redo() {
        // Implement redo functionality if needed
        return false;
    }

    // Event handlers
    handleShellSelection({ shellId, source }) {
        if (source !== 'user-interaction') return;
        this.selectShell(shellId);
    }

    handleCardInstall({ layerId, cardId, options }) {
        this.installCard(layerId, cardId, options);
    }

    handleCardRemoval({ layerId }) {
        this.removeCard(layerId);
    }

    handleWeaponReset() {
        this.resetWeapon();
    }

    handleCardDrop({ layerId, cardData }) {
        this.installCard(layerId, cardData.cardId);
    }

    // Auto-save functionality
    startAutoSave() {
        if (!this.config.enableAutoSave) return;
        
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.config.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    autoSave() {
        try {
            const saveData = this.exportWeapon();
            localStorage.setItem('axiom-crucible-autosave', JSON.stringify(saveData));
            this.core.eventBus.emit('weapon:autosaved', { weapon: this.currentWeapon });
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    loadAutoSave() {
        try {
            const saved = localStorage.getItem('axiom-crucible-autosave');
            if (saved) {
                const saveData = JSON.parse(saved);
                this.importWeapon(saveData);
                return true;
            }
        } catch (error) {
            console.warn('Failed to load auto-save:', error);
        }
        return false;
    }

    // Save/load functionality
    saveWeapon() {
        return this.exportWeapon();
    }

    loadWeapon(data) {
        return this.importWeapon(data);
    }

    exportWeapon() {
        return {
            weapon: {
                id: this.currentWeapon.id,
                name: this.currentWeapon.name,
                shell: this.currentWeapon.shell,
                layers: Array.from(this.currentWeapon.layers.entries()),
                metadata: this.currentWeapon.metadata
            },
            stats: {
                usedSlots: this.getUsedSlots(),
                availableSlots: this.getAvailableSlots(),
                riskLevel: this.getRiskLevel(),
                status: this.getWeaponStatus()
            },
            description: this.generateDescription(),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    importWeapon(data) {
        if (!data.weapon) {
            throw new Error('Invalid weapon data');
        }

        this.currentWeapon = {
            ...data.weapon,
            layers: new Map(data.weapon.layers)
        };

        this.core.eventBus.emit('weapon:imported', { weapon: this.currentWeapon });
        return true;
    }

    updateMetadata() {
        this.currentWeapon.metadata.modified = new Date().toISOString();
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    destroy() {
        this.stopAutoSave();
        this.buildHistory = [];
        this.currentWeapon = null;
    }
}

// Validation Engine - Advanced validation and rule checking
class ValidationEngine {
    constructor(coreEngine, config = {}) {
        this.core = coreEngine;
        this.config = {
            enableRealTimeValidation: true,
            strictMode: false,
            ...config
        };

        this.validators = new Map();
        this.rules = new Map();
        this.loadValidators();
    }

    async initialize() {
        console.log('Initializing Validation Engine...');
        this.loadCoreRules();
        this.bindEvents();
    }

    loadValidators() {
        // Register core validators
        this.validators.set('shell-requirements', this.validateShellRequirements.bind(this));
        this.validators.set('slot-limits', this.validateSlotLimits.bind(this));
        this.validators.set('tier-constraints', this.validateTierConstraints.bind(this));
        this.validators.set('compatibility', this.validateCompatibility.bind(this));
        this.validators.set('risk-assessment', this.validateRiskLevel.bind(this));
    }

    loadCoreRules() {
        // Load validation rules from game data
        for (const rule of this.core.gameData.rules.values()) {
            this.rules.set(rule.id, rule);
        }
    }

    bindEvents() {
        if (this.config.enableRealTimeValidation) {
            this.core.eventBus.on('weapon:shell:selected', this.handleWeaponChange.bind(this));
            this.core.eventBus.on('weapon:card:installed', this.handleWeaponChange.bind(this));
            this.core.eventBus.on('weapon:card:removed', this.handleWeaponChange.bind(this));
        }
    }

    handleWeaponChange({ weapon }) {
        const validation = this.validateWeapon(weapon);
        this.core.eventBus.emit('validation:result', { weapon, validation });
    }

    validateWeapon(weapon) {
        const results = {
            valid: true,
            errors: [],
            warnings: [],
            info: []
        };

        for (const [name, validator] of this.validators) {
            try {
                const result = validator(weapon);
                if (result.errors) results.errors.push(...result.errors);
                if (result.warnings) results.warnings.push(...result.warnings);
                if (result.info) results.info.push(...result.info);
            } catch (error) {
                console.error(`Validator ${name} failed:`, error);
                results.errors.push(`Internal validation error: ${name}`);
            }
        }

        results.valid = results.errors.length === 0;
        return results;
    }

    validateShellRequirements(weapon) {
        const result = { errors: [], warnings: [], info: [] };
        
        if (!weapon.shell) {
            result.errors.push('No shell selected');
            return result;
        }

        const shell = weapon.shell;
        const installedLayers = Array.from(weapon.layers.keys());

        // Check mandatory layers
        const missing = shell.requirements.mandatory.filter(
            layer => !installedLayers.includes(layer)
        );
        
        if (missing.length > 0) {
            result.errors.push(`Missing required layers: ${missing.join(', ')}`);
        }

        // Check forbidden layers
        const forbidden = installedLayers.filter(
            layer => shell.requirements.forbidden.includes(layer)
        );
        
        if (forbidden.length > 0) {
            result.errors.push(`Forbidden layers installed: ${forbidden.join(', ')}`);
        }

        return result;
    }

    validateSlotLimits(weapon) {
        const result = { errors: [], warnings: [], info: [] };
        
        if (!weapon.shell) return result;

        let usedSlots = 0;
        for (const layerData of weapon.layers.values()) {
            usedSlots += layerData.card.cost.slots;
        }

        const maxSlots = weapon.shell.stats.slots;
        
        if (usedSlots > maxSlots) {
            result.errors.push(`Slot limit exceeded: ${usedSlots}/${maxSlots}`);
        } else if (usedSlots === maxSlots) {
            result.info.push('All slots utilized');
        } else {
            result.info.push(`${maxSlots - usedSlots} slots available`);
        }

        return result;
    }

    validateTierConstraints(weapon) {
        const result = { errors: [], warnings: [], info: [] };
        
        if (!weapon.shell) return result;

        const currentTier = this.core.config.get('game.tier');
        
        // Check shell tier
        if (weapon.shell.tier > currentTier) {
            result.errors.push(`Shell tier too high: ${weapon.shell.tier} > ${currentTier}`);
        }

        // Check card tiers
        for (const [layerId, layerData] of weapon.layers) {
            if (layerData.card.tier > currentTier) {
                result.errors.push(`Card "${layerData.card.name}" tier too high: ${layerData.card.tier} > ${currentTier}`);
            }
        }

        return result;
    }

    validateCompatibility(weapon) {
        const result = { errors: [], warnings: [], info: [] };
        
        if (!weapon.shell) return result;

        for (const [layerId, layerData] of weapon.layers) {
            const compatibility = this.core.gameData.validateShellCardCompatibility(
                weapon.shell.id, 
                layerData.card.id
            );
            
            if (!compatibility.valid) {
                result.errors.push(`Incompatible card "${layerData.card.name}": ${compatibility.reason}`);
            }
        }

        return result;
    }

    validateRiskLevel(weapon) {
        const result = { errors: [], warnings: [], info: [] };
        
        if (weapon.layers.size === 0) return result;

        const risks = Array.from(weapon.layers.values()).map(layer => layer.card.stats.risk);
        const riskCounts = { low: 0, medium: 0, high: 0 };
        
        risks.forEach(risk => riskCounts[risk]++);

        if (riskCounts.high > 2) {
            result.warnings.push('Very high risk configuration - expect frequent failures');
        } else if (riskCounts.high > 0) {
            result.warnings.push('High risk components detected - use with caution');
        } else if (riskCounts.medium > 3) {
            result.warnings.push('Multiple medium risk components may interact unpredictably');
        }

        return result;
    }
}

// Export modules
window.WeaponBuilder = WeaponBuilder;
window.ValidationEngine = ValidationEngine;
