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
var FuelSoap;

// due to changes in API from v0.12 to v4
var deepEqual = assert.deepStrictEqual || assert.deepEqual;

describe('building a request envelope', function() {
	var buildObjectSpy;

	beforeEach(function() {
		buildObjectSpy = sinon.spy();

		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'xml2js': {
				Builder: function() {
					return {
						buildObject: buildObjectSpy
					};
				}
			}
		});
	});

	it('should initialize xml2js builder with correct params', function() {
		// Arrange
		var builderSpy = sinon.stub().returns({ buildObject: function() {} });
		var expected   = { rootName: 'Envelope', headless: true };

		FuelSoap = proxyquire('../../lib/fuel-soap', {
			'xml2js': {
				Builder: builderSpy
			}
		});

		// Act
		FuelSoap.prototype._buildEnvelope();

		// Assert
		deepEqual(builderSpy.args[0][0], expected);
	});

	it('should tell xml2js to build object', function() {
		// Act
		FuelSoap.prototype._buildEnvelope();

		// Assert
		assert.ok(buildObjectSpy.calledOnce);
	});

	it('should populate token correctly', function() {
		// Arrange
		var expected = 'myTestToken';

		// Act
		FuelSoap.prototype._buildEnvelope('request', expected);

		// Assert
		assert.equal(buildObjectSpy.args[0][0].Header.fueloauth._, expected);
	});

	it('should populate request properly', function() {
		// Arrange
		var expected = 'request';

		// Act
		FuelSoap.prototype._buildEnvelope(expected);

		// Assert
		assert.equal(buildObjectSpy.args[0][0].Body, expected);
	});
 });
