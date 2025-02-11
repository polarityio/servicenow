module.exports = {
  polarityIntegrationUuid: 'c480b2b0-cce1-11ed-aeee-075d3490155d',
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
      name: 'Username (Required)',
      description:
        'The username to login to ServiceNow. If using OAuth (i.e., Client ID and Secret are provided), the Username and Password should be for the OAuth Application User.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'password',
      name: 'Password (Required)',
      description:
        'The password for the provided Username used to login to ServiceNow.  If using OAuth (i.e., Client Id and Secret are provided), the Username and Password should be for the OAuth Application User.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'clientId',
      name: 'OAuth Client ID (Optional)',
      description:
        'Optional Client ID which is required when authenticating to ServiceNow via OAuth.  If provided, a corresponding Client Secret must also be provided. Can be left blank when authenticating via Basic Auth.',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'clientSecret',
      name: 'OAuth Client Secret (Optional)',
      description:
        'Optional Client Secret which is required when authenticating to ServiceNow via OAuth.  If provided, a corresponding Client ID must also be provided. Can be left blank when authenticating via Basic Auth.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'shouldSearchString',
      name: 'Search By Annotated Entities',
      description:
        'This will toggle whether to search ServiceNow for annotated entities found in your channels.  The "string" Data Type must also be enabled for this option to have an effect.',
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
        'A comma separated list of fields to search when querying for Incidents.  Incident searches are done for IPs, domains, CVEs, annotated entities and any added custom types. IMPORTANT -- ServiceNow does not return an error if invalid fields are provided and will instead return all records.',
      default: 'short_description, description, work_notes',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'incidentDaysAgoToSearch',
      name: 'Incident Search Window in Days ',
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
        "If checked, the integration will search ServiceNow's Asset Table (alm_asset) for IP Addresses, Domains, CVEs, annotated entities, and any added custom types.",
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'assetTableFields',
      name: 'Asset Query Fields',
      description:
        "A comma separated list of fields to search when querying for Assets. Asset searches are done for IPs, domains, CVEs, annotated entities and any added custom types. NOTE: If a field is not in this list, the field will not be searched in ServiceNow's Asset (alm_asset) Table.",
      default: 'name, display_name, asset_tag, ci.name, ci.asset_tag',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
