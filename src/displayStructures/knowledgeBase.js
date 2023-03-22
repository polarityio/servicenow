const KNOWLEDGE_BASE_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    label: 'View Knowledge Base Document',
    icon: 'external-link',
    path: 'link',
    isDisplayLink: true
  },
  { label: 'Number', path: 'number' },
  { label: 'Topic', path: 'topic' },
  {
    label: 'Category',
    path: 'kb_category.link',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'kb_category',
    pathToOnePropertyFromMoreDataToDisplay: 'full_category'
  },
  { label: 'Description', path: 'short_description' },
  { label: 'Created By', path: 'sys_created_by' },
  { label: 'Created On', path: 'sys_created_on', isDate: true },
  { label: 'Updated By', path: 'sys_updated_by' },
  { label: 'Updated On', path: 'sys_updated_on', isDate: true },
  {
    isTitle: true,
    label: 'Author',
    path: 'author.link',
    icon: 'user',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
];

module.exports = KNOWLEDGE_BASE_DISPLAY_STRUCTURE;
