// Core Game Data Management System
// This file contains all game data and acts as the central data store

class GameData {
    constructor() {
        this.version = '1.0.0';
        this.gameSystem = 'Axiom & Crucible';
        this.tier = 0; // Current tier level
        
        // Initialize all game data
        this.shells = new Map();
        this.layers = new Map();
        this.cards = new Map();
        this.rules = new Map();
        this.mechanics = new Map();
        
        this.loadCoreData();
    }

    loadCoreData() {
        this.loadShells();
        this.loadLayers();
        this.loadCards();
        this.loadRules();
        this.loadMechanics();
    }

    // Shell Data Management
    loadShells() {
        const shellsData = [
            {
                id: 'hand-tool',
                name: 'Hand Tool',
                tier: 0,
                category: 'weapon',
                description: 'A manually operated weapon held by a person',
                stats: {
                    slots: 2,
                    stressLimit: 'Low',
                    powerThroughput: 'Low',
                    maintenance: 'Frequent'
                },
                requirements: {
                    mandatory: ['structure', 'power'],
                    optional: ['control', 'safety'],
                    forbidden: []
                },
                rules: {
                    specialRule: 'If Stress exceeds limit, the operator suffers consequences.',
                    overclocking: '+2 Instability per use',
                    materialQuality: 'Crude or reclaimed'
                },
                ui: {
                    icon: 'hand-tool.svg',
                    color: '#3498db',
                    displayOrder: 1
                }
            },
            {
                id: 'static-device',
                name: 'Static Device',
                tier: 0,
                category: 'weapon',
                description: 'A stationary weapon mechanism (trap, ballista)',
                stats: {
                    slots: 3,
                    stressLimit: 'Moderate',
                    powerThroughput: 'Low',
                    maintenance: 'Frequent'
                },
                requirements: {
                    mandatory: ['structure', 'power'],
                    optional: ['control', 'sense', 'safety'],
                    forbidden: []
                },
                rules: {
                    specialRule: 'Stationary weapon mechanism with enhanced stability.',
                    overclocking: '+2 Instability per use',
                    materialQuality: 'Crude or reclaimed'
                },
                ui: {
                    icon: 'static-device.svg',
                    color: '#27ae60',
                    displayOrder: 2
                }
            },
            {
                id: 'simple-automaton',
                name: 'Simple Automaton',
                tier: 0,
                category: 'weapon',
                description: 'A slow, semi-autonomous weapon',
                stats: {
                    slots: 3,
                    stressLimit: 'Low',
                    powerThroughput: 'Low',
                    maintenance: 'Frequent'
                },
                requirements: {
                    mandatory: ['structure', 'power', 'control'],
                    optional: ['sense', 'safety'],
                    forbidden: []
                },
                rules: {
                    specialRule: 'Control failures cause erratic behavior.',
                    overclocking: '+2 Instability per use',
                    materialQuality: 'Crude or reclaimed'
                },
                ui: {
                    icon: 'automaton.svg',
                    color: '#e74c3c',
                    displayOrder: 3
                }
            }
        ];

        shellsData.forEach(shell => this.shells.set(shell.id, shell));
    }

    // Layer Type Management
    loadLayers() {
        const layersData = [
            {
                id: 'structure',
                name: 'Structure',
                question: 'What holds this together?',
                description: 'Physical framework and mounting systems',
                tier: 0,
                category: 'foundation',
                ui: {
                    color: '#34495e',
                    icon: 'structure.svg',
                    displayOrder: 1
                }
            },
            {
                id: 'power',
                name: 'Power',
                question: 'What makes this do anything?',
                description: 'Energy generation and transmission systems',
                tier: 0,
                category: 'core',
                ui: {
                    color: '#f39c12',
                    icon: 'power.svg',
                    displayOrder: 2
                }
            },
            {
                id: 'control',
                name: 'Control',
                question: 'How does it decide what to do?',
                description: 'Decision-making and behavioral systems',
                tier: 0,
                category: 'intelligence',
                ui: {
                    color: '#9b59b6',
                    icon: 'control.svg',
                    displayOrder: 3
                }
            },
            {
                id: 'sense',
                name: 'Sense',
                question: 'What can this detect?',
                description: 'Detection and awareness systems',
                tier: 0,
                category: 'intelligence',
                ui: {
                    color: '#1abc9c',
                    icon: 'sense.svg',
                    displayOrder: 4
                }
            },
            {
                id: 'safety',
                name: 'Safety',
                question: 'What prevents disaster?',
                description: 'Failure prevention and damage mitigation',
                tier: 0,
                category: 'protection',
                ui: {
                    color: '#e67e22',
                    icon: 'safety.svg',
                    displayOrder: 5
                }
            }
        ];

        layersData.forEach(layer => this.layers.set(layer.id, layer));
    }

