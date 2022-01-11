const { get } = require('lodash/fp');

const customFunctionalityByType = require('./customFunctionalityByType');
const defaultFunctionalityByType = require('./defaultFunctionalityByType');
const { mapObject } = require('../dataTransformations');

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


const queryEntityByType = (entity, options, requestWithDefaults, Logger) =>
  get(
    [entity.type, 'queryFunction'],
    customFunctionalityWithDefaults
  )(entity, options, requestWithDefaults, Logger);

const createSummaryByType = (entity, formattedQueryResult, Logger) =>
  get([entity.type, 'createSummaryTags'], customFunctionalityWithDefaults)(
    formattedQueryResult,
    entity,
    Logger
  );

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

module.exports = {
  queryEntityByType,
  createSummaryByType,
  getTableQueryTableNameByType,
  getTableQueryQueryStringByType,
  getDisplayStructureByType,
  getDisplayTabNamesByType,
  getTableQuerySummaryTagPathsType,

  customFunctionalityWithDefaults,
  customFunctionalityByType,
  defaultFunctionalityByType
};
