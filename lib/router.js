
export class Router {
    routes = []; // TODO: Rename to #routes to mark as private?
    error_route; // Name of route to fallback on if no other match
    default_route; // Name of route to use for null routes
    
    constructor(cfg) {
        if (cfg.routes) {
            for (const route in cfg.routes) {
                this.add(route, cfg.routes[route]);
            }
        } // else no default routes defined
        if (cfg.error_route) {
            this.error_route = cfg.error_route;
            if (!this.routes[cfg.error_route]) {
                throw `Error: error handler (${cfg.error_route}) is not a regisered route`;
            }
        }
        if (cfg.default_route) {
            this.default_route = cfg.default_route;
            if (!this.routes[cfg.default_route]) {
                throw `Error: default route (${cfg.default_route}) is not a regisered route`;
            }

        }

        // Register callback to handle back/forward buttons
        window.onhashchange = () => {
            // Go to specified location, but don't update history (it would be redundant)
            this.go(window.location.hash, null, 1);
        };
    }
    /**
     * @param name - path of route to be added
     * @param definition - Route definition, typically a callback function
     */
    add(name, definition) {
        // TODO: Sanity check name, including checking for any conflicting routes
        var path = Router.cleanPath(name);
        this.routes[path] = definition;
    }
    get(path) {
        return this.routes[Router.cleanPath(path)];
    }
    
    /** Set given path as current location
     */
    set(path) {
        window.location.hash = '#' + Router.cleanPath(path);
    }
    
    /** Go to the specified path
     *
     * original routing thought: (for the go function)
       - sanitize input path
       - check for exact match
       - find last '/' and truncate, then repeat search
       - continue until match found, or we run out of match options
       
       - Note: 'default_route' is invoked only if called with null value
       - Handling of wildcards is left as an exercise to callback fns
    */
    go(raw_path, context=null, noHistory=0) {
        var path = Router.cleanPath(raw_path);
        var pathPart = path;
        var cb;

        if (!path) {
            cb = this.routes[this.default_route];
        } else if (this.routes[path]) {
            cb = this.routes[path];
        } else {
            var parts = path.split("/");
            pathPart = '';
            while(parts.length > 1) {
                pathPart += '/' + path.pop();
                cb = this.routes[parts.join('/')];
                if (cb) {
                    break;
                }
            }
        }
        if (!cb) {
            if (this.error_route) {
                cb = this.routes[this.error_route];
            } else {
                throw `Error: ${raw_path} is not a registered application path`; // TODO: Or should we just return false?
            }
        }
        
        // Now that we've confirmed path is valid, set it in history
        if (!noHistory) {
            this.set(path);
        }
        // Issue callback, and return any (optional) return value from cb
        return cb(path, pathPart, context);
    }
    /** Adjust browser history back this number of entries */
    back(cnt=1) {
        return this.forward(-cnt, context);
    }
    /** Adjust browser history forward this number of entries */
    forward(cnt=1) {
        // Adjust history
        history.go(cnt);

        // Note: onhashchange callback will execute action, if new page is a part of this page
        // Note: This function is a convenience wrapper in case additional logic is later needed
    }
    
    // Clean Hash path
    static cleanPath(name) {
        // TODO: URL-encode any characters not alphanumeric or '/'.
        // TODO: Do we need to remove any URL params (ie: ?foo=bar), or can we assume window.location.hash filters those out?
        return name.replace(/^#/,''); 
    }

    
}
