# Polarity Service Now Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

Polarity's ServiceNow integration allows the lookup of Domains, IPv4s, and optionally Strings from channels for Incident and Asset information.  This Integration also allows for Emails to be searched in the users system. ServiceNow change request IDs (e.g. CHG00000012), ServiceNow incident IDs (e.g. INC00000154), ServiceNow Request IDs (e.g. REQ00000155), ServiceNow Requested Item IDs (e.g. RITM00000123), and ServiceNow Knowledge Base IDs (e.g. KB0000008) are also searched against your instance of ServiceNow.  In addition, you have the ability to add Custom Fields to search on Assets and Incidents in the user options.

To learn more about ServiceNow, visit the [official website](https://servicenow.com).


| ![image](https://user-images.githubusercontent.com/306319/45007240-e54bba00-afca-11e8-83f7-6287fe09588b.png)
|---|
|*Service Now Example*|

## Service Now Integration Options

### Service Now Server URL
The URL for your Service Now server which should include the schema (i.e., http, https) and port if required

### Username
The username of the Service Now user you want the integration to authenticate as.  The user should have permissions to access the `sys_user`, `incident`, `sc_request`, `sc_req_item` and `change_request` tables.

### Password
The password for the provided username you want the integration to authenticate as.

### Search By Annotated Entities
This will toggle whether to search ServiceNow for annotated entities found in your channels. The "string" Data Type must also be enabled for this option to have an effect.

### Enable Incident Search
If checked, the integration will search ServiceNow's Incident Table (incident) for IP Addresses, Domains, CVEs, annotated entities, and any added custom types

### Incident Query Fields
A comma separated list of fields to search when querying for Incidents. Incident searches are done for IPs, domains, CVEs, annotated entities and any added custom types. NOTE: If a field is not in this list, it will not be searched for Incident Queries.

### Incident Search Window in Days
Number of days back to search when searching incidents. Filters based on the date that the Incident was opened. Defaults to 360.

### Enable Asset Search
If checked, the integration will search ServiceNow's Asset Table (alm_asset) for IP Addresses, Domains, CVEs, annotated entities, and any added custom types.

### Asset Query Fields
A comma separated list of fields to search when querying for Assets. Asset searches are done for IPs, domains, CVEs, annotated entities and any added custom types. NOTE: If a field is not in this list, the field will not be searched in ServiceNow's Asset Table.

This option defaults to searching the `ci.name` and `ci.asset_tag` fields.  The correct fields to search are dependent on your ServiceNow implementation.  A common additional field to add is `comments`.

## Searching Assets

Assets in ServiceNow are commonly found in the Assets table `alm_assets` or the Configuration Item table `cmdb_ci`.  The Polarity ServiceNow integration searches the `alm_assets` table as part of its asset search capability but fields within the `cmdb_ci` table can be referenced for searching by prepending the table's column name with `ci.`.  As an example, if you'd like to search the `asset_tag` field within the `cmdb_ci` table, you should set the "Asset Query Fields" option to `ci.asset_tag`.  

Common "Asset Query Fields" include:

* display_name
* name
* asset_tag
* comments
* ci.name
* ci.display_name
* ci.asset_tag

## IP Lookups and Finding Query Fields
Because ServiceNow is often customized to fit specific needs, Polarity's ServiceNow Integration offers the ability to look up IPv4 matches on custom Incident and Asset fields. Simply add a comma separated list of custom fields to the `Custom Fields` integration option, and when Polarity recognizes an IP address, it will look up the address in the custom fields you listed and display the results.  To determine what value you should put in this field your can reference our guide [**Here**](./HowToFindCustomFields.md) using the dashboard.

You can also use the ***ServiceNow REST API Explorer*** to examine an incident and look for the custom field on the response object. The ***ServiceNow REST API Explorer*** can be found by searching `REST API Explorer` in your ServiceNow dashboard or by going to  `<your-servicenow-instance-url>/nav_to.do?uri=%2F$restapi.do`. 

They are usually prepended with a `u_` and then the name of the custom field, in lower case, underscore (`_`) separated.

|![image](./assets/example-custom-field.png)
|---|
|*Custom Query Field Example*|

## Known Issues

If adding additional custom types to the ServiceNow integration, please ensure the added custom types do not also match on the built-in custom types for Incidents, Change Requests, Knowledge Base, Request, and Request Item ids.

As an example, if you add a new custom type that matches on the string `INC0001234`, this will conflict with the integration's built-in custom type for looking up incidents by ID.

Ensure that newly added custom types (e.g., for hostnames), does not overlap with these custom types.

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
