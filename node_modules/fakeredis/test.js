"use strict";

var fake        = require ( "./main" ),

    OK          = "OK",
    PONG        = "PONG",

    BAD_ARGS    = "wrong number of arguments",
    BAD_TYPE    = "Operation against a key holding the wrong kind of value",
    BAD_INT     = "value is not an integer or out of range",
    BAD_FLOAT   = "value is not a valid float",
    BAD_SYNTAX  = "syntax error",
    BAD_INDEX   = "index out of range",
    BAD_DB      = "invalid DB index",
    BAD_SETEX   = "invalid expire time in SETEX",
    BAD_SORT    = "One or more scores can't be converted into double";



    ////    So lets go.

process.stdout.write ( 'testing fakeredis ...\n\n' );



    ////    Keys and strings.

( function ()
{
    var redis  = fake.createClient ( "stuff" ),
        redis2 = fake.createClient ( "stuff" );

    redis.AUTH ( "password", test ( "AUTH", null, "OK" ) );

    redis.SET ( "hello", "world", test ( "SET", null, OK ) );
    redis.GET ( "hello", test ( "SET / GET", null, "world" ) );

    redis.SET ( "what", "who" );
    redis.GETSET ( "what", "where", test ( "GETSET", null, "who" ) );
    redis.MGET ( "hello", "nonex", "what", test ( "MGET", null, [ "world", null, "where" ] ) );
    redis.DEL ( "hello", "nonex", "what", test ( "DEL count", null, 2 ) );
    redis.GET ( "hello", test ( "SET / DEL / GET", null, null ) );

    redis.SET ( "hello", "vmvl" );
    redis.GETBIT ( "hello", 7, test ( "GETBIT", null, 0 ) );
    redis.GETBIT ( "hello", 14, test ( "GETBIT", null, 0 ) );
    redis.GETBIT ( "hello", 21, test ( "GETBIT", null, 1 ) );
    redis.SETBIT ( "hello", 7, 1, test ( "SETBIT", null, 0 ) );
    redis.SETBIT ( "hello", 14, 1, test ( "SETBIT", null, 0 ) );
    redis.SETBIT ( "hello", 21, 0, test ( "GETBIT", null, 1 ) );
    redis.GETBIT ( "hello", 7, test ( "GETBIT", null, 1 ) );
    redis.GETBIT ( "hello", 14, test ( "GETBIT", null, 1 ) );
    redis.GETBIT ( "hello", 21, test ( "GETBIT", null, 0 ) );

    redis.STRLEN ( "hello", test ( "STRLEN", null, 4 ) );
    redis.SETBIT ( "hello", 33, 1 );
    redis.SETBIT ( "hello", 34, 1 );
    redis.SETBIT ( "hello", 37, 1 );
    redis.STRLEN ( "hello", test ( "SETBIT refits buffer", null, 5 ) );
    redis.GET ( "hello", test ( "SETBIT char from bits", null, "world" ) );

    redis.SETRANGE ( "hi", 0, "Hello World", test ( "SETRANGE upsert", null, 11 ) );
    redis.GET ( "hi", test ( "SETRANGE", null, "Hello World" ) );
    redis.GETRANGE ( "hi", -5, -1, test ( "GETRANGE negneg", null, "World" ) );
    redis.SETRANGE ( "hi", 6, "Redis", test ( "SETRANGE offset", null, 11 ) );
    redis.GET ( "hi", test ( "SETRANGE", null, "Hello Redis" ) );

    redis.EXPIRE ( "hello", 15 );
    redis.DECR ( "hello", test ( "SET / DECR", BAD_INT, null ) );
    redis.TTL ( "hello", test ( "EXPIRE / TTL", null, 15 ) );
    redis.PERSIST ( "hello" );
    redis.send_command ( "pttl", [ "hello" ], test ( "PERSIST / PTTL", null, -1 ) );
    redis.send_command ( "pexpireat", [ "hello", Date.now () + 250 ] );
    redis.MSETNX ( "somekey", "someval", "hello", "non-world", test ( "MSETNX is safe", null, 0 ) );
    redis.GET ( "hello", test ( "GET expiring", null, "world" ) );
    redis.APPEND ( "hello", " of mine", test ( "APPEND upset", null, ( "world of mine" ).length ) );
    redis.INCR ( "hello", test ( "INCR upset", BAD_INT, null ) );
    redis.DECRBY ( "nonx", 5, test ( "DECR nonexist", null, -5 ) );

    redis.SETEX ( "nonx", 0, "hello", test ( "SETEX fail", BAD_SETEX, null ) );
    redis.SETNX ( "nonx", "dont!", test ( "SETNX fail", null, 0 ) );
    redis.MSET ( "nonx", "do", test ( "MSET", null, OK ) );
    redis.send_command ( "psetex", [ "nonx", 1000, "disappear" ], test ( "PSETEX", null, OK ) );
    redis.GET ( "nonx", test ( "PSETEX set", null, "disappear" ) );
    redis.TTL ( "nonx", test ( "PSETEX expire", null, 1 ) );
    redis.GETSET ( "nonx", "stay" );
    redis.TTL ( "nonx", test ( "GETSET persists", null, -1 ) );
    redis.DEL ( "nonx" );



        ////    Sets.

    redis.SADD ( "hello", "kuku", "buku", test ( "SADD typerror", BAD_TYPE, null ) );
    redis.SADD ( "myset", [ "ala", "bala" ], test ( "SADD multiarg", null, 2 ) );
    redis.SADD ( "myset", "niza", "bala", test ( "SADD delta", null, 1 ) );
    redis.SCARD ( "hello", test ( "SCARD typerror", BAD_TYPE, null ) );
    redis.SCARD ( "myset", test ( "SCARD", null, 3 ) );
    redis.SADD ( "set2", 1, 2, 3, 4, 5 );
    redis.SADD ( "set3", "xxx", "zzz", "yyy" );
    redis.SUNIONSTORE ( "output", [ "nonex1", "myset", "set2", "set3", "nonex2" ], test ( "SUNIONSTORE", null, 11 ) );
    redis.SISMEMBER ( "output", "xxx", test ( "SISMEMBER union 3 sets", null, 1 ) );
    redis.SINTER ( "myset", "output", test ( "SINTER", null, [ "ala", "bala", "niza" ] ) );
    redis.SADD ( "set3", "ala", 3, 4, "kukukuku" );
    redis.SDIFFSTORE ( "output", "output", "set3", test ( "SDIFFSTORE", null, 5 ) );
    redis.SMEMBERS ( "output", test ( "SMEMBERS", null, [ "1", "2", "5", "bala", "niza" ] ) );
    redis.SISMEMBER ( "output", "bala", test ( "SISMEMBER yes", null, 1 ) );
    redis.SISMEMBER ( "output", "what", test ( "SISMEMBER no", null, 0 ) );
    redis.SISMEMBER ( "nonex", "what", test ( "SISMEMBER nonex", null, 0 ) );
    redis.SISMEMBER ( "hello", "what", test ( "SISMEMBER bad", BAD_TYPE, null ) );

    redis.SADD ( "otherset", "whatever" );
    redis.SINTERSTORE ( "nothing", "otherset", "output", test ( "SINTERSTORE empty out", null, 0 ) );
    redis.TYPE ( "nothing", test ( "SINTERSTORE empty out / TYPE", null, "none" ) );

    redis.DEL ( "set3" );
    redis.SPOP ( "set3", test ( "SPOP nothing", null, null ) );
    redis.SINTER ( "output", function ( err, members )
    {
        redis.SPOP ( "output", function ( err, member )
        {
            member = member ? member.toString () : "!?@#?!@?#";

            var expected = members
                .map ( function ( entry ) { return entry.toString (); } )
                .filter ( function ( entry ) { return entry !== member; } );

            redis2.SDIFF ( "output", test ( "SPOP ( client 2 )", null, expected ) );
        });
    });



        ////    Sorted sets.

    redis.ZADD ( "myzset", [ 1, "one", 2, "two", 3, "three" ], test ( "ZADD", null, 3 ) );
    redis.ZCARD ( "myzset", test ( "ZCARD", null, 3 ) );
    redis.ZCARD ( "whatwhat", test ( "ZCARD nonex", null, 0 ) );
    redis.ZCARD ( "myset", test ( "ZCARD bad", BAD_TYPE, null ) );
    redis.ZRANGE ( "myzset", 1, -1, test ( "ZRANGE pos neg", null, [ "two", "three" ] ) );
    redis.ZRANGE ( "myzset", 0, 1, test ( "ZRANGE pos pos", null, [ "one", "two" ] ) );
    redis.ZRANGE ( "myzset", 1, -2, test ( "ZRANGE pos=neg", null, [ "two" ] ) );
    redis.ZRANGE ( "myzset", -1, 1, test ( "ZRANGE null", null, [] ) );
    redis.ZRANGE ( "myzset", "-inf", "+inf", test ( "ZRANGE int", BAD_INT, null ) );
    redis.ZREVRANGEBYSCORE ( "myzset", "+inf", "-inf", test ( "ZREVRANGEBYSCORE all", null, [ "three", "two", "one" ] ) );
    redis.ZREVRANGEBYSCORE ( "myzset", 2, 1, test ( "ZREVRANGEBYSCORE incl", null, [ "two", "one" ] ) );
    redis.ZREVRANGEBYSCORE ( "myzset", 2, "(1", test ( "ZREVRANGEBYSCORE soso", null, [ "two" ] ) );
    redis.ZREVRANGEBYSCORE ( "myzset", "(2", "(1", test ( "ZREVRANGEBYSCORE excl", null, [] ) );
    redis.ZADD ( "myzset", 1.5, "one.five" );
    redis.ZRANGEBYSCORE ( "myzset", "-inf", "+inf", "WITHSCORES", "LIMIT", 1, 2, test ( "ZREVRANGEBYSCORE limit", null, [ "one.five", "1.5", "two", "2" ] ) );

        ////    Negative offset behaves differently here and in SORT

    redis.ZRANGEBYSCORE ( "myzset", "-inf", "+inf", "WITHSCORES", "LIMIT", -1, 2, test ( "ZREVRANGEBYSCORE limit +negoffset", null, [] ) );
    redis.ZRANGEBYSCORE ( "myzset", "-inf", "+inf", "WITHSCORES", "LIMIT", 1, -11, test ( "ZREVRANGEBYSCORE limit +negcount", null, [ "one.five", "1.5", "two", "2", "three", "3" ] ) );

    redis.ZCOUNT ( "myzset", "(1", 2, test ( "ZCOUNT", null, 2 ) );
    redis.SET ( "wrong", "indeed" );
    redis.ZREMRANGEBYRANK ( "wrong", 0, -1, test ( "ZREMRANGEBYRANK badkey", BAD_TYPE, null ) );
    redis.ZREMRANGEBYSCORE ( "myzset", "(1", "2", test ( "ZREMRANGEBYSCORE", null, 2 ) );
    redis.ZRANGE ( "myzset", "0", "-1", test ( "ZREMRANGEBYSCORE / ZRANGE", null, [ "one", "three" ] ) );
    redis.ZADD ( "myzset", 1.9, "goner1", 2.1, "goner2" );
    redis.ZREMRANGEBYRANK ( "myzset", 1, 2, test ( "ZREMRANGEBYRANK", null, 2 ) );
    redis.ZRANGE ( "myzset", "0", "-1", test ( "ZREMRANGEBYRANK / ZRANGE", null, [ "one", "three" ] ) );
    redis.ZADD ( "myzset", "2", "one", test ( "ZADD not adding", null, 0 ) );
    redis.ZADD ( "myzset", "", "one", test ( "ZADD bad score", BAD_FLOAT, null ) );
    redis.ZADD ( "myzset", "2", "two" );
    redis.ZINCRBY ( "myzset", 2, "one", test ( "ZINCRBY", null, 4 ) );
    redis.ZREVRANGE ( "myzset", 0, -1, "WITHSCORES", test ( "ZREVRANGE", null, [ "one", "4", "three", "3", "two", "2" ] ) );
    redis.ZSCORE ( "myzset", "three", test ( "ZSCORE", null, 3 ) );
    redis.ZADD ( "myzset", 1.5, "one.five" );
    redis.ZRANK ( "myzset", "three", test ( "ZRANK", null, 2 ) );
    redis.ZREVRANK ( "myzset", "three", test ( "ZREVRANK", null, 1 ) );

    redis.ZADD ( "zset1", 1, "one", 2, "two" );
    redis.ZADD ( "zset2", 1, "one", 2, "two", 3, "three" );
    redis.ZINTERSTORE ( "out", 2, "zset1", "zset2", "weights", 2, 3, test ( "ZINTERSTORE no aggregate", null, 2 ) );
    redis.ZRANGE ( "out", 0, -1, "WITHSCORES", test ( "ZINTERSTORE / ZRANGE", null, [ "one", "5", "two", "10" ] ) );

    redis.ZUNIONSTORE
    (
        "out", /* 4, */ "nonex", "zset1", "zset2", "out", "weights", 10, 1, 2, 0.5, "aggregate", "max",
        test ( "ZUNIONSTORE missing keycount", BAD_INT, null )
    );
    redis.ZUNIONSTORE
    (
        "out", 4, "nonex", "zset1", "zset2", "out", "weights", 10, 1, 2, /* .5, */ "aggregate", "max",
        test ( "ZUNIONSTORE bad weight count (less)", BAD_FLOAT, null )
    );
    redis.ZUNIONSTORE
    (
        "out", 4, "nonex", "zset1", "zset2", "out", "weights", 10, 1, 2, 0.5, 10, "aggregate", "max",
        test ( "ZUNIONSTORE bad weight count (more)", BAD_ARGS, null )
    );
    redis.ZUNIONSTORE
    (
        "out", 4, "nonex", "zset1", "zset2", "out", "weights", 10, 1, 2, 0.5, "aggregate", /* "max", */
        test ( "ZUNIONSTORE missing aggregate", BAD_ARGS, null )
    );
    redis.ZUNIONSTORE
    (
        "out", 4, "nonex", "zset1", "zset2", "out", /* "weights", */ 10, 1, 2, 0.5, "aggregate", "max",
        test ( "ZUNIONSTORE missing weight keyword", BAD_ARGS, null )
    );

    redis.ZUNIONSTORE
    (
        "out2", 2, "zset1", "zset2",
        test ( "ZUNIONSTORE naked", null, 3 )
    );
    redis.ZRANGE ( "out2", 0, -1, "WITHSCORES", test ( "ZUNIONSTORE naked / ZRANGE", null, [ "one", "2", "three", "3", "two", "4" ] ) );

    redis.ZUNIONSTORE
    (
        "out2", 2, "zset1", "zset2", "aggregate", "min",
        test ( "ZUNIONSTORE with aggregate", null, 3 )
    );
    redis.ZRANGE ( "out2", 0, -1, "WITHSCORES", test ( "ZUNIONSTORE with aggregate / ZRANGE", null, [ "one", "1", "two", "2", "three", "3" ] ) );

    redis.ZUNIONSTORE
    (
        "out", 4, "nonex", "zset1", "zset2", "out", "weights", 10, 1, 2, .5, "aggregate", "max",
        test ( "ZUNIONSTORE with weights + aggregate", null, 3 )
    );
    redis.ZRANGE ( "out", 0, -1, "WITHSCORES", test ( "ZUNIONSTORE / ZRANGE", null, [ "one", "2.5", "two", "5", "three", "6" ] ) );

    redis.KEYS ( "*z?et*", test ( "KEYS with ? and *", null, [ "myzset", "zset1", "zset2" ] ) );
    redis.KEYS ( "my[sz]*et", test ( "KEYS with [] and *", null, [ "myset", "myzset" ] ) );
    redis.KEYS ( "my[sz]{2}et", test ( "REGEXP escaping", null, [] ) );
    redis.TYPE ( "myset", test ( "TYPE", null, "set" ) );

    redis.EXPIRE ( "out", 60 );
    redis.RENAME ( "out", "outandabout", test ( "RENAME", null, OK ) );
    redis.ZADD ( "outandabout", 0, "zero", test ( "ZADD zero", null, 1 ) );
    redis.TTL ( "outandabout", test ( "RENAME / ZADD / TTL", null, 60 ) );
    redis.EXISTS ( "out", test ( "EXISTS no", null, 0 ) );
    redis.EXISTS ( "outandabout", test ( "EXISTS yes", null, 1 ) );

    redis.ZADD ( "lexi", 1, "AAA", 1, "BBB", 1, "ZZZ", 1, "XXX", 1, "YYY", 2, "FFF" );
    redis.ZRANGE ( "lexi", 0, -1, test ( "lexicographic zset member sort", null, [ "AAA", "BBB", "XXX", "YYY", "ZZZ", "FFF" ] ) );
    redis.ZREVRANGE ( "lexi", 0, -1, test ( "lexicographic zset member sort", null, [ "FFF", "ZZZ", "YYY", "XXX", "BBB", "AAA" ] ) );

    redis.ZADD ( "otherzset", 100, "whatever" );
    redis.ZINTERSTORE ( "nothing", 2, "lexi", "otherzset", test ( "ZINTERSTORE empty out", null, 0 ) );
    redis.TYPE ( "nothing", test ( "ZINTERSTORE empty out / TYPE", null, "none" ) );



        ////    Hashes.

    redis.HGETALL ( "nonex", test ( "HGETALL nonex", null, null ) );

    redis.HMSET ( "h", { "f1" : "v1", "field-3" : "3" }, test ( "HMSET {} ok", null, OK ) );
    redis.HMSET ( "h", "f2", "v2", "field-4", 4, test ( "HMSET ... ok", null, OK ) );

    redis.HSETNX ( "h", "f1", "V1", test ( "HSETNX safe", null, 0 ) );
    redis.HSETNX ( "h", "F1", "V1", test ( "HSETNX", null, 1 ) );
    redis.HGETALL ( "h", test ( "HGETALL", null, { "F1": "V1", "f1": "v1", "f2": "v2", "field-3": "3", "field-4": "4" } ) );

    redis.getKeyspace ( "*h", test ( "getKeyspace() with pattern", null, [ "h", "-1", "hash", [ "F1", "V1", "f1", "v1", "f2", "v2", "field-3", "3", "field-4", "4" ] ] ) );

    redis.HKEYS ( "h", test ( "HKEYS", null, [ "F1", "f1", "f2", "field-3", "field-4" ] ) );
    redis.send_command ( "HINCRBYFLOAT", [ "h", "f1", 3.5 ], test ( "HINCRBYFLOAT fail", BAD_FLOAT, null ) );
    redis.HINCRBY ( "h", "field-3", 3, test ( "HINCRBYFLOAT success", null, 6 ) );
    redis.HVALS ( "h", test ( "HVALS", null, [ "4", "6", "V1", "v1", "v2" ] ) );
    redis.HMGET ( "h", "F1", "f1", "f2", test ( "HMGET", null, [ "V1", "v1", "v2" ] ) );
    redis.HGETALL ( "h", function ( err, data )
    {
        redis.multi ()
            .HGETALL ( "h", test ( "HGETALL multi/exec sugar", err, data ) )
                .exec ( test ( "HGETALL multi/exec replies sugar", err, [ data ] ) );

        redis.HDEL ( "h", "field-3", "F1", "F2", test ( "HDEL", null, 2 ) );
        redis.TYPE ( "h", test ( "TYPE hash", null, "hash" ) );
        redis.HDEL ( "h", "field-4", "f1", "f2" );
        redis.TYPE ( "h", test ( "TYPE none", null, "none" ) );
    });

    redis.HDEL( 'hnonex', 'moot', test( "HDEL nonex", null, 0 ) );
    redis.HSET( 'w00t', 'field', 'value', function( err, ok ) {
        redis.HDEL( 'w00t', 'moot', test( "HDEL nonex field", null, 0 ) );
    });




        ////    Lists, non-blocking.

    redis.LPUSH ( "list", [ "one", "two", "three" ], test ( "LPUSH", null, 3 ) );
    redis.LPOP ( "list", test ( "RPOP", null, "three" ) );
    redis.LRANGE ( "list", 0, -1, test ( "LRANGE all posneg", null, [ "two", "one" ] ) );
    redis.LSET ( "list", 1, "what", test ( "LSET", null, OK ) );
    redis.LSET ( "list", 4, "what", test ( "LSET out of range", BAD_INDEX, null ) );
    redis.LTRIM ( "list", 1, -1, test ( "LTRIM posneg", null, OK ) );
    redis.RPOPLPUSH ( "nonexl", "newlist", test ( "RPOPLPUSH nonex", null, null ) );
    redis.TYPE ( "newlist", test ( "RPOPLPUSH nonex safe", null, "none" ) );
    redis.RPOPLPUSH ( "list", "newlist", test ( "RPOPLPUSH", null, "what" ) );
    redis.LPUSHX ( "nonex", "where", "why", test ( "LPUSHX nonex", null, 0 ) );
    redis.RPUSHX ( "newlist", "where", "why", test ( "RPUSHX", null, 3 ) );
    redis.RPUSH ( "list3", "one", "two", "three", test ( "RPUSH", null, 3 ) );
    redis.LTRIM ( "list3", -3, -1, test ( "LTRIM negneg", null, OK ) );
    redis.LLEN ( "list3", test ( "LLEN", null, 3 ) );
    redis.LINDEX ( "list3", 2, test ( "LINDEX posyes", null, "three" ) );
    redis.LINDEX ( "list3", -3, test ( "LINDEX negyes", null, "one" ) );
    redis.LINDEX ( "list3", 3, test ( "LINDEX negno", null, null ) );
    redis.LINDEX ( "list3", -4, test ( "LINDEX negno", null, null ) );
    redis.LINDEX ( "nonex", 0, test ( "LINDEX badkey", null, null ) );
    redis.LINDEX ( "hello", 0, test ( "LINDEX badkey", BAD_TYPE, null ) );
    redis.LRANGE ( "list3", -3, 2, test ( "LRANGE all negpos", null, [ "one", "two", "three" ] ) );
    redis.LRANGE ( "list3", -5, 0, test ( "LRANGE lo2lo", null, [ "one" ] ) );
    redis.LRANGE ( "list3", 2, 10, test ( "LRANGE hi2hi", null, [ "three" ] ) );
    redis.LPUSH ( "list3", "three", "what", "what" );
    redis.LREM ( "list3", 1, "one", test ( "LREM left", null, 1 ) );
    redis.LREM ( "list3", -1, "three", test ( "LREM right", null, 1 ) );
    redis.LREM ( "list3", -2, "what", test ( "LREM 2right", null, 2 ) );

    redis.getKeyspace ( "*list*", test ( "lists outcome", null, [ "list3", "-1", "list", [ "three", "two" ], "newlist", "-1", "list", [ "what", "where", "why" ] ] ) );

    redis.LREM( "lnonex", 1, "what", test( "LREM nonex", null, 0 ) );

    redis.LPUSH("lremlist", "a", "b", "b", "a", "b", "b", test("LPUSH", null, 6));
    redis.LREM("lremlist", 0, "a", test("LREM 0", null, 2));
    redis.LLEN("lremlist", test("LLEN", null, 4));
    redis.LREM("lremlist", 0, "b", test("LREM 0", null, 4));
    redis.LLEN("lremlist", test("LLEN empty", null, 0));



        ////    Blocking list commands !

    redis.BLPOP ( "BL-a", "BL-b", "BL-c", 0, test ( "BLPOP", null, [ "BL-a", "AAA" ] ) );

    redis2.LPUSH ( "BL-a", "AAA", test ( "LPUSH + BLPOP", null, 1 ) );
    redis2.BRPOP ( "BL-b", "BL-c", 0, test ( "BRPOP", null, [ "BL-b", "BB3" ] ) );

    redis.RPUSH ( "BL-b", "BB1", "BB2", "BB3", test ( "RPUSH + BRPOP", null, 3 ) );
    redis.BLPOP ( "BL-a", "BL-c", 0, test ( "BLPOP", null, [ "BL-c", "CC1" ] ) );

    redis2.RPUSH ( "BL-c", "CC1", "CC2", "CC3", test ( "RPUSH + BLPOP", null, 3 ) );

    redis.getKeyspace ( "BL-?", test ( "blocking lists outcome", null, [ "BL-b", "-1", "list", [ "BB1", "BB2" ], "BL-c", "-1", "list", [ "CC2", "CC3" ] ] ) );



        ////    Misc stuff.

    redis.ECHO ( "hello world!", test ( "ECHO", null, "hello world!" ) );
    redis.PING ( test ( "PING", null, "PONG" ) );

    redis.SAVE ( test ( "SAVE", null, "OK" ) );
    redis.BGSAVE ( test ( "BGSAVE", null, "OK" ) );
    redis.BGREWRITEAOF ( test ( "BGREWRITEAOF", null, "OK" ) );



        ////    Expiry and flush.

    setTimeout
    (
        function ()
        {
            redis.GET ( "hello", test ( "GET expired", null, null ) );

            // redis.pretty ();

            redis.FLUSHDB ();
            redis.GETSET ( "hello", "world", test ( "GETSET null", null, null ) );
            redis.getKeyspace ( test ( "getKeyspace() flushed, nopat", null, [ "hello", "-1", "string", "world" ] ) );
        },
        1000
    );
}
() );



    ////    Transactions.

