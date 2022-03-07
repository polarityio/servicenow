const fp = require('lodash/fp');
const reduce = require('lodash/fp/reduce').convert({ cap: false });

const validateOptions = (options, callback) => {
  const stringOptionsErrorMessages = {
    url: 'You must provide a valid URL from your ServiceNow Account',
    username: 'You must provide a valid Username from your ServiceNow Account',
    password: 'You must provide a valid Password from your ServiceNow Account',
    incidentQueryFields: 'You must provide at least one field to search for Incidents',
    assetTableFields: 'You must provide at least one field to search for Assets'
  };

  const stringValidationErrors = _validateStringOptions(stringOptionsErrorMessages, options);

  const urlValidationErrors = _validateUrlOption(options.url);

  callback(null, stringValidationErrors.concat(urlValidationErrors));
};

const _validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && fp.isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

const _validateUrlOption = ({ value: url }, otherErrors = []) => {
  const endWithError =
    url && url.endsWith('//')
      ? otherErrors.concat({
          key: 'url',
          message: 'Your Url must not end with a //'
        })
      : otherErrors;
  if (endWithError.length) return endWithError;

  if (url) {
    try {
      new URL(url);
    } catch (_) {
      return otherErrors.concat({
        key: 'url',
        message:
          'What is currently provided is not a valid URL. You must provide a valid ServiceNow Instance URL.'
      });
    }
  }

  return otherErrors;
};

module.exports = validateOptions;
