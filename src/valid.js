
require('./shim');
module.exports = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
	if(v === undefined){ return false }
	if(v === null){ return true } // "deletes", nulling out keys.
	if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
	if(v !== v){ return false } // can you guess what this checks for? ;)
	if('string' == typeof v // text!
	|| 'boolean' == typeof v
	|| 'number' == typeof v){
		return true; // simple values are valid.
	}
	if(v && ('string' == typeof (v['#']||0)) && Object.empty(v, ['#'])){ return v['#'] } // is link
	return false; // If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
}
	