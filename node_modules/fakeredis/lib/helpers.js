"use strict";


    ////    Stylize a string alla vows

var stylize;
( function ()
{
    var styles =
    {
        'bold'      : '1',
        'italic'    : '3',
        'underline' : '4',

        'grey'      : '90',

        'red'       : '1;31',
        'green'     : '1;32',
        'yellow'    : '1;33',
        'blue'      : '1;34',
        'magenta'   : '1;35',
        'cyan'      : '1;36',
        'white'     : '1;37'
    };

    stylize = function ( str, style )
    {
        return '\x1B[' + styles[style] + 'm' + str +
               '\x1B[0m';
    };
}
() );



    ////    Prettyprint a subset of the keyspace of the fakeredis instance.

exports.pretty = function ( options )
{
    var pattern, wrap, label;

    if ( typeof options === 'string' )
        options = { pattern : options };

    pattern = ( options && options.pattern ) || "*";
    wrap    = ( options && options.wrap )    || 4;
    label   = ( options && options.label )   || "keyspace " + pattern;

    this.send_command ( "FAKE_DUMP", [ pattern || "*" ], function ( err, dump )
    {
        var i, n = dump && dump.length, style, key, ttl, type, value;

        if ( err )
            throw err;
        if ( label )
            process.stdout.write ( '\n' + stylize ( label, 'bold' ) + ':\n\n' );
        else
            process.stdout.write ( '\n' );

        for ( i = 0; i < n; i += 4 )
        {
            key   = dump [ i ];
            ttl   = dump [ i + 1 ];
            type  = dump [ i + 2 ];
            value = dump [ i + 3 ];

            style = 'white';

            if ( type === 'list' )
                style = 'green';

            else if ( type === 'hash' )
                style = 'yellow';

            else if ( type === 'set' )
                style = 'cyan';

            else if ( type === 'zset' )
                style = 'red';

            process.stdout.write
            (
                stylize ( type, 'bold' )
                +   '\t' + stylize ( key, 'bold' )
                +   '\n' + stylize ( ttl, ttl >= 0 ? 'italic' : 'grey' )
                +   '\t' +
                    (
                        value.map

                        ?   value.map ( function ( member, index )
                            {
                                return ( wrap && index && !( ( index ) % wrap ) ? '\n\t' : '' ) + stylize ( member, style );
                            })
                            .join ( ',\t' )

                        :   stylize ( value, style )
                    )
                +   '\n\n'
            );
        }
    });
};



    ////    Get a subset of the keyspace of the fakeredis instance.

exports.getKeyspace = function ( options, callback )
{
    var cb;

    if ( !callback && typeof options === 'function' )
    {
        callback = options;
        options  = null;
    }

    if ( typeof options === 'string' )
        options = { pattern : options };
    if ( !callback || typeof callback !== 'function' )
        throw new Error ( "You didn't provide a valid callback." );


        ////    By default respond with an array of [ key, ttl, type, value, key2, ttl2, type2, value2, ... ]

    cb = callback;


        ////    Respond with a key-value map.

    if ( options && options.map )
        cb = function ( err, data )
        {
            var out, i, n;
            if ( data )
            {
                out = {};
                n = data.length;
                for ( i = 0; i < n; i += 4 )
                    out [ data [ i ] ] = data [ i + 3 ];
            }

            callback ( err, out );
        };


        ////    Respond with an array of arrays.

    else if ( options && options.group )
        cb = function ( err, data )
        {
            var out, i, n;
            if ( data )
            {
                out = [];
                n = data.length;
                for ( i = 0; i < n; i += 4 )
                    out.push ( data.slice ( i, 4 ) );
            }

            callback ( err, out );
        };


    this.send_command ( "FAKE_DUMP", [ options && options.pattern || "*" ], cb );
};



    ////    Serve getKeyspace() as JSON from localhost:[port]/keyspace.json

exports.serveKeyspace = function ( port )
{
    var self = this,
        url  = require ( "url" );

    require ( "http" ).createServer
    (
        function ( req, res )
        {
            var data = url.parse ( req.url, true );

            if ( data.pathname !== '/keyspace.json' )
            {
                res.statusCode = 404;
                res.end ( "Not found." );
                return;
            }

            if ( req.method !== 'GET' )
            {
                res.statusCode = 405;
                res.end ( "Method not supported." );
                return;
            }

            self.getKeyspace ( data.query, function ( err, data )
            {
                if ( err )
                {
                    res.statusCode = 500;
                    res.end ( err );
                    return;
                }

                res.setHeader ( "Content-Type", "application/json" );
                res.end ( JSON.stringify ( data ) );
            });
        }
    )
    .listen ( port );
};



    ////    Get available and missing commands.
/*
exports.getCommands = function ( callback )
{
    this.send_command ( "FAKE_AVAIL", [], callback );
};

exports.getMissing = function ( callback )
{
    this.send_command ( "FAKE_MISS", [], callback );
};
*/
