const { get, merge } = require('lodash/fp');

const customFunctionalityByType = require('./customFunctionalityByType');
const defaultFunctionalityByType = require('./defaultFunctionalityByType');

/**
 * NOTE: To Add or Modify an Entity Type's functionality go to customFunctionalityByType.js
 */
const customFunctionalityWithDefaults = merge(
  defaultFunctionalityByType,
  customFunctionalityByType
);

const queryEntityByType = (entity, options, requestWithDefaults, Logger) =>
  get(
    [entity.type, 'queryFunction'],
    customFunctionalityWithDefaults
  )(entity, options, requestWithDefaults, Logger);

const createSummaryByType = (entity, formattedQueryResult) =>
  get([entity.type, 'createSummaryTags'], customFunctionalityWithDefaults)(
    entity,
    formattedQueryResult
  );

const getTableQueryTableNameByType = (type) =>
  get([type, 'tableQueryTableName'], customFunctionalityWithDefaults);

const getTableQueryQueryStringByType = (entity, options) =>
  get([entity.type, 'tableQueryQueryString'], customFunctionalityWithDefaults)(
    entity,
    options
  );

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
  getDisplayTabNamesByType
};
