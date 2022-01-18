const {
  map,
  get,
  flow,
  compact,
  flatten,
  getOr,
  omit
} = require('lodash/fp');

const moreDataDisplayStructures = require('../moreDataDisplayStructures');

const { mapObjectAsync } = require('../../dataTransformations');
const {
  populateDisplayStructureIgnoringLinks,
  getDisplayLink
} = require('./putResultsInDisplayStructureIgnoringMoreDataLinks');


const getDisplayStructureNestedLinkData = async (
  lookupObject,
  options,
  requestWithDefaults,
  Logger
) => {
  const displayStructureWithoutNestedLinkData = flow(
    get('data.details'),
    omit('displayTabNames')
  )(lookupObject);

  const displayStructureWithPopulatedLinkResults = await mapObjectAsync(
    async (partlyPopulatedDisplayStructure, resultReturnKey) => [
      resultReturnKey,
      await populateDisplayStructureWithLinks(
        partlyPopulatedDisplayStructure,
        options,
        requestWithDefaults,
        Logger
      )
    ],
    displayStructureWithoutNestedLinkData
  );

  lookupObject.data.details = {
    ...lookupObject.data.details,
    ...displayStructureWithPopulatedLinkResults
  };
  return lookupObject.data;
};

const populateDisplayStructureWithLinks = async (
  partlyPopulatedDisplayStructure,
  options,
  requestWithDefaults,
  Logger
) => {
  const displayStructureWithNestedPopulatedLinkDisplayStuctures = await Promise.all(
    map(
      async (displayStructureField) =>
        displayStructureField.linkToMoreData
          ? await getMoreDataAndAddToDisplayStructure(
              displayStructureField,
              options,
              requestWithDefaults,
              Logger
            )
          : displayStructureField,
      partlyPopulatedDisplayStructure
    )
  );

  const displayStructureWithNestedStructuresFlattened = flow(
    compact,
    flatten
  )(displayStructureWithNestedPopulatedLinkDisplayStuctures);

  return displayStructureWithNestedStructuresFlattened;
};

const getMoreDataAndAddToDisplayStructure = async (
  {
    moreDataDisplayStructure,
    pathToOnePropertyFromMoreDataToDisplay,
    linkToMoreData,
    pathIsLinkToMoreData,
    ...displayStructureField
  },
  options,
  requestWithDefaults,
  Logger
) => {
  const unpopulatedMoreDataDisplayStructure =
    moreDataDisplayStructures[moreDataDisplayStructure];
  if (!(unpopulatedMoreDataDisplayStructure || pathToOnePropertyFromMoreDataToDisplay))
    return;

  const moreData = getOr(
    {},
    'body.result',
    await requestWithDefaults({
      uri: linkToMoreData,
      options
    })
  );

  let pathResult;
  if (pathToOnePropertyFromMoreDataToDisplay) {
    pathResult = get(pathToOnePropertyFromMoreDataToDisplay, moreData);
    return (
      !!pathResult && {
        ...displayStructureField,
        ...getDisplayLink(displayStructureField, moreData, options),
        value: pathResult
      }
    );
  }

  const moreDataDisplayStructureWithoutLinksPopulated =
    populateDisplayStructureIgnoringLinks(
      [moreData],
      [displayStructureField, ...unpopulatedMoreDataDisplayStructure],
      options
    );

  const moreDataDisplayStructureWithLinksPopulated =
    await populateDisplayStructureWithLinks(
      moreDataDisplayStructureWithoutLinksPopulated,
      options,
      requestWithDefaults,
      Logger
    );

  return moreDataDisplayStructureWithLinksPopulated;
};

module.exports = getDisplayStructureNestedLinkData;
