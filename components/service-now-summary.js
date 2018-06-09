polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    tags: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');
        details = details.results;

        return [
            details.name,
            details.edu_status,
            details.sys_class_name,
            details.category,
            details.phase
        ].filter(entry => entry);
    })
});
