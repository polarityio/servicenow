const tableQueryDisplayStructure = require('./tableQuery');
const assetsDisplayStructure = require('./assets');
const knowledgeBaseDisplayStructure = require('./knowledgeBase');
const usersDisplayStructure = require('./users');

const {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  getDisplayStructureNestedLinkData
} = require('./handleDisplayStructures/index');

module.exports = {
  putResultsInDisplayStructureIgnoringMoreDataLinks,
  getDisplayStructureNestedLinkData,
  assetsDisplayStructure,
  knowledgeBaseDisplayStructure,
  tableQueryDisplayStructure,
  usersDisplayStructure
};
