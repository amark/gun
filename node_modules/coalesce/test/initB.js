var web = require('../coalesce')
, opt = {port: 8081, sec: -2};

opt.run = ['./serverB'];
opt.node = {
	src: ["http://localhost:8080/com"] // have to include /com or not? Let's say yes for now. Is this its ID?
	,key: "I am a secret key that establishes trustworthiness as a root system machine"
}

web(opt);
console.log("initB @ "+ opt.port);