const KNOWLEDGE_BASE_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    label: 'View Knowledge Base Document',
    icon: 'external-link',
    path: 'link',
    isDisplayLink: true
  },
  { label: 'Number', path: 'number' },
  { label: 'Author', path: 'author' },
  { label: 'Topic', path: 'topic' },
  { label: 'Category', path: 'kb_category' },
  { label: 'Description', path: 'short_description' },
  { label: 'Create By', path: 'sys_created_by' },
  { label: 'Create On', path: 'sys_created_on', isDate: true },
  { label: 'Updated By', path: 'sys_updated_by' },
  { label: 'Updated On', path: 'sys_updated_on', isDate: true }
];

module.exports = KNOWLEDGE_BASE_DISPLAY_STRUCTURE;
