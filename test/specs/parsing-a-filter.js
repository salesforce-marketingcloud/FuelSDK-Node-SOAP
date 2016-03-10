/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';
var assert   = require('assert');
var FuelSoap = require('../../lib/fuel-soap');

describe('parsing a filter', function() {
	describe('a simple filter', function() {
		it('should have a "SimpleFilterPart" returned as the xsi:type', function() {
			// Act
			var result = FuelSoap.prototype._parseFilter({});

			// Assert
			assert.equal(result.$['xsi:type'], 'SimpleFilterPart');
		});

		it('should put the operator in the correct place', function() {
			// Arrange
			var expected = 'SampleOperator';
			var sampleFilter = { operator: expected };

			// Act
			var result = FuelSoap.prototype._parseFilter(sampleFilter);

			// Assert
			assert.equal(result.SimpleOperator, expected);
		});

		it('should put the leftOperand in the correct place', function() {
			// Arrange
			var expected = 'SampleOperator';
			var sampleFilter = { leftOperand: expected };

			// Act
			var result = FuelSoap.prototype._parseFilter(sampleFilter);

			// Assert
			assert.equal(result.Property, expected);
		});

		it('should put the rightOperand in the correct place', function() {
			// Arrange
			var expected = 'SampleOperator';
			var sampleFilter = { rightOperand: expected };

			// Act
			var result = FuelSoap.prototype._parseFilter(sampleFilter);

			// Assert
			assert.equal(result.Value, expected);
		});
	});

	describe('a complex filter', function() {
		var sampleComplexFilter;
		var subFilterTestCases;

		beforeEach(function() {
			sampleComplexFilter = {
				leftOperand: {
					leftOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
					, operator: 'operator'
					, rightOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
				}
				, operator: 'operator'
				, rightOperand: {
					leftOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
					, operator: 'operator'
					, rightOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
				}
			};
		});

		it('should have a "ComplexFilterPart" returned as the xsi:type in top level', function() {
			// Arrange
			var sampleFilter = {
				leftOperand: {}
				, rightOperand: {}
			};

			// Act
			var result = FuelSoap.prototype._parseFilter(sampleFilter);

			// Assert
			assert.equal(result.$['xsi:type'], 'ComplexFilterPart');
		});

		it('should put the top level operator in the correct place', function() {
			// Act
			var result = FuelSoap.prototype._parseFilter(sampleComplexFilter);

			// Assert
			assert.equal(result.LogicalOperator, sampleComplexFilter.operator);
		});

		subFilterTestCases = [
			{ property: 'RightOperand' }
			, { property: 'LeftOperand' }
		];

		subFilterTestCases.forEach(function(testCase) {
			it('should create sub simple filters in ' + testCase.property, function() {
				// Arrange
				var sampleLessComplexFilter = {
					leftOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
					, operator: 'operator'
					, rightOperand: {
						leftOperand: 'left'
						, operator: 'operator'
						, rightOperand: 'right'
					}
				};

				// Act
				var result = FuelSoap.prototype._parseFilter(sampleLessComplexFilter);

				// Assert
				assert.equal(result[testCase.property].$['xsi:type'], 'SimpleFilterPart');
			});

			it('should create sub complex filters in ' + testCase.property, function() {
				// Act
				var result = FuelSoap.prototype._parseFilter(sampleComplexFilter);

				// Assert
				assert.equal(result[testCase.property].$['xsi:type'], 'ComplexFilterPart');
			});
		});


	});
});
