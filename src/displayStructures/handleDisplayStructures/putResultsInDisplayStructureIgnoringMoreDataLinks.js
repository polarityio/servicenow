const { map, flatMap, get, flow, filter, isEmpty } = require('lodash/fp');


const { mapObject } = require('../../dataTransformations');

const putResultsInDisplayStructureIgnoringMoreDataLinks = (
  entity,
  queryFunctionResultsForThisEntity,
  options,
  Logger
) => {
  const { getDisplayStructureByType } = require('../../functionalityByEntityType/index');

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
        filter(hasRequiredValueOrIsTitle)
      )(unpopulatedDisplayStructure),
    specificQueryFunctionResults
  );

const populateDisplayStructureField =
  (queryFunctionResult, options, indent = 0) =>
  (displayStructureField) => {
    const displayStructurePathResult = get(
      displayStructureField.path,
      queryFunctionResult
    );

    return {
      ...displayStructureField,
      indent,
      ...getDisplayLink(displayStructureField, queryFunctionResult, options),
      [displayStructureField.pathIsLinkToMoreData ? 'linkToMoreData' : 'value']:
        processField(displayStructureField, displayStructurePathResult)
    };
  };

const getDisplayLink = (displayStructureField, queryFunctionResult, options) =>
  displayStructureField.isDisplayLink &&
  !displayStructureField.pathIsLinkToMoreData &&
  queryFunctionResult.sys_class_name &&
  queryFunctionResult.sys_id && {
    displayLink: `${options.url}/nav_to.do?uri=${queryFunctionResult.sys_class_name}.do?sys_id=${queryFunctionResult.sys_id}`
  };

const processField = (field, pathResult) =>
  field.process ? field.process(pathResult) : pathResult;

const hasRequiredValueOrIsTitle = (displayStructureField) => {
  const hasResultValue = !isEmpty(
    displayStructureField.value || displayStructureField.linkToMoreData
  );
  const isTitle =
    displayStructureField.isTitle &&
    displayStructureField.label &&
    !displayStructureField.pathIsLinkToMoreData;

  return hasResultValue || isTitle;
};

module.exports = {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  populateDisplayStructureIgnoringLinks,
  getDisplayLink
};
