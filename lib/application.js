import {Router} from './router.js';
/*
 * This is the common base Application class for w2ui applications
 * The original intent was to define a single class that can work with multiple frameworks
 *   however, the LCARS framework I wanted to use with it is incompatible.
 * For now, this version is specific to W2ui, but may be refactored later
 * - Original thought was for layout definitions to be objects, but that precludes the posibility of serialization
 * - Currently utilizing layout.type. We can add layout.platform (or similar) to specify w2ui, or other.
 * - addLayout would then
 *   - If input is of Layout class, merely register it
 *   - Otherwise, instantiate appropriate class to manage it
 *   - Note: Whether interoperable or not, we would keep an internal listing of layout objects in their wrapper classes for future use
 *     For example, even sticking iwth only w2ui, we could extend W2UiLayout to build a more complex/reusable helper widget that combines multiple elements.  For example, a tab helper that includes a nested layout and handlers for tab switching
 *
*/
export class Application {
    div;
    config;
    router;

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
        this.router = new Router(config);

        // Initialize the default layouts
        if (config.layouts) {
            this.addLayouts(config.layouts);
        }
        
        // Initialize the Page
        if (config.default_layout) {
            // TODO: The [0] is assuming jquery object. We should check above and set var to DOM instead
            w2ui[config.default_layout].render(mainDiv[0]);
        }

        /* Execute current (or default) route
         *   We pass in the current url hash, no context, and specify not to adjust history
         */  
        this.router.go(window.location.hash, null, 1);
    }
    
    /**
     * @param layouts[] - An array of layout definitions
     */
    addLayouts(layouts) {
        // Initialize all new layouts
        for(const key in layouts) {
            if (!layouts[key].def.name) {
                // Convenience wrapper to avoid duplicate names in cfg, while still permitting easy lookup later if needed
                layouts[key].def.name = key;
            }
            this.addLayout(layouts[key], 1);
        }

        // Initialize any dependent contents
        //  Note: This is deferred for a second loop to allow for out-of-order definitions
        for(const key in layouts) {
            if (layouts[key].content) {
                this.#loadContent(layouts[key]);
            }
        }
    }
    /**
     * @param layout - Layout definition object containing a name,
     *   type, def, and optional contents array
     * @param deferSetContent - If true, do not attempt to initialize
     *   the contents obj entries. This is used, for example, during
     *   initialization to defer processing until all layout pieces have
     *   been initialized.
     */
    addLayout(layout, deferSetContent=0) {
        /* TODO: Validate layout type. For now, assume type is always
         * a valid w2ui type
         */
        $()[layout.type](layout.def);
        
        // Associate child content objects if needed
        if (!deferSetContent && layout.content) {
            this.#loadContent(layout);
        }
    }
    #loadContent(layout) {
        for(const key in layout.content) {
            if (w2ui[layout.content[key]]) {
                w2ui[layout.def.name].html(key,
                                           w2ui[layout.content[key]]
                                          );
            } else {
                console.warn(`Can't set content for ${layout.def.name}'s ${key} to uninitialized ${layout.content[key]}`);
            }
        }
    }
}
