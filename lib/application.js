import {Router} from './router.js';
/*
 * This is the common base Application class for applications definitions.
 *
 * It is paired with ApplicationComponent instances.  Currently, only
 * W2UI instances have been defined, but it is the intention to extend
 * with other frameworks (ie: LCARS-SDK) in the futuer.  These
 * component interfaces are wrappers for the corresponding W2UI
 * objects, with added convenience methods for common use cases.
 *
 */
export class Application {
    div; // Reference to root element for binding default layout
    config; // Copy of initial configuration (informational only)
    router; // Application Page Routing
    #components = {}; // List of initialized components

    /**
     * @param mainDiv - The DIV that this Application will be anchored to
     *   NOTE: It is assumed this is a jquery object for this initial version
     * @param config - This is the application-specific configuration structure
     *    This includes a definition of routes, layouts, and (typically) callbacks
     */
    constructor(mainDiv, config) {
        if (mainDiv) { // TODO: Validate type
            this.div = mainDiv;
        } else {
            throw new Error("Application created without anchor element");
        } 
        if (!config) {
            // This might be valid for debug or admin cases
            console.warn("Warning: Application created without configuration.");
            return;
        }            

        // Log the raw configuration input
        this.config = config;

        /* If a title is configured, set page title
         *  Note: Generally this will be set in index and redundant
         */
        if (config.title) {
            document.title = config.title;
        }

        // Initialize the Router
        // TODO: Replace with factory method for singleton pattern (only one router can be bound to window.hash.onChange)
        this.router = new Router(config);

        // Initialize the default layouts
        if (config.components) {
            this.addComponents(config.components);
        }
        
        // Initialize the Page with the default component (typically of a 'layout' type)
        if (config.default_component) {
            this.#components[config.default_component].render(mainDiv[0]);
        }

        /* Execute current (or default) route
         *   We pass in the current url hash, no context, and specify not to adjust history
         */  
        this.router.go(window.location.hash, null, 1);
    }
    
    /**
     * @param components[] - An array of component definitions
     */
    addComponents(components) {
        var new_objs = [];
        
        // Initialize all new components
        for(const key in components) {
            new_objs.push(this.addComponent(key, components[key], 1));
        }

        // After all are constructed, call their init functions
        for(var obj of new_objs) {
            obj.init();
        }
    }
    
    /**
     * @param component - Component definition object containing a name,
     *   type, def, and optional contents array
     * @param deferSetContent - If true, do not attempt to initialize
     *   the contents obj entries. This is used, for example, during
     *   initialization to defer processing until all component pieces have
     *   been initialized.
     */
    addComponent(name, component, deferSetContent=0) {
        if (this.#components[name]) {
            throw Error("Attempt to add duplicate component " + name);
        }
        if (!component.name) {
            component.name = name; // Ensure components know their own names
        }
        
        var obj = SlapComponent.factory(component, this);
        
        // Associate child content objects if needed (and not deferred)
        if (!deferSetContent) {
            obj,init();
        }
        this.#components[name] = obj;
        return obj;
    }
}


// ApplicationComponent & Implementations (may split this into separate iles)
export class SlapComponent {
    // Direct mapping of registered component names
    static #components = {};

    // Regex mapping of registered component names, if provided
    static #patterns = [];

    /* Reference to parent Application definition
     *  Application will typically be Singleton, but not necessarily
    */
    app;

    // Reference to original config. May be used for re-initialization in some cases.
    config;
    
    static factory(cfg, app) {
        if (SlapComponent.#components[cfg.type]) {
            return new SlapComponent.#components[cfg.type](cfg, app);
        }
        
        // TODO: Handle potential wildcard types by checkign the regex patterns
        for (var obj of SlapComponent.#patterns) {
            if (cfg.type.match(obj.regexType)) {
                return new obj(cfg, app);
            }
        }
        
        throw Error(cfg.type + " is not a registered type");
    }
    static register(type) {
        // Sanity check
        if (!type.prototype instanceof SlapComponent) {
            throw Error("Attempt to register a SlapComponent that isn't a child of it.");
        }
                
        if (type.regexType) {
            // If this type defines a regex pattern, add it to iteration list
            this.#patterns.push(type);
        }
        
        SlapComponent.#components[type.name] = type;
    }

    // Abstract Prototypes
    constructor(config, app) {
        this.config = config; // User-defined component configuration
        this.app = app; // Reference to root application object.  TODO: Or should we replace this with a global?
    }
    init() { } // If multiple components are added at once, init() will be called in order after all constructors have been created
    
}
