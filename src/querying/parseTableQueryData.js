const { map } = require('lodash/fp');
const { mapObject } = require('../dataTransformations');
const { PROPERTY_MAP } = require('../constants');
const { parseErrorToReadableJSON } = require('../dataTransformations');

const parseTableQueryData = async (
  results,
  type,
  options,
  requestWithDefaults
) =>
  Promise.all(map(parseTableQueryRow(type, options, requestWithDefaults), results));

const parseTableQueryRow = (type, options, requestWithDefaults) => async (result) =>
  mapObject(async (propertyMapObject, propertyKey) => {
    try {
      const resultValue = result[propertyKey];
      if (!resultValue) return;

      const resultValueIsAnUnprocessedLink =
        valueIsLink(resultValue) && !linkIsProcessed(resultValue);

      let parsedDetailsResult;
      if (resultValueIsAnUnprocessedLink) {
        const details = await getDetailsInformation(
          resultValue.link,
          options,
          requestWithDefaults
        );

        parsedDetailsResult = await parseTableQueryRow(
          type,
          withDetails,
          options,
          requestWithDefaults
        )(details);
      } else if (valueIsProcessed(resultValue)) return;

      const parsedResult = !valueIsProcessed(resultValue)
        ? transformPropertyLinkValue(propertyMapObject, resultValue, result)
        : resultValue;

      return [
        propertyKey,
        parsedDetailsResult
          ? {
              ...parsedResult,
              details: parsedDetailsResult
            }
          : parsedResult
      ];
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        {
          detail: 'Failed to Parse Result',
          propertyKey,
          propertyMapObject,
          result,
          options,
          formattedError: err
        },
        'Parse Result Failed'
      );

      throw error;
    }
  }, PROPERTY_MAP[type]);

const valueIsProcessed = (resultValue) => resultValue && resultValue.isProcessed;

const valueIsLink = (resultValue) =>
  resultValue !== null && typeof resultValue.link === 'string';

const linkIsProcessed = (resultValue) =>
  !(
    resultValue !== null &&
    (resultValue.details === null || typeof resultValue.details === 'undefined')
  );

const transformPropertyLinkValue = (propertyObj, value, parentObj) => ({
  title: propertyObj.title,
  value: propertyObj.title,
  type: propertyObj.type,
  link: value.link,
  isLink: true,
  isProcessed: true,
  details: null,
  sysId: value.value
});

const getDetailsInformation = async (link, options, requestWithDefaults) =>
  get(
    'body.result',
    await requestWithDefaults({
      uri: link,
      options
    })
  );

module.exports = parseTableQueryData;
