const { flow, map, size, mapValues, some, identity } = require('lodash/fp');

const { CREATE_SUMMARY_TAGS_BY_TYPE, getSummaryType } = require('./constants');

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

const createSummary = (entity, result) => {
  const type = getSummaryType(entity);

  const createSummaryTagFunction = CREATE_SUMMARY_TAGS_BY_TYPE[type];

  return createSummaryTagFunction(result);
};

const formatQueryResult = (result) => {
  const resultNotEmpty = flow(mapValues(size), some(identity))(result);

  return resultNotEmpty && result;
};

module.exports = createLookupResults;
