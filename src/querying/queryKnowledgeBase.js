const { getOr, size } = require('lodash/fp');

const queryKnowledgeBase = async (entity, options, requestWithDefaults, Logger) => {
  try {
    const knowledgeBaseData = getOr(
      [],
      'body.records',
      await requestWithDefaults({
        uri: `${options.url}/kb_knowledge_list.do?JSONv2=&displayvalue=true&sysparm_query=numberCONTAINS${entity.value}`,
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
    const err = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
    Logger.error(
      {
        detail: 'Failed to Query Knowledge Base',
        options,
        formattedError: err
      },
      'Quering Knowledge Base Failed'
    );

    throw error;
  }
};

module.exports = queryKnowledgeBase;