const ASSET_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    label: 'View Asset',
    icon: 'computer-classic',
    path: 'asset.link',
    isDisplayLink: true
  },
  { label: 'Asset Name', path: 'name' },
  { label: 'Short Description', path: 'short_description' },
  { label: 'Name', path: 'ci.link', pathIsLinkToMoreData: true,  pathToOnePropertyFromMoreDataToDisplay: 'name'},
  { label: 'Display Name', path: 'display_name' },
  { label: 'Asset Subcategory', path: 'subcategory' },
  { label: 'Serial Number', path: 'serial_number' },
  { label: 'Asset Tag', path: 'asset_tag' },
  { label: 'Asset Delivered On', path: 'delivery_date', isDate: true },
  { label: 'System Last Updated On', path: 'sys_updated_on', isDate: true },
  { label: 'Asset Sub-Warranty Expires On', path: 'warranty_expiration', isDate: true },
  { label: 'Asset Operating System', path: 'os' },
  { label: 'Asset Delivered On', path: 'delivery_date', isDate: true },
  { label: 'PO Number', path: 'po_number' },
  { label: 'Comments', path: 'comments' },

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
    label: 'Department',
    path: 'department.link',
    pathIsLinkToMoreData: true,
    moreDataLinkType: 'cmn_department',
    pathToOnePropertyFromMoreDataToDisplay: 'name'
  },
];

module.exports = ASSET_DISPLAY_STRUCTURE;
