const {
  map,
  flatMap,
  flow,
  get,
  getOr,
  compact,
  __,
  uniq,
  size,
  capitalize,
  concat,
  slice
} = require('lodash/fp');

// Custom Summary Creation Functions
const getTotalAssetSummaryTag = ({ assetsData }) =>
  size(assetsData) ? [`Assets: ${size(assetsData)}`] : [];

const getTotalKbDocsSummaryTag = ({ knowledgeBaseData }) =>
  size(knowledgeBaseData) ? [`Knowledge Base Documents: ${size(knowledgeBaseData)}`] : [];


const SUMMARY_TAG_DEFAULT_PATHS = ['category'];

const getTableQueryDataSummaryTags = (result, entity, Logger) => {
  const { getTableQuerySummaryTagPathsType } = require('./index');

  return flow(
    getOr([], 'tableQueryData'),
    flatMap((tableQueryDataResult) => {
      const summaryTagPathsForThisType = getTableQuerySummaryTagPathsType(entity.type);

      const allTableQueryPathValuesForThisResult = flow(
        concat(summaryTagPathsForThisType),
        map(flow(get(__, tableQueryDataResult), capitalize)),
        uniq,
        slice(0, 5)
      )(SUMMARY_TAG_DEFAULT_PATHS);

      const activityTabForThisResult = !tableQueryDataResult.active
        ? []
        : tableQueryDataResult.active == 'true'
        ? 'Active'
        : 'Inactive';

      return allTableQueryPathValuesForThisResult.concat(activityTabForThisResult);
    }),
    compact,
    uniq
  )(result);
};

module.exports = {
  getTableQueryDataSummaryTags,
  getTotalAssetSummaryTag,
  getTotalKbDocsSummaryTag
};
