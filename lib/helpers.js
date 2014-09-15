'use strict';

module.exports = {
    checkExpiredToken: function( err ) {
        return err.faultstring && err.faultstring === "Token Expired";
    }
    , deliverResponse: function( type, data, callback, errorFrom ) {

        // if it's an error and we have where it occured, let's tack it on
        if( type === 'error' ) {

            if( !!errorFrom ) {
                data.errorPropagatedFrom = errorFrom;
            }

            callback( data, null );

        } else if( type === 'response' ) {

            callback( null, data );

        }
    }
};