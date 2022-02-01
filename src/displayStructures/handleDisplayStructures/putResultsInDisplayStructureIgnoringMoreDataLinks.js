const { map, flatMap, get, flow, filter, isEmpty, isPlainObject } = require('lodash/fp');


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

const processField = (field, pathResult) => {
  const processedResult = field.process ? field.process(pathResult) : pathResult;

  return isPlainObject(processedResult)
    ? JSON.stringify({
        ...(processedResult.link && {
          PolarityMessage:
            'It is recommended you add `.link` to your `path` field, and ' +
            '`pathIsLinkToMoreData: true` to you Display Structure for this field.  ' +
            'If you do that you will also need to add `moreDataDisplayStructure`, or the ' +
            '`pathToOnePropertyFromMoreDataToDisplay` property as well.'
        }),
        ...processedResult
      })
    : processedResult;
}

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
