let async = require('async');
let request = require('request');
let config = require('./config/config');

let requestWithDefaults;
let Logger;
let requestOptions = {
    json: true
};

function doLookup(entities, options, callback) {
    let results = [];

    async.each(entities, (entity, callback) => {
        let requestOptions = {};
        requestOptions.auth = {
            username: options.username,
            password: options.password
        };
        requestOptions.qs = {
            sysparm_query: `email=${entity.value}`
        };

        requestWithDefaults(options.host + '/api/now/table/sys_user', requestOptions, (err, resp, body) => {
            if (err || resp.statusCode != 200) {
                Logger.error('error during entity lookup', { error: err, statusCode: resp ? resp.statusCode : null });
                callback(err || new Error('non-200 http status code: ' + resp.statusCode));
                return;
            }

            Logger.trace('resp body', { body: body });

            results.push(body);
            callback();
        });
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

function validateOptions(options, callback) {
    callback(null, null);
}

module.exports = {
    doLookup: doLookup,
    startup: startup,
    validateOptions: validateOptions
};