( function ()
{
    var multi,
        redis  = fake.createClient ( "transactions-1" ),
        redis2 = fake.createClient ( "transactions-1" );

    redis.SET ( "abc", "dfg" );
    redis.SET ( "what", "who" );
    redis.WATCH ( "why", "what", "abc" );
    multi = redis.MULTI ();
    redis.GET ( "abc", function ()
    {
        redis2.SET ( "abc", "dfgdfg", function ()
        {
            multi.SET ( "abc", "dfggfd", test ( "SET discarded", null, null ) );
            multi.exec ();

            redis.GET ( "abc", test ( "invalidated transaction", null, "dfgdfg" ) );
        });
    });
}
() );

( function ()
{
    var multi,
        redis  = fake.createClient ( "transactions-1" ),
        redis2 = fake.createClient ( "transactions-1" );

    redis.SET ( "abc", "dfg" );
    redis.SET ( "what", "who" );
    redis.WATCH ( "why", "what", "abc" );
    multi = redis.MULTI ();
    redis.GET ( "abc", function ()
    {
        redis2.SET ( "abc", "dfgdfg", function ()
        {
            multi.SET ( "abc", "dfggfd", test ( "SET discarded", null, null ) );
            multi.exec ();

            redis.GET ( "abc", test ( "invalidated transaction", null, "dfgdfg" ) );
        });
    });
}
() );

