const { map, flow, get, compact, __, uniq } = require('lodash/fp');
const { mapObject } = require('../dataTransformations');

const customFunctionalityByType = require('./customFunctionalityByType');


// Custom Summary Creation Functions
const getTotalAssetSummaryTag = ({ assetData }) =>
  size(assetData) ? `Assets: ${size(assetData)}` : [];

const getTotalKbDocsSummaryTag = ({ knowledgeBaseData }) =>
  size(knowledgeBaseData) ? `Knowledge Base Documents: ${size(knowledgeBaseData)}` : [];


const TABLE_QUERY_SUMMARY_TAG_PATHS_BY_TYPE = mapObject((typeMappingObj, type) => {
  const propertyValueForThisType = get('tableQuerySummaryTagPaths', typeMappingObj);
  return !!propertyValueForThisType && [type, propertyValueForThisType];
}, customFunctionalityByType);

const getTableQueryDataSummaryTags = (result, entity) =>
  flow(
    getOr([], 'tableQueryData'),
    flatMap((tableQueryDataResult) => {
      const type = getTableQuerySummaryTagPathsType(entity);
      const summaryTagPathsTypeForThisType = TABLE_QUERY_SUMMARY_TAG_PATHS_BY_TYPE[type];
      
      const allTableQueryPathValuesForThisResult = map(
        get(__, tableQueryDataResult),
        summaryTagPathsTypeForThisType
      );

      const activityTabForThisResult = !tableQueryDataResult.active
        ? []
        : tableQueryDataResult.active === 'true'
        ? 'active'
        : 'inactive';

      return allTableQueryPathValuesForThisResult.concat(activityTabForThisResult);
    }),
    compact,
    uniq
  )(result);


module.exports = {
  getTableQueryDataSummaryTags,
  getTotalAssetSummaryTag,
  getTotalKbDocsSummaryTag
};
