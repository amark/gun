if(!(typeof navigator == "undefined") && navigator.product == "ReactNative"){
    module.exports = require('./src');
}else{
    module.exports = require('./gun.js');
}