const _ = require('lodash');
const {
  keys,
  values,
  zipObject,
  map,
  first,
  omit,
  mapKeys,
  reduce
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
        : 'unknown'
    )
    .omit('unknown')
    .value();

const splitOutIgnoredIps = (_entitiesPartition) => {
  const { ignoredIPs, entitiesPartition } = _.groupBy(
    _entitiesPartition,
    ({ isIP, value }) =>
      !isIP || (isIP && !IGNORED_IPS.has(value)) ? 'entitiesPartition' : 'ignoredIPs'
  );

  return {
    entitiesPartition,
    ignoredIpLookupResults: _.map(ignoredIPs, (entity) => ({
      entity,
      data: null
    }))
  };
};

const objectPromiseAll = async (obj = { fn1: async () => {} }) => {
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

const mapObject = async (func, obj) => {
  // func: (value, key) => [newKey, newValue], obj: { key1:value1, key2:value2 }
  // return { newKey1: newValue1, newKey2: newValue2 }
  const unzippedResults = await Promise.all(
    mapKeys(async (key) => await func(obj[key], key), obj)
  );
  return flow(transpose2DArray, zipObject)(unzippedResults);
};


module.exports = {
  getKeys,
  groupEntities,
  splitOutIgnoredIps,
  objectPromiseAll,
  asyncObjectReduce,
  mapObject,
  transpose2DArray
};
