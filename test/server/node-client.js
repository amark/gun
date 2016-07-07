var Gun = require('../../index');
var location = {host:"localhost"};
var gun = Gun( 'ws://' + location.host + ':8081/gun');
var gdb = gun.get( 'data' );
gdb.map(function(val,field){ console.log( field, "=", val ); } );
console.log( "done... wait forever?" );