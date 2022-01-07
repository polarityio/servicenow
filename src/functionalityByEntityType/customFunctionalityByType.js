const { map, flow, join, split, trim, merge, omit, compact } = require('lodash/fp');

const { mapObject } = require('../dataTransformations');

const queryAssets = require('../querying/queryAssets');
const queryKnowledgeBase = require('../querying/queryKnowledgeBase');
const queryTableData = require('../querying/queryTableData');

const {
  getTableQueryDataSummaryTags,
  getTotalAssetSummaryTag,
  getTotalKbDocsSummaryTag
} = require('./createSummaryTagsFunctions');

const {
  assetsDisplayStructure,
  knowledgeBaseDisplayStructure,
  tableQueryDisplayStructure,
  usersDisplayStructure
} = require('../displayStructures/index');

/** CUSTOM_FUNCTIONALITY_FOR_STANDARD_ENTITY_TYPES
 * This is where all the magic stems from.  This object is where can you specify custom 
 * functionality for any standard (non-custom) entity type without really having to
 * understand all the gotcha's of the rest of the code and allows you to quickly and 
 * easily add new type to the integration.  In this object the keys are the entity type 
 * names, and the values are where you specify you custom functionality for that entity 
 * type.
 * {
 *    [result of entity.type check]: { 
 *      This object that describes querying and formatting functionality for this entity type
 *      
 *      queryFunction: [optional, default = queryTableData]
 *        async (entity, options, requestWithDefaults, Logger) => {
 *          ...Query code
 *          returns {
 *            [unique key used in the details object to access query data]:
 *              data to go into the details object in the lookup results, and is passed into createSummaryTags
 *          }
 *        }, check out use in getLookupResults.js for more info
 *        NOTE: It is recommended you create this function in the ./querying folder and import it here.
 * 
 *      tableQueryTableName: [optional, default = "incidents"]
 *        "String used to specify the table name for the Table Query"
 *         NOTE: Omit this key if you use a queryFunction that does not execute queryTableData.
 *      tableQueryQueryString: [optional, default = numberTableQueryString]
 *        (entity, options) => "String used to specify the query string for the Table Query"
 *         NOTE: Omit this key if you use a queryFunction that does not execute queryTableData.
 *      tableQuerySummaryTagPaths: [optional]
 *        ["List of string paths of properties you would like to display from Table Query results"]
 *         NOTE: Omit this key if you use a queryFunction that does not execute queryTableData.
 *           Or if there are no summary tags needed for this entity type
 * 
 *      createSummaryTags: [optional, default = getTableQueryDataSummaryTags]
 *        (entity, results) => {
 *          return ["Summary Tags generated from results for this entity type"];
 *        }
 *        results is the result object generated in the query function
 *        NOTE: It is recommended you add your custom functionality to createSummaryTagsFunctions.js
 *    }
 * }
 * NOTE: If you would like to just use the defaults for an entity type, it can just be 
 *   omitted from this object.  If you would like to understand the defaults better you 
 *   check out the DEFAULT_FUNCTIONALITY_OBJECT in defaultFunctionalityByType.js
 */

// TODO write docs on displayTabNames and displayStructure,
const CUSTOM_FUNCTIONALITY_FOR_STANDARD_ENTITY_TYPES = {
  IPv4: {
    queryFunction: async (entity, options, requestWithDefaults, Logger) => ({
      ...(await queryAssets(entity, options, requestWithDefaults, Logger)),
      ...(await queryTableData(entity, options, requestWithDefaults, Logger))
    }),
    tableQueryQueryString: ({ value }, { customIpFields }) =>
      customIpFields &&
      typeof customIpFields === 'string' &&
      customIpFields.length !== 0 &&
      flow(
        split(','),
        compact,
        map((field) => `${trim(field)}=${value}`),
        join('^NQ')
      )(customIpFields),

    tableQuerySummaryTagPaths: ['number'],
    createSummaryTags: (results) =>
      getTableQueryDataSummaryTags(results).concat(getTotalAssetSummaryTag(results)),
    displayTabNames: { assetData: 'Assets', tableQueryData: 'Incidents' },
    displayStructure: {
      assetData: assetsDisplayStructure,
      tableQueryData: tableQueryDisplayStructure
    }
  },
  domain: {
    queryFunction: queryAssets,
    createSummaryTags: getTotalAssetSummaryTag,
    displayTabNames: { assetData: 'Assets' },
    displayStructure: { assetData: assetsDisplayStructure }
  },
  string: {
    queryFunction: queryAssets,
    createSummaryTags: getTotalAssetSummaryTag,
    displayTabNames: { assetData: 'Assets' },
    displayStructure: { assetData: assetsDisplayStructure }
  },
  email: {
    tableQueryTableName: 'sys_user',
    tableQueryQueryString: ({ value }) => `email=${value}`,
    tableQuerySummaryTagPaths: ['name'],
    displayTabNames: { tableQueryData: 'Users' },
    displayStructure: { tableQueryData: usersDisplayStructure }
  }
};

/** CUSTOM_FUNCTIONALITY_FOR_CUSTOM_ENTITY_TYPES
 * Custom Entity Types work the same as standard entity types with two differences:
 *   1.) The Keys on the top level are not the result of the entity.type check, but 
 *       instead are the "key" properties specified in the config.js file.
 *   2.) Properties in "defaults" get passed along to to all specific custom types, but 
 *       can be overridden if specified on the individual custom type level.
 *
 * NOTE: If you would like to just use the defaults for an entity type, it can just be 
 *   omitted from this object.  If you would like to understand the defaults better you 
 *   check out the DEFAULT_FUNCTIONALITY_OBJECT in defaultFunctionalityByType.js
*/
const CUSTOM_FUNCTIONALITY_FOR_CUSTOM_ENTITY_TYPES = {
  // All Custom Types
  defaults: {
    tableQuerySummaryTagPaths: ['sys_class_name', 'category', 'phase']
  },

  // Specific Custom Types
  knowledgeBase: {
    queryFunction: queryKnowledgeBase,
    createSummaryTags: getTotalKbDocsSummaryTag,
    displayTabNames: { knowledgeBaseData: 'Knowledge Base' },
    displayStructure: { knowledgeBaseData: knowledgeBaseDisplayStructure }
  },

  change: {
    tableQueryTableName: 'change_request'
  },
  request: {
    tableQueryTableName: 'sc_request'
  },
  requestedItem: {
    tableQueryTableName: 'sc_req_item'
  }
};

const specificCustomTypesWithDefaults = flow(
  omit('defaults'),
  mapObject((specificCustomTypeOverrides, specificCustomType) => [
    specificCustomType,
    merge(
      CUSTOM_FUNCTIONALITY_FOR_CUSTOM_ENTITY_TYPES.defaults,
      specificCustomTypeOverrides
    )
  ])
)(CUSTOM_FUNCTIONALITY_FOR_CUSTOM_ENTITY_TYPES);

const customFunctionalityByType = {
  ...CUSTOM_FUNCTIONALITY_FOR_STANDARD_ENTITY_TYPES,
  ...specificCustomTypesWithDefaults
};


module.exports = customFunctionalityByType;