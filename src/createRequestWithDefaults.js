const fs = require('fs');
const { identity, omit } = require('lodash/fp');
const request = require('postman-request');
const config = require('../config/config');
const { parseErrorToReadableJSON } = require('./dataTransformations');
const NodeCache = require('node-cache');
const { createHash } = require('crypto');

const tokenCache = new NodeCache();

const SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES = [200];

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

const getTokenCacheKey = (options) => {
  return createHash('sha256')
    .update(options.username + options.password + options.clientId + options.clientSecret)
    .digest('hex');
};

const createRequestWithDefaults = (Logger) => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = config;

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    json: true
  };

  const requestWithDefaults = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefault = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      try {
        const result = await _requestWithDefault(_requestOptions);
        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        postRequestFunctionResults = await postRequestFailureFunction(
          error,
          _requestOptions
        );
      }
      return postRequestFunctionResults;
    };
  };

  // Internal request function with defaults set used to do OAuth token authentication if required
  const _authRequest = requestWithDefaults();

  const handleAuth = async ({ options, ...requestOptions }) => {
    if (
      options.username &&
      options.password &&
      !options.clientId &&
      !options.clientSecret
    ) {
      // Basic Auth
      return {
        ...requestOptions,
        auth: {
          username: options.username,
          password: options.password
        }
      };
    } else if (options.clientId && options.clientSecret) {
      // OAuth
      const tokenId = getTokenCacheKey(options);
      let accessToken;
      if (tokenCache.has(tokenId)) {
        accessToken = tokenCache.get(tokenId);
      } else {
        Logger.trace('Fetching new OAuth Access token');
        const response = await _authRequest({
          uri: `${options.url}/oauth_token.do`,
          form: {
            grant_type: 'password',
            client_id: options.clientId,
            client_secret: options.clientSecret,
            username: options.username,
            password: options.password
          },
          method: 'POST',
          options
        });
        Logger.trace({ response }, 'Received new OAuth Token');
        if (response && response.body && response.body.access_token) {
          accessToken = response.body.access_token;
          // Expire access tokens once 80% of their lifetime has passed which will
          // force a new, fresh token to be fetched on the next request
          const expires = response.body.expires_in;
          tokenCache.set(tokenId, accessToken, Math.round(expires - expires * 0.2));
        }
      }

      return {
        ...requestOptions,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
    }
  };

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    let requestOptionsWithoutSensitiveData = {
      ...requestOptions,
      options: '************'
    };

    if (requestOptionsWithoutSensitiveData.auth) {
      requestOptionsWithoutSensitiveData.auth.password = '*********';
    }

    if (
      requestOptionsWithoutSensitiveData.headers &&
      requestOptionsWithoutSensitiveData.headers.Authorization
    ) {
      requestOptionsWithoutSensitiveData.headers.Authorization = 'Bearer *********';
    }

    Logger.trace({
      MESSAGE: 'checkForStatusError',
      statusCode,
      requestOptions: requestOptionsWithoutSensitiveData,
      body
    });

    if (statusCode === 401 && requestOptions.options) {
      // clear the token associated with this request as it's not valid to prevent
      // stale invalid tokens from accumulating in the cache.
      tokenCache.del(getTokenCacheKey(requestOptions.options));
    }

    const roundedStatus = Math.round(statusCode / 100) * 100;
    if (!SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES.includes(roundedStatus)) {
      const requestError = Error('Request Error');
      requestError.status = statusCode;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaults(handleAuth);

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
