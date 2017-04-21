
var Type = require('./type');
var Val = require('./val');
var Node = {_: '_'};
Node.soul = function(n, o){ return (n && n._ && n._[o || soul_]) } // convenience function to check to see if there is a soul on a node and return it.
Node.soul.ify = function(n, o){ // put a soul on an object.
	o = (typeof o === 'string')? {soul: o} : o || {};
	n = n || {}; // make sure it exists.
	n._ = n._ || {}; // make sure meta exists.
	n._[soul_] = o.soul || n._[soul_] || text_random(); // put the soul on it.
	return n;
}
Node.soul._ = Val.rel._;
;(function(){
	Node.is = function(n, cb, as){ var s; // checks to see if an object is a valid node.
		if(!obj_is(n)){ return false } // must be an object.
		if(s = Node.soul(n)){ // must have a soul on it.
			return !obj_map(n, map, {as:as,cb:cb,s:s,n:n});
		}
		return false; // nope! This was not a valid node.
	}
	function map(v, f){ // we invert this because the way we check for this is via a negation.
		if(f === Node._){ return } // skip over the metadata.
		if(!Val.is(v)){ return true } // it is true that this is an invalid node.
		if(this.cb){ this.cb.call(this.as, v, f, this.n, this.s) } // optionally callback each field/value.
	}
}());
;(function(){
	Node.ify = function(obj, o, as){ // returns a node from a shallow object.
		if(!o){ o = {} }
		else if(typeof o === 'string'){ o = {soul: o} }
		else if(o instanceof Function){ o = {map: o} }
		if(o.map){ o.node = o.map.call(as, obj, u, o.node || {}) }
		if(o.node = Node.soul.ify(o.node || {}, o)){
			obj_map(obj, map, {o:o,as:as});
		}
		return o.node; // This will only be a valid node if the object wasn't already deep!
	}
	function map(v, f){ var o = this.o, tmp, u; // iterate over each field/value.
		if(o.map){
			tmp = o.map.call(this.as, v, ''+f, o.node);
			if(u === tmp){
				obj_del(o.node, f);
			} else
			if(o.node){ o.node[f] = tmp }
			return;
		}
		if(Val.is(v)){
			o.node[f] = v;
		}
	}
}());
var obj = Type.obj, obj_is = obj.is, obj_del = obj.del, obj_map = obj.map;
var text = Type.text, text_random = text.random;
var soul_ = Node.soul._;
var u;
module.exports = Node;
	