node-fuelAuth
=============

The fuelAuth library allows users to create new authentication clients and interact with the REST and SOAP APIs at a low-level.


###Set up a new client

```
//Required Settings
var clientId = 'yourClientId';
var clientSecret = 'yourClientSecrete';

//Optional Settings
var authUrl = "https://auth.exacttargetapis.com/v1/requestToken" //this is the default
var soapEndpoint = 'https://webservice.exacttarget.com/Service.asmx'; //this is the default
var restEndpoint = "https://www.exacttargetapis.com/" //this is the default

//Used with SSO - will be created for you if not provided
var refreshToken = "" 
var accessToken = ""
var expiration = ""


//Create new client - optional settings are passed in here
var client = new fuelAuth({"clientId":clientId, "clientSecret":clientSecret});

```

###Requests
fuelAuth uses the request library, and all request methods should include a callback function with the parameters `error`, `response`, and `body`.

####SOAP Requests
```
client.soapRequest({headers:{'SOAPAction':"Describe"}, 'body': xml}, function(error, response, body){
	console.log('=====SOAP RESPONSE=====')
	if(error) console.log(error);
	console.log(body);
})
```

####REST Requests
```
client.restRequest({url:'platform/v1/tokencontext'}, function(error, response, body){
	console.log('=====REST RESPONSE=====')
	if(error) console.log(error);
	console.log(body);
})
```

This is a new library and requires extensive testing.  We are currently working to develop a test suite, but real world testing is also welcomed. Feel free to test it out and submit issues as they are found.

###Coming Soon 
As development progress, this will be used in a fuel library that will wrap convenience functions around standard objects and routes.  This is meant to serve as the lowest level library to interact with the APIs.

