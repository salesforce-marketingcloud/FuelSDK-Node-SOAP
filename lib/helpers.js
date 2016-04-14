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
	, deliverResponse: function(type, data, callback, errorFrom) {
		// if it's an error and we have where it occurred, let's tack it on
		switch(type) {
			case 'error':
				if(!!errorFrom) {
					data.errorPropagatedFrom = errorFrom;
				}
				callback(data, null);
				break;
			case 'response':
				callback(null, data);
				break;
		}
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
