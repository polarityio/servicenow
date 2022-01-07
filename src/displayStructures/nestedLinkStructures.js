const MORE_DATA_DISPLAY_STRUCTURE_BY_LINK_TYPE = {
  sys_user: [
    { label: 'Name', path: 'name' },
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
  ]
};


module.exports = MORE_DATA_DISPLAY_STRUCTURE_BY_LINK_TYPE;