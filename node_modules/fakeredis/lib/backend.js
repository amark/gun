"use strict";


    ////    Error replies.

var ERROR       = function ( message )
{
    this.getError = function () { return message; };
    this.toString = function () { return "<ERROR<" + message + ">>"; };
};

var BAD_TYPE    = new ERROR ( 'Operation against a key holding the wrong kind of value' );
var BAD_KEY     = new ERROR ( 'no such key' );
var BAD_INT     = new ERROR ( 'value is not an integer or out of range' );
var BAD_FLOAT   = new ERROR ( 'value is not a valid float' );
var BAD_ARGS    = new ERROR ( 'wrong number of arguments' );
var BAD_SYNTAX  = new ERROR ( 'syntax error' );
var BAD_INDEX   = new ERROR ( 'index out of range' );
var BAD_SORT    = new ERROR ( 'One or more scores can\'t be converted into double' );

var BAD_BIT1    = new ERROR ( 'bit offset is not an integer or out of range' );
var BAD_BIT2    = new ERROR ( 'bit is not an integer or out of range' );
var BAD_SETEX   = new ERROR ( 'invalid expire time in SETEX' );
var BAD_ZUIS    = new ERROR ( 'at least 1 input key is needed for ZUNIONSTORE/ZINTERSTORE' );



    ////    Status replies.

var STATUS      = function ( message )
{
    this.getStatus = function () { return message; };
    this.toString = function () { return "<STATUS<" + message + ">>"; };
};

var OK          = new STATUS ( 'OK' );
var PONG        = new STATUS ( 'PONG' );
var NONE        = new STATUS ( 'none' );



    ////    Redis types.

var VALID_TYPE  = function () {};
var TYPE        = function ( type, makePrimitive )
{
    var Constr = function ( value )
    {
        if ( !( this instanceof VALID_TYPE ) )
            return new Constr ( value );
        if ( !value )
            value = makePrimitive ();

        this.value = value;
    };

    Constr.getStatus = function () { return type; };
    Constr.prototype = new VALID_TYPE;
    Constr.prototype.toString = function () { return "<TYPE<" + type + ">>"; };
    Constr.prototype.TYPE = Constr;
    return Constr;
};

var EMPTY_STR   = { toString : function () { return ""; }, length : 0, copy : function () {} };
var STRING      = TYPE ( "string", function () { return EMPTY_STR; } );
var LIST        = TYPE ( "list",   function () { return []; } );
var HASH        = TYPE ( "hash",   function () { return {}; } );
var SET         = TYPE ( "set",    function () { return {}; } );
var ZSET        = TYPE ( "zset",   function () { return {}; } );



    ////    Utils.

var arr = function ( obj )
{
    var i, n = obj.length, out = [];
    for ( i = 0; i < n; i ++ )
        out [ i ] = obj [ i ];

    return out;
};

var range = function ( min, max )
{
    var xlo, xhi;

    if (( xlo = min.substr ( 0, 1 ) === '(' ))
        min = str2float ( min.substr ( 1 ) );
    else
        min = str2float ( min );

    if ( min instanceof ERROR )
        return min;

    if (( xhi = max.substr ( 0, 1 ) === '(' ))
        max = str2float ( max.substr ( 1 ) );
    else
        max = str2float ( max );

    if ( max instanceof ERROR )
        return max;

    return function ( num )
    {
        return !( ( xlo && num <= min ) || ( num < min ) || ( xhi && num >= max ) || ( num > max ) );
    };
};

var slice = function ( arr, start, stop, asCount )
{
    start = str2int ( start );
    stop  = str2int ( stop );
    if ( start instanceof ERROR ) return start;
    if ( stop instanceof ERROR )  return stop;

    if ( arr.slice )
    {
        var n = arr.length;
        if ( asCount )
        {
            if ( start < 0 )
            {
                start = 0; // Redis is inconsistent about this, ZRANGEBYSCORE will return an empty multibulk on negative offset
                stop  = 0; // whilst SORT will return as if the offset was 0. Best to lint these away with client-side errors.
            }
            else if ( stop < 0 ) stop = n;
            else stop += start;
        }
        else
        {
            if ( start < 0 ) start = n + start;
            if ( stop < 0 ) stop = n + stop;
            stop ++;
        }

        if ( start >= stop )
            return [];
        else
            return arr.slice ( start < 0 ? 0 : start, stop > n ? n : stop );
    }

    else
        return arr;
};

var str2float = function ( string )
{
    var value = Number ( string );
    if ( typeof string !== 'string' ) throw new Error ( "WOOT! str2float: '" + string + "' not a string." );
    if ( string === '+inf' ) value = Number.POSITIVE_INFINITY;
    else if ( string === '-inf' ) value = Number.NEGATIVE_INFINITY;
    else if ( !string || ( !value && value !== 0 ) ) return BAD_FLOAT;
    return value;
};

var str2int = function ( string )
{
    var value = str2float ( string );
    if ( value instanceof ERROR || value % 1 !== 0 ) return BAD_INT;
    return value;
};

