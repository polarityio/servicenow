const { map, flatMap, get, flow, filter } = require('lodash/fp');
const tableQueryDisplayStructure = require('./tableQuery');
const assetsDisplayStructure = require('./assets');
const knowledgeBaseDisplayStructure = require('./knowledgeBase');
const usersDisplayStructure = require('./users');

const nestedLinkStructures = require('./nestedLinkStructures');

const { mapObject } = require('../dataTransformations');

const putResultsInDisplayStructureIgnoringMoreDataLinks = (
  entity,
  queryFunctionResultsForThisEntity,
  options
) => {
  const { getDisplayStructureByType } = require('../functionalityByEntityType/index');

  const displayStructureForThisEntity = getDisplayStructureByType(entity.type);

  const displayStructureWithPopulatedResults = mapObject(
    (unpopulatedDisplayStructure, resultReturnKey) => [
      resultReturnKey,
      populateDisplayStructureIgnoringLinks(
        queryFunctionResultsForThisEntity[resultReturnKey],
        unpopulatedDisplayStructure,
        options
      )
    ],
    displayStructureForThisEntity
  );
  return displayStructureWithPopulatedResults;
};

const populateDisplayStructureIgnoringLinks = (
  specificQueryFunctionResults,
  unpopulatedDisplayStructure,
  options
) =>
  flatMap(
    (queryFunctionResult) =>
      flow(
        map(populateDisplayStructureField(queryFunctionResult, options)),
        filter(isLinkPathOrHasRequiredResultValue)
      )(unpopulatedDisplayStructure),
    specificQueryFunctionResults
  );

const populateDisplayStructureField =
  (queryFunctionResult, options) => (displayStructureField) =>
    !displayStructureField.pathIsLinkToMoreData
      ? {
          ...displayStructureField,
          ...(displayStructureField.isDisplayLink &&
            queryFunctionResult.sys_class_name &&
            queryFunctionResult.sys_id && {
              displayLink: `${options.url}/nav_to.do?uri=${queryFunctionResult.sys_class_name}.do?sys_id=${queryFunctionResult.sys_id}`
            }),
          value: get(displayStructureField.path, queryFunctionResult)
        }
      : displayStructureField;

const isLinkPathOrHasRequiredResultValue = (displayStructureField) => {
  const isLinkPath = displayStructureField.pathIsLinkToMoreData;
  const hasResultValue = !!displayStructureField.value;
  const isLinkWithoutNeededValue =
    !displayStructureField.pathIsLinkToMoreData &&
    displayStructureField.isTitle &&
    displayStructureField.label;

  return isLinkPath || hasResultValue || isLinkWithoutNeededValue;
}

const getDisplayStructureNestedLinkData = async (
  tableOrStructureName,
  data,
  options,
  requestWithDefaults,
  Logger
) => 'Fully Flushed out strucutre';

module.exports = {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  getDisplayStructureNestedLinkData,
  assetsDisplayStructure,
  knowledgeBaseDisplayStructure,
  tableQueryDisplayStructure,
  usersDisplayStructure
};
