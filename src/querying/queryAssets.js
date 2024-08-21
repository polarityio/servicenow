const { flow, get, map, split, trim, join, getOr, size } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');

const queryAssets = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const assetTableQuery = flow(
      get('assetTableFields'),
      split(','),
      map((field) => `${trim(field)}CONTAINS${entity.value}`),
      join('^NQ')
    )(options);

    const requestOptions = {
      uri: `${options.url}/api/now/table/alm_asset`,
      qs: {
        sysparm_query: assetTableQuery,
        sysparm_limit: 10
      },
      options
    };

    const response = await requestWithDefaults(requestOptions);
    const assetsData = getOr([], 'body.result', response);

    if (!size(assetsData)) return;

    return { assetsData: assetsData };
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error(
      {
        detail: 'Failed to Query Assets',
        formattedError: err
      },
      'Query Assets Failed'
    );

    throw error;
  }
};

module.exports = queryAssets;
