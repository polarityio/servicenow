const STANDARD_TABLE_QUERY_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    icon: 'ticket',
    path: 'number',
    isDisplayLink: true
  },
  { isTextBlock: true, path: 'short_description' },
  { label: 'Active', path: 'active' },
  { label: 'Category', path: 'category' },
  { label: 'Severity', path: 'severity' },
  { label: 'Urgency', path: 'urgency' },
  { label: 'Opened At', path: 'opened_at', isDate: true },
  { label: 'Resolved At', path: 'resolved_at', isDate: true },
  { label: 'Closed At', path: 'closed_at', isDate: true },

  {
    isTitle: true,
    label: 'Opened By',
    path: 'opened_by',
    icon: 'door-open',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },

  {
    isTitle: true,
    label: 'Assigned To',
    path: 'assigned_to',
    icon: 'user',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
  {
    isTitle: true,
    label: 'Resolved By',
    path: 'resolved_by',
    icon: 'check',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
  {
    label: 'Closed By',
    path: 'closed_by',
    icon: 'door-closed',
    isTitle: true,
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },

  { label: 'Close Code', path: 'close_code' },
  { label: 'Close Notes', path: 'close_notes' }
];

module.exports = STANDARD_TABLE_QUERY_DISPLAY_STRUCTURE;
