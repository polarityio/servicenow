module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'ServiceNow',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'SN',
  defaultColor: 'light-purple',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'ServiceNow automates and streamlines work and helps create great employee and customer experiences.',
  entityTypes: ['IPv4', 'email', 'domain', 'string', 'cve'],
  customTypes: [
    {
      key: 'incident',
      regex: /INC[0-9]{7,}/
    },
    {
      key: 'knowledgeBase',
      regex: /KB[0-9]{7,}/
    },
    {
      key: 'change',
      regex: /CHG[0-9]{7,}/
    },
    {
      key: 'request',
      regex: /REQ[0-9]{7,}/
    },
    {
      key: 'requestedItem',
      regex: /RITM[0-9]{7,}/
    }
  ],
  /**
   * An array of style files (css or less) that will be included for your integration. Any styles specified in
   * the below files can be used in your custom template.
   *
   * @type Array
   * @optional
   */
  styles: ['./styles/styles.less'],
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
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the ServiceNow integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',
    /**
     * If set to false, the integration will ignore SSL errors.  This will allow the integration to connect
     * to ServiceNow servers without valid SSL certificates.  Please note that we do NOT recommending setting this
     * to false in a production environment.
     */
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
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
      key: 'url',
      name: 'URL',
      description:
        'The URL of the ServiceNow instance to connect to including the schema (i.e., https://)',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'username',
      name: 'Username',
      description: 'The username to login to ServiceNow with',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'password',
      name: 'Password',
      description: 'The password to login to ServiceNow with',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'shouldSearchString',
      name: 'Search By Annotated Entities',
      description:
        "This will toggle whether or not to search the ServiceNow for annotated entities found in your channels.",
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'incidentQueryFields',
      name: 'Incident Query Fields',
      description:
        'A comma separated list of Fields to query against Incidents.  \n' +
        'NOTE: If a field is not in this list, it will not be searched on Incident Queries.\n' +
        '(This applies to IP Addresses, Domains, and String searches)',
      default: 'u_ip_addr_2, u_destination_ip, short_description, work_notes',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'enableAssetSearch',
      name: 'Enable Asset Search',
      description:
          "If checked, the integration will search ServiceNow's Asset Table (alm_asset) for IP addresses, domains, and annotated entities.",
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'assetTableFields',
      name: 'Asset Query Fields',
      description:
        "A comma separated list of fields to search domains and IPs by in ServiceNow's Asset Table.  \n" +
        "NOTE: If a field is not in this list, the field will not be searched in ServiceNow's Asset Table.\n" +
        '(This applies to IP Addresses, Domains, and String searches)',
      default: 'dns_domain, sys_domain_path, ip_address, short_description',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
