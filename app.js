// Main Application Entry Point
// This file bootstraps the entire application

class AxiomCrucibleApp {
    constructor() {
        this.core = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.log('🔧 Initializing Axiom & Crucible Application...');
            
            // Initialize core engine
            this.core = new CoreEngine();
            await this.core.initialize();

            // Setup application-level event handlers
            this.bindApplicationEvents();

            // Mark as initialized
            this.initialized = true;

            console.log('✅ Axiom & Crucible Application ready!');
            this.core.eventBus.emit('app:ready');

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    bindApplicationEvents() {
        // Handle application lifecycle events
        this.core.eventBus.on('app:ready', this.onAppReady.bind(this));
        this.core.eventBus.on('core:error', this.onCoreError.bind(this));
        
        // Handle window events
        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
        window.addEventListener('unload', this.onUnload.bind(this));
        
        // Handle visibility changes (for auto-save, etc.)
        document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
        
        // Global error handling
        window.addEventListener('error', this.onGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.onUnhandledRejection.bind(this));
    }

    onAppReady() {
        // Application is fully ready
        this.showLoadingComplete();
        this.checkForAutoSave();
    }

    onCoreError({ error }) {
        console.error('Core engine error:', error);
        this.showErrorMessage('Application Error', 'A critical error occurred. Please refresh the page.');
    }

    onBeforeUnload(event) {
        // Trigger save before page unload
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        if (weaponBuilder && weaponBuilder.currentWeapon.shell) {
            // Save current work
            weaponBuilder.autoSave();
            
            // Show confirmation if there are unsaved changes
            if (this.hasUnsavedChanges()) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return event.returnValue;
            }
        }
    }

    onUnload() {
        // Clean shutdown
        if (this.core) {
            this.core.eventBus.emit('app:shutdown');
        }
    }

    onVisibilityChange() {
        if (document.hidden) {
            // Page became hidden - trigger auto-save
            const weaponBuilder = this.core.getModule('WeaponBuilder');
            if (weaponBuilder) {
                weaponBuilder.autoSave();
            }
        }
    }

    onGlobalError(event) {
        console.error('Global error:', event.error);
        this.core.eventBus.emit('error:fatal', { 
            error: event.error, 
            type: 'javascript' 
        });
    }

    onUnhandledRejection(event) {
        console.error('Unhandled promise rejection:', event.reason);
        this.core.eventBus.emit('error:fatal', { 
            error: event.reason, 
            type: 'promise' 
        });
    }

    handleInitializationError(error) {
        // Show user-friendly error message
        document.body.innerHTML = `
            <div class="error-container">
                <div class="error-message">
                    <h1>⚠️ Application Failed to Start</h1>
                    <p>We're sorry, but Axiom & Crucible could not initialize properly.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <button onclick="window.location.reload()" class="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    checkForAutoSave() {
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        if (weaponBuilder && weaponBuilder.loadAutoSave()) {
            this.showAutoSaveRecovery();
        }
    }

    hasUnsavedChanges() {
        const weaponBuilder = this.core.getModule('WeaponBuilder');
        if (!weaponBuilder || !weaponBuilder.currentWeapon.shell) {
            return false;
        }

        // Check if weapon has been modified since last save
        const lastModified = new Date(weaponBuilder.currentWeapon.metadata.modified);
        const now = new Date();
        const timeDiff = now - lastModified;
        
        // Consider changes within last 5 minutes as "unsaved"
        return timeDiff < 5 * 60 * 1000;
    }

    showLoadingComplete() {
        // Remove loading spinner if present
        const loader = document.querySelector('.loading-spinner');
        if (loader) {
            loader.remove();
        }

        // Show main interface
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = '1';
        }
    }

    showAutoSaveRecovery() {
        const ui = this.core.uiManager;
        if (ui) {
            ui.showModal(`
                <div class="autosave-recovery">
                    <h3>🔄 Auto-Save Found</h3>
                    <p>We found an automatically saved weapon design. Would you like to restore it?</p>
                    <div class="modal-actions">
                        <button onclick="this.acceptAutoSave()" class="primary-button">
                            Restore Design
                        </button>
                        <button onclick="this.dismissAutoSave()" class="secondary-button">
                            Start Fresh
                        </button>
                    </div>
                </div>
            `, {
                closable: false
            });
        }
    }

    acceptAutoSave() {
        this.core.uiManager.hideModal();
        this.core.eventBus.emit('weapon:autosave:restored');
    }

    dismissAutoSave() {
        // Clear the auto-save
        localStorage.removeItem('axiom-crucible-autosave');
        this.core.uiManager.hideModal();
    }

    showErrorMessage(title, message) {
        const ui = this.core.uiManager;
        if (ui) {
            ui.showToast(`${title}: ${message}`, 'error', 10000);
        } else {
            alert(`${title}\n\n${message}`);
        }
    }

    // Public API for external access
    getCore() {
        return this.core;
    }

    getModule(moduleName) {
        return this.core ? this.core.getModule(moduleName) : null;
    }
}

// Create global application instance
window.AxiomCrucible = new AxiomCrucibleApp();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.AxiomCrucible.initialize();
    } catch (error) {
        console.error('Failed to initialize Axiom & Crucible:', error);
    }
});

// Export for debugging
window.app = window.AxiomCrucible;
