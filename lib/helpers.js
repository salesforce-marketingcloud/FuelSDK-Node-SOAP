/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
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
