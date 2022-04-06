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
          sysparm_limit: 10
        }
      })
    );

    if (!size(tableQueryData)) return;

    Logger.trace({
      MESSAGE: '****** Getting Fields For UI Adjustment ******',
      tableQueryData
    });
    return { tableQueryData };
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error(
      {
        detail: 'Failed to Query Table',
        formattedError: err
      },
      'Query Table Failed'
    );

    throw error;
  }
};

module.exports = queryTableData;