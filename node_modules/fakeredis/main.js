"use strict";


// By default fakeredis simulates a ridiculous amount of network latency
// to help you discover race-conditions when testing multi-client setups.
// Instantiate your 'clients' with a truthy .fast option,
// or set it here globally to make things go a bit faster.
exports.fast = false;


/**

    TODO:
    -   lint negative count and offset LIMITs away,
        SORT and ZRANGEBYSCORE treat them differently, so it's just confusing and a bad practice.

 **/

var index       = require ( "redis" ),
    Backend     = require ( "./lib/backend" ).Backend,
    Connection  = require ( "./lib/connection" ).Connection,
    helpers     = require ( "./lib/helpers" ),

    backends    = {},
    RedisClient = index.RedisClient,

    anon        = 0;


    ////    Re-export redis exports.

exports.RedisClient = index.RedisClient;
exports.Multi       = index.Multi;
exports.print       = index.print;


    ////    Overriden client factory.

exports.createClient = function ( port, host, options )
{
    var id  = !port && !host ? 'fake_' + ( ++ anon ) : ( host || "" ) + ( port || "" ),
        lat = options && options.fast || exports.fast ? 1 : null,
        c   = new Connection ( backends [ id ] || ( backends [ id ] = new Backend ), lat, lat ),
        cl  = new RedisClient ( { on : function () {} } /* , options */ ),
        ns  = options && options.no_sugar;

    if ( options && options.verbose )
        c.verbose = true;

    cl.connected = true;
    cl.ready = true;

    cl.send_command = function ( command, args, callback )
    {
            ////    Interpret arguments, copy-paste from mranney/redis/index.js for best compat.

        if (typeof command !== "string") {
            throw new Error("First argument to send_command must be the command name string, not " + typeof command);
        }

        if (Array.isArray(args)) {
            if (typeof callback === "function") {
                // probably the fastest way:
                //     client.command([arg1, arg2], cb);  (straight passthrough)
                //         send_command(command, [arg1, arg2], cb);
            } else if (! callback) {
                // most people find this variable argument length form more convenient, but it uses arguments, which is slower
                //     client.command(arg1, arg2, cb);   (wraps up arguments into an array)
                //       send_command(command, [arg1, arg2, cb]);
                //     client.command(arg1, arg2);   (callback is optional)
                //       send_command(command, [arg1, arg2]);
                //     client.command(arg1, arg2, undefined);   (callback is undefined)
                //       send_command(command, [arg1, arg2, undefined]);
                var last_arg_type = typeof args[args.length - 1];
                if (last_arg_type === "function" || last_arg_type === "undefined") {
                    callback = args.pop();
                }
            } else {
                throw new Error("send_command: last argument must be a callback or undefined");
            }
        } else {
            throw new Error("send_command: second argument must be an array");
        }

        // if the last argument is an array, expand it out.  This allows commands like this:
        //     client.command(arg1, [arg2, arg3, arg4], cb);
        //  and converts to:
        //     client.command(arg1, arg2, arg3, arg4, cb);
        // which is convenient for some things like sadd
        if (Array.isArray(args[args.length - 1])) {
            args = args.slice(0, -1).concat(args[args.length - 1]);
        }

            ////    Lint args.

        if ( !options || !options.no_lint )
        {
            var i, n;
            n = args.length;
            for ( i = 0; i < n; i ++ )
                if ( typeof args [ i ] !== 'string' && typeof args [ i ] !== 'number' )
                    throw new Error ( "fakeredis/lint: Argument #" + i + " for " + command + " is not a String or Number: " + args [ i ] );
        }

            ////    You can disable hash sugar with the no_sugar option.

        var cb;
        if ( callback && !ns && /^hgetall/i.test ( command ) )
            cb = function ( err, data )
            {
                if ( !err && data )
                    data = reply_to_object ( data );

                callback ( err, data );
            };

        else
            cb = callback;

        c.push ( this, command, args, cb );
    };

    cl.pushMessage = cl.emit.bind ( cl );

    ( function ()
    {
        var prop;
        for ( prop in helpers )
            cl [ prop ] = helpers [ prop ];
    }
    () );

    return cl;
};


    ////    Helpers for node_redis compat.

// hgetall converts its replies to an Object.  If the reply is empty, null is returned.
function reply_to_object(reply) {
    var obj = {}, j, jl, key, val;

    if (reply.length === 0) {
        return null;
    }

    for (j = 0, jl = reply.length; j < jl; j += 2) {
        key = reply[j].toString();
        val = reply[j + 1];
        obj[key] = val;
    }

    return obj;
}

