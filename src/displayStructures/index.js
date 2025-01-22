const tableQueryDisplayStructure = require('./tableQuery');
const assetsDisplayStructure = require('./assets');
const knowledgeBaseDisplayStructure = require('./knowledgeBase');
const usersDisplayStructure = require('./users');

const {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  putResultsInDisplayStructureIgnoringMoreDataLinksMultiType,
  getDisplayStructureNestedLinkData
} = require('./handleDisplayStructures/index');

module.exports = {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  putResultsInDisplayStructureIgnoringMoreDataLinksMultiType,
  getDisplayStructureNestedLinkData,
  assetsDisplayStructure,
  knowledgeBaseDisplayStructure,
  tableQueryDisplayStructure,
  usersDisplayStructure
};
