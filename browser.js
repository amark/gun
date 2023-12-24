if(!(typeof navigator == "undefined") && navigator.product == "ReactNative"){
    require("./lib/mobile.js");
    module.exports = require('./src');
}else{
    module.exports = require('./gun.js');
}