( function ()
{
    var multi,
        redis  = fake.createClient ( "transactions-2" ),
        redis2 = fake.createClient ( "transactions-2" );

    redis.SET ( "abc", "dfg" );
    redis.SET ( "what", "who" );
    redis.WATCH ( "why", "what", "abc" );
    multi = redis.MULTI ();
    redis.GET ( "abc", function ()
    {
        redis2.SET ( "abc", "dfgdfg", function ()
        {
            redis.UNWATCH ();
            multi.SET ( "abc", "dfggfd", test ( "SET discarded", null, OK ) );
            multi.STRLEN ( "abc", test ( "STRLEN", null, 6 ) );
            multi.exec ();

            redis.GET ( "abc", test ( "unwatched succeeds", null, "dfggfd" ) );
        });
    });
}
() );

( function ()
{
    var client = fake.createClient (), set_size = 1000;

    client.sadd("bigset", "a member");
    client.sadd("bigset", "another member");

    while (set_size > 0) {
        client.sadd("bigset", "member " + set_size);
        set_size -= 1;
    }

    client.multi()
        .scard("bigset")
        .sadd("set2","m1","m2")
        .keys("*")
        .smembers("set2")
        .srem("set2","m3","m2","m1")
        .dbsize( test ( "DBSIZE", null, 1 ) )
        .exec( test ( "multi chain with an individual callback", null, [ 1002, 2, [ "bigset", "set2" ], [ "m1", "m2" ], 2, 1 ] ) );
}
() );



    ////    Pub / Sub.

