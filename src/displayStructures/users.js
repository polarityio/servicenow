const USER_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    path: 'name',
    icon: 'user',
    isDisplayLink: true
  },
  { label: 'Title', path: 'title' },
  { label: 'Email', path: 'email' },
  { label: 'VIP', path: 'vip', capitalize: true },
  { label: 'Active', path: 'active', capitalize: true },
  { label: 'Gender', path: 'gender' },
  { label: 'Education Status', path: 'edu_status' },
  { label: 'Locked Out', path: 'locked_out', capitalize: true },
  { label: 'Failed Attempts', path: 'failed_attempts' },
  { label: 'Needs Password Reset', path: 'password_needs_reset' },
  {
    label: 'Department',
    path: 'department.link',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'cmn_department',
    pathToOnePropertyFromMoreDataToDisplay: 'name'
  },
  {
    label: 'Location',
    path: 'location.link',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'cmn_location',
    pathToOnePropertyFromMoreDataToDisplay: 'name'
  }
];

module.exports = USER_DISPLAY_STRUCTURE;