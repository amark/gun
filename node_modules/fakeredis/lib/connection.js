"use strict";


exports.Connection = function ( backend, minLatency, maxLatency )
{
    var connection = this,
        db = 0,

        queue,
        watch,
        block,

        timeout = 0,
        state = NORMAL,
        subs = 0;


    this.push = function ( client, command, args, callback )
    {
        state ( client, prep ( command, args, callback ) );
    };


        ////    Push a command to a normal connection.

    function NORMAL ( client, entry )
    {
        var i, n, matches;


            ////    Transactions.

        if ( entry.command === "WATCH" )
        {
            entry.override = function ()
            {
                var i, n = entry.args.length;
                if ( !watch )
                    watch = {};
                for ( i = 0; i < n; i ++ )
                    if ( !( entry.args [ i ] in watch ) )
                        watch [ entry.args [ i ] ] = backend.getRevision ( entry.args [ i ] );

                return "OK";
            };
        }

        else if ( entry.command === "UNWATCH" )
        {
            entry.override = function ()
            {
                watch = null;
                return "OK";
            };
        }

        else if ( entry.command === "DISCARD" )
        {
            if ( queue )
            {
                if ( !timeout )
                    timeout = setTimeout ( exec, randLat () );

                for ( i = 0; i < queue.length; i ++ )
                    if ( queue [ i ].command === "MULTI" )
                    {
                        queue.splice ( i, queue.length );

                            ////    This will substitute the DISCARD command with an UNWATCH,
                            ////        hence the recursive call to this.push.

                        return this.push ( [ "UNWATCH" ], entry.callback );
                    }
            }

            entry.override = function () { return "OK"; };
        }

        else if ( entry.command === "MULTI" )
        {
            entry.override = function ( queue )
            {
                if ( !queue ) throw new Error ( 'WOOT! no queue.' );
                var w = watch, key, entry, x = 0;
                watch = null;
                if ( w ) for ( key in w )
                    if ( backend.getRevision ( key ) !== w [ key ] )
                    {
                            ////    Abort because of a change in the watched keyspace.

                        n = 0;
                        while (( entry = queue.shift () ))
                        {
                            if ( entry.command === "EXEC" )
                            {
                                entry.override = function ()
                                {
                                    var i, out = [];
                                    for ( i = 0; i < n; i ++ )
                                        out [ i ] = null;

                                    return out;
                                };

                                queue.unshift ( entry );
                                break;
                            }

                            n ++;
                        }

                        return "OK";
                    }

                var replies = [];
                var i, n = queue.length, cb = pushReply.bind ( replies );
                for ( i = 0; i < n; i ++ )
                {
                    entry = queue [ i ];
                    if ( entry.command !== "EXEC" )
                    {
                            ////    Collect replies for the EXEC output.

                        entry.callback = cb;

                            ////    Prevent blocking within a transaction.

                        delete entry.block;
                    }

                    else
                    {
                            ////    Exec calls back with the entire reply list.

                        entry.override = entry.override.bind ( replies );
                        return "OK";
                    }
                }

                throw new Error ( "WOOT! Can't find the EXEC command in the queue." );
            };

                ////    Prevent flushing before the exec.

            if ( timeout )
            {
                clearTimeout ( timeout );
                timeout = 0;
            }

            if ( queue )
                queue.push ( entry );
            else
                queue = [ entry ];

            return;
        }

        else if ( entry.command === "EXEC" )
        {
            entry.override = function ()
            {
                return this.join ? this : null;
            };

            if ( queue && !timeout )
                timeout = setTimeout ( exec, randLat () );
        }


            ////    Pubsub.

        if (( matches = /^(P)?(UN)?SUBSCRIBE$/.exec ( entry.command ) ))
        {
            if( !client.$PUSHDELAY )
                client.$PUSHDELAY = new Delay ( client, 'pushMessage', minLatency );

            entry.override = function ()
            {
                var i, n = entry.args.length;

                if ( n ) for ( i = 0; i < n; i ++ )
                {
                        ////    Unsubscribe.

                    if ( matches [ 2 ] )
                        subs = backend.unsub ( matches [ 1 ] ? true : false, entry.args [ i ], client.$PUSHDELAY );

                        ////    Subscribe.

                    else
                        subs = backend.sub ( matches [ 1 ] ? true : false, entry.args [ i ], client.$PUSHDELAY );
                }

                else if ( matches [ 2 ] )
                {
                        ////    Unsubscribe from all.

                    subs = backend.unsub ( matches [ 1 ] ? true : false, null, client.$PUSHDELAY );
                }

                else
                    return new Error ( 'Wrong number of arguments for \'' + matches [ 0 ] + '\' command' );

                if ( !subs )
                    state = NORMAL;

                return "OK";
            };

            if ( !matches [ 2 ] )
                state = SUBSCRIBED;
        }


            ////    Connection.

        if ( entry.command === 'QUIT' )
        {
            entry.override = function ()
            {
                if ( client.$PUSHDELAY )
                {
                        ////    Unsubscribe.

                    backend.unsub ( true, null, client.$PUSHDELAY );
                    backend.unsub ( false, null, client.$PUSHDELAY );
                }

                return "OK";
            };

            state = CLOSED;
        }

        else if (entry.command === 'SELECT')
        {
            entry.override = function()
            {
                var n = entry.args.length;
                if (n !== 1)
                    return new Error("Wrong number of arguments for 'SELECT' command.");
                var id = Number(entry.args[0]);
                if ((!id && id !== 0) || id % 1 !== 0 || id < 0)
                    return new Error("invalid DB index");

                db = id;
                backend.selectDB(db);
                return "OK";
            }
        }


            ////    Regular commands.

        if ( queue )
            queue.push ( entry );

        else
        {
            queue = [ entry ];
            timeout = setTimeout ( exec, randLat () );
        }
    };


        ////    Push a command to a subscribed connection.

    function SUBSCRIBED ( client, entry )
    {

            ////    Allow commands that modify the subscription set.

        if ( /SUBSCRIBE|^QUIT/.test ( entry.command ) )
            NORMAL ( client, entry );
        else
            throw new Error ( "fakeredis: Connection is in pub/sub mode (" + subs + " subscriptions)." );
    }


        ////    Closed connection.

    function CLOSED ( client, entry )
    {
        throw new Error ( "fakeredis: You've closed this connection with QUIT, cannot " + entry.command );
    }


        ////    Blocked connection.

    function BLOCKED ( client, entry )
    {
        if ( !block )
            block = [ client, entry ];
        else
            block.push ( client, entry );
    }


        ////    Execute everything in the queue sequentially.

    function exec ()
    {
        timeout = 0;
        var q = queue, entry, func, out, err, data, resp = [];
        queue = null;

        if ( connection.verbose )
            console.log ( '\n' );

        backend.selectDB(db);

        if ( q ) while (( entry = q.shift () ))
        {
            if ( entry === 'SKIP' )
                continue;

            func = backend [ entry.command ];
            out  = null;

            if ( connection.verbose )
                console.log ( "fakeredis>", entry.command, entry.args.join ( ' ' ) );

            if ( entry.override )
            {
                out  = entry.override ( q );
                err  = out instanceof Error ? out : null;
                data = out instanceof Error ? null : out;
            }

            else if ( !func || typeof func !== 'function' )
                throw new Error ( 'WOOT! Wierd queue entry : ' + JSON.stringify ( entry ) + ' / ' + JSON.stringify ( q ) );

            else if ( func.length && func.length !== entry.args.length )
            {
                err  = new Error ( 'Wrong number of arguments for \'' + entry.command.toLowerCase () + '\' command' );
                data = null;
            }

            else
            {
                out  = func.apply ( backend, entry.args );
                err  = ( ( out && out.getError ) || null ) && new Error ( out.getError () );
                data = err ? null : ( out && out.getStatus && out.getStatus () ) || out;

                    ////    Block if necessary.

                if ( entry.block && err === null && data === null )
                {
                    if ( resp.length )
                        flush ( resp );

                    q.unshift ( entry );
                    queue = q;
                    state = BLOCKED;
                    backend.sub ( false, backend.UPDATE, connection );

                    if ( entry.block && typeof entry.block === 'number' )
                        setTimeout ( unblock.bind ( null, entry ), entry.block * 1000 );

                    return;
                }
            }

            if ( !err && !data && typeof out === "undefined" )
                throw new Error ( "WOOT! Backend returned undefined." );
            if ( out && out.rev )
                throw new Error ( "WOOT! Returning the whole keyspace entry." );

            if ( data === true )
                throw new Error ( "TRUE THAT! " + JSON.stringify ( entry ) );

            data = fdata ( data );
            if ( entry.callback )
                resp.push ( entry.callback.bind ( null, err, data ) );
        }

        if ( connection.verbose )
            console.log ( '\n' );

        if ( resp.length )
            flush ( resp );
    }

    function flush ( resp )
    {
        setTimeout
        (
            function ()
            {
                var i, n;

                n = resp.length;
                for ( i = 0; i < n; i ++ )
                    resp [ i ] ();
            },
            minLatency
        );
    }

    function unblock ( entry )
    {
        if ( entry )
            delete entry.block;

        state = NORMAL;
        exec ();

        if ( state === NORMAL )
        {
            backend.unsub ( false, backend.UPDATE, connection );

            var a = block, i, n = a && a.length;
            block = null;
            for ( i = 0; i < n; i += 2 )
                NORMAL ( a [ i ], a [ i + 1 ] );
        }
    }

    this.pushMessage = function ( type, channel, message )
    {
            ////    Attempt to unblock on backend keyspace change.

        unblock ();
    }


        ////    Format data the way it comes out of node_redis.

    function fdata ( data )
    {
        if ( typeof data !== 'object' && typeof data !== 'number' && typeof data !== 'string' )
            throw new Error ( 'WOOT! Data is not an object/string/number : ' + data );

        if ( data )
        {
            if ( typeof data === 'string' && !isNaN ( data ) )
                data = Number ( data );

            else if ( data.length && data.map )
                data = data.map ( finnerdata );

            else if ( typeof data === 'object' && !data.map )
                throw new Error ( 'WOOT! Illegal object in data : ' + data );
        }

        return data;
    }

    function finnerdata ( data )
    {
        if ( typeof data !== 'object' && typeof data !== 'number' && typeof data !== 'string' )
            throw new Error ( 'WOOT! Data is not an object/string/number : ' + data );

        if ( data )
        {
            if ( typeof data === 'number' )
                data = String ( data );

            else if ( data.length && data.map )
                data = data.map ( finnerdata );

            else if ( typeof data === 'object' && !data.map )
                throw new Error ( 'WOOT! Illegal object in data : ' + data );
        }

        return data;
    }


        ////    Prepare command.

    function prep ( command, args, callback )
    {
        var command = command.toUpperCase (),
            args    = args.map ( function ( arg ) { return String ( arg ); } ),
            block   = false;

        if ( /^B[LR]POP/.test ( command ) && args.length )      //  Backend will validate the timeout param more robustly.
            block   = parseInt ( args [ args.length - 1 ] ) || true;

        if ( !backend [ command ] )
            throw new Error ( "fakeredis: " + command + " is not implemented in fakeredis. Let me know if you need it." );

        return { command : command, args : args, callback : callback, block : block };
    }


        ////    Helper to push replies onto the replies list.

    function pushReply ( err, data )
    {
        this.push ( fdata ( data ) );
    }


        ////    Immitate latency.

    minLatency = Math.ceil ( minLatency || 15 );
    maxLatency = Math.ceil ( maxLatency || minLatency * 3 );

    if ( maxLatency < minLatency || minLatency < 0 )
        throw new Error ( "Bad min/max latency settings." );

    function randLat ()
    {
        return Math.ceil ( ( maxLatency - minLatency ) * Math.random () + minLatency );
    }

};



function Delay ( object, method, delay )
{
    var queue,
        flush;

    this [ method ] = function ()
    {
        if ( !queue )
        {
            queue = [ arguments ];
            setTimeout ( flush, delay );
        }
        else
            queue.push ( arguments );
    };

    flush = function ()
    {
        var q = queue, i, n = q.length;
        queue = null;

        for ( i = 0; i < n; i ++ )
            object [ method ].apply ( object, q [ i ] );
    };

}



