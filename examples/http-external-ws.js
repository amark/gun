var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;

var Gun = require('../');

// have to do this before instancing gun(?)
Gun.on('out', function(msg){
	this.to.next( msg );
	msg = JSON.stringify(msg);
	gunPeers.forEach( function(peer){ peer.send( msg ) })
})

var gun = Gun({ 
	file: 'data.json'
});

var server = require('http').createServer(function(req, res){
	var insert = "";
	if( req.url.endsWith( "gun.js" ) )
		insert = "../";

	require('fs').createReadStream(require('path').join(__dirname, insert, req.url)).on('error',function(){ // static files!
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(require('fs').readFileSync(require('path').join(__dirname, 'index.html'))); // or default to index
	}).pipe(res); // stream
});

// do not do this to attach server... instead pull websocket provider and use that.
// gun.wsp(server);

var ws = require( 'ws' ); // default websocket provider gun used...
var WebSocketServer = ws.Server;

var wss = new WebSocketServer( {
        server: server, // 'ws' npm
        autoAcceptConnections : false // want to handle the request (websocket npm?)
    });

wss.on('connection',acceptConnection )

var gunPeers = [];  // used as a list of connected clients.

function acceptConnection( connection ) {
    // connection.upgradeReq.headers['sec-websocket-protocol'] === (if present) protocol requested by client
    // connection.upgradeReq.url  === url request
    console.log( "connect?", connection.upgradeReq.headers, connection.upgradeReq.url )
    gunPeers.push( connection );
    connection.on( 'error',function(error){console.log( "WebSocket Error:", error) } );
    
    connection.on('message', function (msg) {
        msg = JSON.parse(msg)
        if ("forEach" in msg) msg.forEach(m => gun.on('in', JSON.parse(m)));
        else gun.on('in', msg)
    })

    connection.on( 'close', function(reason,desc){
        // gunpeers gone.
        var i = gunPeers.findIndex( function(p){return p===connection} );
        if( i >= 0 )
            gunPeers.splice( i, 1 );

    })
}

server.listen(port);

console.log('Server started on port ' + port + ' with ');
