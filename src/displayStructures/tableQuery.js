const STANDARD_TABLE_QUERY_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    icon: 'ticket',
    path: 'number',
    isDisplayLink: true
  },
  { isTextBlock: true, path: 'short_description' },
  { label: 'Active', path: 'active', capitalize: true },
  { label: 'Category', path: 'category', capitalize: true },
  {
    label: 'Impact',
    path: 'impact',
    process: (impact) => THREE_LEVEL_FIELD[impact]
  },
  {
    label: 'Urgency',
    path: 'urgency',
    process: (urgency) => THREE_LEVEL_FIELD[urgency]
  },
  {
    label: 'Priority',
    path: 'priority',
    process: (priority) => FIVE_LEVEL_FIELD[priority]
  },
  {
    label: 'Severity',
    path: 'severity',
    process: (severity) => FIVE_LEVEL_FIELD[severity]
  },
  { label: 'Opened At', path: 'opened_at', isDate: true },
  { label: 'Resolved At', path: 'resolved_at', isDate: true },
  { label: 'Closed At', path: 'closed_at', isDate: true },

  {
    isTitle: true,
    label: 'Opened By',
    path: 'opened_by.link',
    icon: 'door-open',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
  {
    isTitle: true,
    label: 'Assigned To',
    path: 'assigned_to.link',
    icon: 'user',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
  {
    isTitle: true,
    label: 'Resolved By',
    path: 'resolved_by.link',
    icon: 'check',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },
  {
    isTitle: true,
    label: 'Closed By',
    path: 'closed_by.link',
    icon: 'door-closed',
    isDisplayLink: true,
    pathIsLinkToMoreData: true,
    moreDataDisplayStructure: 'sys_user'
  },

  { label: 'Close Code', path: 'close_code' },
  { label: 'Close Notes', path: 'close_notes' }
];

const THREE_LEVEL_FIELD = {
  0: '-- None --',
  1: '1 - High',
  2: '2 - Medium',
  3: '3 - Low'
};
const FIVE_LEVEL_FIELD = {
  0: '-- None --',
  1: '1 - Critical',
  2: '2 - High',
  3: '3 - Moderate',
  4: '4 - Low',
  5: '5 - Planning'
};

module.exports = STANDARD_TABLE_QUERY_DISPLAY_STRUCTURE;
