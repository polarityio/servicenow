const {
  map,
  flow,
  get,
  join,
  mapKeys,
  zipObject,
  compact,
  reduce
} = require('lodash/fp');

const queryAssets = require('./querying/queryAssets');
const queryKnowledgeBase = require('./querying/queryKnowledgeBase');
const queryDefaultTable = require('./querying/queryDefaultTable');
const transpose2DArray = reduce(
  (agg, [key, value]) => [
    [...agg[0], key],
    [...agg[1], value]
  ],
  [[], []]
);

const IGNORED_IPS = new Set(['127.0.0.1', '255.255.255.255', '0.0.0.0']);
const SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES = [200];

const numberTableQueryString = ({ value }) => `number=${value}`;
const incidentLayout = require('./models/incident-layout');
const incidentModel = require('./models/incident-model');
const requestLayout = require('./models/request-layout');
const requestModel = require('./models/request-model');
const itemLayout = require('./models/item-layout');
const itemModel = require('./models/item-model');
const changeLayout = require('./models/change-layout');
const changeModel = require('./models/change-model');
const userLayout = require('./models/user-layout');


//TODO: Need to change this stucture to be much more intuitive to add new entity types in the future.
// Currently the structure isn't self explanatory, and would be difficult to figure out
// Will likely need to alter the parseTableQueryData.js function when altering this stucture.
const LAYOUT_MAP = {
  incident: incidentLayout,
  sc_request: requestLayout,
  sc_req_item: itemLayout,
  change_request: changeLayout,
  sys_user: userLayout
};

const PROPERTY_MAP = {
  incident: incidentModel,
  sc_request: requestModel,
  sc_req_item: itemModel,
  change_request: changeModel,
  sys_user: {
    name: {
      title: 'Name',
      type: 'sys_user'
    },
    title: {
      title: 'Title',
      type: 'sys_user'
    },
    email: {
      title: 'Email',
      type: 'sys_user'
    },
    department: {
      title: 'Department',
      type: 'cmn_department'
    },
    location: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_location: {
    name: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_department: {
    name: {
      title: 'Department',
      type: 'department'
    }
  }
};

// TODO: Things to Add
// mapping summary tag creation logic by type. see createLookupResults.ls createSummary for reference
// mapping layout and property maps by type

const ENTITY_TYPE_BASED_MAPPING = {
  /**
   * [Key For Type Check To Match On]: {
   *   queryFunction: async (entity, options, requestWithDefaults, Logger) => ({
   *     returns data to go into the details object in the lookup results
   *   }), check out ./getLookupResults for use
   *   defaultQueryTable: table to query on.  check out ./querying/queryDefaultTable.js for use
   *   defaultTableQuery (entity, options) => returns string query to use in default table query.  check out ./querying/queryDefaultTable.js for use
   *   summaryProperties: ['string of property path in defaultTableQuery result to add to summary tags']
   * }
   */
  IPv4: {
    queryFunction: async (entity, options, requestWithDefaults, Logger) => ({
      ...(await queryAssets(entity, options, requestWithDefaults, Logger)),
      ...(await queryDefaultTable(entity, options, requestWithDefaults, Logger))
    }),
    defaultQueryTable: 'incident',
    defaultTableQuery: ({ value }, { customIpFields }) =>
      flow(
        split(','),
        map((field) => `${trim(field)}=${value}`),
        join('^NQ')
      )(customIpFields),
    summaryProperties: ['number']
  },
  domain: {
    queryFunction: queryAssets,
    defaultQueryTable: 'incident',
    defaultTableQuery: numberTableQueryString,
  },
  string: {
    queryFunction: queryAssets,
    defaultQueryTable: 'incident',
    defaultTableQuery: numberTableQueryString,
  },
  email: {
    queryFunction: queryDefaultTable,
    defaultQueryTable: 'sys_user',
    defaultTableQuery: ({ value }) => `email=${value}`,
    summaryProperties: ['name']
  },
  custom: {
    queryFunction: queryDefaultTable,
    summaryProperties: ['sys_class_name', 'category', 'phase']
  },

  // Specific Custom Types
  knowledgeBase: {
    queryFunction: queryKnowledgeBase,
    defaultQueryTable: 'incident',
    defaultTableQuery: numberTableQueryString
  },

  incident: {
    defaultTableQuery: numberTableQueryString,
    defaultQueryTable: 'incident'
  },
  change: {
    defaultTableQuery: numberTableQueryString,
    defaultQueryTable: 'change_request'
  },
  request: {
    defaultTableQuery: numberTableQueryString,
    defaultQueryTable: 'sc_request'
  },
  requestedItem: {
    defaultTableQuery: numberTableQueryString,
    defaultQueryTable: 'sc_req_item'
  },

  // MISC
  temporarilyIgnore: {
    queryFunction: () => {}
  }
};

 /**
   * key: key found inside of each type mapping.  For example queryFunction
   * return {
   *    [type for each mapping object that contains the key]: the value of the key for this type
   * }
   * 
   * Example: 
   * if key === 'defaultQueryTable' then output will be
   * {
      IPv4: 'incident',
      domain: 'incident',
      string: 'incident',
      email: 'sys_user',
      knowledgeBase: 'incident',
      incident: 'incident',
      change: 'change_request',
      request: 'sc_request',
      requestedItem: 'sc_req_item'
    };
   * if key === 'summaryProperties' then output will be
   * {
      IPv4: ['number'],
      email: ['name'],
      custom: ['sys_class_name', 'category', 'phase']
    };
   */

const getKeyFromEntityTypeMapping = (key) =>
  flow(
    mapKeys((type) => {
      const keysValue = get([type, key], ENTITY_TYPE_BASED_MAPPING);
      return !!keysValue && [type, keysValue];
    }),
    compact,
    (x) => transpose2DArray(x),
    zipObject
  )(ENTITY_TYPE_BASED_MAPPING);

const QUERY_FUNCTION_BY_TYPE = getKeyFromEntityTypeMapping('queryFunction');
const DEFAULT_TABLE_BY_TYPE = getKeyFromEntityTypeMapping('defaultQueryTable');
const DEFAULT_QUERY_BY_TYPE = getKeyFromEntityTypeMapping('defaultTableQuery');
const SUMMARY_PROPERTIES_BY_TYPE = getKeyFromEntityTypeMapping('summaryProperties');



module.exports = {
  IGNORED_IPS,
  LAYOUT_MAP,
  PROPERTY_MAP,
  SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES,
  QUERY_FUNCTION_BY_TYPE,
  DEFAULT_TABLE_BY_TYPE,
  DEFAULT_QUERY_BY_TYPE,
  SUMMARY_PROPERTIES_BY_TYPE
};
