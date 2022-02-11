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
  capitalize
} = require('lodash/fp');

// Custom Summary Creation Functions
const getTotalAssetSummaryTag = ({ assetData }) =>
  size(assetData) ? `Assets: ${size(assetData)}` : [];

const getTotalKbDocsSummaryTag = ({ knowledgeBaseData }) =>
  size(knowledgeBaseData) ? `Knowledge Base Documents: ${size(knowledgeBaseData)}` : [];


const SUMMARY_TAG_DEFAULT_PATHS = ['category'];

const getTableQueryDataSummaryTags = (result, entity, Logger) => {
  const { getTableQuerySummaryTagPathsType } = require('./index');

  return flow(
    getOr([], 'tableQueryData'),
    flatMap((tableQueryDataResult) => {
      const summaryTagPathsForThisType = getTableQuerySummaryTagPathsType(entity.type);

      const allTableQueryPathValuesForThisResult = map(
        flow(get(__, tableQueryDataResult), capitalize),
        SUMMARY_TAG_DEFAULT_PATHS.concat(summaryTagPathsForThisType)
      );

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
