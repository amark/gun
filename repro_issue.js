var Gun = require('./index');
var gun = Gun();

var main = gun.get('test_main');
var sub = main.get('test_sub');

console.log("Setting up listener on sub-node...");
sub.on(function(data, key) {
    console.log("Sub-node updated:", key, "=", data);
    if (data === 'updated_value') {
        console.log("SUCCESS: Update received on sub-node.");
        process.exit(0);
    }
});

console.log("Putting data to sub-node...");
// Initial put
sub.put('initial_value');

// Delayed update to trigger .on()
setTimeout(function() {
    console.log("Updating sub-node value...");
    sub.put('updated_value');
}, 100);

// Timeout if no event received
setTimeout(function() {
    console.log("FAILURE: No update received on sub-node within timeout.");
    process.exit(1);
}, 2000);
