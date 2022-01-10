polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  displayTabNames: Ember.computed.alias('details.displayTabNames'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  activeTab: '',
  init() {
    const tabKeys = Object.keys(this.get('displayTabNames'));
    this.set('tabKeys', tabKeys);

    this.set(
      'activeTab',
      tabKeys.find((tabKey) => this.get('details')[tabKey])
    );
    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    }
  }
});
