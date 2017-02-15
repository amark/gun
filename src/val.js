
var Type = require('./type');
var Val = {};
Val.is = function(v){ // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
	if(v === u){ return false }
	if(v === null){ return true } // "deletes", nulling out fields.
	if(v === Infinity){ return false } // we want this to be, but JSON does not support it, sad face.
	if(text_is(v) // by "text" we mean strings.
	|| bi_is(v) // by "binary" we mean boolean.
	|| num_is(v)){ // by "number" we mean integers or decimals. 
		return true; // simple values are valid.
	}
	return Val.rel.is(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
}
Val.rel = {_: '#'};
;(function(){
	Val.rel.is = function(v){ // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
		if(v && v[rel_] && !v._ && obj_is(v)){ // must be an object.
			var o = {};
			obj_map(v, map, o);
			if(o.id){ // a valid id was found.
				return o.id; // yay! Return it.
			}
		}
		return false; // the value was not a valid soul relation.
	}
	function map(s, f){ var o = this; // map over the object...
		if(o.id){ return o.id = false } // if ID is already defined AND we're still looping through the object, it is considered invalid.
		if(f == rel_ && text_is(s)){ // the field should be '#' and have a text value.
			o.id = s; // we found the soul!
		} else {
			return o.id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
		}
	}
}());
Val.rel.ify = function(t){ return obj_put({}, rel_, t) } // convert a soul into a relation and return it.
var rel_ = Val.rel._, u;
var bi_is = Type.bi.is;
var num_is = Type.num.is;
var text_is = Type.text.is;
var obj = Type.obj, obj_is = obj.is, obj_put = obj.put, obj_map = obj.map;
module.exports = Val;
	