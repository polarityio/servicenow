const {
  flow,
  map,
  get,
  size,
  __,
  concat,
  uniq,
  mapValues,
  some,
  identity,
  compact
} = require('lodash/fp');

const { SUMMARY_PROPERTIES_BY_TYPE } = require('./constants');

const createLookupResults = (foundEntities, options, Logger) =>
  map(({ entity, result }) => {
    let lookupResult;
    const formattedQueryResult = formatQueryResult(result);
    if (size(formattedQueryResult)) {
      lookupResult = {
        entity,
        data: {
          summary: createSummary(entity, formattedQueryResult),
          details: formattedQueryResult
        }
      };
    } else {
      lookupResult = {
        entity,
        data: null
      };
    }
    return lookupResult;
  }, foundEntities);

const createSummary = (entity, { assetData, knowledgeBaseData, tableQueryData }) => {
  const tableQueryDataSummaryTags = flow(
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
      )(SUMMARY_PROPERTIES_BY_TYPE)
    ),
    compact,
    uniq
  )(tableQueryData);

  return []
    .concat(size(assetData) ? `Assets: ${size(assetData)}` : [])
    .concat(
      size(knowledgeBaseData)
        ? `Knowledge Base Documents: ${size(knowledgeBaseData)}`
        : []
    )
    .concat(tableQueryDataSummaryTags);
};

const formatQueryResult = (results) => {
  const resultsNotEmpty = flow(mapValues(size), some(identity))(results);

  return resultsNotEmpty && results;
};

module.exports = createLookupResults;
