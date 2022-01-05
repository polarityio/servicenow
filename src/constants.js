const {
  map,
  flow,
  get,
  join,
  mapKeys,
  compact,
  reduce,
  size,
  __,
  concat,
  uniq,
  merge
} = require('lodash/fp');

const { entityTypes, customTypes } = require('../config/config');

const { mapObject } = require('./dataTransformations');

const queryAssets = require('./querying/queryAssets');
const queryKnowledgeBase = require('./querying/queryKnowledgeBase');
const queryDefaultTable = require('./querying/queryDefaultTable');

//TODO: merge with standar object and do this for custom types
const DEFAULT_MAPPING_OBJECT = {
  customQueryFunction: queryDefaultTable,
  customQueryTableName: 'incidents',
  createCustomTableQuery: numberTableQueryString,
  createSummaryTags: getTableQueryDataSummaryTags
};

const DEFAULT_STANDARD_MAPPING = reduce(
  (agg, entityType) => ({ ...agg, [entityType]: DEFAULT_MAPPING_OBJECT }),
  {},
  entityTypes
);

const DEFAULT_CUSTOM_MAPPING = flow(
  map(get('key')),
  reduce((agg, entityType) => ({ ...agg, [entityType]: DEFAULT_MAPPING_OBJECT }), {
    custom: DEFAULT_MAPPING_OBJECT
  })
)(customTypes);


// TODO: Things to Add
// mapping layout and property maps by type
/**
 * TODO:
 * change do comments and variable names to make sense
 * 
 */
const ENTITY_TYPE_BASED_MAPPING = {
  /**
   * [result of entity.type check]: { // This object that describes querying and formatting functionality for this entity type
   *   customQueryFunction: [optional, default = queryDefaultTable]
   *     async (entity, options, requestWithDefaults, Logger) => ({
   *       ...Query code
   *       returns {
   *         [unique key used in the details object to access query data]:
   *           data to go into the details object in the lookup results, and is passed into createSummaryTags
   *       }
   *     }), check out use in ./getLookupResults for more
   *   NOTE: It is recommended you create this function in the ./querying folder and import it here.
   *
   *   customQueryTableName: [optional, default = "incidents"]
   *     "String used to specify the table name for the Table Query"
   *      NOTE: Omit this key if you use a customQueryFunction that does not execute queryDefaultTable.
   *   createCustomTableQuery: [optional, default = numberTableQueryString]
   *     (entity, options) => "String used to specify the query string for the Table Query"
   *      NOTE: Omit this key if you use a customQueryFunction that does not execute queryDefaultTable.
   *   tableQuerySummaryTagPaths: [optional]
   *     ["List of string paths of properties you would like to display from Table Query results"]
   *      NOTE: Omit this key if you use a customQueryFunction that does not execute queryDefaultTable.
   *        Or if there are no summary tags needed for this entity type
   *
   *   createSummaryTags: [optional, default = getTableQueryDataSummaryTags]
   *     (results) => {
   *       return ["Summary Tags generated from results for this entity type"];
   *     }
   *     results is the result object generated in the query function
   * }
   * 
   * NOTE: If you would like to just use the defaults for an entity type, it can just be omitted from this object.
   */
  IPv4: {
    customQueryFunction: async (entity, options, requestWithDefaults, Logger) => ({
      ...(await queryAssets(entity, options, requestWithDefaults, Logger)),
      ...(await queryDefaultTable(entity, options, requestWithDefaults, Logger))
    }),
    createCustomTableQuery: ({ value }, { customIpFields }) =>
      flow(
        split(','),
        map((field) => `${trim(field)}=${value}`),
        join('^NQ')
      )(customIpFields),

    tableQuerySummaryTagPaths: ['number'],
    createSummaryTags: (results) =>
      getTableQueryDataSummaryTags(results).concat(getTotalAssetSummaryTag(results))
  },
  domain: {
    customQueryFunction: queryAssets,
    createSummaryTags: getTotalAssetSummaryTag
  },
  string: {
    customQueryFunction: queryAssets,
    createSummaryTags: getTotalAssetSummaryTag
  },
  email: {
    customQueryTableName: 'sys_user',
    createCustomTableQuery: ({ value }) => `email=${value}`,
    tableQuerySummaryTagPaths: ['name']
  }
};

