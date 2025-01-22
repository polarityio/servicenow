const { get } = require('lodash/fp');
const _ = require('lodash');
const customFunctionalityByType = require('./customFunctionalityByType');
const defaultFunctionalityByType = require('./defaultFunctionalityByType');
const { mapObject } = require('../dataTransformations');
const { getLogger } = require('../logger');
/**
 * NOTE: To Add or Modify an Entity Type's functionality go to customFunctionalityByType.js
 */
const customFunctionalityWithDefaults = mapObject(
  (functionalityForThisEntityType, entityType) => {
    if (!get(entityType, customFunctionalityByType))
      return [entityType, functionalityForThisEntityType];

    const customFunctionalityWithDefaultsForThisType = mapObject(
      (functionalityProperty, functionalityKey) => {
        const customTypeFunctionalityProperty = get(
          [entityType, functionalityKey],
          customFunctionalityByType
        );
        return [
          functionalityKey,
          customTypeFunctionalityProperty || functionalityProperty
        ];
      },
      defaultFunctionalityByType[entityType]
    );

    return [entityType, customFunctionalityWithDefaultsForThisType];
  },
  defaultFunctionalityByType
);

const queryEntityByType = (entity, options, requestWithDefaults, Logger) => {
  Logger.info(
    { entity, keys: Object.keys(customFunctionalityWithDefaults) },
    'queryEntityByType'
  );
  return get([entity.type, 'queryFunction'], customFunctionalityWithDefaults)(
    entity,
    options,
    requestWithDefaults,
    Logger
  );
};

const createSummaryByType = (entity, formattedQueryResult, Logger) =>
  get([entity.type, 'createSummaryTags'], customFunctionalityWithDefaults)(
    formattedQueryResult,
    entity,
    Logger
  );

const createSummaryByTypes = (entity, formattedQueryResult, Logger) => {
  let summary = [];
  entity.types.forEach((type) => {
    if (type.startsWith('custom.')) {
      type = type.split('.')[1];
    }
    const createSummaryFunc = get(
      [type, 'createSummaryTags'],
      customFunctionalityWithDefaults,
      null
    );
    if (createSummaryFunc) {
      summary = summary.concat(createSummaryFunc(formattedQueryResult, entity, Logger));
    }
  });
  return _.uniq(summary);
};

const getTableQueryTableNameByType = (type) =>
  get([type, 'tableQueryTableName'], customFunctionalityWithDefaults);

const getTableQueryQueryStringByType = (entity, options) =>
  get([entity.type, 'tableQueryQueryString'], customFunctionalityWithDefaults)(
    entity,
    options
  );

const getTableQuerySummaryTagPathsType = (type) =>
  get([type, 'tableQuerySummaryTagPaths'], customFunctionalityWithDefaults);

const getDisplayStructureByType = (type) =>
  get([type, 'displayStructure'], customFunctionalityWithDefaults);

const getDisplayTabNamesByType = (type) =>
  get([type, 'displayTabNames'], customFunctionalityWithDefaults);

const getDisplayTabNamesByTypes = (types) => {
  let tabNames = {};
  types.forEach((type) => {
    if (type.startsWith('custom.')) {
      type = type.split('.')[1];
    }
    tabNames = {
      ...tabNames,
      ..._.get([type, 'displayTabNames'], customFunctionalityWithDefaults, {})
    };
  });
  return tabNames;
};

module.exports = {
  queryEntityByType,
  createSummaryByType,
  createSummaryByTypes,
  getTableQueryTableNameByType,
  getTableQueryQueryStringByType,
  getDisplayStructureByType,
  getDisplayTabNamesByType,
  getDisplayTabNamesByTypes,
  getTableQuerySummaryTagPathsType,

  //customFunctionalityWithDefaults,
  customFunctionalityByType,
  defaultFunctionalityByType
};
