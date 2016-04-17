/*
 * Copyright (c) 2016, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Legal Text is available at https://github.com/forcedotcom/Legal/blob/master/License.txt
 */

'use strict';

module.exports = {
	checkExpiredToken: function(err) {
		return err.faultstring && err.faultstring === "Token Expired";
	}
	, parseReqOptions: function(options) {
		var reqOptions = null;

		if (options && options.reqOptions) {
			reqOptions = options.reqOptions;
			delete options.reqOptions;
		}
		return reqOptions;
	}
};