var pattern = function ( string )
{
    string = string.replace ( /[+{($^|.\\]/g, '\\' + '$0' );
    string = string.replace ( /(^|[^\\])([*?])/g, '$1.$2' );
    string = '^' + string + '$';

    var pattern = new RegExp ( string );
    return pattern.test.bind ( pattern );
};



    ////    Keyspace and pubsub.

exports.Backend = function ()
{
    var state,
        dbs     = {},
        delrev  = {},
        rev     = 0,

        subs    = [],
        call    = [],
        tick    = false;


    // Select.
    // Selected keyspace is NOT relevant to pubsub.
    this.selectDB = function (id) {
        if (typeof id !== "number" || id % 1 !== 0)
            throw new Error("Invalid database id: " + id);

        // Select or instantiate.
        var db = dbs[id] || (dbs[id] = {});
        state = db;
    };

    // Connections start in database 0.
    this.selectDB(0);


        ////    Typed getKey.

    this.getKey = function ( type, key, make )
    {
        var entry = state [ key ];

        if ( type && !type.getStatus )
            throw new Error ( "WOOT! type param for getKey is not a valid type." );
        if ( key === undefined )
            throw new Error ( "WOOT! key param for getKey is undefined." );

        if ( !entry || entry.expire < Date.now () )
        {
            delete state [ key ];
            delrev [ key ] = ++ rev;
            entry = null;
        }
        else if ( !( entry.value instanceof VALID_TYPE ) )
            throw new Error ( "WOOT! keyspace entry value is not a valid type." );

        if ( type )
        {
            if ( entry && !( entry.value instanceof type ) )
                return BAD_TYPE;
            if ( !entry && make )
                return new type;
        }

        return ( entry && entry.value ) || null;
    };

    this.setKey = function ( key, value )
    {
        if ( value )
        {
            if ( !( value instanceof VALID_TYPE ) )
                throw new Error ( "WOOT! Value doesn't have a valid type." );

            rev ++;
            state [ key ] = { value : value };
            state [ key ].rev = rev;
            delete delrev [ key ];

            this.pub ( this.UPDATE, key );

            return 1;
        }

        else if ( state [ key ] )
        {
            rev ++;
            delrev [ key ] = rev;
            delete state [ key ];

            return 1;
        }

        return 0;
    };

    this.upsetKey = function ( key, value )
    {
        if ( !value )
            throw new Error ( "WOOT! Update key with a falsy value." );
        if ( !( value instanceof VALID_TYPE ) )
            throw new Error ( "WOOT! Value doesn't have a valid type." );

        if ( state [ key ] && state [ key ].expire >= Date.now () )
        {
            if ( state [ key ].value !== value )
                throw new Error ( "WOOT! Chaning value containers during upsetKey." );

            rev ++;
            state [ key ].value = value;
            state [ key ].rev   = rev;

            this.pub ( this.UPDATE, key );
        }

        else
            this.setKey ( key, value );
    };

    this.getExpire = function ( key )
    {
        var entry = state [ key ];

        if ( !entry || entry.expire < Date.now () )
        {
            delete state [ key ];
            return null;
        }

        return entry.expire;
    };

    this.setExpire = function ( key, expire )
    {
        var entry = state [ key ];

        if ( !entry || entry.expire < Date.now () )
        {
            delete state [ key ];
            return 0;
        }

        else if ( expire )
        {
            entry.expire = expire;
            return 1;
        }

        else if ( entry.expire )
        {
            delete entry.expire;
            return 1;
        }

        return 0;
    };

    this.getKeys = function ()
    {
        var keys = [],
            key;

        for ( key in state )
            if ( this.getKey ( null, key ) )
                keys.push ( key );

        return keys;
    };

    this.renameKey = function ( keyA, keyB )
    {
        if ( !this.getKey ( null, keyA ) )
            return false;

        rev ++;
        state [ keyB ] = state [ keyA ];
        state [ keyB ].rev = rev ++;
        delete state [ keyA ];

        this.pub ( this.UPDATE, keyB );

        return true;
    };


        ////    Keyspace change event.

    this.UPDATE = new STATUS ( "Key value updated." );


        ////    For implementing watch and stuff.

    this.getRevision = function ( key )
    {
        this.getKey ( null, key );
        return ( state [ key ] && state [ key ].rev ) || delrev [ key ] || 0;
    };


        ////    Publish / subscribe backend.

    this.pub = function ( channel, message )
    {
        if ( !channel && channel !== '' ) throw new Error ( "WOOT! Publishing to a falsy, non-string channel : [" + channel + '] ' + message );
        if ( !message && message !== '' ) throw new Error ( "WOOT! Publishing a falsy, non-string message : [" + channel + '] ' + message );

        var i, n = subs.length, sub, x = 0;
        for ( i = 0; i < n; i ++ )
        {
            sub = subs [ i ];

            if ( sub.channel === channel || ( sub.pattern !== null && sub.channel ( channel ) ) )
            {
                if ( sub.pattern !== null )
                    call.push ( sub.client.pushMessage.bind ( sub.client, 'pmessage', sub.pattern, channel, message ) );
                else
                    call.push ( sub.client.pushMessage.bind ( sub.client, 'message', channel, message ) );

                x ++;
                if ( !tick )
                {
                    tick = true;
                    process.nextTick ( function ()
                    {
                        var c, func;
                        tick = false;
                        c = call.splice ( 0, call.length );
                        while (( func = c.shift () )) func ();
                    });
                }
            }
        }

        return x;
    };

        ////    p - true/false
        ////    channel - string
        ////    client { push ( pattern, channel, message ) }

    this.sub = function ( p, channel, client )
    {
        if ( !channel && channel !== '' ) throw new Error ( "WOOT! Subscribing to a falsy, non-string channel : [" + channel + ']' );
        if ( !client || !client.pushMessage ) throw new Error ( "WOOT! Subscribing an invalid client : " + client );
        if ( typeof channel === 'function' ) throw new Error ( "WOOT! Subscribing to a function : " + channel );

        var i, n = subs.length, sub, found = false;
        for ( i = 0; i < n; i ++ )
        {
            sub = subs [ i ];
            if ( sub.client === client && ( ( p && sub.pattern === channel ) || ( !p && sub.channel === channel ) ) )
            {
                found = true;
                break;
            }
        }

        var x = this.numSubs ( client );

        if ( !found )
        {
            x ++;

            subs.push ({ pattern : p ? channel : null, channel : p ? pattern ( channel ) : channel, client : client });
            process.nextTick ( client.pushMessage.bind ( client, p ? 'psubscribe' : 'subscribe', channel, x ) );
        }

        return x;
    };

    this.unsub = function ( p, channel, client )
    {
        if ( !channel && channel !== '' && channel !== null ) throw new Error ( "WOOT! Unsubscribing from a falsy, non-string, non-null channel : [" + channel + ']' );
        if ( !client || !client.pushMessage ) throw new Error ( "WOOT! Unsubscribing an invalid client : " + client );

        var x = this.numSubs ( client );

        var i, n = subs.length, sub;
        for ( i = 0; i < n; i ++ )
        {
            sub = subs [ i ];
            if ( sub.client !== client )
                continue;

            if ( ( p && sub.pattern !== null && ( channel === null || sub.pattern === channel ) ) || ( !p && sub.pattern === null && ( channel === null || sub.channel === channel ) ) )
            {
                x --;
                subs.splice ( i, 1 );
                process.nextTick ( client.pushMessage.bind ( client, p ? 'punsubscribe' : 'unsubscribe', p ? sub.pattern : sub.channel, x ) );
                i --; n --;
            }
        }

        return x;
    };

    this.numSubs = function ( client )
    {
        var i, n = subs.length, x = 0;
        for ( i = 0; i < n; i ++ )
            if ( subs [ i ].client === client )
                x ++;

        return x;
    }

};



    ////    Redis commands.

exports.Backend.prototype =
{


        ////    Keys.

    DEL : function ()
    {
        var i, n = arguments.length, x = 0;
        if ( !n ) return BAD_ARGS;
        for ( i = 0; i < n; i ++ )
            if ( this.setKey ( arguments [ i ], null ) ) x ++;

        return x;
    },

    EXISTS : function ( key )
    {
        return this.getKey ( null, key ) ? 1 : 0;
    },

    PEXPIREAT : function ( key, time )
    {
        time = str2int ( time );
        if ( time instanceof ERROR ) return time;
        return this.setExpire ( key, time );
    },

    EXPIREAT : function ( key, time )
    {
        time = str2int ( time );
        if ( time instanceof ERROR ) return time;
        return this.setExpire ( key, time * 1000 );
    },

    PEXPIRE : function ( key, time )
    {
        time = str2int ( time );
        if ( time instanceof ERROR ) return time;
        return this.setExpire ( key, time + Date.now () );
    },

    EXPIRE : function ( key, time )
    {
        time = str2int ( time );
        if ( time instanceof ERROR ) return time;
        return this.setExpire ( key, time * 1000 + Date.now () );
    },

    PERSIST : function ( key )
    {
        return this.PEXPIREAT ( key, "0" );
    },

    PTTL : function ( key )
    {
        var ttl = this.getExpire ( key );
        if ( ttl ) return ttl - Date.now ();
        else return -1;
    },

    RANDOMKEY : function ( key )
    {
        var keys = this.getKeys (), n = keys && keys.length;
        if ( n ) return keys [ Math.floor ( Math.random () * n ) ];
        else return null;
    },

    RENAME : function ( key, newkey )
    {
        return this.renameKey ( key, newkey ) ? OK : BAD_KEY;
    },

    RENAMENX : function ( key, newkey )
    {
        if ( !this.EXISTS ( key ) ) return BAD_KEY;
        if ( this.EXISTS ( newkey ) ) return 0;
        if ( !this.renameKey ( key, newkey ) ) throw new Error ( "WOOT! Couldn't rename." );
        return 1;
    },

    TTL : function ( key )
    {
        var ttl = this.getExpire ( key );
        if ( ttl ) return Math.ceil ( ( ttl - Date.now () ) / 1000 );
        else return -1;
    },

    TYPE : function ( key )
    {
        var K = this.getKey ( null, key );
        return K ? K.TYPE : NONE;
    },

    KEYS : function ( pat )
    {
        var keys = this.getKeys ().filter ( pattern ( pat ) );
        keys.sort ();
        return keys;
    },



        ////    String setters.

    SET : function ( key, value )
    {
        var buf = new Buffer ( Buffer.byteLength ( value ) );
            buf.write ( value );

        this.setKey ( key, new STRING ( buf ) );
        return OK;
    },

    sIncrBy : function ( parse, key, incr )
    {
        var K = this.getKey ( STRING, key, true );
        if ( K instanceof ERROR ) return K;

        incr = parse ( incr );
        if ( incr instanceof ERROR ) return incr;
        var value = parse ( K.value.toString () || "0" );
        if ( value instanceof ERROR ) return value;

        value = ( value + incr ).toString ();
        var buf = new Buffer ( Buffer.byteLength ( value ) );
            buf.write ( value );

        K.value = value;
        this.upsetKey ( key, K );
        return value;
    },

    sFit : function ( key, length )
    {
        var K = this.getKey ( STRING, key, true );
        if ( K instanceof ERROR ) return ERROR;

        if ( K.value.length < length )
        {
            var buf = new Buffer ( length );
                buf.fill ( 0 );

            K.value.copy ( buf );
            K.value = buf;
        }

        return K;
    },

    SETBIT : function ( key, offset, state )
    {
        var offset = str2int ( offset );
        if ( !( offset > -1 ) ) return BAD_BIT1;
        var state = str2int ( state );
        if ( !( state === 0 || state === 1 ) ) return BAD_BIT2;

        var x = Math.floor ( offset / 8 );
        var K = this.sFit ( key, x + 1 );
        if ( K instanceof ERROR ) return K;

        var mask = 1 << ( 7 - ( offset % 8 ) );
        var current = K.value [ x ];
        var old = current & mask ? 1 : 0;

        if ( state && !old )
            K.value [ x ] = current | mask;
        else if ( !state && old )
            K.value [ x ] = current & ~mask;

        this.upsetKey ( key, K );
        return old;
    },

    SETRANGE : function ( key, offset, value )
    {
        var offset = str2int ( offset );
        if ( !( offset > -1 ) ) return BAD_BIT1;

        var K = this.sFit ( key, offset + Buffer.byteLength ( value ) );
        K.value.write ( value, offset );

        this.upsetKey ( key, K );
        return this.STRLEN ( key );
    },

        ////    String getters.

    GET : function ( key )
    {
        var K = this.getKey ( STRING, key );
        if ( K instanceof ERROR ) return K;
        return K ? K.value.toString () : null;
    },

    STRLEN : function ( key )
    {
        var K = this.getKey ( STRING, key );
        if ( K instanceof ERROR ) return ERROR;
        return K ? K.value.length : 0;
    },

    GETBIT : function ( key, offset )
    {
        var K = this.getKey ( STRING, key );
        if ( K instanceof ERROR ) return ERROR;

        var offset = str2int ( offset );
        if ( !( offset > -1 ) ) return BAD_BIT1;
        var x = Math.floor ( offset / 8 );
        if ( !K || K.length < x + 1 ) return 0;

        var mask = 1 << ( 7 - ( offset % 8 ) );
        return ( K.value [ x ] & mask ) ? 1 : 0;
    },

    GETRANGE : function ( key, start, stop )
    {
        var K = this.getKey ( STRING, key );
        if ( K instanceof ERROR ) return ERROR;
        if ( !K ) return "";

        var out = slice ( K.value, start, stop );
        if ( out instanceof ERROR ) return out;
        return out.toString ();
    },

        ////    String ops.

    APPEND : function ( key, value )
    {
        var strlen = this.STRLEN ( key );
        if ( strlen instanceof ERROR ) return strlen;
        return this.SETRANGE ( key, strlen.toString (), value );
    },

    DECR : function ( key )
    {
        return this.DECRBY ( key, "1" );
    },

    DECRBY : function ( key, decr )
    {
        var value = str2int ( decr );
        if ( value instanceof ERROR ) return value;
        return this.INCRBY ( key, ( - value ).toString () );
    },

    GETSET : function ( key, value )
    {
        var old = this.GET ( key );
        if ( old instanceof ERROR ) return old;
        this.SET ( key, value );
        return old;
    },

    INCR : function ( key )
    {
        return this.INCRBY ( key, "1" );
    },

    INCRBY : function ( key, incr )
    {
        return this.sIncrBy ( str2int, key, incr );
    },

    INCRBYFLOAT : function ( key, incr )
    {
        return this.sIncrBy ( str2float, key, incr );
    },

    MGET : function ()
    {
        var out = [], i, n = arguments.length;
        if ( !n ) return BAD_ARGS;

        for ( i = 0; i < n; i ++ )
        {
            var value = this.GET ( arguments [ i ] );
            out [ i ] = value instanceof ERROR ? null : value;
        }

        return out;
    },

    MSET : function ()
    {
        var key, value, i, n = arguments.length;
        if ( !n || n % 2 ) return BAD_ARGS;

        for ( i = 0; i < n; i += 2 )
        {
            key   = arguments [ i ];
            value = arguments [ i + 1 ];
            this.SET ( key, value );
        }

        return OK;
    },

    MSETNX : function ()
    {
        var i, n = arguments.length;
        for ( i = 0; i < n; i += 2 )
            if ( this.EXISTS ( arguments [ i ] ) ) return 0;

        this.MSET.apply ( this, arguments );
        return 1;
    },

    PSETEX : function ( key, timediff, value )
    {
        if ( !( str2int ( timediff ) > 0 ) )
            return BAD_SETEX;

        this.SET ( key, value );
        this.PEXPIRE ( key, timediff );
        return OK;
    },

    SETEX : function ( key, timediff, value )
    {
        if ( !( str2int ( timediff ) > 0 ) )
            return BAD_SETEX;

        this.SET ( key, value );
        this.EXPIRE ( key, timediff );
        return OK;
    },

    SETNX : function ( key, value )
    {
        if ( this.EXISTS ( key ) ) return 0;
        this.SET ( key, value );
        return 1;
    },



        ////    Lists, non-blocking.

    lStore : function ( key, values )
    {
            ////    Only used in SORT.

        if ( values.length )
            return this.setKey ( key, new LIST ( values ) );
        else
            return this.setKey ( key, null );
    },

    LINDEX : function ( key, index )
    {
        var K = this.getKey ( LIST, key );
        if ( K instanceof ERROR ) return K;

        index = str2int ( index );
        if ( index instanceof ERROR )
            return index;

        return ( K && K.value [ index < 0 ? K.value.length + index : index ] ) || null;
    },

    upsetList : function ( key, K )
    {
        if ( K.value.length ) this.upsetKey ( key, K );
        else this.setKey ( key, null );
    },

    LINSERT : function ( key, relpos, pivot, value )
    {
        var K = this.getKey ( LIST, key ), x;
        if ( K instanceof ERROR ) return K;

        relpos = relpos.toUpperCase ();
        if ( relpos !== 'BEFORE' && relpos !== 'AFTER' ) return BAD_SYNTAX;
        if ( !K ) return 0;
        if ( ( x = K.value.indexOf ( pivot ) ) < 0 ) return 0;

        K.value.splice ( relpos === 'AFTER' ? x + 1 : x, 0, value );
        this.upsetList ( key, K );
        return 1;
    },

    LLEN : function ( key )
    {
        var K = this.getKey ( LIST, key );
        if ( K instanceof ERROR ) return K;

        return ( K && K.value && K.value.length ) || 0;
    },

    lPopMany : function ( left, keys )
    {
        var K = [], value, i, n = keys.length;
        if ( !n ) return BAD_ARGS;
        for ( i = 0; i < n; i ++ )
        {
            K [ i ] = this.getKey ( LIST, keys [ i ] );
            if ( K [ i ] instanceof ERROR ) return K [ i ];
        }
        for ( i = 0; i < n; i ++ )
            if ( K [ i ] && K [ i ].value && K [ i ].value.length )
            {
                value = left ? K [ i ].value.shift () : K [ i ].value.pop ();
                this.upsetList ( keys [ i ], K [ i ] );
                return [ keys [ i ], value ];
            }

        return null;
    },

    lPop : function ( left, key )
    {
        var out = this.lPopMany ( left, [ key ] );
        return out && out.length ? out [ 1 ] : out;
    },

    LPOP : function ( key )
    {
        return this.lPop ( true, key );
    },

    RPOP : function ( key )
    {
        return this.lPop ( false, key );
    },

    lPush : function ( left, make, args )
    {
        var i, n = args.length, key = args [ 0 ];
        var K = this.getKey ( LIST, key, make );
        if ( K instanceof ERROR ) return K;
        if ( n < 2 ) return BAD_ARGS;
        if ( !K ) return 0;

        if ( left ) for ( i = 1; i < n; i ++ )
            K.value.unshift ( args [ i ] );
        else
            K.value.push.apply ( K.value, args.slice ( 1 ) );

        this.upsetList ( key, K );
        return K.value.length;
    },

    LPUSH : function ()
    {
        return this.lPush ( true, true, arr ( arguments ) );
    },

    LPUSHX : function ()
    {
        return this.lPush ( true, false, arr ( arguments )  );
    },

    RPUSH : function ()
    {
        return this.lPush ( false, true, arr ( arguments )  );
    },

    RPUSHX : function ()
    {
        return this.lPush ( false, false, arr ( arguments )  );
    },

    RPOPLPUSH : function ( source, destination )
    {
        var dest = this.getKey ( LIST, destination );
        if ( dest && dest instanceof ERROR ) return dest;
        var value = this.RPOP ( source );
        if ( value === null || value instanceof ERROR ) return value;

        var len = this.LPUSH ( destination, value );
        if ( !len || len instanceof ERROR ) throw new Error ( "WOOT! LPUSH failed in RPOPLPUSH." );

        return value;
    },

    LRANGE : function ( key, start, stop )
    {
        var K = this.getKey ( LIST, key );
        if ( K instanceof ERROR ) return K;
        if ( !K ) return [];

        return slice ( K.value, start, stop );
    },

    LREM : function ( key, count, value )
    {
        var K = this.getKey ( LIST, key );
        if ( K instanceof ERROR ) return K;
        var count = str2int ( count );
        if ( count instanceof ERROR ) return count;
        if( !K ) return 0;

        var i, n = K.value.length, x = 0;
        if ( count < 0 )
        {
            count *= -1;
            for ( i = n - 1; i >= 0; i -- )
                if ( K.value [ i ] === value && (!count || x < count) )
                {
                    K.value.splice ( i, 1 );
                    x ++;
                }
        }
        else for ( i = 0; i < n; i ++ )
            if ( K.value [ i ] === value && (!count || x < count) )
            {
                K.value.splice ( i, 1 );
                i --; n --; x ++;
            }

        if ( x > 0 ) this.upsetList ( key, K );
        return x;
    },

    LSET : function ( key, index, value )
    {
        var K = this.getKey ( LIST, key );
        if ( !K ) return BAD_KEY;
        if ( K instanceof ERROR ) return K;
        var index = str2int ( index );
        if ( index instanceof ERROR ) return index;
        if ( index < 0 || index > K.value.length ) return BAD_INDEX;

        K.value [ index ] = value;
        this.upsetList ( key, K );
        return OK;
    },

    LTRIM : function ( key, start, stop )
    {
        var range = this.LRANGE ( key, start, stop );
        if ( !range.join )
            return range;

        var K = this.getKey ( LIST, key );
        if ( K )
        {
            K.value = range;
            this.upsetList ( key, K );
        }

        return OK;
    },

        ////    Blocking list commands.
        ////        The blocking part happens at the connection level,
        ////            where in case the response is null the connection subscribes to the keyspace change event for the key and waits to retry.

        ////    So this only validates the parameter.

    bArgs : function ( args )
    {
        args = arr ( args );
        var timeout = str2int ( args.pop () || "FAIL" );
        if ( timeout instanceof ERROR ) return timeout;
        if ( timeout < 0 ) return BAD_INT;
        return args;
    },

    BLPOP : function ()
    {
        var a = this.bArgs ( arguments );
        if ( a instanceof ERROR ) return a;
        return this.lPopMany ( true, a );
    },

    BRPOP : function ()
    {
        var a = this.bArgs ( arguments );
        if ( a instanceof ERROR ) return a;
        return this.lPopMany ( false, a );
    },

    BRPOPLPUSH : function ()
    {
        var a = this.bArgs ( arguments );
        if ( a instanceof ERROR ) return a;
        return this.RPOPLPUSH.apply ( this, a );
    },



        ////    Hashes.

    structPut : function ( type, validate, revArgs, args )
    {
        var key = args [ 0 ], i, n = args.length, x = 0;

        if ( n < 3 || ( ( n - 1 ) % 2 ) ) return BAD_ARGS;
        var K = this.getKey ( type, key, true );
        if ( K instanceof ERROR ) return K;

        for ( i = 1; i < n; i += 2 )
        {
            var member = args [ revArgs ? i + 1 : i ],
                value = validate ( args [ revArgs ? i : i + 1 ] );
            if ( value instanceof ERROR ) return value;
            if ( !( member in K.value ) ) x ++;
            K.value [ member ] = value;
        }

        if ( x ) this.upsetKey ( key, K );
        return x;
    },

    structDel : function ( type, args )
    {
        var key = args [ 0 ],
            i, n = args.length,
            x;

        if ( n < 2 ) return BAD_ARGS;
        var K = this.getKey ( type, key );
        if ( K instanceof ERROR ) return K;
        if ( !K ) return 0;

        x = 0;
        for ( i = 1; i < n; i ++ )
        {
            if ( args [ i ] in K.value ) x ++;
            delete K.value [ args [ i ] ];
        }

            ////    Remove the set if empty, upset otherwise.

        var member;
        for ( member in K.value )
        {
            if ( x ) this.upsetKey ( key, K );
            return x;
        }

        this.setKey ( key, null );
        return x;
    },

    structGet : function ( type, key, member )
    {
        var K = this.getKey ( type, key );
        if ( K instanceof ERROR ) return K;
        if ( !K || !( member in K.value ) ) return null;
        return K.value [ member ];
    },

    HDEL : function ()
    {
        return this.structDel ( HASH, arguments );
    },

    HEXISTS : function ( key, field )
    {
        var fields = this.HKEYS ( key );
        if ( fields.indexOf ) return fields.indexOf ( field ) >= 0 ? 1 : 0;
        return fields;
    },

    HGET : function ( key, field )
    {
        return this.structGet ( HASH, key, field );
    },

    HGETALL : function ( key )
    {
        var fields = this.HKEYS ( key );
        var i, n = fields.length, out = [];
        for ( i = 0; i < n; i ++ )
            out.push ( fields [ i ], this.HGET ( key, fields [ i ] ) );

        return out;
    },

    hIncrBy : function ( parse, key, field, incr )
    {
        var K = this.getKey ( HASH, key, true );
        if ( K instanceof ERROR ) return K;

        incr = parse ( incr );
        if ( incr instanceof ERROR ) return incr;
        var value = parse ( K.value [ field ] || "0" );
        if ( value instanceof ERROR ) return value;

        K.value [ field ] = ( value + incr ).toString ();
        this.upsetKey ( key, K );
        return K.value [ field ];
    },

    HINCRBY : function ( key, field, incr )
    {
        return this.hIncrBy ( str2int, key, field, incr );
    },

    HINCRBYFLOAT : function ( key, field, incr )
    {
        return this.hIncrBy ( str2float, key, field, incr );
    },

    HKEYS : function ( key )
    {
        var K = this.getKey ( HASH, key );
        if ( K instanceof ERROR ) return K;

        var fields = [], field;
        if ( K ) for ( field in K.value )
            fields.push ( field );

        fields.sort ();
        return fields;
    },

    HLEN : function ( key )
    {
        var fields = this.HKEYS ( key );
        if ( fields.indexOf ) return fields.length;
        return fields;
    },

    HMGET : function ()
    {
        var K = this.getKey ( HASH, arguments [ 0 ] );
        if ( K instanceof ERROR ) return K;

        var i, n = arguments.length, values = [];
        if ( n < 2 ) return BAD_ARGS;
        for ( i = 1; i < n; i ++ )
            values.push ( K && arguments [ i ] in K.value ? K.value [ arguments [ i ] ] : null );

        return values;
    },

    HMSET : function ()
    {
        var x = this.structPut ( HASH, String, false, arguments );
        return x instanceof ERROR ? x : OK;
    },

    HSET : function ( key, field, value )
    {
        return this.structPut ( HASH, String, false, arguments );
    },

    HSETNX : function ( key, field, value )
    {
        var exists = this.HEXISTS ( key, field );
        if ( exists instanceof ERROR ) return exists;
        if ( exists ) return 0;
        return this.HSET ( key, field, value );
    },

    HVALS : function ( key )
    {
        var out = this.HKEYS ( key ), self = this;
        if ( out instanceof ERROR ) return out;

        if ( out.map )
            out = out.map ( function ( field )
            {
                return self.HGET ( key, field );
            });

        out.sort ();
        return out;
    },



        ////    Sets.

    SADD : function ()
    {
        var key  = arguments [ 0 ],
            i, n = arguments.length,
            x    = 0;

        if ( n < 2 ) return BAD_ARGS;
        var K = this.getKey ( SET, key, true );
        if ( K instanceof ERROR ) return K;

        for ( i = 1; i < n; i ++ )
            if ( !K.value [ arguments [ i ] ] )
            {
                K.value [ arguments [ i ] ] = true;
                x ++;
            }

        if ( x ) this.upsetKey ( key, K );
        return x;
    },

    SCARD : function ( key )
    {
        var members = this.SMEMBERS ( key );
        return members.join ? members.length : members;
    },

    SISMEMBER : function ( key, member )
    {
        var members = this.SMEMBERS ( key );
        return members.indexOf ? members.indexOf ( member ) >= 0 ? 1 : 0 : members;
    },

    SMEMBERS : function ( key )
    {
        return this.SUNION ( key );
    },

    SPOP : function ( key )
    {
        var member = this.SRANDMEMBER ( key );
        if ( typeof member === 'string' )
            this.SREM ( key, member );

        return member;
    },

    SRANDMEMBER : function ( key )
    {
        var members    = this.SMEMBERS ( key ),
            n = members.length, member;
        if ( !n )
            return n === 0 ? null : members;

        member = members [ Math.floor ( Math.random () * n ) ];
        return member;
    },

    SREM : function ()
    {
        return this.structDel ( SET, arguments );
    },

        ////    Set multikey ops.
        ////    Set members come out sorted lexicographically to facilitate testing.

    SMOVE : function ( source, destination, member )
    {
        var removed = this.SREM ( source, member );
        if ( removed === 1 )
            return this.SADD ( destination, member );
        else
            return removed;
    },

    SUNION : function ()
    {
        var i, n = arguments.length, out = [];
        if ( !n ) return BAD_ARGS;

        for ( i = 0; i < n; i ++ )
        {
            var K = this.getKey ( SET, arguments [ i ] );
            if ( K instanceof ERROR ) return K;

            var member;
            if ( K ) for ( member in K.value )
                if ( out.indexOf ( member ) < 0 )
                    out.push ( member );
        }

        out.sort ();
        return out;
    },

    sCombine : function ( diff, args )
    {
        var i, n = args.length;
        if ( !n )
            return BAD_ARGS;

        var out = this.SUNION ( args [ 0 ] );
        if ( out instanceof ERROR ) return out;
        for ( i = 1; i < n; i ++ )
        {
            var K = this.getKey ( SET, args [ i ] );
            if ( K instanceof ERROR ) return K;

            var j, m = out.length;
            if ( K ) for ( j = 0; j < m; j ++ )
                if ( ( diff && K.value [ out [ j ] ] ) || ( !diff && !K.value [ out [ j ] ] ) )
                {
                    out.splice ( j, 1 );
                    j --;
                    m --;
                }
        }

        out.sort ();
        return out;
    },

    SDIFF : function ()
    {
        return this.sCombine ( true, arr ( arguments ) );
    },

    SINTER : function ()
    {
        return this.sCombine ( false, arr ( arguments ) );
    },

    sStore : function ( key, members )
    {
        var K, i, n = members.length;
        if ( n ) K = new SET ({});
        for ( i = 0; i < n; i ++ )
            K.value [ members [ i ] ] = true;

        return this.setKey ( key, K || null );
    },

    sStoreOp : function ( op, args )
    {
        if ( !args.length )
            return BAD_ARGS;

        var key     = args.shift (),
            members = op.apply ( this, args );

        if ( members.join )
        {
            this.sStore ( key, members );
            return members.length;
        }

        return members;
    },

    SDIFFSTORE : function ()
    {
        return this.sStoreOp ( this.SDIFF, arr ( arguments ) );
    },

    SINTERSTORE : function ()
    {
        return this.sStoreOp ( this.SINTER, arr ( arguments ) );
    },

    SUNIONSTORE : function ()
    {
        return this.sStoreOp ( this.SUNION, arr ( arguments ) );
    },



        ////    Sorted sets.

    ZADD : function ()
    {
        return this.structPut ( ZSET, str2float, true, arguments );
    },

    ZCARD : function ( key )
    {
        return this.ZCOUNT ( key, '-inf', '+inf' );
    },

    ZCOUNT : function ( key, min, max )
    {
        var members = this.ZRANGEBYSCORE ( key, min, max );
        return members.join ? members.length : members;
    },

    ZINCRBY : function ( key, incr, member )
    {
        var K = this.getKey ( ZSET, key, true );
        if ( K instanceof ERROR ) return K;

        var value = str2float ( incr );
        if ( value instanceof ERROR ) return value;
        value += Number ( K.value [ member ] || 0 );

        K.value [ member ] = value;
        this.upsetKey ( key, K );
        return value;
    },

        ////    Sort set queries.

    zSort : function ( rev, key, min, max )
    {
        var K = this.getKey ( ZSET, key );
        if ( K instanceof ERROR ) return K;
        if ( !K ) return [];

        var R = range ( min, max ), member, out = [];
        if ( R instanceof ERROR ) return R;

        for ( member in K.value )
            if ( R ( K.value [ member ] ) )
                out.push ({ member : member, score : K.value [ member ] });

            ////    First by score,
            ////        then in lexicographic order.

        if ( rev )
            out.sort ( function ( b, a )
            {
                return ( a.score - b.score ) || ( a.member < b.member ? -1 : 1 );
            });

        else
            out.sort ( function ( a, b )
            {
                return ( a.score - b.score ) || ( a.member < b.member ? -1 : 1 );
            });

        return out;
    },

    zUnwrap : function ( range, scores )
    {
        var i, n = range.length, out = n ? [] : range;
        if ( n )
            for ( i = 0; i < n; i ++ )
            {
                out.push ( range [ i ].member );
                if ( scores )
                    out.push ( range [ i ].score );
            }

        return out;
    },

    zGetRange : function ( rev, args )
    {
        var key = args [ 0 ], start = args [ 1 ], stop = args [ 2 ], scores = args [ 3 ];

        if ( args.length < 3 || args.length > 4 )
            return BAD_ARGS;
        if ( scores && scores.toUpperCase () !== 'WITHSCORES' )
            return BAD_SYNTAX;

        var range = this.zSort ( rev, key, '-inf', '+inf' );

        return this.zUnwrap ( slice ( range, start, stop ), scores );
    },

    zGetRangeByScore : function ( rev, args )
    {
        var key = args [ 0 ], min = args [ rev ? 2 : 1 ], max = args [ rev ? 1 : 2 ],
            scores, limit, offset, count;

        if ( args.length < 3 )
            return BAD_ARGS;

        else if ( args.length === 4 )
            scores = args [ 3 ];

        else if ( args.length === 6 )
        {
            limit  = args [ 3 ];
            offset = args [ 4 ];
            count  = args [ 5 ];
        }

        else if ( args.length === 7 )
        {
            scores = args [ 3 ];
            limit  = args [ 4 ];
            offset = args [ 5 ];
            count  = args [ 6 ];
        }

        if ( scores && scores.toUpperCase () !== 'WITHSCORES' )
            return BAD_SYNTAX;
        if ( limit && limit.toUpperCase () !== 'LIMIT' )
            return BAD_SYNTAX;

        var range = this.zSort ( rev, key, min, max );
        if ( limit )
            range = slice ( range, offset, count, true );

        return this.zUnwrap ( range, scores );
    },

    ZRANGE : function ()
    {
        return this.zGetRange ( false, arr ( arguments ) );
    },

    ZREVRANGE : function ()
    {
        return this.zGetRange ( true, arr ( arguments ) );
    },

    ZRANGEBYSCORE : function ()
    {
        return this.zGetRangeByScore ( false, arr ( arguments ) );
    },

    ZREVRANGEBYSCORE : function ()
    {
        return this.zGetRangeByScore ( true, arr ( arguments ) );
    },

    ZRANK : function ( key, member )
    {
        var out = this.zSort ( false, key, '-inf', '+inf' ),
            i, n = out.length;

        for ( i = 0; i < n; i ++ )
            if ( out [ i ].member === member )
                return i;

        return n || n === 0 ? null : out;
    },

    ZREVRANK : function ( key, member )
    {
        var out = this.zSort ( false, key, '-inf', '+inf' ),
            i, n = out.length;

        for ( i = n - 1; i >= 0; i -- )
            if ( out [ i ].member === member )
                return n - i - 1;

        return n || n === 0 ? null : out;
    },

    ZSCORE : function ( key, member )
    {
        return this.structGet ( ZSET, key, member );
    },

    ZREM : function ()
    {
        return this.structDel ( ZSET, arguments );
    },

    ZREMRANGEBYRANK : function ( key, start, stop )
    {
        var members = this.ZRANGE ( key, start, stop ), n = members.length;
        if ( n )
            n = this.ZREM.apply ( this, [ key ].concat ( members ) );

        return n || n === 0 ? n : members;
    },

    ZREMRANGEBYSCORE : function ( key, min, max )
    {
        var members = this.ZRANGEBYSCORE ( key, min, max ), n = members.length;
        if ( n )
            n = this.ZREM.apply ( this, [ key ].concat ( members ) );

        return n || n === 0 ? n : members;
    },

        ////    Sorted set multikey ops.

    zOpStore : function ( union, key, keys, weights, aggregate )
    {
        var K = this.getKey ( ZSET, keys [ 0 ] );
        if ( K instanceof ERROR ) return K;

        var out = {}, member, x = 0, weight = ( weights === null ? 1 : weights [ 0 ] );
        if ( K ) for ( member in K.value )
        {
            out [ member ] = K.value [ member ] * weight;
            x ++;
        }

        var i, n = keys.length;
        for ( i = 1; i < n; i ++ )
        {
            K = this.getKey ( ZSET, keys [ i ] );
            if ( K instanceof ERROR ) return K;

            weight = ( weights !== null ? weights [ i ] : 1 );
            if ( !union )
            {
                if ( !K )
                {
                    out = {};
                    x = 0;
                }

                else for ( member in out ) if ( !( member in K.value ) )
                {
                    delete out [ member ];
                    x --;
                }
            }

            if ( K ) for ( member in K.value )
                if ( union || member in out )
                {
                    if ( !( member in out ) )
                    {
                        x ++;
                        out [ member ] = K.value [ member ] * weight;
                    }

                    else
                        out [ member ] = aggregate ( K.value [ member ] * weight, out [ member ] );
                }
        }

        if ( x ) this.setKey ( key, new ZSET ( out ) );
        return x;
    },

    zsum : function ( a, b ) { return a + b; },
    zmin : function ( a, b ) { return a < b ? a : b; },
    zmax : function ( a, b ) { return a > b ? a : b; },

    zParseOpStore : function ( union, args )
    {
        var key = args [ 0 ], N = str2int ( args [ 1 ] );
        if ( N instanceof ERROR ) return N;
        if ( N < 1 ) return BAD_ZUIS;
        if ( args.length < N + 2 ) return BAD_ARGS;

        var keys = args.splice ( 2, N ), weigh = ( args [ 2 ] || '' ).toUpperCase () === 'WEIGHTS', weights;
        if ( weigh )
        {
            if ( args.length < N + 3 ) return BAD_ARGS;
            weights = args.splice ( 3, N );
            if ( weights.map ( str2float ).some ( function ( w ) { return w instanceof ERROR; } ) ) return BAD_FLOAT;
            args.splice ( 2, 1 );
        }

        var aggregate = ( args [ 2 ] || '' ).toUpperCase () === 'AGGREGATE' ? ( args [ 3 ] || '' ).toLowerCase () : null;
        if ( aggregate )
        {
            if ( aggregate !== 'sum' && aggregate !== 'min' && aggregate !== 'max' ) return BAD_SYNTAX;
            aggregate = this [ 'z' + aggregate ];
            if ( typeof aggregate !== 'function' )
                throw new Error ( "WOOT! Can't find the aggregate function for " + args [ 3 ] );
            args.splice ( 2, 2 );
        }

        if ( args.length !== 2 )
            return BAD_ARGS;

        return this.zOpStore ( union, key, keys, weights || null, aggregate || this.zsum );
    },

    ZINTERSTORE : function ()
    {
        return this.zParseOpStore ( false, arr ( arguments ) );
    },

    ZUNIONSTORE : function ()
    {
        return this.zParseOpStore ( true, arr ( arguments ) );
    },



        ////    Sort.

    sortSelect : function ( pat, key )
    {
        var select = /^((?:.)*?)(?:->(.*))?$/.exec ( pat ),
            key    = select [ 1 ].replace ( /\*/, key ),    // no g flag, so only first occurence is replaced
            field  = select [ 2 ];

        if ( typeof field === 'string' )
            return this.HGET ( key, field );
        else
            return this.GET ( key );
    },

    SORT : function ()
    {
        var self = this, args = arr ( arguments ), n = args.length;
        if ( !n ) return new BAD_ARGS;

            ////    Parse.
            ////    SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]

        var key = args.shift (),
            by, limit, offset, count, get, pat, desc, alpha, store;

        if ( /^by$/i.test ( args [ 0 ] ) )
        {
            by = args [ 1 ];
            if ( typeof by !== 'string' ) return BAD_SYNTAX;
            args.splice ( 0, 2 );
        }

        if ( /^limit$/i.test ( args [ 0 ] ) )
        {
            limit  = true;
            if ( args.length < 3 ) return BAD_ARGS;
            offset = args [ 1 ]; // integer validation happens in slice()
            count  = args [ 2 ];
            args.splice ( 0, 3 );
        }

        while ( /^get$/i.test ( args [ 0 ] ) )
        {
            pat = args [ 1 ];
            if ( typeof pat !== 'string' ) return BAD_SYNTAX;
            if ( !get ) get = [];
            get.push ( pat );
            args.splice ( 0, 2 );
        }

        if ( /^asc|desc$/i.test ( args [ 0 ] ) )
        {
            desc = /^desc$/i.test ( args [ 0 ] );
            args.splice ( 0, 1 );
        }

        if ( /^alpha$/i.test ( args [ 0 ] ) )
        {
            alpha = true;
            args.splice ( 0, 1 );
        }

        if ( /^store$/i.test ( args [ 0 ] ) )
        {
            store = args [ 1 ];
            if ( typeof store !== 'string' ) return BAD_SYNTAX;
            args.splice ( 0, 2 );
        }

            ////    Redis appears to accept params in any order,
            ////        needs some tests before allowing this here.

        if ( args.length ) return BAD_SYNTAX;

            ////    Collect data.

        var type = this.TYPE ( key ), data, scoreFail = false;

        if ( type === NONE )
            data = [];
        else if ( type === LIST )
            data = this.LRANGE ( key, '0', '-1' );
        else if ( type === SET )
            data = this.SMEMBERS ( key );
        else if ( type === ZSET )
            data = this.ZRANGE ( key, '0', '-1' );
        else
            return BAD_TYPE;

        data = data.map ( function ( id )
        {
            var entry = { id : id };
            if ( by )
            {
                entry.by = self.sortSelect ( by, id );
                if ( !alpha )
                    entry.num = str2float ( entry.by || '0' );
            }
            else if ( !alpha )
                entry.num = str2float ( id );
            else
                entry.num = 0;

            if ( entry.num instanceof ERROR )
                scoreFail = true;

            if ( get )
                entry.get = get.map ( function ( get )
                {
                    if ( get === '#' ) return id;
                    return self.sortSelect ( get, id );
                });

            return entry;
        });

        if ( scoreFail ) return BAD_SORT;

            ////    Sort.

        data.sort ( function ( a, b )
        {
            var d = a.num - b.num;
            if ( !d && by ) d = a.by < b.by ? -1 : a.by > b.by ? 1 : 0;
            if ( !d ) d = a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
            return desc ? -d : d;
        });

            ////    Limit.

        if ( parseInt ( offset ) < 0 )
            offset = '0'; // SORT treats negative offset limit differently from other redis commands.

        if ( limit ) data = slice ( data, offset, count, true );

            ////    Format.

        var out = [], i;
        n = data.length;
        for ( i = 0; i < n; i ++ )
        {
            if ( get ) out.push.apply ( out, data [ i ].get );
            else out [ i ] = data [ i ].id;
        }

            ////    Store or return.

        if ( store )
        {
            this.lStore ( store, out );
            return this.LLEN ( store );
        }
        else
            return out;
    },



        ////    Pubsub.

    PUBLISH : function ( channel, message )
    {
        return this.pub ( channel, message );
    },



        ////    Connection.
        ////    Quit and select could be implemented on the connection object.

    PING : function ()
    {
        if ( arguments.length )
            return BAD_ARGS;

        return PONG;
    },

    ECHO : function ( message )
    {
        return message;
    },



        ////    Server.
        ////    FLUSHALL can be implemented on the connection object.

    DBSIZE : function ()
    {
        return this.getKeys ().length;
    },

    FLUSHDB : function ()
    {
        var keys = this.getKeys (), i, n = keys.length;
        for ( i = 0; i < n; i ++ )
            this.setKey ( keys [ i ], null );

        return OK;
    },

    TIME : function ()
    {
        var time = Date.now (),
            sec  = Math.round ( time / 1000 ),
            msec = ( time % 1000 ) * 1000 + Math.floor ( Math.random () * 1000 );

        return [ sec, msec ];
    },



        ////    Helper commands.
/*
    FAKE_MISS : function ()
    {
        var implemented = this;

        return require ( "../lib/commands" ).filter ( function ( command )
        {
            return !( command.toUpperCase () in implemented );
        });
    },

    FAKE_AVAIL : function ()
    {
        var implemented = this;

        return require ( "../lib/commands" ).filter ( function ( command )
        {
            return ( command.toUpperCase () in implemented );
        });
    },
*/
    FAKE_DUMP : function ( pattern )
    {
        var keys = this.KEYS ( pattern ), i, n = keys.length, out = [], key, type;

        for ( i = 0; i < n; i ++ )
        {
            key  = keys [ i ];
            type = this.TYPE ( key );
            out.push ( key, this.TTL ( key ), type.getStatus () );

            if ( type === STRING )
                out.push ( this.GET ( key ) );
            else if ( type === LIST )
                out.push ( this.LRANGE ( key, '0', '-1' ) );
            else if ( type === HASH )
                out.push ( this.HGETALL ( key ) );
            else if ( type === SET )
                out.push ( this.SMEMBERS ( key ) );
            else if ( type === ZSET )
                out.push ( this.ZRANGE ( key, '0', '-1', 'withscores' ) );
            else
                throw new Error ( "WOOT! Key type is " + type );
        }

        return out;
    }
};



    ////    These don't have an effect on the dataset, so dummies are safe for tests.

exports.Backend.prototype.AUTH =
exports.Backend.prototype.BGREWRITEAOF =
exports.Backend.prototype.SAVE =
exports.Backend.prototype.BGSAVE = function () { return OK; };



    ////    All of these are implemented at the connection level.

exports.Backend.prototype.QUIT =

exports.Backend.prototype.SUBSCRIBE =
exports.Backend.prototype.PSUBSCRIBE =
exports.Backend.prototype.UNSUBSCRIBE =
exports.Backend.prototype.PUNSUBSCRIBE =

exports.Backend.prototype.MULTI =
exports.Backend.prototype.EXEC =
exports.Backend.prototype.WATCH =
exports.Backend.prototype.UNWATCH =
exports.Backend.prototype.SELECT =
exports.Backend.prototype.DISCARD = function () { throw new Error ( "WOOT! This command shouldn't have reached the backend." ); };



