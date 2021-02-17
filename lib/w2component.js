import {SlapComponent} from './application.js';

// W2UI Base SlapComponent Wrapper
export class SlapW2Component extends SlapComponent {
    static regexType = /^w2/;


    constructor(config, app) {
        super(config, app);

        if (!config.def.name) {
            // Convenience wrapper to avoid duplicate names in original cfg, while still permitting easy lookup later if needed
            config.def.name = config.name;
        }

        
        /* TODO: Validate component type. For now, assume type is always
         * a valid w2ui type + def
         */
        $()[config.type](config.def);

    }
}
export class SlapW2Layout extends SlapW2Component {
    static regexType = "w2layout";

    init() {
        if (this.config.content) {
            for(const key in this.config.content) {
                if (w2ui[this.config.content[key]]) {
                    w2ui[this.config.def.name].html(key,
                                                    w2ui[this.config.content[key]]
                                                   );
                } else {
                    console.warn(`Can't set content for ${this.config.def.name}'s ${key} to uninitialized ${this.config.content[key]}`);
                }
            }
        }
    }
    render(div) {
        // TODO: The [0] is assuming jquery object. We should verify, and handle accordingly if given DOM or div name instead.
        w2ui[this.config.def.name].render(div);
    }

}
export class SlapW2Sidebar extends SlapW2Component {
    static regexType = "w2sidebar";

    constructor(config, app) {
        if (!config.def.onClick) {
            // Automatically set routing handler, unless user has defined a custom handler
            config.def.onClick = (event) => {app.router.set(event.target)};
        }
        super(config, app);
    }
}

SlapComponent.register(SlapW2Layout);
SlapComponent.register(SlapW2Sidebar);

// Add generic component as a fallback (must be added last as patterns are parsed in order of registration)
SlapComponent.register(SlapW2Component)

