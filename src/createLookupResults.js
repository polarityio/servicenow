const { flow, map, size, mapValues, some, identity } = require('lodash/fp');

const createLookupResults = (foundEntities, options, Logger) => {
  const {
    putResultsInDisplayStructureIgnoringMoreDataLinks
  } = require('./displayStructures/index');
  
  const {
    createSummaryByType,
    getDisplayTabNamesByType
  } = require('./functionalityByEntityType/index');

  return map(({ entity, result }) => {
    const formattedQueryResult = formatQueryResult(result);

    const lookupResult = {
      entity,
      data: !!formattedQueryResult
        ? {
            summary: createSummaryByType(entity, formattedQueryResult, Logger),
            details: {
              ...putResultsInDisplayStructureIgnoringMoreDataLinks(
                entity,
                formattedQueryResult,
                options,
                Logger
              ),
              displayTabNames: getDisplayTabNamesByType(entity.type)
            }
          }
        : null
    };
    return lookupResult;
  }, foundEntities);
};

const formatQueryResult = (result) => {
  const resultNotEmpty = flow(mapValues(size), some(identity))(result);

  return resultNotEmpty && result;
};

module.exports = createLookupResults;
