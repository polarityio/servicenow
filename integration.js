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
        let additionalOptions = {
            auth: {
                username: options.username,
                password: options.password
            },
            qs: {
                sysparm_query: `email=${entity.value}`
            }
        };

        Logger.trace({ additionalOptions: additionalOptions });

        requestWithDefaults(options.host + '/api/now/table/sys_user', additionalOptions, (err, resp, body) => {
            if (err || resp.statusCode != 200) {
                Logger.error('error during entity lookup', { error: err, statusCode: resp ? resp.statusCode : null });
                callback(err || new Error('non-200 http status code: ' + resp.statusCode));
                return;
            }

            Logger.trace('resp body for ' + entity.value, { body: body, statusCode: resp.statusCode });

            body.result.forEach(result => {
                results.push({ entity: entity, data: { details: result } });
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

function validateOptions(options, callback) {
    callback(null, null);
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
