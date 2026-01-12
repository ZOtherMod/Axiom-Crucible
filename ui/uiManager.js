// UI Manager - Handles all user interface rendering and interactions
// Modular component system for easy extension and maintenance

class UIManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.components = new Map();
        this.layouts = new Map();
        this.themes = new Map();
        this.currentTheme = 'default';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        console.log('Initializing UI Manager...');

        try {
            await this.loadThemes();
            await this.initializeComponents();
            await this.setupLayouts();
            await this.bindGlobalEvents();

            this.initialized = true;
            this.core.eventBus.emit('ui:initialized');
        } catch (error) {
            console.error('Failed to initialize UI Manager:', error);
            throw error;
        }
    }

    async loadThemes() {
        // Default theme is already loaded via CSS
        // Additional themes can be loaded dynamically
        this.themes.set('default', {
            name: 'Default',
            cssFile: 'styles.css',
            loaded: true
        });

        // Future themes
        this.themes.set('dark', {
            name: 'Dark Mode',
            cssFile: 'themes/dark.css',
            loaded: false
        });

        this.themes.set('high-contrast', {
            name: 'High Contrast',
            cssFile: 'themes/high-contrast.css',
            loaded: false
        });
    }

    async initializeComponents() {
        // Register all UI components
        this.registerComponent('ShellSelector', ShellSelector);
        this.registerComponent('LayerCardPool', LayerCardPool);
        this.registerComponent('WeaponDisplay', WeaponDisplay);
        this.registerComponent('WeaponSummary', WeaponSummary);
        this.registerComponent('NavigationBar', NavigationBar);
        this.registerComponent('Modal', Modal);
        this.registerComponent('Toast', Toast);

        // Initialize core components
        await this.initializeComponent('ShellSelector', '#shell-selection');
        await this.initializeComponent('LayerCardPool', '#layer-cards');
        await this.initializeComponent('WeaponDisplay', '#weapon-display');
        await this.initializeComponent('WeaponSummary', '#weapon-summary');
        await this.initializeComponent('Modal', document.body);
        await this.initializeComponent('Toast', document.body);
    }

    registerComponent(name, ComponentClass) {
        if (this.components.has(name)) {
            console.warn(`Component ${name} already registered`);
            return;
        }

        this.components.set(name, {
            ComponentClass,
            instances: new Map()
        });
    }

    async initializeComponent(componentName, container, config = {}) {
        const componentInfo = this.components.get(componentName);
        if (!componentInfo) {
            throw new Error(`Component ${componentName} not registered`);
        }

        const containerElement = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (!containerElement) {
            throw new Error(`Container not found: ${container}`);
        }

        const instance = new componentInfo.ComponentClass(this, containerElement, config);
        
        if (typeof instance.initialize === 'function') {
            await instance.initialize();
        }

        const instanceId = this.generateId();
        componentInfo.instances.set(instanceId, instance);

        this.core.eventBus.emit('ui:component:initialized', { 
            componentName, 
            instanceId, 
            instance 
        });

        return { instanceId, instance };
    }

    getComponent(componentName, instanceId = null) {
        const componentInfo = this.components.get(componentName);
        if (!componentInfo) return null;

        if (instanceId) {
            return componentInfo.instances.get(instanceId);
        }

        // Return first instance if no ID specified
        return componentInfo.instances.values().next().value;
    }

    destroyComponent(componentName, instanceId) {
        const componentInfo = this.components.get(componentName);
        if (!componentInfo) return;

        const instance = componentInfo.instances.get(instanceId);
        if (!instance) return;

        if (typeof instance.destroy === 'function') {
            instance.destroy();
        }

        componentInfo.instances.delete(instanceId);
        this.core.eventBus.emit('ui:component:destroyed', { componentName, instanceId });
    }

    async setupLayouts() {
        // Define responsive layouts
        this.layouts.set('mobile', {
            name: 'Mobile Layout',
            breakpoint: 768,
            grid: {
                areas: [
                    '"header header"',
                    '"shells shells"',
                    '"cards cards"',
                    '"display display"',
                    '"summary summary"'
                ],
                columns: '1fr',
                rows: 'auto'
            }
        });

        this.layouts.set('tablet', {
            name: 'Tablet Layout',
            breakpoint: 1024,
            grid: {
                areas: [
                    '"header header header"',
                    '"shells shells shells"',
                    '"cards display display"',
                    '"summary summary summary"'
                ],
                columns: '1fr 1fr 1fr',
                rows: 'auto auto 1fr auto'
            }
        });

        this.layouts.set('desktop', {
            name: 'Desktop Layout',
            breakpoint: 1200,
            grid: {
                areas: [
                    '"header header header header"',
                    '"shells shells shells shells"',
                    '"cards cards display summary"',
                    '"cards cards display summary"'
                ],
                columns: '1fr 1fr 1fr 1fr',
                rows: 'auto auto 1fr 1fr'
            }
        });

        this.applyResponsiveLayout();
    }

    applyResponsiveLayout() {
        const width = window.innerWidth;
        let targetLayout = 'mobile';

        for (const [name, layout] of this.layouts) {
            if (width >= layout.breakpoint) {
                targetLayout = name;
            }
        }

        this.applyLayout(targetLayout);
    }

    applyLayout(layoutName) {
        const layout = this.layouts.get(layoutName);
        if (!layout) return;

        const container = document.querySelector('.builder-layout');
        if (!container) return;

        container.style.gridTemplateAreas = layout.grid.areas.join(' ');
        container.style.gridTemplateColumns = layout.grid.columns;
        container.style.gridTemplateRows = layout.grid.rows;

        this.core.eventBus.emit('ui:layout:changed', { layoutName, layout });
    }

    async bindGlobalEvents() {
        // Responsive layout handling
        window.addEventListener('resize', this.debounce(() => {
            this.applyResponsiveLayout();
        }, 250));

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Global drag and drop prevention (except our components)
        document.addEventListener('dragover', (e) => {
            if (!e.target.closest('.drag-zone')) {
                e.preventDefault();
            }
        });

        document.addEventListener('drop', (e) => {
            if (!e.target.closest('.drag-zone')) {
                e.preventDefault();
            }
        });
    }

    handleGlobalKeyboard(event) {
        // Global shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.core.eventBus.emit('app:save');
                    break;
                case 'z':
                    event.preventDefault();
                    this.core.eventBus.emit('app:undo');
                    break;
                case 'y':
                    event.preventDefault();
                    this.core.eventBus.emit('app:redo');
                    break;
            }
        }

        // Escape key handling
        if (event.key === 'Escape') {
            this.core.eventBus.emit('ui:escape');
        }
    }

    // Utility methods
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    }

    showModal(content, options = {}) {
        const modal = this.getComponent('Modal');
        if (modal) {
            modal.show(content, options);
        }
    }

    hideModal() {
        const modal = this.getComponent('Modal');
        if (modal) {
            modal.hide();
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = this.getComponent('Toast');
        if (toast) {
            toast.show(message, type, duration);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Theme management
    async switchTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) {
            console.warn(`Theme ${themeName} not found`);
            return false;
        }

        if (!theme.loaded) {
            await this.loadThemeCSS(theme);
        }

        this.currentTheme = themeName;
        document.body.className = `theme-${themeName}`;
        
        this.core.eventBus.emit('ui:theme:changed', { themeName, theme });
        return true;
    }

    async loadThemeCSS(theme) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = theme.cssFile;
            link.onload = () => {
                theme.loaded = true;
                resolve();
            };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}

// Base Component Class
class BaseComponent {
    constructor(uiManager, container, config = {}) {
        this.ui = uiManager;
        this.core = uiManager.core;
        this.container = container;
        this.config = { ...this.getDefaultConfig(), ...config };
        this.initialized = false;
        this.destroyed = false;
    }

    getDefaultConfig() {
        return {};
    }

    async initialize() {
        if (this.initialized) return;
        
        await this.render();
        await this.bindEvents();
        
        this.initialized = true;
        this.onInitialized();
    }

    async render() {
        // Override in subclasses
    }

    async bindEvents() {
        // Override in subclasses
    }

    onInitialized() {
        // Override in subclasses
    }

    destroy() {
        if (this.destroyed) return;
        
        this.unbindEvents();
        this.cleanup();
        
        if (this.container && this.container.parentNode) {
            this.container.innerHTML = '';
        }
        
        this.destroyed = true;
    }

    unbindEvents() {
        // Override in subclasses
    }

    cleanup() {
        // Override in subclasses
    }

    createElement(tag, attributes = {}, children = []) {
        return this.ui.createElement(tag, attributes, children);
    }
}

// Export classes
window.UIManager = UIManager;
window.BaseComponent = BaseComponent;
