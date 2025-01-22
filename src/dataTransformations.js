const _ = require('lodash');
const {
  flow,
  keys,
  values,
  zipObject,
  map,
  first,
  omit,
  reduce,
  size,
  negate,
  curry,
  filter,
  eq,
  isEmpty
} = require('lodash/fp');

const { IGNORED_IPS } = require('./constants');

const getKeys = (keys, items) =>
  Array.isArray(items)
    ? items.map((item) => _.pickBy(item, (v, key) => keys.includes(key)))
    : _.pickBy(items, (v, key) => keys.includes(key));

const groupEntities = (entities) =>
  _.chain(entities)
    .groupBy(({ isIP, isDomain, type }) =>
      isIP
        ? 'ip'
        : isDomain
        ? 'domain'
        : type === 'MAC'
        ? 'mac'
        : type === 'MD5'
        ? 'md5'
        : type === 'SHA1'
        ? 'sha1'
        : type === 'SHA256'
        ? 'sha256'
        : type === 'cve'
        ? 'cve'
        : 'unknown'
    )
    .omit('unknown')
    .value();

const splitOutIgnoredIps = (_entitiesPartition) => {
  const { ignoredIPs, entitiesPartition } = _.groupBy(
    _entitiesPartition,
    ({ isIP, value, type }) =>
      !isIP || (isIP && !IGNORED_IPS.has(value) && type !== 'custom')
        ? 'entitiesPartition'
        : 'ignoredIPs'
  );

  return {
    entitiesPartition,
    ignoredIpLookupResults: _.map(ignoredIPs, (entity) => ({
      entity,
      data: null
    }))
  };
};

const objectPromiseAll = async (
  obj = {
    fn1: async () => {}
  }
) => {
  const labels = keys(obj);
  const functions = values(obj);
  const executedFunctions = await Promise.all(map((func) => func(), functions));

  return zipObject(labels, executedFunctions);
};

const asyncObjectReduce = async (func, initAgg, obj) => {
  const nextKey = flow(keys, first)(obj);

  if (!nextKey) return initAgg;

  const newAgg = await func(initAgg, obj[nextKey], nextKey);

  return await asyncObjectReduce(func, newAgg, omit(nextKey, obj));
};

const transpose2DArray = reduce(
  (agg, [key, value]) => [
    [...agg[0], key],
    [...agg[1], value]
  ],
  [[], []]
);

const or =
  (...[func, ...funcs]) =>
  (x) =>
    func(x) || (funcs.length && or(...funcs)(x));

const and =
  (...[func, ...funcs]) =>
  (x) =>
    func(x) && (funcs.length ? and(...funcs)(x) : true);

// func: (value, key) => [newKey, newValue], obj: { key1:value1, key2:value2 }
// return { newKey1: newValue1, newKey2: newValue2 }
const mapObject = curry((func, obj) =>
  flow(
    Object.entries,
    map(([key, value]) => func(value, key)),
    filter(and(negate(isEmpty), flow(size, eq(2)))),
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(obj)
);

const mapObjectAsync = async (func, obj) => {
  // func: (value, key) => [newKey, newValue], obj: { key1:value1, key2:value2 }
  // return { newKey1: newValue1, newKey2: newValue2 }
  const unzippedResults = await Promise.all(
    map(async ([key, value]) => await func(value, key), Object.entries(obj))
  );

  return flow(
    filter(and(negate(isEmpty), flow(size, eq(2)))),
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(unzippedResults);
};

const parseErrorToReadableJSON = (error) =>
  JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));

/**
 * Merges two arrays of objects and removes duplicates based on the equality of the
 * given `mergeKey`
 */
const mergeAndRemoveDuplicates = (arr1, arr2, mergeKey) => {
  // Merge the two arrays
  const mergedArray = [...arr1, ...arr2];

  // Sort the merged array based on the 'key' property
  mergedArray.sort((a, b) => {
    if (a[mergeKey] < b[mergeKey]) return -1;
    if (a[mergeKey] > b[mergeKey]) return 1;
    return 0;
  });

  // Filter out duplicates
  const uniqueArray = [];
  for (let i = 0; i < mergedArray.length; i++) {
    // If it's the first element or different from the previous one, add it to the uniqueArray
    if (i === 0 || mergedArray[i][mergeKey] !== mergedArray[i - 1][mergeKey]) {
      uniqueArray.push(mergedArray[i]);
    }
  }

  return uniqueArray;
};

module.exports = {
  getKeys,
  groupEntities,
  splitOutIgnoredIps,
  objectPromiseAll,
  asyncObjectReduce,
  mapObject,
  mapObjectAsync,
  transpose2DArray,
  parseErrorToReadableJSON,
  mergeAndRemoveDuplicates
};