( function ()
{
    var pub  = fake.createClient ( "pubsub-1" ),
        sub1 = fake.createClient ( "pubsub-1" ),
        sub2 = fake.createClient ( "pubsub-1" ),
        sub3 = fake.createClient ( "pubsub-1" ),

        data = [ 0, [], [], [] ],
        tcb1 = test ( "PUBSUB basics", null, [ 4, [ 'mych-alpha', 'mych-beta', 'mych-omega' ], [ 'mych-alpha', 'mych-beta' ], [ 'mych-alpha', 'mych-beta', 'what-what', 'mych-omega' ] ] ),

        ord  = [],
        tcb2 = test ( "PUBSUB normal / sequence", null, [ 1, '*ch', 'pun', 1 ] ),

        thr  = test ( "Pubsub mode", null, true ),
        pun  = test ( "PUNSUBSCRIBE", null, "*ch" );

    sub2.SADD ( "testset", "testmem", function ( err, data )
    {
        ord.push ( data );
    });

    sub1.SUBSCRIBE ( "mych" );
    sub2.PSUBSCRIBE ( "*ch" );
    sub3.PSUBSCRIBE ( "my*", "what" );

    try
    {
        sub3.PUBLISH ( 'fail', 'fail' );
        thr ( null, false );
    }
    catch ( e )
    {
        thr ( null, true );
    }

    sub1.on ( 'message', function ( channel, message )
    {
        data [ 1 ].push ( channel + '-' + message );

        if ( message === 'alpha' )
            pub.PUBLISH ( 'mych', 'beta', test ( 'PUB2', null, 3 ) );
    });

    sub2.on ( 'pmessage', function ( pattern, channel, message )
    {
        data [ 2 ].push ( channel + '-' + message );

        if ( message === 'beta' )
        {
            pub.PUBLISH ( 'ignore', 'ignored', test ( 'PUB3 ignored', null, 0 ) );
            pub.PUBLISH ( 'what', 'what', test ( 'PUB3 delivered', null, 1 ) );
            sub2.PUNSUBSCRIBE ( 'hello', 'world', '*ch' );
        }
    });

    sub2.on ( 'punsubscribe', function ( pattern )
    {
        pun ( null, pattern );

        ord.push ( 'pun' );

        sub2.SREM ( 'testset', 'testmem', function ( err, data )
        {
            ord.push ( data );
        });

        sub2.PUBLISH ( 'hello', 'world', test ( 'PUB4 ignored', null, 0 ) );
        sub2.PUBLISH ( 'mych', 'omega', test ( 'PUB5 unsubed', null, 2 ) );
    });

    sub3.on ( 'pmessage', function ( pattern, channel, message )
    {
        data [ 3 ].push ( channel + '-' + message );
    });

    var start = function ( ch )
    {
        data [ 0 ] ++;
        if ( data [ 0 ] === 4 )
        {
            pub.PUBLISH ( 'mych', 'alpha', test ( 'PUB1', null, 3 ) );
        }

        if ( ch === '*ch' )
            ord.push ( ch );
    };

    sub1.on ( 'subscribe', start );
    sub2.on ( 'psubscribe', start );
    sub3.on ( 'psubscribe', start );

        ////    Test the state a bit later.

    setTimeout
    (
        function ()
        {
            tcb1 ( null, data );
            tcb2 ( null, ord );
        },
        1000
    );
}
() );

