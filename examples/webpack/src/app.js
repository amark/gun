define(function(require, exports, module) {

    var Gun = require("gun");

    var gun = new Gun();

    gun.get("hello").get("world").put("from gun").on((data, key) => console.log(data, key));

});