# Polarity Service Now Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

Polarity's ServiceNow integration allows the lookup of system user emails, ServiceNow change request IDs (e.g. CHG00000012), and ServiceNow incident IDs (e.g. INC00000154) against your instance of ServiceNow.  In addition, we can search for IPv4 addresses against custom fields that you specify.

To learn more about ServiceNow, visit the [offical website](https://servicenow.com).

> Note that this integration is currently in beta.

| ![image](./example-integration.png)
|---|
|*Service Now Example*|

## Service Now Integration Options

### Service Now Server URL
The URL for your Service Now server which should include the schema (i.e., http, https) and port if required

### Username
The username of the Service Now user you want the integration to authenticate as.  The user should have permissions to access the `sys_user`, `incident`, and `change_request` tables.

### Password
The password for the provided username you want the integration to authenticate as.

### Custom IPv4 Fields
A comma separated list of fields to lookup on IP matches. See below for use.

## IP Lookups
Because ServiceNow is often customized to fit specific needs, Polarity's ServiceNow Integration offers the ability to look up IPv4 matches on custom Incident fields. Simply add a comma separated list of custom fields to the `Custom Fields` integration option, and when Polarity reognizes an IP address, it will look up the address in the custom fields you listed and display the results.  To determine what value you should put in this field, use the ServiceNow REST API Explorer to examine an incident and look for the custom field on the response object. They are usually prepended with a `u_` and then the name of the custom field, in lower case, underscore (`_`) separated.

|![image](./example-custom-field.png)
|---|
|*Custom Field Example*|

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