( function ()
{
    var pub  = fake.createClient ( "pubsub-2" ),
        sub1 = fake.createClient ( "pubsub-2" ),
        sub2 = fake.createClient ( "pubsub-2" ),

        un1  = [],
        tcb1 = test ( "PUBSUB UNSUBSCRIBE from all", null, [ "one", 3, "two", 2, "three", 1 ] ),

        un2  = [],
        tcb2 = test ( "PUBSUB PUNSUBSCRIBE from all", null, [ "on?", 3, "tw?", 2, "thre?", 1 ] ),

        good = [],
        tcb3 = test ( "subscribed correctly", null, [ "A", "B", "C", "A", "B", "C" ] ),

        bad  = [],
        tcb4 = test ( "unsubscribed correctly", null, [] ),

        msg  = [ 'A', 'B', 'C' ],

        x    = 0,
        y    = 0,
        tcb5 = test ( "sub / unsub counters", null, [ 8, 6 ] );



    sub1.SUBSCRIBE ( 'one' );
    sub1.SUBSCRIBE ( 'two', 'three' );
    sub2.PSUBSCRIBE ( 'on?' );
    sub2.PSUBSCRIBE ( 'tw?', 'thre?' );

    sub1.PSUBSCRIBE ( 't?st' );
    sub2.SUBSCRIBE ( 'test' );

    sub1.on ( 'message', function ( pat, channel, message )
    {
        bad.push ( message );
    });
    sub2.on ( 'pmessage', function ( channel, message )
    {
        bad.push ( message );
    });

    sub1.on ( 'pmessage', function ( pat, channel, message )
    {
        good.push ( message );
    });
    sub2.on ( 'message', function ( channel, message )
    {
        good.push ( message );
    });



    sub1.on ( 'subscribe', function ()
    {
        start ();
    });
    sub1.on ( 'psubscribe', function ()
    {
        start ();
    });
    sub2.on ( 'subscribe', function ()
    {
        start ();
    });
    sub2.on ( 'psubscribe', function ()
    {
        start ();
    });

    function start ()
    {
        x ++;
        if ( x < 8 )
            return;

        sub1.UNSUBSCRIBE ();
        sub2.PUNSUBSCRIBE ();
    };



    sub1.on ( 'unsubscribe', function ( channel, count )
    {
        un1.push ( channel, count );
        end ();
    });

    sub2.on ( 'punsubscribe', function ( pattern, count )
    {
        un2.push ( pattern, count );
        end ();
    });

    function end ()
    {
        y ++;
        if ( y < 4 )
            return;

        pub.PUBLISH ( 'test', msg.shift () );
        if ( y === 4 )
            pub.PUBLISH ( 'three', 'ignored', test ( "PUB ignored", null, 0 ) );
    };


        ////    Test the state a bit later.

    setTimeout
    (
        function ()
        {
            tcb1 ( null, un1 );
            tcb2 ( null, un2 );
            tcb3 ( null, good );
            tcb4 ( null, bad );
            tcb5 ( null, [ x, y ] );
        },
        1000
    );
}
() );



    ////    More blocking list stuff.

