const async = require('async');
const request = require('request');
const config = require('./config/config');
const fs = require('fs');
const incidentLayout = require('./models/incident-layout');
const incidentModel = require('./models/incident-model');
const changeLayout = require('./models/change-layout');
const changeModel = require('./models/change-model');
const userLayout = require('./models/user-layout');

let requestWithDefaults;
let Logger;

const layoutMap = {
  incident: incidentLayout,
  change_request: changeLayout,
  sys_user: userLayout
};

const propertyMap = {
  incident: incidentModel,
  change_request: changeModel,
  sys_user: {
    name: {
      title: 'Name',
      type: 'sys_user'
    },
    title: {
      title: 'Title',
      type: 'sys_user'
    },
    email: {
      title: 'Email',
      type: 'sys_user'
    },
    department: {
      title: 'Department',
      type: 'cmn_department'
    },
    location: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_location: {
    name: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_department: {
    name: {
      title: 'Department',
      type: 'department'
    }
  }
};

function doLookup(entities, options, cb) {
  Logger.trace({ options: options });
  const lookupResults = [];

  async.each(
    entities,
    (entityObj, nextEntity) => {
      const queryObj = getQueries(entityObj, options);
      if (queryObj.error) {
        return nextEntity({
          detail: queryObj.error
        });
      }

      let requestOptions = {
        uri: `${options.url}/api/now/table/${queryObj.table}`,
        auth: {
          username: options.username,
          password: options.password
        },
        qs: {
          sysparm_query: queryObj.query,
          sysparm_limit: 10
        }
      };

      // Logger.trace({
      //   requestOptions: requestOptions
      // });

      requestWithDefaults(requestOptions, (err, resp, body) => {
        if (err || resp.statusCode != 200) {
          Logger.error('error during entity lookup', {
            error: err,
            statusCode: resp ? resp.statusCode : null
          });

          cb(
            err || {
              detail: 'non-200 http status code: ' + resp.statusCode
            }
          );
          return;
        }

        if (body.result.length === 0) {
          lookupResults.push({
            entity: entityObj,
            data: null
          });
          return nextEntity(null);
        }

        const serviceNowObjectType = getServiceNowObjectType(entityObj);

        parseResults(serviceNowObjectType, body.result, false, options, (err, parsedResults) => {
          if (err) {
            return nextEntity(err);
          }

          lookupResults.push({
            entity: entityObj,
            data: {
              summary: getSummaryTags(entityObj, body.result),
              details: {
                serviceNowObjectType: serviceNowObjectType,
                layout: layoutMap[serviceNowObjectType],
                results: parsedResults
              }
            }
          });

          nextEntity(null);
        });
      });
    },
    (err) => {
      cb(err, lookupResults);
    }
  );
}

function getServiceNowObjectType(entityObj) {
  if (entityObj.type === 'custom') {
    if (entityObj.types.indexOf('custom.incident') >= 0) {
      return 'incident';
    } else {
      return 'change_request';
    }
  } else if (entityObj.type === 'email') {
    return 'sys_user';
  } else {
    //IPv4 fields are search incidents
    return 'incident';
  }
}

function parseResults(type, results, withDetails, options, cb) {
  if (typeof withDetails === 'undefined') {
    withDetails = false;
  }

  let parsedResults = [];
  async.each(
    results,
    (result, next) => {
      parseResult(type, result, withDetails, options, (err, parsedResult) => {
        parsedResults.push(parsedResult);
        next(err);
      });
    },
    (err) => {
      cb(err, parsedResults);
    }
  );
}

function parseResult(type, result, withDetails, options, cb) {
  let parsedResult = {};

  if (typeof propertyMap[type] !== 'undefined') {
    async.eachOf(
      propertyMap[type],
      (propertyMapObject, propertyKey, nextProperty) => {
        // Logger.debug('', {
        //   propertyMapObject: propertyMapObject,
        //   propertyKey: propertyKey,
        //   result: result
        // });
        let resultValue = result[propertyKey];

        if (typeof resultValue !== 'undefined') {
          if (valueIsLink(resultValue) && !linkIsProcessed(resultValue)) {
            // this property is a link so we need to traverse it
            if (withDetails) {
              Logger.info('Printing resultValue', {
                resultValue: resultValue
              });

              getDetailsInformation(resultValue.link, options, (err, details) => {
                if (err) {
                  return nextProperty(err);
                }
                Logger.debug('Parsing', { details: details });

                parseResult(
                  propertyMapObject.type,
                  details,
                  true,
                  options,
                  (parseDetailsError, parsedDetailsResult) => {
                    if (parseDetailsError) {
                      return nextProperty(parseDetailsError);
                    }

                    //resultValue = transformPropertyLinkValue(propertyMapObject, resultValue.link);

                    if (!valueIsProcessed(resultValue)) {
                      let transformedResult = transformPropertyLinkValue(
                        propertyMapObject,
                        resultValue,
                        result
                      );
                      transformedResult.details = parsedDetailsResult;
                      parsedResult[propertyKey] = transformedResult;
                    } else {
                      resultValue.details = parsedDetailsResult;
                      parsedResult[propertyKey] = resultValue;
                    }

                    //parsedResult[propertyKey] = resultValue;
                    nextProperty(null);
                  }
                );
                //lookupObject.data.details.results.onDetails[objectName] = details;
              });
            } else {
              // don't need to try and load details yet
              parsedResult[propertyKey] = transformPropertyLinkValue(
                propertyMapObject,
                resultValue,
                result
              );
              nextProperty(null);
            }
          } else if (!valueIsProcessed(resultValue)) {
            parsedResult[propertyKey] = transformPropertyValue(
              propertyMapObject,
              resultValue,
              result
            );
            nextProperty(null);
          } else {
            nextProperty(null);
          }
        } else {
          nextProperty(null);
        }
      },
      (err) => {
        console.info(parsedResult);
        cb(err, parsedResult);
      }
    );
  } else {
    cb(null, parsedResult);
  }
}

function valueIsProcessed(resultValue) {
  if (resultValue !== null && resultValue.isProcessed === true) {
    return true;
  }
  return false;
}

function linkIsProcessed(resultValue) {
  if (
    resultValue !== null &&
    (resultValue.details === null || typeof resultValue.details === 'undefined')
  ) {
    return false;
  }
  return true;
}

function valueIsLink(resultValue) {
  if (resultValue !== null && typeof resultValue.link === 'string') {
    return true;
  }
  return false;
}

function transformPropertyLinkValue(propertyObj, value, parentObj) {
  return {
    title: propertyObj.title,
    value: propertyObj.title,
    type: propertyObj.type,
    link: value.link,
    isLink: true,
    isProcessed: true,
    details: null,
    sysId: value.value
  };
}

function transformPropertyValue(propertyObj, value, parentObj) {
  return {
    title: propertyObj.title,
    value: value,
    type: propertyObj.type,
    isLink: false,
    isProcessed: true,
    details: null,
    sysId: parentObj.sys_id
  };
}

function getSummaryTags(entityObj, results) {
  let summaryProperties;

  if (entityObj.type === 'custom') {
    summaryProperties = ['sys_class_name', 'category', 'phase'];
  } else if (entityObj.type.toLowerCase() === 'ipv4') {
    summaryProperties = ['number'];
  } else if (entityObj.type.toLowerCase() === 'email') {
    summaryProperties = ['name'];
  }

  return results.reduce((acc, result) => {
    //Logger.info('result: ', result);
    summaryProperties.forEach((prop) => {
      if (typeof result[prop] !== 'undefined') {
        acc.push(result[prop]);
      }
    });
    return acc;
  }, []);
}

function getQueries(entityObj, options) {
  let result = {
    table: '',
    query: '',
    error: null
  };

  if (entityObj.isEmail) {
    result.table = 'sys_user';
    result.query = `email=${entityObj.value}`;
  } else if (entityObj.isIPv4) {
    if (
      !options.customIpFields ||
      (typeof options.customIpFields === 'string' && options.customIpFields.length === 0)
    ) {
      result.error = 'Received an IPv4 entity but no custom fields are set, ignoring';
      return result;
    } else {
      result.table = 'incident';
      result.query = options.customIpFields
        .split(',')
        .map((query) => `${query.trim()}=${entityObj.value}`)
        .join('^NQ');
    }
  } else if (entityObj.types.indexOf('custom.change') > -1) {
    result.table = 'change_request';
    result.query = `number=${entityObj.value}`;
  } else if (entityObj.types.indexOf('custom.incident') > -1) {
    result.table = 'incident';
    result.query = `number=${entityObj.value}`;
  }

  return result;
}

function onDetails(lookupObject, options, cb) {
  parseResults(
    lookupObject.data.details.serviceNowObjectType,
    lookupObject.data.details.results,
    true,
    options,
    (err, parsedResults) => {
      if (err) {
        return cb(err, lookupObject.data);
      } else {
        Logger.debug('onDetails', { results: lookupObject.data.details.results });
        cb(null, lookupObject.data);
      }
    }
  );
}

function getDetailsInformation(link, options, cb) {
  const requestOptions = {
    uri: link,
    auth: {
      username: options.username,
      password: options.password
    }
  };

  //Logger.info('getDetails URI', { requestOptions: requestOptions });
  requestWithDefaults(requestOptions, (err, response, body) => {
    if (err) {
      return cb({
        err: err,
        link: link,
        detail: 'HTTP Request Error when retrieving details'
      });
    }

    if (response.statusCode !== 200) {
      return cb({
        detail: 'Unexpected Status Code Received',
        link: link,
        statusCode: response.statusCode
      });
    }

    cb(null, body.result);
  });
}

function startup(logger) {
  Logger = logger;
  const requestOptions = {
    json: true
  };

  if (typeof config.request.cert === 'string' && config.request.cert.length > 0) {
    requestOptions.cert = fs.readFileSync(config.request.cert);
  }

  if (typeof config.request.key === 'string' && config.request.key.length > 0) {
    requestOptions.key = fs.readFileSync(config.request.key);
  }

  if (typeof config.request.passphrase === 'string' && config.request.passphrase.length > 0) {
    requestOptions.passphrase = config.request.passphrase;
  }

  if (typeof config.request.ca === 'string' && config.request.ca.length > 0) {
    requestOptions.ca = fs.readFileSync(config.request.ca);
  }

  if (typeof config.request.proxy === 'string' && config.request.proxy.length > 0) {
    requestOptions.proxy = config.request.proxy;
  }

  if (typeof config.request.rejectUnauthorized === 'boolean') {
    requestOptions.rejectUnauthorized = config.request.rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(requestOptions);
}

function validateOption(errors, options, optionName, errMessage) {
  if (
    typeof options[optionName].value !== 'string' ||
    (typeof options[optionName].value === 'string' && options[optionName].value.length === 0)
  ) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }
}

function validateOptions(options, callback) {
  let errors = [];

  validateOption(errors, options, 'url', 'You must provide a valid URL.');
  validateOption(errors, options, 'username', 'You must provide a valid username.');
  validateOption(errors, options, 'password', 'You must provide a valid password.');

  callback(null, errors);
}

module.exports = {
  doLookup: doLookup,
  startup: startup,
  validateOptions: validateOptions,
  onDetails: onDetails
  // // exports for testing purposes
  // parseResults: parseResults,
  // parseResult: parseResult,
  // transformPropertyValue: transformPropertyValue,
  // propertyIsLink: propertyIsLink
};
