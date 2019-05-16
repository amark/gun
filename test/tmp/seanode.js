var Gun = require('../../gun.js');
require('../../sea.js');

var pub = "tgEJ8TTeTN8Xi0D3oMVbZGyVVFDGT4AUoqyrUguAguU.9-yZfWtPSZ_4ILnttWy-KWvwUUyO2-dB1DHRYud-CDE";

var sig = decodeURIComponent("SEA%7B%22m%22%3A%22%5C%22hello%5C%22%22%2C%22s%22%3A%22%C2%90%C3%B1%C3%93sy%5Cu0011%C3%87%C2%A5%C2%97%C3%93%5Cu0011%C3%A1JV%C2%AA%C3%94C%C3%A3%C3%85%C2%80a%5Cu0006%C2%B6%C2%A7%C3%BE%C2%9F%C2%92%5Cu000eS%C2%90%C3%A8%C3%B1kH%7D%C2%9A%5Cb%C3%B0g%C2%B9%7F%C2%B2%C3%9F%C3%A0j%C3%9Bk%5C%22%3E%C2%B6%C2%8F%5Cu001b%C3%81%C2%8B%C2%97%C3%92%C2%AA%C3%A5%C2%B6%5D%C3%85%C2%9A%3BA%22%7D");

console.log(sig);

;(async function(){
	var test = await Gun.SEA.verify(sig, pub);
	console.log("???", test);
}());