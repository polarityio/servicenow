const { getOr, size, map } = require('lodash/fp');
const { parseErrorToReadableJSON } = require('../dataTransformations');

const queryKnowledgeBase = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const knowledgeBaseData = getOr(
      [],
      'body.result',
      await requestWithDefaults({
        uri: `${options.url}/api/now/table/kb_knowledge`,
        qs: {
          sysparm_query: `numberCONTAINS${entity.value}`,
          sysparm_limit: 10
        },
        options
      })
    );

    if (!size(knowledgeBaseData)) return;

    return {
      knowledgeBaseData: map(
        (kbItem) => ({
          ...kbItem,
          link: `${options.url}/nav_to.do?uri=/kb_knowledge.do?sys_id=${kbItem.sys_id}`
        }),
        knowledgeBaseData
      )
    };
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error(
      {
        detail: 'Failed to Query Knowledge Base',
        formattedError: err
      },
      'Querying Knowledge Base Failed'
    );

    throw error;
  }
};

module.exports = queryKnowledgeBase;
