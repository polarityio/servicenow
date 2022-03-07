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

### Search By String
This will toggle whether or not to search the ServiceNow's Asset Table with strings found in your channels.

### Incident Query Fields
A comma separated list of Fields to query against Incidents. 
> NOTE: If a field is not in this list, it will not be searched on on in ServiceNow's Incident Table.
> (This applies to IP Addresses, Domains, and String searches)
      
### Asset Query Fields
A comma separated list of fields to search domains and IPs by in ServiceNow's Asset Table.
> NOTE: If a field is not in this list, it will not be searched on in ServiceNow's Asset Table.
> (This applies to IP Addresses, Domains, and String searches)

## IP Lookups and Finding Query Fields
Because ServiceNow is often customized to fit specific needs, Polarity's ServiceNow Integration offers the ability to look up IPv4 matches on custom Incident and Asset fields. Simply add a comma separated list of custom fields to the `Custom Fields` integration option, and when Polarity recognizes an IP address, it will look up the address in the custom fields you listed and display the results.  To determine what value you should put in this field your can reference our guide [**Here**](./HowToFindCustomFields.md) using the dashboard.

You can also use the ***ServiceNow REST API Explorer*** to examine an incident and look for the custom field on the response object. The ***ServiceNow REST API Explorer*** can be found by searching `REST API Explorer` in your ServiceNow dashboard or by going to  `<your-servicenow-instance-url>/nav_to.do?uri=%2F$restapi.do`. 

They are usually prepended with a `u_` and then the name of the custom field, in lower case, underscore (`_`) separated.

|![image](./assets/example-custom-field.png)
|---|
|*Custom Query Field Example*|

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