( function ()
{
    fake.createClient ().BLPOP ( "list", "mylist", "BL-a", 1, test ( "BLPOP timeout", null, null ) );
    fake.createClient ().BRPOP ( "list", "mylist", "BL-a", 1, test ( "BRPOP timeout", null, null ) );
    fake.createClient ().BRPOPLPUSH ( "list", "mylist", "BL-a", 1, test ( "BRPOPLPUSH timeout", null, null ) );
}
() );



    ////    Connection state changes and other weirdness.

( function ()
{
    var redis1 = fake.createClient ( "weird" ),
        redis2 = fake.createClient ( "weird" ),
        redis3 = fake.createClient ( "weird" );


    redis1.multi ()
        .SET ( "hello", "world" )
        .BLPOP ( "nonex", 0, test ( "BLPOP in transaction", null, null ) )
        .LPUSH ( "step-1", "", test ( "LPUSH empty string", null, 1 ) )
            .exec ();

    redis1.BRPOP ( "step-3", 0, test ( "BRPOPLPUSH step 3, chain worked.", null, [ "step-3", "" ] ) );

    redis1.MULTI ()
        .get ( "hello", test ( "GET transblocktrans", null, "redis" ) )
        .blpop ( "nonex", 0, test ( "BLPOP in postblock transaction", null, null ) )
        .publish ( "hello", "world", test ( "PUBLISH in postblock transaction", null, 1 ) )
            .exec ();

    redis2.BRPOPLPUSH ( "step-2", "step-3", 0, test ( "BRPOPLPUSH step 2", null, "" ) );
    redis2.SET ( "hello", "redis" );

    redis3.BRPOPLPUSH ( "step-1", "step-2", 0, test ( "BRPOPLPUSH step 1", null, "" ) );
    redis3.SUBSCRIBE ( "hello" );


    redis3.on ( 'message', function ( channel, message )
    {
        if ( channel === 'hello' && message === 'world' )
            redis3.UNSUBSCRIBE ();
    });

    redis3.on ( 'unsubscribe', function ( channel )
    {
        if ( channel === 'hello' )
            redis3.LPUSH ( "end-message", "Hello World!" );
    });


    redis1.BLPOP ( "end-message", 0, test ( "Multi + Blocking + Pubsub, end result", null, [ "end-message", "Hello World!" ] ) );
}
() );



    ////    Sort.

