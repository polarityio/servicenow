const _ = require('lodash');
const { map } = require('lodash/fp');
const { splitOutIgnoredIps } = require('./dataTransformations');
const { queryEntityByType } = require('./functionalityByEntityType/index');
const createLookupResults = require('./createLookupResults');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const entitiesResults = await _getEntitiesResults(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );
  
  Logger.info({entitiesResults}, 'Entity results');

  const lookupResults = createLookupResults(entitiesResults, options, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

const _getEntitiesResults = async (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) =>
  Promise.all(
    map(async (entity) => {
      // if entity.type is `string` then this is an annotated entity with no other
      // entity type matches (including custom and built in types).  We want to check
      // if string lookups are enabled before continuing.
      if (entity.type === 'string' && !options.shouldSearchString)
        return { entity, results: {} };

      // Since we allow users to specify a custom hostname regex it is possible
      // for an entity to match two custom types.  As a result, for each unique custom type
      // we need to run a lookup
      if (entity.type === 'custom') {
        Logger.info({ entity }, 'Handling custom type');
        const typeResults = await Promise.all(
          entity.types.map(async (type) => {
            if (type.startsWith('custom.')) {
              // The way the integration is set up is that the type must be the name of the custom type rather custom
              // as an example, if the type is `custom.incident` then the `type` property must be set to `incident`.
              entity.type = type.split('.')[1];
              Logger.info({ entity }, 'Type to lookup');
              const result = await queryEntityByType(
                entity,
                options,
                requestWithDefaults,
                Logger
              );

              Logger.info({ result }, 'SINGLE LOOKUP RESULTS');
              return result;
            }
            return {};
          })
        );

        Logger.info({ typeResults }, 'Type Results');

        let finalResults = {
          tableQueryData: [],
          assetsData: [],
          knowledgeBaseData: []
        };
        typeResults.forEach((result) => {
          if (result && result.tableQueryData) {
            finalResults.tableQueryData = finalResults.tableQueryData.concat(
              result.tableQueryData
            );
          }
          if (result && result.assetsData) {
            finalResults.assetsData = finalResults.assetsData.concat(
              result.assetsData
            );
          }
          if (result && result.knowledgeBaseData) {
            finalResults.knowledgeBaseData = finalResults.knowledgeBaseData.concat(
              result.knowledgeBaseData
            );
          }
        });

        finalResults.tableQueryData = _.uniqBy(finalResults.tableQueryData, function (e) {
          return e.number ? e.number : e;
        });

        
        return { entity, result: finalResults };
      }

      // Non-custom build-in types are handled here
      const result = await queryEntityByType(
        entity,
        options,
        requestWithDefaults,
        Logger
      );

      return { entity, result };
    }, entitiesPartition)
  );

module.exports = {
  getLookupResults
};
