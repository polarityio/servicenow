const { getOr, size } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');
const {
  LAYOUT_MAP,
  getTableQueryTableNameByType,
  getTableQueryQueryStringByType
} = require('../functionalityByEntityType/index');


const queryDefaultTable = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const table = getTableQueryTableNameByType(entity.type),
    const query = getTableQueryQueryStringByType(entity, options)

    const tableQueryData = getOr(
      [],
      'body.result',
      await requestWithDefaults({
        uri: `${options.url}/api/now/table/${table}`,
        options,
        qs: {
          sysparm_query: query,
          sysparm_limit: 1000
        },
        json: true
      })
    );

    if (!size(tableQueryData)) return;

    return {
      serviceNowObjectType: table,
      layout: LAYOUT_MAP[table],
      tableQueryData
    };
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error(
      {
        detail: 'Failed to Query Table',
        options,
        formattedError: err
      },
      'Query Table Failed'
    );

    throw error;
  }
};

module.exports = queryDefaultTable;