( function ()
{
    var redis = fake.createClient (),
        result;

        ////    Simple num and alpha sort.

    redis.LPUSH ( "list", "2", "11", 3, 1 );
    redis.SORT ( "list", test ( "SORT num", null, [ "1", "2", "3", "11" ] ) );
    redis.DEL ( "list" );

    redis.LPUSH ( "list", "2", "a", "11", 3, 1, "A", "-", "_", ".", "~", "*" );
    redis.SORT ( "list", test ( "SORT scorefail", BAD_SORT, null ) );
    redis.SORT ( "list", "alpha", test ( "SORT alpha", null, [ "*", "-", ".", "1", "11", "2", "3", "A", "_", "a", "~" ] ) );
    redis.DEL ( "list" );

        ////    By clause.

    redis.LPUSH ( "list", 11, 22, "hello", "abra", "opa" );
    redis.SET ( "w11w", -1 );
    redis.SET ( "w22w", 1 );
    redis.SORT ( "list", "by", "w*w", test ( "SORT num by +MVs, str*", null, [ "11", "abra", "hello", "opa", "22" ] ) );
    redis.DEL ( "list", "w11w", "w22w" );

        ////    Test BY and GET clauses.

    redis.LPUSH ( "list", 11, 22, 33, 44, 55 );
    redis.SADD  ( "set",  11, 22, 33, 44, 55 );
    redis.ZADD  ( "zset", 0, 11, 0, 22, 0, 33, 0, 44, 0, 55 );

    redis.HMSET ( "o11", "name", "tuti", "age", 25 );
    redis.HMSET ( "o22", "name", "ivo", "age", 26 );
    redis.HMSET ( "o33", "name", "lino", "age", 27 );
    redis.HMSET ( "o44", "name", "mina", "age", 20 );
    redis.HMSET ( "o55", "name", "kemi", "age", 18 );

    result = [ "55", "kemi", "44", "mina", "11", "tuti", "22", "ivo", "33", "lino" ];

    redis.SORT ( "list", "by", "o*->age", "get", "#", "get", "o*->name", test ( "SORT list by+get, h*->f", null, result ) );
    redis.SORT ( "set",  "by", "o*->age", "get", "#", "get", "o*->name", test ( "SORT set by+get, h*->f",  null, result ) );
    redis.SORT ( "zset", "by", "o*->age", "get", "#", "get", "o*->name", test ( "SORT zset by+get, h*->f", null, result ) );

    redis.SORT ( "zset", "by", "o*->age", "get", "#", "get", "o*->name", "store", "storekey", test ( "SORT zset by+get, h*->f, STORE", null, result.length ) );
    redis.LRANGE ( "storekey", 0, -1, test ( "SORT zset by+get, h*->f, STORE / LRANGE", null, result ) );

        ////    Negative offset behaves differently here and in ZRANGEBYSCORE

    redis.SORT ( "list", "by", "o*->age", "limit", 0, 2, "get", "#", "get", "o*->name", test ( "SORT limit", null, result.slice ( 0, 4 ) ) );
    redis.SORT ( "list", "by", "o*->age", "limit", 2, 4, "get", "#", "get", "o*->name", test ( "SORT limit +offset", null, result.slice ( 4 ) ) );
    redis.SORT ( "list", "by", "o*->age", "limit", 2, -10, "get", "#", "get", "o*->name", test ( "SORT limit +negcount", null, result.slice ( 4 ) ) );
    redis.SORT ( "list", "by", "o*->age", "limit", -2, 2, "get", "#", "get", "o*->name", test ( "SORT limit +negoffset+negcount", null, result.slice ( 0, 4 ) ) );

    redis.HSET ( "o11", "age", "not-a-number" );
    redis.SORT ( "list", "by", "o*->age", "get", "#", "get", "o*->name", test ( "SORT by+scorefail", BAD_SORT, null ) );

        ////    Edge cases.

    redis.SORT ( "nonex", test ( "SORT nonex", null, [] ) );
    redis.SORT ( "nonex", "by", "o*->age", test ( "SORT nonex+by", null, [] ) );
    redis.SORT ( "nonex", "by", "o*->age", "get", "#", "get", "o*->name", test ( "SORT nonex+by+get", null, [] ) );
    redis.SET ( "hello", "world" );
    redis.SORT ( "hello", test ( "SORT bad type", BAD_TYPE, null ) );
}
() );



    ////    Keyspace dump.

