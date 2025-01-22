const { flow, map, size, mapValues, some, identity } = require('lodash/fp');

const createLookupResults = (foundEntities, options, Logger) => {
  const {
    putResultsInDisplayStructureIgnoringMoreDataLinksMultiType
  } = require('./displayStructures/index');

  const {
    createSummaryByTypes,
    getDisplayTabNamesByTypes
  } = require('./functionalityByEntityType/index');

  return map(({ entity, result }) => {
    const formattedQueryResult = formatQueryResult(result);

    const lookupResult = {
      entity,
      data: !!formattedQueryResult
        ? {
            summary: createSummaryByTypes(
              entity,
              result._resultTypes,
              formattedQueryResult,
              Logger
            ),
            details: {
              ...putResultsInDisplayStructureIgnoringMoreDataLinksMultiType(
                entity,
                result._resultTypes,
                formattedQueryResult,
                options,
                Logger
              ),
              displayTabNames: getDisplayTabNamesByTypes(result._resultTypes)
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
