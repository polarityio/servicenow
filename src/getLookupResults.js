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
              let simplifiedType = type.split('.')[1];
              entity.type = simplifiedType;
              Logger.info({ entity }, 'Type to lookup');
              const result = await queryEntityByType(
                entity,
                options,
                requestWithDefaults,
                Logger
              );

              Logger.info({ result, type: entity.type }, 'SINGLE LOOKUP RESULTS');
              result._resultType = simplifiedType;
              return result;
            }
            return {};
          })
        );

        

        let finalResults = {
          tableQueryData: [],
          assetsData: [],
          knowledgeBaseData: []
        };
        const resultTypes = new Set();
        typeResults.forEach((result) => {
          if (result && result.tableQueryData) {
            resultTypes.add(result._resultType);
            finalResults.tableQueryData = finalResults.tableQueryData.concat(
              result.tableQueryData
            );
          }
          if (result && result.assetsData) {
            resultTypes.add(result._resultType);
            finalResults.assetsData = finalResults.assetsData.concat(
              result.assetsData
            );
          }
          if (result && result.knowledgeBaseData) {
            resultTypes.add(result._resultType);
            finalResults.knowledgeBaseData = finalResults.knowledgeBaseData.concat(
              result.knowledgeBaseData
            );
          }
        });
        
        finalResults._resultTypes = [...resultTypes];

        finalResults.tableQueryData = _.uniqBy(finalResults.tableQueryData, function (e) {
          return e.number ? e.number : e;
        });

        Logger.info({ finalResults }, 'Final Results');
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
