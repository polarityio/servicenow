const ASSET_DISPLAY_STRUCTURE = [
  {
    isTitle: true,
    label: 'View Asset',
    icon: 'external-link',
    path: 'asset.link',
    isDisplayLink: true
  },
  { label: 'Asset Name', path: 'name' },
  { label: 'Asset Subcategory', path: 'subcategory' },
  { label: 'Serial Number', path: 'serial_number' },
  { label: 'Asset Tag', path: 'asset_tag' },
  { label: 'Asset Delivered On', path: 'delivery_date', isDate: true },
  { label: 'System Last Updated On', path: 'sys_updated_on', isDate: true },
  { label: 'Asset Sub-Warranty Expires On', path: 'warranty_expiration', isDate: true },
  { label: 'Asset Operating System', path: 'os' },
  { label: 'Asset Delivered On', path: 'delivery_date', isDate: true },
  { label: 'PO Number', path: 'po_number' }
];

module.exports = ASSET_DISPLAY_STRUCTURE;
