const { flow, split, trim, join, getOr, first, last, size } = require('lodash/fp');
const {
  LAYOUT_MAP,
  DEFAULT_TABLE_BY_TYPE,
  DEFAULT_QUERY_BY_TYPE
} = require('../constants');

const queryDefaultTable = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const { table, query } = getQueries(entity, options);

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
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
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


const getQueries = (entity, options) => flow(getType, (type) => ({
    table: DEFAULT_TABLE_BY_TYPE[type],
    query: DEFAULT_QUERY_BY_TYPE[type](entity, options)
  }))(entity)


const getType = ({ type, types }) =>
  type === 'custom' ? flow(first, split('.'), last)(types) : type;

module.exports = queryDefaultTable;