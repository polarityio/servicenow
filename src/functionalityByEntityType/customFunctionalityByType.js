const { flow, merge, omit } = require('lodash/fp');

const { mapObject } = require('../dataTransformations');

const queryKnowledgeBase = require('../querying/queryKnowledgeBase');

const { getTotalKbDocsSummaryTag } = require('./createSummaryTagsFunctions');

const assetsAndIncidentCustomFunctionality = require('./assetsAndIncidentCustomFunctionality');

const {
  knowledgeBaseDisplayStructure,
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
 *      queryFunction: [default = queryTableData]
 *        async (entity, options, requestWithDefaults, Logger) => {
 *          ...Query code
 *          returns {
 *            [unique key used in the details object to access query data]:
 *              data to go into the details object in the lookup results, and is passed into createSummaryTags
 *          }
 *        }, check out use in getLookupResults.js for more info
 *        NOTE: It is recommended you create this function in the ./querying folder and import it here.
 * 
 *      tableQueryTableName: [default = "incidents"]
 *        "String used to specify the table name for the Table Query"
 *         NOTE: Omit this key if you use a queryFunction that does not execute queryTableData.
 *          Can be found one an individual record for the table on the dashboard under the 
 *          "uri" query parameter in the dashboard url excluding the / or %2F, and the ".do"
 *      tableQueryQueryString: [default = numberTableQueryString]
 *        (entity, options) => "String used to specify the query string for the Table Query"
 *         NOTE: Omit this key if you use a queryFunction that does not execute queryTableData.
 *      tableQuerySummaryTagPaths: [default = ["category"]]
 *        ["List of string paths of properties you would like to display from Table Query results"]
 *         NOTE: The defaults will always be added to your result. Also, omit this key if 
 *         you use a queryFunction that does not execute queryTableData Or if only the 
 *         default paths are needed.
 * 
 *      createSummaryTags: [default = getTableQueryDataSummaryTags]
 *        (entity, results) => {
 *          return ["Summary Tags generated from results for this entity type"];
 *        }
 *        results is the result object generated in the query function
 *        NOTE: It is recommended you add your custom functionality to createSummaryTagsFunctions.js
 * 
 *      displayTabNames: [default = { tableQueryData: "Incidents" }]
 *        { [key returned from queryFunction]: "Tab name for this query result"}
 *      displayStructure: [default = { tableQueryData: tableQueryDisplayStructure }]
 *        { [key returned from queryFunction]: [{displayStructure}]}
 *        NOTE: A Display Structure shows how we format the data for the front end to display.
 *         Look to ./displayStructures/tableQuery for reference.
* }
 * NOTE: If you would like to just use the defaults for an entity type, it can just be 
 *   omitted from this object.  If you would like to understand the defaults better you 
 *   check out the DEFAULT_FUNCTIONALITY_OBJECT in defaultFunctionalityByType.js
 */

const CUSTOM_FUNCTIONALITY_FOR_STANDARD_ENTITY_TYPES = {
  IPv4: assetsAndIncidentCustomFunctionality,
  domain: assetsAndIncidentCustomFunctionality,
  string: assetsAndIncidentCustomFunctionality,
  cve: assetsAndIncidentCustomFunctionality,
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
    tableQuerySummaryTagPaths: ['category', 'phase']
  },

  // Specific Custom Types
  knowledgeBase: {
    queryFunction: queryKnowledgeBase,
    createSummaryTags: getTotalKbDocsSummaryTag,
    displayTabNames: { knowledgeBaseData: 'Knowledge Base' },
    displayStructure: { knowledgeBaseData: knowledgeBaseDisplayStructure }
  },

  change: {
    tableQueryTableName: 'change_request',
    displayTabNames: { tableQueryData: 'Changes' }
  },
  request: {
    tableQueryTableName: 'sc_request',
    displayTabNames: { tableQueryData: 'Requests' }
  },
  requestedItem: {
    tableQueryTableName: 'sc_req_item',
    displayTabNames: { tableQueryData: 'Requested Items' }
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