    // Card Data Management
    loadCards() {
        const cardsData = [
            // Structure Cards
            {
                id: 'basic-frame',
                name: 'Basic Frame',
                layerId: 'structure',
                tier: 0,
                rarity: 'common',
                cost: {
                    slots: 0,
                    materials: ['crude-metal', 'basic-tools'],
                    time: 'hours'
                },
                stats: {
                    risk: 'low',
                    stability: 1,
                    durability: 'basic'
                },
                mechanics: {
                    role: 'Holds all other layers together',
                    failure: 'The device bends, cracks, or collapses',
                    triggers: ['excessive-stress', 'material-fatigue'],
                    effects: ['structure-damage', 'total-failure-risk']
                },
                requirements: {
                    skills: [],
                    tools: ['basic-workshop'],
                    knowledge: []
                },
                ui: {
                    description: 'A basic structural framework that provides mounting points for other components.',
                    flavorText: 'Crude but functional, this frame will hold... probably.',
                    tags: ['foundational', 'required']
                }
            },
            {
                id: 'manual-drive',
                name: 'Manual Drive',
                layerId: 'power',
                tier: 0,
                rarity: 'common',
                cost: {
                    slots: 1,
                    materials: ['lever-mechanism', 'grip-material'],
                    time: 'hours'
                },
                stats: {
                    risk: 'low',
                    powerOutput: 'variable',
                    efficiency: 'direct'
                },
                mechanics: {
                    role: 'Converts your effort into motion or force',
                    failure: 'The device locks up or kicks back',
                    triggers: ['operator-fatigue', 'mechanism-jam'],
                    effects: ['operator-injury', 'power-loss']
                },
                requirements: {
                    skills: ['basic-mechanics'],
                    tools: ['hand-tools'],
                    knowledge: []
                },
                ui: {
                    description: 'Direct manual operation providing reliable but limited power.',
                    flavorText: 'Your muscles are the engine. Hope you\'re strong enough.',
                    tags: ['reliable', 'operator-dependent']
                }
            },
            {
                id: 'stored-motion',
                name: 'Stored Motion',
                layerId: 'power',
                tier: 0,
                rarity: 'uncommon',
                cost: {
                    slots: 1,
                    materials: ['spring-steel', 'tension-cable'],
                    time: 'days'
                },
                stats: {
                    risk: 'medium',
                    powerOutput: 'burst',
                    efficiency: 'high'
                },
                mechanics: {
                    role: 'Releases stored kinetic force',
                    failure: 'Power releases all at once',
                    triggers: ['spring-failure', 'release-malfunction'],
                    effects: ['area-damage', 'component-destruction']
                },
                requirements: {
                    skills: ['advanced-mechanics', 'spring-working'],
                    tools: ['precision-tools'],
                    knowledge: ['energy-storage']
                },
                ui: {
                    description: 'Pre-tensioned mechanism that stores and releases energy on command.',
                    flavorText: 'Wind it up and pray the release mechanism works when you need it.',
                    tags: ['powerful', 'unstable', 'burst-power']
                }
            }
            // More cards would be added here following the same pattern
        ];

        cardsData.forEach(card => this.cards.set(card.id, card));
    }

    // Rules System
    loadRules() {
        const rulesData = [
            {
                id: 'tier-0-constraints',
                name: 'Tier-0 Global Constraints',
                category: 'tier-constraints',
                applies: 'all',
                constraints: {
                    stabilityContribution: { min: 0, max: 2 },
                    powerThroughput: 'low',
                    stressTolerance: 'limited',
                    maintenanceRequirement: 'frequent',
                    overclockingAllowed: true,
                    overclockingPenalty: 2,
                    materialQuality: ['crude', 'reclaimed']
                }
            },
            {
                id: 'shell-layer-restrictions',
                name: 'Shell Layer Restrictions',
                category: 'compatibility',
                applies: 'shells',
                rules: {
                    oneCardPerLayer: true,
                    mandatoryLayersRequired: true,
                    slotLimitsEnforced: true,
                    forbiddenLayersBlocked: true
                }
            }
        ];

        rulesData.forEach(rule => this.rules.set(rule.id, rule));
    }

