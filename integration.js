let async = require('async');
let request = require('request');
let config = require('./config/config');

let requestWithDefaults;
let Logger;
let requestOptions = {
    json: true
};

function doLookup(entities, options, callback) {
    Logger.trace({ options: options });
    let results = [];

    async.each(entities, (entity, callback) => {
        let table;
        let queries = [];

        if (entity.isEmail) {
            table = 'sys_user';
            queries.push('email');
        } else if (entity.isIPv4) {
            if (!options.custom) {
                Logger.warn('received an IPv4 entity but no custom fields are set, ignoring');
                callback();
                return;
            } else {
                table = 'incident';
                queries = queries.concat(options.custom.split(','));
            }
        } else if (entity.types.indexOf('custom.change') > -1) {
            table = 'change_request';
            queries.push('number');
        } else if (entity.types.indexOf('custom.incident') > -1) {
            table = 'incident';
            queries.push('number');
        } else {
            callback({ err: 'invalid entity type ' + entity.type });
            return;
        }

        async.each(queries, (query, callback) => {
            let url = `${options.host}/api/now/table/${table}`;
            let additionalOptions = {
                auth: {
                    username: options.username,
                    password: options.password
                },
                qs: {
                    sysparm_query: `${query}=${entity.value}`
                }
            };

            Logger.trace({ additionalOptions: additionalOptions });

            requestWithDefaults(url, additionalOptions, (err, resp, body) => {
                if (err || resp.statusCode != 200) {
                    Logger.error('error during entity lookup', { error: err, statusCode: resp ? resp.statusCode : null });
                    callback(err || { err: 'non-200 http status code: ' + resp.statusCode });
                    return;
                }

                async.each(body.result, (result, callback) => {
                    Logger.trace('async.each for body.result');

                    results.push({
                        entity: entity,
                        data: {
                            details: {
                                host: options.host,
                                uriType: table,
                                results: result
                            }
                        }
                    });

                    async.each(['assigned_to', 'opened_by', 'closed_by', 'resolved_by'], (fill, callback) => {
                        if (result[fill]) {
                            let link = result[fill].link;

                            requestWithDefaults(link, additionalOptions, (err, resp, body) => {
                                if (err || resp.statusCode != 200) {
                                    // Ignore and continue, we'll just mark them "unavailable" on the gui
                                    Logger.error(`error during ${fill} lookup, continuing`, { error: err, statusCode: resp ? resp.statusCode : null, body: body });
                                } else {
                                    result[fill] = body.result;
                                }

                                callback();
                            });
                        } else {
                            callback();
                        }
                    }, err => callback(err));
                }, err => callback(err));
            });
        }, err => callback(err));
    }, err => {
        callback(err, results);
    });
}

function startup(logger) {
    Logger = logger;

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
    if (typeof options[optionName].value !== 'string' ||
        (typeof options[optionName].value === 'string' && options[optionName].value.length === 0)) {
        errors.push({
            key: optionName,
            message: errMessage
        });
    }
}

function validateOptions(options, callback) {
    let errors = [];

    validateOption(errors, options, 'host', 'You must provide a valid host.');
    validateOption(errors, options, 'username', 'You must provide a valid username.');
    validateOption(errors, options, 'password', 'You must provide a valid password.');

    callback(null, errors);
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
