/**
 * What is SendID? - SendID is the same as JobID (as shown in ET UI)
 * 
 * This script requires a SendID and of course your clientID and clientSecret
 * 
 * Then requests data for each tracking event from the Exact Target soap API
 * 
 * Then saves the values for: 
 * 'SentEvent', 'OpenEvent', 'ClickEvent', 'UnsubEvent', 'BounceEvent'
 * 
 * Then uses those values to create new values:
 * DeliverabilityRate, OpenRate, ClickThroughRate, UnsubscribeRate
 *
 */

'use strict';

var FuelSoap = require('../../lib/fuel-soap'), 
		   _ = require('lodash');


// Fetch API token
var options = {
	auth: {
		clientId: 'testing', 
		clientSecret: 'testing'
	}, 
	soapEndpoint: 'https://webservice.s6.exacttarget.com/Service.asmx' // default --> https://webservice.exacttarget.com/Service.asmx
};
var SoapClient = new FuelSoap(options);


// This is to add our values to
var dataOutput = {
	SentEvent: 0, 
	OpenEvent: 0, 
	ClickEvent: 0, 
	UnsubEvent: 0, 
	BounceEvent: 0
};

// If all these values are true we have finished
// requiring data and are ready to calculate % values
var outputDone = { 
	SentEvent: false,
	OpenEvent: false,
	ClickEvent: false,
	UnsubEvent: false,
	BounceEvent: false
};


function calculateValues() {
	// Give dataOutput a shorter name for convenience
	var d = dataOutput;

	var totalDelivered = (d.SentEvent - d.BounceEvent);

	function parseRate(value) {
		return parseFloat( value.toFixed(2) );
	}

	// DeliverabilityRate
	d.DeliverabilityRate = parseRate( 100 - ( (d.BounceEvent / d.SentEvent) * 100 ) );
	// OpenRate
	d.OpenRate = parseRate( (d.OpenEvent / totalDelivered) * 100);
	// ClickThroughRate
	d.ClickThroughRate = parseRate( (d.ClickEvent / totalDelivered) * 100);
	// UnsubscribeRate
	d.UnsubscribeRate = parseRate( (d.UnsubEvent / totalDelivered) * 100);

	console.log(d);
}


function checkDone() {
	// '_' here refers to lodash
	if (_.all(outputDone, Boolean) === true) {
		calculateValues();
	}
}


function countArray(err, response) {
	if (err) {throw err;}

	/* jshint validthis: true */

	if (response.body.OverallStatus === 'MoreDataAvailable') {
		// Add value to global dataOutput
		// dataOutput[this.EventType] += response.body.Results.length; 
		// will always = 2500. So instead we could write this as: 
		dataOutput[this.EventType] += 2500;
		// Now grab the response.body.RequestID and pass it to getEventData until OverallStatus == OK
		getEventData(this.EventType, this.sendID, response.body.RequestID);

		console.log('...');

	} else if (response.body.OverallStatus === 'OK') {
		// Add value to global dataOutput
		dataOutput[this.EventType] += response.body.Results.length;
		// Mark this eventType as done
		outputDone[this.EventType] = true;
		
		console.log(outputDone);
		
		checkDone();
		
		console.log('...');

	} else {
		console.log('Unexpected OverallStatus value in response: ' + response.body.OverallStatus );

	}
}


function getEventData(EventType, sendID, continueRequest) {
	var options = {
		filter: {
			leftOperand: 'SendID',
			operator: 'equals',
			rightOperand: sendID
		} 
	};

	if (continueRequest) {
		options.continueRequest = continueRequest;
	}

	SoapClient.retrieve(EventType, ['SubscriberKey'], options, countArray.bind( {EventType: EventType, sendID: sendID} ));
}


function getTrackingData(sendID) {
	var EventTypeArray = [
		'SentEvent', 'OpenEvent', 'ClickEvent', 'UnsubEvent', 'BounceEvent'
	];

	for (var i=0; i < EventTypeArray.length; i++) {
		getEventData(EventTypeArray[i], sendID);
	}
}


// Add SendID here
getTrackingData('777777');



// This is what the logged data should look like:
// { SentEvent: true,
//   OpenEvent: true,
//   ClickEvent: true,
//   UnsubEvent: true,
//   BounceEvent: true }
// ...
// { SentEvent: 196900,
//   OpenEvent: 30409,
//   ClickEvent: 909,
//   UnsubEvent: 372,
//   BounceEvent: 1049,
//   DeliverabilityRate: 99.47,
//   OpenRate: 15.53,
//   ClickThroughRate: 0.46,
//   UnsubscribeRate: 0.19 }
// ...
// [Finished in 293.0s]