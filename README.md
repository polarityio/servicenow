# Polarity Service Now Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

Polarity's Service Now Integration allows the lookup of emails, Service Now change request IDs (e.g. CHG00000012), and Service Now incident IDs (e.g. INC00000154) against your instance of Service Now.

To learn more about Service Now, visit the [offical website](https://servicenow.com).

> Note that this integration is currently in beta.

| ![image](./example.png)
|---|
|*Service Now Example*|

## Service Now Integration Options

### Service Now Server URL
The URL for your Service Now server which should include the schema (i.e., http, https) and port if required

### Username
The username of the Service Now user you want the integration to authenticate as.  The user should have permissions to access the `sys_user`, `incident`, and `change_request` tables.

### Password
The password for the provided username you want the integration to authenticate as.

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see: 

https://polarity.io/
