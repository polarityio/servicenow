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
        let query;

        if (entity.isEmail) {
            table = 'sys_user';
            query = 'email';
        } else if (entity.types.indexOf('custom.change') > -1) {
            table = 'change_request';
            query = 'number';
        } else if (entity.types.indexOf('custom.incident') > -1) {
            table = 'incident';
            query = 'number';
        } else {
            callback({ err: 'invalid entity type ' + entity.type });
            return;
        }

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

            body.result.forEach(result => {
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
            });

            callback();
        });
    }, err => {
        Logger.trace('result returned to client', results);
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
