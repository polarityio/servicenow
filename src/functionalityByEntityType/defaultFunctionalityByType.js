const { map, flow, get, reduce } = require('lodash/fp');

const { entityTypes, customTypes } = require('../../config/config');

const queryDefaultTable = require('../querying/queryDefaultTable');

const numberTableQueryString = ({ value }) => `number=${value}`;

const { getTableQueryDataSummaryTags } = require('./createSummaryTagsFunctions');

const DEFAULT_FUNCTIONALITY_OBJECT = {
  queryFunction: queryDefaultTable,
  tableQueryTableName: 'incidents',
  tableQueryQueryString: numberTableQueryString,
  createSummaryTags: getTableQueryDataSummaryTags
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
