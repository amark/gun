var url = require('url');
var Gun = require('../gun');

/**
 * Verify the origin
 * 
 * @param  {RegExp|Array|String|Function} allowed   The allowed origins
 * @param  {String}              origin    String representation of the request URL
 * @return {Boolean}             Whether or not the origin is valid
 */
var verifyOrigin = function(allowed, origin) {
    var isValid = false;
    if (allowed instanceof RegExp) {
        isValid = allowed.test(origin);
    } else if (allowed instanceof Array) {
        isValid = allowed.indexOf(origin) !== -1;
    } else if (allowed instanceof Function) {
        isValid = allowed(origin);
    } else {
        isValid = allowed === origin;
    }
    return isValid;
};

/**
 * Verify the authentication header
 *
 * @todo  make this callback based
 * 
 * @param  {Function|String} check       Check option passed in
 * @param  {String}          authToken   The auth token passed in query string
 * @param  {Object}          query       Full query string as an object
 * @return {Boolean}         Whether or not the auth header is valid
 */
var verifyAuth = function(check, authToken, query) {
    var isValid = false;
    if (check instanceof Function) {
        isValid = check(authToken, query);
    } else {
        isValid = check === authToken;
    }
    return isValid === true;
};

Gun.on('opt', function(context) {
    var opt = context.opt || {};
    var ws = opt.ws || {};

    if (!opt.verify) {
        this.to.next(context);
        return;
    }

    /**
     *  verify when instantiating Gun can contain the following keys:
     *      allowOrigins: Array|RegExp|String
     *      auth:         String|Function
     *      authKey:      String
     *      check:        Function
     */
    var verify = opt.verify;
    if (ws.verifyClient && !verify.override) {
        throw Error('Cannot override existing verifyClient option in `ws` configuration.');
    }

    /**
     * Attach a verifyClient to the WS configuration.
     * 
     * @param  {Object}   info      Request information
     * @param  {Function} callback  Called when verification is complete
     */
    ws.verifyClient = function(info, callback) {

        // Callback Definitions
        var errorCallback = (errorCode, message) => {
            callback(false, errorCode, message);
        };
        var successCallback = () => {
            callback(true);
        };

        // 0. Verify security
        if (verify.requireSecure && !info.secure) {
            errorCallback(400, 'Insecure connection');
            return;
        }

        // 1. Verify request origin
        if (verify.allowOrigins && !verifyOrigin(verify.allowOrigins, info.origin)) {
            errorCallback(403, 'Origin forbidden');
            return;
        }

        // 2. Check authentication
        if (verify.auth) {

            // Retrieve parameters from the query string
            // and convert into an object
            var queryUrl = url.parse(info.req.url, true);
            queryUrl.query = queryUrl.query || {};

            // Get the header defined by the user
            // Or use authorization by default.
            var token = (verify.authKey)
                            ? queryUrl.query[verify.authKey]
                                : queryUrl.query.authorization;

            // Check the token against the verification function
            if (!token || !verifyAuth(verify.auth, token, queryUrl.query)) {
                errorCallback(403, 'Forbidden');
                return;
            }
        }

        // If no additional verification check is provided, 
        // simply return true at this point since all 
        // provided verifications have passed.
        if (!verify.check) {
            successCallback();
            return;
        }

        // 3. Pass to generic check handler
        // This can return a value; alternatively, this can use the
        // callback functionality
        var isValid = verify.check(info, successCallback, errorCallback); 

        // Check returned a response, pass this to the callback
        // If not, assume the user will call
        if (typeof isValid !== 'undefined') {
            if (typeof isValid === 'boolean') {
                if (isValid === true) {
                    successCallback();
                } else {
                    errorCallback(400);
                }
            }
        }          
    };
    context.opt.ws = ws;

    // Pass to next plugins
    this.to.next(context);
});

module.exports = Gun;
