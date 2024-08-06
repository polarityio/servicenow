const { map, flow, get, reduce } = require('lodash/fp');

const { mergeAndRemoveDuplicates } = require('../dataTransformations');
const { entityTypes, customTypes: customTypesJs } = require('../../config/config');
const { customTypes: customTypesJson } = require('../../config/config.json');
const customTypes = mergeAndRemoveDuplicates(customTypesJs, customTypesJson, 'key');

const queryTableData = require('../querying/queryTableData');

const numberTableQueryString = ({ value }) => `number=${value}`;

const { getTableQueryDataSummaryTags } = require('./createSummaryTagsFunctions');
const { tableQueryDisplayStructure } = require('../displayStructures/index');
const assetsAndIncidentCustomFunctionality = require('./assetsAndIncidentCustomFunctionality');

// Not currently used but contains default values if you only want to search the Incident
// table and not search the assets table.
const DEFAULT_INCIDENT_ONLY_SEARCH_FUNCTIONALITY_OBJECT = {
  queryFunction: queryTableData,
  tableQueryTableName: 'incident',
  tableQueryQueryString: numberTableQueryString,
  createSummaryTags: getTableQueryDataSummaryTags,
  displayTabNames: { tableQueryData: 'Incidents' },
  displayStructure: { tableQueryData: tableQueryDisplayStructure },
  // Empty Defaults
  tableQuerySummaryTagPaths: false
};

const DEFAULT_FUNCTIONALITY_OBJECT = assetsAndIncidentCustomFunctionality;

const defaultFunctionalityForStandardEntityTypes = reduce(
  (agg, entityType) => ({ ...agg, [entityType]: DEFAULT_FUNCTIONALITY_OBJECT }),
  {},
  entityTypes
);

const defaultFunctionalityForCustomEntityTypes = flow(
  map(get('key')),
  reduce(
    (agg, entityType) => ({ ...agg, [entityType]: DEFAULT_FUNCTIONALITY_OBJECT }),
    {}
  )
)(customTypes);

const defaultFunctionalityByType = {
  ...defaultFunctionalityForCustomEntityTypes,
  ...defaultFunctionalityForStandardEntityTypes
};

module.exports = defaultFunctionalityByType;