( function ()
{
    var redis = fake.createClient ();

    redis.SET ( "hello", "redis" );
    redis.SET ( "mykey", "some string" );
    redis.SADD ( "myset", "m3", "m2", "m1" );
    redis.ZADD ( "myzset", 10, "zm1", 5, "zm2", -5, "zm3" );
    redis.HMSET ( "myhash", "field1", "value1", "field2", "value2" );
    redis.LPUSH ( "mylist", "e1", "e2", "e3" );

    redis.getKeyspace ( "my*", test
    (
        "keyspace dump, all types", null,
        [
            "myhash", "-1", "hash", [ "field1", "value1", "field2", "value2" ],
            "mykey",  "-1", "string", "some string",
            "mylist", "-1", "list", [ "e3", "e2", "e1" ],
            "myset",  "-1", "set",  [ "m1", "m2", "m3" ],
            "myzset", "-1", "zset", [ "zm3", "-5", "zm2", "5", "zm1", "10" ]
        ]
    ));
}
() );


// Select.
(function () {

    var redis1 = fake.createClient("select-test");
    var redis2 = fake.createClient("select-test");
    var redis3 = fake.createClient("select-test");

    var finish = test("SELECT, cross-database pubsub", null, "Hey you!");

    redis2.SUBSCRIBE("PASS");
    redis2.on('message', function(channel, message) {
        finish(null, message);
    });

    redis1.SET("A", "Hola");
    redis1.SELECT(1, test("SELECT 1", null, OK));

    redis1.GET("A", test("SELECT, keyspace isolation", null, null));
    redis1.SET("A", "Hello", function() {

        redis3.GET("A", test("SELECT, connection selection isolation", null, "Hola"));
        redis3.SET("A", "Hola!!!", function() {

            redis1.SELECT(0, test("SELECT 0", null, OK));
            redis1.GET("A", test("SELECT, keyspace switching", null, "Hola!!!"));

            redis1.SELECT(-1, test("SELECT BAD_DB neg", BAD_DB, null));
            redis1.SELECT("X", test("SELECT BAD_DB X", BAD_DB, null));
            redis1.SELECT(111.4, test("SELECT BAD_DB float", BAD_DB, null));

            redis1.SELECT(2000, test("SELECT 2000", null, OK));
            redis1.PUBLISH("PASS", "Hey you!");
        });
    });
} ());


// Select with blocking.
(function () {

    var redis1 = fake.createClient("select-test2");
    var redis2 = fake.createClient("select-test2");
    var redis3 = fake.createClient("select-test2");

    redis1.BLPOP("list", "other", 1, test("SELECT 0 + BLPOP", null, ["list", "hello list in 0"]));

    redis2.SELECT(1);
    redis2.BRPOP("other", "list", 1, test("SELECT 1 + BRPOP", null, ["list", "hello list in 1"]));

    redis3.SELECT(2);
    redis3.LPUSH("list", "wrong!");
    redis3.SELECT(1);
    redis3.LPUSH("list", "hello list in 1");
    redis3.SELECT(0);
    redis3.RPUSH("list", "hello list in 0");
} ());


    ////    Test shorthand.

var TEST_COUNT, numErrors;

function test ( name, xErr, xData )
{
    var timeout,
        c = TEST_COUNT = ( TEST_COUNT || 0 ) + 1;

    xErr  = JSON.stringify ( xErr );
    xData = JSON.stringify ( xData );

    timeout = setTimeout
    (
        function ()
        {
            numErrors = ( numErrors || 0 ) + 1;
            process.stdout.write ( '\x1B[1;31m\n  ✗ #' + c + ' ' + name + '\x1B[0m:\n\tDidn\'t call back.\n\txErr = ' + xErr + '\t\txData = ' + xData + '\n\n' );
        },
        5000
    );

    return function ( err, data )
    {
        clearTimeout ( timeout );
        if ( err )
            err = err.message;

        err  = JSON.stringify ( err );
        data = JSON.stringify ( data );

        if ( typeof err === 'object' )
            err = err.toString ();
        if ( typeof data === 'object' )
            data = data.toString ();

        if ( err === xErr && data === xData )
            process.stdout.write ( '\x1B[1;32m  ✓ #' + c + ' ' + name + '\x1B[0m\n' );

        else
        {
            numErrors = ( numErrors || 0 ) + 1;
            process.stdout.write ( '\x1B[1;31m\n  ✗ #' + c + ' ' + name + '\x1B[0m:\n\terr  = ' + err + '\t\tdata  = ' + data + '\n\txErr = ' + xErr + '\t\txData = ' + xData + '\n\n' );
        }
    };
}

var doexit = false;
process.on ( 'exit', function ()
{
    if ( doexit )
        return;
    doexit = true;

    if ( !numErrors )
    {
        process.stdout.write ( '\n\x1B[1;32m  ✓ All good.\x1B[0m\n' );
        process.exit ( 0 );
    }

    else
    {
        process.stdout.write ( '\x1B[1;31m\n  ✗ ' + numErrors + ' broken.\x1B[0m\n' );
        process.exit ( 1 );
    }
});


