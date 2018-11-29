process.env.GUN_ENV = "false";
var Gun=require('gun')
var g = new Gun({peers: ['http://localhost:4246/gun'],localStorage: false});
g.get("FOOxx").get("BARxx").once(data=>console.log("RCVD: (SHOULD NOT BE UNDEFINED!)", data));

console.log('now run ```var g = new Gun({peers: ["http://localhost:4246/gun"],localStorage: false}); g.get("FOOxx").get("BARxx").once(data=>console.log("RCVD:", data))```');