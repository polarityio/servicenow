const { map, flow, first, split, last } = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');

const { queryEntityByType } = require('./entityTypeToFunctionalityMapping/index');

const createLookupResults = require('./createLookupResults');


const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const entitiesWithCustomTypesSpecified = map(
    ({ type, types, ...entity }) => ({
      ...entity,
      type: type === 'custom' ? flow(first, split('.'), last)(types) : type
    }),
    entities
  );
  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(
    entitiesWithCustomTypesSpecified
  );

  const foundEntities = await _getEntityResults(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const lookupResults = createLookupResults(foundEntities, options, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

const _getEntityResults = async (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) =>
  Promise.all(
    map(async (entity) => {
      if (entity.type === 'string' && !options.shouldSearchString)
        return { entity, results: {} };

      const result = await queryEntityByType(entity, options, requestWithDefaults, Logger);

      return { entity, result };
    }, entitiesPartition)
  );

module.exports = {
  getLookupResults
};
