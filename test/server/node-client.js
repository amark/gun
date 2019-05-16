var Gun = require('../../index');

var location = {host:"localhost"};

var gun = Gun( { file: 'read.json', peers: ['http://' + location.host + ':8765/gun'] });

gun.get( 'data' ).path('stuff').map(function(val,field){ console.log( field, "=", val ); } );

console.log( "done... wait forever?" );