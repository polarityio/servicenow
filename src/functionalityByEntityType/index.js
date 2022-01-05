const { get, merge } = require('lodash/fp');

const customFunctionalityByType = require('./customFunctionalityByType');
const defaultFunctionalityByType = require('./defaultFunctionalityByType');

const { LAYOUT_MAP, PROPERTY_MAP } = require('./asdf');
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
  )((entity, options, requestWithDefaults, Logger));

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

module.exports = {
  queryEntityByType,
  createSummaryByType,
  getTableQueryTableNameByType,
  getTableQueryQueryStringByType,
  LAYOUT_MAP,
  PROPERTY_MAP
};