    // Mechanics System
    loadMechanics() {
        const mechanicsData = [
            {
                id: 'failure-system',
                name: 'Failure Mechanics',
                category: 'core',
                description: 'How components fail and affect the overall system',
                implementation: 'FailureManager',
                config: {
                    cascadeFailures: true,
                    stressAccumulation: true,
                    maintenanceDecay: true
                }
            },
            {
                id: 'risk-assessment',
                name: 'Risk Assessment',
                category: 'core',
                description: 'Calculate overall system risk and failure probability',
                implementation: 'RiskCalculator',
                config: {
                    riskFactors: ['component-risk', 'interaction-risk', 'operator-risk'],
                    aggregationMethod: 'weighted-average'
                }
            }
        ];

        mechanicsData.forEach(mechanic => this.mechanics.set(mechanic.id, mechanic));
    }

    // Data Access Methods
    getShell(id) {
        return this.shells.get(id);
    }

    getShellsByCategory(category) {
        return Array.from(this.shells.values()).filter(shell => shell.category === category);
    }

    getShellsByTier(tier) {
        return Array.from(this.shells.values()).filter(shell => shell.tier === tier);
    }

    getLayer(id) {
        return this.layers.get(id);
    }

    getLayersByCategory(category) {
        return Array.from(this.layers.values()).filter(layer => layer.category === category);
    }

    getCard(id) {
        return this.cards.get(id);
    }

    getCardsByLayer(layerId) {
        return Array.from(this.cards.values()).filter(card => card.layerId === layerId);
    }

    getCardsByTier(tier) {
        return Array.from(this.cards.values()).filter(card => card.tier === tier);
    }

    getCardsByRarity(rarity) {
        return Array.from(this.cards.values()).filter(card => card.rarity === rarity);
    }

    getRule(id) {
        return this.rules.get(id);
    }

    getMechanic(id) {
        return this.mechanics.get(id);
    }

    // Data Validation
    validateShellCardCompatibility(shellId, cardId) {
        const shell = this.getShell(shellId);
        const card = this.getCard(cardId);
        
        if (!shell || !card) return { valid: false, reason: 'Invalid shell or card' };
        
        const layer = this.getLayer(card.layerId);
        if (!layer) return { valid: false, reason: 'Invalid layer' };
        
        // Check if layer is allowed for this shell
        const allowedLayers = [...shell.requirements.mandatory, ...shell.requirements.optional];
        if (!allowedLayers.includes(card.layerId)) {
            return { valid: false, reason: `${layer.name} layer not allowed for ${shell.name}` };
        }
        
        // Check if layer is forbidden
        if (shell.requirements.forbidden.includes(card.layerId)) {
            return { valid: false, reason: `${layer.name} layer forbidden for ${shell.name}` };
        }
        
        // Check tier compatibility
        if (card.tier > shell.tier) {
            return { valid: false, reason: 'Card tier too high for shell' };
        }
        
        return { valid: true };
    }

    // Export/Import for save systems
    exportData() {
        return {
            version: this.version,
            gameSystem: this.gameSystem,
            tier: this.tier,
            shells: Array.from(this.shells.entries()),
            layers: Array.from(this.layers.entries()),
            cards: Array.from(this.cards.entries()),
            rules: Array.from(this.rules.entries()),
            mechanics: Array.from(this.mechanics.entries())
        };
    }

    importData(data) {
        if (data.version !== this.version) {
            console.warn('Data version mismatch. Migration may be required.');
        }
        
        this.shells = new Map(data.shells);
        this.layers = new Map(data.layers);
        this.cards = new Map(data.cards);
        this.rules = new Map(data.rules);
        this.mechanics = new Map(data.mechanics);
    }

    // Plugin system for extending data
    registerShell(shellData) {
        if (this.shells.has(shellData.id)) {
            throw new Error(`Shell ${shellData.id} already exists`);
        }
        this.shells.set(shellData.id, shellData);
    }

    registerCard(cardData) {
        if (this.cards.has(cardData.id)) {
            throw new Error(`Card ${cardData.id} already exists`);
        }
        this.cards.set(cardData.id, cardData);
    }

    registerLayer(layerData) {
        if (this.layers.has(layerData.id)) {
            throw new Error(`Layer ${layerData.id} already exists`);
        }
        this.layers.set(layerData.id, layerData);
    }
}

// Global instance
window.GameData = GameData;
