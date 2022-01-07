const USER_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    path: 'name',
    icon: 'user',
    isDisplayLink: true
  },
  { label: 'Title', path: 'title' },
  { label: 'Email', path: 'email' },
  {
    label: 'Department',
    path: 'department',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'cmn_department',
    pathToOnePropertyFromMoreDataToDisplay: 'name'
  },
  {
    label: 'Location',
    path: 'location',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'cmn_location',
    pathToOnePropertyFromMoreDataToDisplay: 'name'
  }
];

module.exports = USER_DISPLAY_STRUCTURE;