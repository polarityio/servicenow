const { map, flow, join, split, trim, compact } = require('lodash/fp');

const queryAssets = require('../querying/queryAssets');
const queryTableData = require('../querying/queryTableData');

const {
  getTableQueryDataSummaryTags,
  getTotalAssetSummaryTag
} = require('./createSummaryTagsFunctions');

const {
  assetsDisplayStructure,
  tableQueryDisplayStructure
} = require('../displayStructures/index');

const assetsAndIncidentCustomFunctionality = {
  queryFunction: async (entity, options, requestWithDefaults, Logger) => ({
    ...(await queryAssets(entity, options, requestWithDefaults, Logger)),
    ...(await queryTableData(entity, options, requestWithDefaults, Logger))
  }),
  tableQueryQueryString: ({ value }, { incidentQueryFields }) =>
    incidentQueryFields &&
    typeof incidentQueryFields === 'string' &&
    incidentQueryFields.length !== 0 &&
    flow(
      split(','),
      compact,
      map((field) => `${trim(field)}CONTAINS${value}`),
      join('^NQ')
    )(incidentQueryFields),
  createSummaryTags: (results, entity, Logger) =>
    getTableQueryDataSummaryTags(results, entity, Logger).concat(
      getTotalAssetSummaryTag(results, entity, Logger)
    ),
  tableQuerySummaryTagPaths: ['number'],
  displayTabNames: { assetsData: 'Assets', tableQueryData: 'Incidents' },
  displayStructure: {
    assetsData: assetsDisplayStructure,
    tableQueryData: tableQueryDisplayStructure
  }
};

module.exports = assetsAndIncidentCustomFunctionality;
