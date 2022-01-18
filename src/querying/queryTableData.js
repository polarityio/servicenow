const { getOr, size } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');

const queryTableData = async (entity, options, requestWithDefaults, Logger) => {
  const {
    getTableQueryTableNameByType,
    getTableQueryQueryStringByType
  } = require('../functionalityByEntityType/index');

  try {
    const tableName = getTableQueryTableNameByType(entity.type);
    const queryString = getTableQueryQueryStringByType(entity, options)
    if(!(tableName && queryString)) return;

    const tableQueryData = getOr(
      [],
      'body.result',
      await requestWithDefaults({
        uri: `${options.url}/api/now/table/${tableName}`,
        options,
        qs: {
          sysparm_query: queryString,
          sysparm_limit: 1000
        }
      })
    );

    if (!size(tableQueryData)) return;

    return { tableQueryData };
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

module.exports = queryTableData;