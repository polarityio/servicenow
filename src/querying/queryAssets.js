const { flow, get, split, trim, join, getOr, size } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');

const queryAssets = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const assetTableQuery = flow(
      get('assetTableFields'),
      split(','),
      map((field) => `${trim(field)}CONTAINS${entity.value}`),
      join('^OR')
    )(options);

    const assetsData = getOr(
      [],
      'body.records',
      await requestWithDefaults({
        uri: `${options.url}/cmdb_ci_list.do?JSONv2=&displayvalue=true&sysparm_query=${assetTableQuery}`,
        options
      })
    );

    if (!size(assetsData)) return;

    return { assetsData };
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error(
      {
        detail: 'Failed to Query Assets',
        options,
        formattedError: err
      },
      'Query Assets Failed'
    );

    throw error;
  }
};

module.exports = queryAssets;