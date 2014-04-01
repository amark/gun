var web = require('../coalesce')
, opt = {port: 8080, sec: -2};

opt.run = ['./serverA'];
opt.node = {
	src: "http://localhost:8080/com"
	,key: "I am a secret key that establishes trustworthiness as a root system machine"
}

web(opt);
console.log("initA @ "+ opt.port);