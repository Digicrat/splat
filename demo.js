// Load deployment-specific configuration attributes (ie: API paths)
import cfg from './config/config.js';

// Main Application utilities
import {Application} from './lib/application.js';

// TODO: Can we simplify this?
var sidebar = {
    name: 'sidebar',
    
    flatButton: true, // Not working...
    /*(
    onFlat: function (event) {
        //$('#sidebar').css('width', (event.goFlat ? '35px' : '200px'));
        //w2ui.main.refresh();
        w2ui.main.sizeTo('left', (event.goFlat ? '35px' : '200px') );
    },
*/    
    nodes: [ 
        { id: 'admin', text: 'Administration', group: true, expanded: true, nodes: [
            { id: 'admin-rooms', text: 'Rooms', img: 'icon-page' },
            { id: 'admin-devices', text: 'Devices', img: 'icon-page'  },
            { id: 'admin-machines', text: 'State Machines', img: 'icon-page' },
        ]},
        { id: 'util', text: 'Utilities', group: true, expanded: true, nodes: [
            { id: 'docs', text: 'Documentation', img: 'icon-page' },
        ]}
    ],
};



// Create Application Engine
var app = new Application($('#main'), {
    /*** Informational Attributes ***/
    title: "Main DEMO Application",
    description: "Prototype application for this framework",
    

    /** Routes define application logic routing
     *  routes can be invoked via URL navigation, or from menu item callbacks
     */
    default_route: "todo", //"simple", // Route to load on page load or hashchange if window.location.hash is empty
    error_route: "todo", // Route to fallback on if defined route is not found
    routes: {
        "todo" : function(path) {
            w2ui.main.html('main', path + ' TODO' );
        },
        /* TODO
        "apphome" : app.home, // If fn, then treat as simple callback
        "simple" : "simple", // If string, router will pass back to application to set this layout
        "complex" : {
            "layout" : "simple",
            "pre" : complexCheck, // Pre-routing callback. If it returns false, do not complete
            "post" : populateSimple, // Post-attachment callback
            "context" : "foo", // Optional context to pass to callbacks. Note: If route.go is called with an explicit context, that will supersede this value.
        }
        */
    },

    // TODO: rename root_layout?
    // This is the default layout definition to use for the page root element
    default_layout: "main",
    
    layouts: {
        "main" : {
            type: "w2layout",
            def: {
                padding: 0,
                panels: [
                    { type: 'top', size: 40, resizable: false, style: 'border: 1px solid #dfdfdf; padding: 5px;' },
                    { type: 'left', size: 200, resizable: true, minSize: 120 },
                    { type: 'main', overflow: 'hidden' }
                ]
            },
            content: {
                "top" : "toolbar",
                "main" : "home", // TODO
                "left" : "sidebar"
            }
        },
        sidebar: {
            type: 'w2sidebar',
            def: {

            },
            def: sidebar, // TODO: Cleanup
        },
        toolbar: {
            type: "w2toolbar",
            def: {
                name: 'toolbar',
                items: [
                    { type: 'drop', id: 'settings', text: '', icon: 'w2ui-icon-pencil',
                      html: '<div style="padding: 10px; line-height: 1.5">Future: Settings?</div>' },
                    { type: 'button', id: 'refresh', text: '', icon: 'w2ui-icon-reload' }, // Placeholder
                    { type: 'break' },
                    { type: 'button', id: 'connect', text: 'DB', icon: 'w2ui-icon-check' },
                ],
                onClick: function(event) {
                    switch(event.target) {
                    case 'refresh':
                    default:
                        console.log(`Placeholder for ${event.target}`);
                    }
                }
            }
        },
    },

});


