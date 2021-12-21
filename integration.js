'use strict';
const fp = require('lodash/fp');

const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');
const parseTableQueryData = require('./src/querying/parseTableQueryData');

const { getLookupResults } = require('./src/getLookupResults');
const { size } = require('lodash/fp');

let Logger;
let requestWithDefaults;
const startup = (logger) => {
  Logger = logger;
  requestWithDefaults = createRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.debug({ entities }, 'Entities');
  options.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;

  let lookupResults;
  try {
    lookupResults = await getLookupResults(entities, options, requestWithDefaults, Logger);
  } catch (error) {
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');
    return cb({ detail: error.message || 'Command Failed', err });
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};


const onDetails = async (lookupObject, options, cb) => {
  const tableQueryData = get('data.details.tableQueryData', lookupObject);
  if (size(tableQueryData)) {
    lookupObject.data.details.tableQueryData = await parseTableQueryData(
      tableQueryData,
      get('data.details.serviceNowObjectType', lookupObject),
      options,
      requestWithDefaults
    );
  }
  
  return cb(null, lookupObject.data);
};
module.exports = {
  startup,
  validateOptions,
  doLookup,
  onDetails
};
