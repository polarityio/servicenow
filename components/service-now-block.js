polarity.export = PolarityComponent.extend({
    details: Ember.computed.alias('block.data.details'),
    items: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');
        details = details.results;

        var items = [
            // Email Attributes
            { title: 'Name', value: details.name },
            { title: 'VIP', value: details.vip },
            { title: 'Active', value: details.active },
            { title: 'Gender', value: details.gender },
            { title: 'Education Status', value: details.edu_status },
            { title: 'Locked Out', value: details.locked_out },
            { title: 'Failed Attempts', value: details.failed_attempts },
            { title: 'Needs Password Reset', value: details.password_needs_reset },

            //INC/CHG Attributes
            { title: 'Short Description', value: details.short_description },
            { title: 'Class', value: details.sys_class_name },
            { title: 'Urgency', value: details.urgency },
            { title: 'Severity', value: details.severity },
            { title: 'Category', value: details.category },
            { title: 'Close Code', value: details.close_code },
            { title: 'Close Notes', value: details.close_notes },
            { title: 'Updated By', value: details.sys_updated_by },
            { title: 'Created On', value: details.sys_created_on },
            { title: 'Created By', value: details.sys_created_by }
        ].filter(item => item.value);

        return items;
    }),
    link: Ember.computed('block.data.details', function () {
        var details = this.get('block.data.details');
        return details.host + '/nav_to.do?uri=' + details.uriType + '.do?sys_id=' + details.results.sys_id
    })
});
