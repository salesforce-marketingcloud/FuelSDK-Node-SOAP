/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

var assert     = require('assert');
var proxyquire = require('proxyquire');
var sinon      = require('sinon');

describe('SOAP Action - schedule', function() {
	var FuelSoap;
	var soapRequestSpy;
	var parsedOptions = { parsedOptions: true };
	var simpleVerifyTestCases = [
		{ property: 'action', expected: 'Schedule' }
		, { property: 'key', expected: 'ScheduleResponseMsg' }
		, { property: 'retry', expected: true }
		, { property: 'reqOptions', expected: parsedOptions }
	];

	var exampleRecurrence = {
		Recurrence: {
			$: {'xsi:type': 'MinutelyRecurrence'},
			MinutelyRecurrencePatternType: 'Interval',
			MinuteInterval: '10'
		},
		RecurrenceType: 'Minutely',
		RecurrenceRangeType: 'EndAfter',
		StartDateTime: '2019-04-10T10:10:00.046+01:00',
		Occurrences: '999999'
	};
	var exampleInteractions =[ 
		{
			Interaction: {
				ObjectID: '1234'
			}
		}
	];

	beforeEach(function() {
		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'./helpers': {
				parseReqOptions: function() { return parsedOptions; }
			}
		});
		soapRequestSpy = sinon.stub(FuelSoap.prototype, 'soapRequest');
	});

	afterEach(function() {
		FuelSoap.prototype.soapRequest.restore();
	});
	simpleVerifyTestCases.forEach(function(testCase) {
		it('should call soapRequest with correct ' + testCase.property, function() {
			// Act
			FuelSoap.prototype.schedule(
				'Test', 
				exampleRecurrence,
				exampleInteractions,
				'start', 
				{ options: true }, 
				function() {});
			// Assert
			assert.equal(soapRequestSpy.args[0][0][testCase.property], testCase.expected);
		});
	});

	it('should pass correct body to soapRequest', function() {
		// Act
		FuelSoap.prototype.schedule('Test', exampleRecurrence, exampleInteractions,'start',{ options: true } , function() {});

		// Assert
		var actualObj = soapRequestSpy.args[0][0].req;
		assert.equal(actualObj.ScheduleRequestMsg.Recurrence, exampleRecurrence);
		assert.equal(actualObj.ScheduleRequestMsg.Interactions, exampleInteractions);
		assert.ok(!actualObj.ScheduleRequestMsg.Options.QueryAllAccounts);
	});

	it('should pass callback to soapRequest when props', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.schedule('Test', { data: true }, sampleCallback);

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});

	it('should pass callback to soapRequest when props and options', function() {
		// Arrange
		var sampleCallback = sinon.spy();

		// Act
		FuelSoap.prototype.schedule('Test', exampleRecurrence, exampleInteractions,'start',{ options: true } , function() {});

		// Assert
		assert.ok(soapRequestSpy.calledWith(sinon.match.object, sampleCallback));
	});

	it('should add QueryAllAccounts to body when option passed', function() {
		// Arrange
		var sampleOptions = { queryAllAccounts: true };

		// Act
		FuelSoap.prototype.schedule('Test', exampleRecurrence, exampleInteractions,'start',sampleOptions , function() {});

		// Assert
		var actualObj = soapRequestSpy.args[0][0].req;
		assert.ok(actualObj.ScheduleRequestMsg.Options.QueryAllAccounts);
	});
});
