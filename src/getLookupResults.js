const fp = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const { QUERY_FUNCTION_BY_TYPE } = require('./constants');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {

  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const foundEntities = await _getFoundEntities(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const lookupResults = createLookupResults(foundEntities, options, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

const _getFoundEntities = async (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) =>
  Promise.all(
    fp.map(async (entity) => {
      const queryFunction = QUERY_FUNCTION_BY_TYPE[getType(entity, options)];
      
      const result = await queryFunction(entity, options, requestWithDefaults, Logger);

      return { entity, result };
    }, entitiesPartition)
  );

const getType = ({ type, types }, { shouldSearchString }) => 
  type === 'custom' && types.indexOf('custom.knowledgeBase') >= 0 
    ? 'knowledgeBase' :
  type === 'string' && !shouldSearchString 
    ? 'temporarilyIgnore' :
  type

module.exports = {
  getLookupResults
};
