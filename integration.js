'use strict';

const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');
const { getDisplayStructureNestedLinkData } = require('./src/displayStructures/index');
const { parseErrorToReadableJSON } = require('./src/dataTransformations');

const { getLookupResults } = require('./src/getLookupResults');

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
    const err = parseErrorToReadableJSON(error)
    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');
    
    return cb({
      detail:
        (error.message === 'read ECONNRESET'
          ? 'ECONNRESET.  This can occur from an ServiceNow Instance hibernating.'
          : error.message) || 'Command Failed',
      err
    });
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};


const onDetails = async (lookupObject, options, cb) => {  
  try {
    const displayStructureNestedLinkData = await getDisplayStructureNestedLinkData(
      lookupObject,
      options,
      requestWithDefaults,
      Logger
    );

    return cb(null, displayStructureNestedLinkData);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error({ error, formattedError: err }, 'On Details Failed');

    if (/Invalid URI .*/ig.test(error.message)) {
      cb();
      throw new Error(
        "A Display Field's link property is coming up to an invalid url. Hint: Most link paths include a `.link` at the end." +
          (err.displayFieldTitle
            ? ` The Display Field with the bad link is '${err.displayFieldTitle}'`
            : '')
      );
    }
    
    return cb({
      detail: error.message || 'Command Failed',
      err
    });
  }
};
module.exports = {
  startup,
  validateOptions,
  doLookup,
  onDetails
};
