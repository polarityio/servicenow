module.exports = {
    /**
     * Name of the integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @required
     */
    name: "Service Now",
    /**
     * The acronym that appears in the notification window when information from this integration
     * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
     * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
     * here will be carried forward into the notification window.
     *
     * @type String
     * @required
     */
    acronym: "SN",
    /**
     * Description for this integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @optional
     */
    description: "ServiceNow automates and streamlines work and helps create great employee and customer experiences.",
    entityTypes: ['ipv4', 'email'],
    customTypes: [
        {
            key: 'incident',
            regex: /INC[0-9]{7,}/
        },
        {
            key: 'change',
            regex: /CHG[0-9]{7,}/
        }
    ],
    /**
     * An array of style files (css or less) that will be included for your integration. Any styles specified in
     * the below files can be used in your custom template.
     *
     * @type Array
     * @optional
     */
    "styles": [
        "./styles/service-now.less"
    ],
    /**
     * Provide custom component logic and template for rendering the integration details block.  If you do not
     * provide a custom template and/or component then the integration will display data as a table of key value
     * pairs.
     *
     * @type Object
     * @optional
     */
    block: {
        component: {
            file: "./components/service-now-block.js"
        },
        template: {
            file: "./templates/service-now-block.hbs"
        }
    },
    summary: {
        component: {
            file: './components/service-now-summary.js'
        },
        template: {
            file: './templates/service-now-summary.hbs'
        }
    },
    request: {
        // Provide the path to your certFile. Leave an empty string to ignore this option.
        // Relative paths are relative to the STAXX integration's root directory
        cert: '',
        // Provide the path to your private key. Leave an empty string to ignore this option.
        // Relative paths are relative to the STAXX integration's root directory
        key: '',
        // Provide the key passphrase if required.  Leave an empty string to ignore this option.
        // Relative paths are relative to the STAXX integration's root directory
        passphrase: '',
        // Provide the Certificate Authority. Leave an empty string to ignore this option.
        // Relative paths are relative to the STAXX integration's root directory
        ca: '',
        // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
        // the url parameter (by embedding the auth info in the uri)
        proxy: '',
        /**
         * If set to false, the integeration will ignore SSL errors.  This will allow the integration to connect
         * to STAXX servers without valid SSL certificates.  Please note that we do NOT recommending setting this
         * to false in a production environment.
         */
        rejectUnauthorized: true
    },
    logging: {
        // directory is relative to the this integrations directory
        // e.g., if the integration is in /app/polarity-server/integrations/virustotal
        // and you set directoryPath to be `integration-logs` then your logs will go to
        // `/app/polarity-server/integrations/integration-logs`
        // You can also set an absolute path.  If you set an absolute path you must ensure that
        // the directory you specify is writable by the `polarityd:polarityd` user and group.

        //directoryPath: '/var/log/polarity-integrations',
        level: 'trace',  //trace, debug, info, warn, error, fatal
    },
    /**
     * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
     * as an array of option objects.
     *
     * @type Array
     * @optional
     */
    options: [
        {
            key: "host",
            name: "Host",
            description: "The hostname of the Service Now instance to connect to",
            default: "",
            type: "text",
            userCanEdit: false,
            adminOnly: true
        },
        {
            key: "username",
            name: "Username",
            description: "The username to log in to Service Now with",
            default: "",
            type: "text",
            userCanEdit: false,
            adminOnly: true
        },
        {
            key: "password",
            name: "Password",
            description: "The password to log in to Service Now with",
            default: "",
            type: "password",
            userCanEdit: false,
            adminOnly: true
        },
        {
            key: 'custom',
            name: 'Custom Fields',
            description: 'A comma separated list of custom fields to query IP against incidents',
            default: '',
            type: 'text',
            userCanEdit: false,
            adminOnly: true
        }
    ]
};
