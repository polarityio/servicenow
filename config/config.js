module.exports = {
  name: 'ServiceNow',
  acronym: 'SN',
  defaultColor: 'light-purple',
  description:
    'ServiceNow automates and streamlines work and helps create great employee and customer experiences.',
  entityTypes: ['IPv4', 'email', 'domain', 'string', 'cve'],
  customTypes: [
    {
      key: 'incident',
      regex: 'INC[0-9]{7,}'
    },
    {
      key: 'knowledgeBase',
      regex: 'KB[0-9]{7,}'
    },
    {
      key: 'change',
      regex: 'CHG[0-9]{7,}'
    },
    {
      key: 'request',
      regex: 'REQ[0-9]{7,}'
    },
    {
      key: 'requestedItem',
      regex: 'RITM[0-9]{7,}'
    }
  ],
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info'
  },
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
        'This will toggle whether or not to search ServiceNow for annotated entities found in your channels.  The "string" Data Type must also be enabled for this option to have an effect.',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'enableIncidentSearch',
      name: 'Enable Incident Search',
      description:
        "If checked, the integration will search ServiceNow's Incident Table (incident) for IP Addresses, Domains, CVEs, annotated entities, and any added custom types",
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'incidentQueryFields',
      name: 'Incident Query Fields',
      description:
        'A comma separated list of fields to search when querying for Incidents.  Incident searches are done for IPs, domains, CVEs, annotated entities and any added custom types. NOTE: If a field is not in this list, it will not be searched for Incident Queries.',
      default: 'short_description, description, work_notes',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'incidentDaysAgoToSearch',
      name: 'Days ',
      description:
        'Number of days back to search when searching incidents.  Filters based on the date that the Incident was opened. Defaults to 360.',
      default: 360,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'enableAssetSearch',
      name: 'Enable Asset Search',
      description:
        "If checked, the integration will search ServiceNow's Asset Table (alm_asset) for IP Addresses, Domains, CVEs, annotated entities, and any added custom types",
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'assetTableFields',
      name: 'Asset Query Fields',
      description:
        "A comma separated list of fields to search when querying for Assets. Asset searches are done for IPs, domains, CVEs, annotated entities and any added custom types. NOTE: If a field is not in this list, the field will not be searched in ServiceNow's Asset Table.",
      default: 'ci.name, ci.asset_tag, short_description',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
