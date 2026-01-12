// Core Engine - Main application controller and event system
// This is the central nervous system that coordinates all other modules

class CoreEngine {
    constructor() {
        this.version = '1.0.0';
        this.modules = new Map();
        this.eventBus = new EventBus();
        this.state = new StateManager();
        this.config = new ConfigManager();
        this.initialized = false;
        
        this.bindCoreEvents();
    }

    async initialize() {
        if (this.initialized) {
            console.warn('CoreEngine already initialized');
            return;
        }

        console.log('Initializing Axiom & Crucible Core Engine...');
        
        try {
            // Initialize core systems
            await this.initializeGameData();
            await this.initializeUI();
            await this.initializeModules();
            
            this.initialized = true;
            this.eventBus.emit('core:initialized');
            
            console.log('Core Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Core Engine:', error);
            this.eventBus.emit('core:error', { error });
        }
    }

    async initializeGameData() {
        this.gameData = new GameData();
        this.eventBus.emit('data:loaded');
    }

    async initializeUI() {
        this.uiManager = new UIManager(this);
        await this.uiManager.initialize();
    }

    async initializeModules() {
        // Load core modules
        const coreModules = [
            'WeaponBuilder',
            'ValidationEngine', 
            'ExportManager',
            'SaveManager'
        ];

        for (const moduleName of coreModules) {
            await this.loadModule(moduleName);
        }
    }

    async loadModule(moduleName, config = {}) {
        try {
            if (this.modules.has(moduleName)) {
                console.warn(`Module ${moduleName} already loaded`);
                return this.modules.get(moduleName);
            }

            // Dynamic module loading
            let ModuleClass;
            switch (moduleName) {
                case 'WeaponBuilder':
                    ModuleClass = WeaponBuilder;
                    break;
                case 'ValidationEngine':
                    ModuleClass = ValidationEngine;
                    break;
                case 'ExportManager':
                    ModuleClass = ExportManager;
                    break;
                case 'SaveManager':
                    ModuleClass = SaveManager;
                    break;
                default:
                    throw new Error(`Unknown module: ${moduleName}`);
            }

            const moduleInstance = new ModuleClass(this, config);
            this.modules.set(moduleName, moduleInstance);
            
            if (typeof moduleInstance.initialize === 'function') {
                await moduleInstance.initialize();
            }

            this.eventBus.emit('module:loaded', { moduleName, module: moduleInstance });
            console.log(`Module ${moduleName} loaded successfully`);
            
            return moduleInstance;
        } catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
            this.eventBus.emit('module:error', { moduleName, error });
            throw error;
        }
    }

    unloadModule(moduleName) {
        const module = this.modules.get(moduleName);
        if (!module) return;

        if (typeof module.destroy === 'function') {
            module.destroy();
        }

        this.modules.delete(moduleName);
        this.eventBus.emit('module:unloaded', { moduleName });
    }

    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    bindCoreEvents() {
        // Handle global application events
        this.eventBus.on('app:shutdown', this.handleShutdown.bind(this));
        this.eventBus.on('error:fatal', this.handleFatalError.bind(this));
    }

    handleShutdown() {
        console.log('Shutting down Core Engine...');
        
        // Clean up modules
        for (const [name, module] of this.modules) {
            if (typeof module.destroy === 'function') {
                try {
                    module.destroy();
                } catch (error) {
                    console.error(`Error destroying module ${name}:`, error);
                }
            }
        }
        
        this.modules.clear();
        this.initialized = false;
    }

    handleFatalError(error) {
        console.error('Fatal error occurred:', error);
        // Could implement error reporting, safe mode, etc.
    }
}

// Event Bus for decoupled communication
class EventBus {
    constructor() {
        this.events = new Map();
    }

    on(event, callback, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push({
            callback,
            context,
            id: this.generateId()
        });
    }

    off(event, callbackOrId) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const filtered = callbacks.filter(item => {
            return item.callback !== callbackOrId && item.id !== callbackOrId;
        });
        
        this.events.set(event, filtered);
    }

    emit(event, data = null) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        callbacks.forEach(({ callback, context }) => {
            try {
                if (context) {
                    callback.call(context, data);
                } else {
                    callback(data);
                }
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

// State Management
class StateManager {
    constructor() {
        this.state = {};
        this.history = [];
        this.maxHistory = 50;
        this.subscribers = new Map();
    }

    get(path) {
        return this.getNestedValue(this.state, path);
    }

    set(path, value) {
        this.pushHistory();
        this.setNestedValue(this.state, path, value);
        this.notifySubscribers(path, value);
    }

    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, []);
        }
        
        const id = this.generateId();
        this.subscribers.get(path).push({ id, callback });
        return id;
    }

    unsubscribe(path, id) {
        if (!this.subscribers.has(path)) return;
        
        const callbacks = this.subscribers.get(path);
        const filtered = callbacks.filter(item => item.id !== id);
        this.subscribers.set(path, filtered);
    }

    notifySubscribers(path, value) {
        // Notify exact path subscribers
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).forEach(({ callback }) => {
                callback(value, path);
            });
        }

        // Notify parent path subscribers
        const pathParts = path.split('.');
        for (let i = pathParts.length - 1; i >= 0; i--) {
            const parentPath = pathParts.slice(0, i).join('.');
            if (this.subscribers.has(parentPath)) {
                this.subscribers.get(parentPath).forEach(({ callback }) => {
                    callback(this.get(parentPath), parentPath);
                });
            }
        }
    }

    pushHistory() {
        this.history.push(JSON.parse(JSON.stringify(this.state)));
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length === 0) return false;
        
        this.state = this.history.pop();
        return true;
    }

    reset() {
        this.state = {};
        this.history = [];
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

// Configuration Management
class ConfigManager {
    constructor() {
        this.config = {
            ui: {
                theme: 'default',
                animations: true,
                responsiveBreakpoints: {
                    mobile: 768,
                    tablet: 1024,
                    desktop: 1200
                }
            },
            game: {
                tier: 0,
                enableAdvancedFeatures: false,
                autoSave: true,
                autoSaveInterval: 30000
            },
            debug: {
                enableLogging: false,
                enablePerformanceMetrics: false,
                logLevel: 'warn'
            }
        };
    }

    get(path) {
        return this.getNestedValue(this.config, path);
    }

    set(path, value) {
        this.setNestedValue(this.config, path, value);
        this.save();
    }

    load() {
        try {
            const saved = localStorage.getItem('axiom-crucible-config');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.config = { ...this.config, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load config from localStorage:', error);
        }
    }

    save() {
        try {
            localStorage.setItem('axiom-crucible-config', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save config to localStorage:', error);
        }
    }

    reset() {
        this.config = {};
        localStorage.removeItem('axiom-crucible-config');
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }
}

// Export for global access
window.CoreEngine = CoreEngine;
window.EventBus = EventBus;
window.StateManager = StateManager;
window.ConfigManager = ConfigManager;
