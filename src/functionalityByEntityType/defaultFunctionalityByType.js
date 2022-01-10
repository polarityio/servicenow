const { map, flow, get, reduce } = require('lodash/fp');

const { entityTypes, customTypes } = require('../../config/config');

const queryTableData = require('../querying/queryTableData');

const numberTableQueryString = ({ value }) => `number=${value}`;

const { getTableQueryDataSummaryTags } = require('./createSummaryTagsFunctions');
const { tableQueryDisplayStructure } = require('../displayStructures/index');

const DEFAULT_FUNCTIONALITY_OBJECT = {
  queryFunction: queryTableData,
  tableQueryTableName: 'incident',
  tableQueryQueryString: numberTableQueryString,
  createSummaryTags: getTableQueryDataSummaryTags,
  displayTabNames: { tableQueryData: 'Incidents' },
  displayStructure: { tableQueryData: tableQueryDisplayStructure }
};

const defaultFunctionalityForStandardEntityTypes = reduce(
  (agg, entityType) => ({ ...agg, [entityType]: DEFAULT_FUNCTIONALITY_OBJECT }),
  {},
  entityTypes
);

const defaultFunctionalityForCustomEntityTypes = flow(
  map(get('key')),
  reduce((agg, entityType) => ({ ...agg, [entityType]: DEFAULT_FUNCTIONALITY_OBJECT }), {
    custom: DEFAULT_FUNCTIONALITY_OBJECT
  })
)(customTypes);

const defaultFunctionalityByType = {
  ...defaultFunctionalityForCustomEntityTypes,
  ...defaultFunctionalityForStandardEntityTypes
};

module.exports = defaultFunctionalityByType;
