const KNOWLEDGE_BASE_DISPLAY_STRUCTURE = [
  { label: 'Number', path: 'number' },
  { label: 'Topic', path: 'topic' },
  { label: 'Category', path: 'kb_category' },
  { label: 'Description', path: 'short_description' },
  { label: 'Author', path: 'author' },
  { label: 'Create On', path: 'sys_created_on', isDate: true },
  { label: 'Create By', path: 'sys_created_by' },
  { label: 'Updated On', path: 'sys_updated_on', isDate: true },
  { label: 'Updated By', path: 'sys_updated_by' },
  {
    isTitle: true,
    label: 'View Knowledge Base Document',
    icon: 'external-link',
    path: 'link',
    isDisplayLink: true
  }
];

module.exports = KNOWLEDGE_BASE_DISPLAY_STRUCTURE;