const CUSTOM_ENTITY_TYPE_BASED_MAPPING = {
  /**
   * Custom Types work the same as standard entity types with the added stipulation that
   *   properties in "custom" get passed along to to all specific custom types, but can
   *   be overridden if specified on the individual custom type level.
   * 
   * NOTE: If you would like to just use the defaults for an entity type, it can just be omitted from this object.
   */
  // All Custom Types
  custom: {
    tableQuerySummaryTagPaths: ['sys_class_name', 'category', 'phase']
  },

  // Specific Custom Types
  knowledgeBase: {
    customQueryFunction: queryKnowledgeBase,
    createSummaryTags: getTotalKbDocsSummaryTag
  },

  change: {
    customQueryTableName: 'change_request'
  },
  request: {
    customQueryTableName: 'sc_request'
  },
  requestedItem: {
    customQueryTableName: 'sc_req_item'
  }
};

const getCustomTypesWithKey = (key) =>
  flow(
    omit('custom'),
    mapKeys(
      (customEntityType) =>
        get([customEntityType, key], CUSTOM_ENTITY_TYPE_BASED_MAPPING) && customEntityType
    ),
    compact
  )(CUSTOM_ENTITY_TYPE_BASED_MAPPING);

const customEntityTypesWithCustomQueryFunction = getCustomTypesWithKey('createSummaryTags') 
const customEntityTypesWithCustomTagCreation = getCustomTypesWithKey('createSummaryTags') 

const createTypeCheckFunction =
  (customEntityTypesWithCustomFunctionality) =>
  ({ type, types }) =>
    size(customEntityTypesWithCustomFunctionality)
      ? reduce(
          (result, customType) =>
            type === 'custom' && types.indexOf(`custom.${customType}`) >= 0
              ? customType
              : result,
          type,
          customEntityTypesWithCustomFunctionality
        )
      : type;

const getQueryFunctionType = createTypeCheckFunction(customEntityTypesWithCustomQueryFunction);
const getSummaryType = createTypeCheckFunction(customEntityTypesWithCustomTagCreation);

const asdf = {
  ...merge(DEFAULT_STANDARD_MAPPING, ENTITY_TYPE_BASED_MAPPING),
  ...merge(DEFAULT_CUSTOM_MAPPING, CUSTOM_ENTITY_TYPE_BASED_MAPPING)
};

//TODO: make comments explaining this if you wanted to add a custom key
const getKeyFromEntityTypeMapping = (typeMappingPropertyPath) => mapObject((typeMappingObj, type)=> {
  const propertyValueForThisType = get(typeMappingPropertyPath, typeMappingObj);
  return !!propertyValueForThisType && [type, propertyValueForThisType];
}, asdf)

const QUERY_FUNCTION_BY_TYPE = getKeyFromEntityTypeMapping('customQueryFunction');
const DEFAULT_TABLE_BY_TYPE = getKeyFromEntityTypeMapping('customQueryTableName');
const DEFAULT_QUERY_BY_TYPE = getKeyFromEntityTypeMapping('customQueryTableName');
const TABLE_QUERY_SUMMARY_TAG_PATHS = getKeyFromEntityTypeMapping('tableQuerySummaryTagPaths');
const CREATE_SUMMARY_TAGS_BY_TYPE = getKeyFromEntityTypeMapping('createSummaryTags');

const getTableQueryDataSummaryTags = flow(
  get('tableQueryData'),
  flatMap((tableQueryDataResult) =>
    flow(
      get(entity.type),
      map(get(__, tableQueryDataResult)),
      concat(
        !tableQueryDataResult.active
          ? []
          : tableQueryDataResult.active === 'true'
          ? 'active'
          : 'inactive'
      )
    )(TABLE_QUERY_SUMMARY_TAG_PATHS)
  ),
  compact,
  uniq
);

const getTotalAssetSummaryTag = ({ assetData }) =>
  size(assetData) ? `Assets: ${size(assetData)}` : [];

const getTotalKbDocsSummaryTag = ({ knowledgeBaseData }) =>
  size(knowledgeBaseData) ? `Knowledge Base Documents: ${size(knowledgeBaseData)}` : [];




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

module.exports = {
  IGNORED_IPS,
  LAYOUT_MAP,
  PROPERTY_MAP,
  SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES,
  QUERY_FUNCTION_BY_TYPE,
  DEFAULT_TABLE_BY_TYPE,
  DEFAULT_QUERY_BY_TYPE,
  SUMMARY_PROPERTIES_BY_TYPE,
  CREATE_SUMMARY_TAGS_BY_TYPE,
  getSummaryType,
  getQueryFunctionType
};
