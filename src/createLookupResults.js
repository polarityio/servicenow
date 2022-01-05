const { flow, map, size, mapValues, some, identity } = require('lodash/fp');

const { createSummaryByType } = require('./entityTypeToFunctionalityMapping/index');

const createLookupResults = (foundEntities, options, Logger) =>
  map(({ entity, result }) => {
    let lookupResult;
    const formattedQueryResult = formatQueryResult(result);
    if (size(formattedQueryResult)) {
      lookupResult = {
        entity,
        data: {
          summary: createSummaryByType(entity, formattedQueryResult),
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


const formatQueryResult = (result) => {
  const resultNotEmpty = flow(mapValues(size), some(identity))(result);

  return resultNotEmpty && result;
};

module.exports = createLookupResults;
