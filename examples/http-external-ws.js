var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;

var Gun = require('../');
var gun = Gun({ 
	file: 'data.json',
	s3: {
		key: '', // AWS Access Key
		secret: '', // AWS Secret Token
		bucket: '' // The bucket you want to save into
	}
});

var server = require('http').createServer(function(req, res){
	if(gun.wsp.server(req, res)){ 
		return; // filters gun requests!
	}
	require('fs').createReadStream(require('path').join(__dirname, req.url)).on('error',function(){ // static files!
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

Gun.on('out', function(msg){
	msg = JSON.stringify({headers:{},body:msg});
	gunPeers.forEach( function(peer){ peer.send( msg ) })
})
function acceptConnection( connection ) {
    // connection.upgradeReq.headers['sec-websocket-protocol'] === (if present) protocol requested by client
    // connection.upgradeReq.url  === url request
    console.log( "connect?", connection.upgradeReq.headers, connection.upgradeReq.url )
    gunPeers.push( connection );
    connection.on( 'error',function(error){console.log( "WebSocket Error:", error) } );
    
    connection.on( 'message',function(msg){gun.on('in',JSON.parse( msg).body)})
    connection.on( 'close', function(reason,desc){
        // gunpeers gone.
        var i = gunPeers.findIndex( function(p){return p===connection} );
        if( i >= 0 )
            gunPeers.splice( i, 1 );

    })
}

server.listen(port);

console.log('Server started on port ' + port + ' with ');
