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

const { mapObjectAsync, parseErrorToReadableJSON } = require('../../dataTransformations');
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
  const displayStructureWithNestedPopulatedLinkDisplayStructures = await Promise.all(
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
  )(displayStructureWithNestedPopulatedLinkDisplayStructures);

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

  let moreData;
  try {
    moreData = getOr(
      {},
      'body.result',
      await requestWithDefaults({
        uri: linkToMoreData,
        options
      })
    );
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error({ error, formattedError: err }, 'Error Getting More Data From Nested Link');

    if(!pathToOnePropertyFromMoreDataToDisplay) throw error;

    const errorWithDisplayFieldTitle = new Error(error.message);
    errorWithDisplayFieldTitle.displayFieldTitle = displayStructureField.label;
    throw errorWithDisplayFieldTitle;
  }

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
