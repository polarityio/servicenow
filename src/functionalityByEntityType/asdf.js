const incidentLayout = require('../models/incident-layout');
const incidentModel = require('../models/incident-model');
const requestLayout = require('../models/request-layout');
const requestModel = require('../models/request-model');
const itemLayout = require('../models/item-layout');
const itemModel = require('../models/item-model');
const changeLayout = require('../models/change-layout');
const changeModel = require('../models/change-model');
const userLayout = require('../models/user-layout');

//TODO: Need to change this stucture to be much more intuitive to add new entity types in the future.
// Currently the structure isn't self explanatory, and would be difficult to figure out
// Will likely need to alter the parseTableQueryData.js function when altering this stucture.
const LAYOUT_MAP = {
  incident: incidentLayout,
  sc_request: requestLayout,
  sc_req_item: itemLayout,
  change_request: changeLayout,
  sys_user: userLayout
};

const PROPERTY_MAP = {
  incident: incidentModel,
  sc_request: requestModel,
  sc_req_item: itemModel,
  change_request: changeModel,
  sys_user: {
    name: {
      title: 'Name',
      type: 'sys_user'
    },
    title: {
      title: 'Title',
      type: 'sys_user'
    },
    email: {
      title: 'Email',
      type: 'sys_user'
    },
    department: {
      title: 'Department',
      type: 'cmn_department'
    },
    location: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_location: {
    name: {
      title: 'Location',
      type: 'cmn_location'
    }
  },
  cmn_department: {
    name: {
      title: 'Department',
      type: 'department'
    }
  }
};

module.exports = {
  LAYOUT_MAP,
  PROPERTY_MAP
};
