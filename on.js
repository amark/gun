;(function(){
	var setImmediate = setImmediate || function(cb){setTimeout(cb,0)}
	function On(){
		var chain = new Chain();
		return chain.$ = function(where){
			chain.$[where] = function(fn){
				chain.$[where] = fn;
			}
			chain.where = where;
			return chain;
		}
	}
	On.is = function(On){ return (On instanceof On)? true : false }
	function Chain(){
		if(!(this instanceof Chain)){
			return new Chain();
		}
	}
	Chain.chain = Chain.prototype;
	Chain.chain.emit = function(a,s,d,f){
		var me = this
		,	where = me.where
		, 	args = Array.prototype.slice.call(arguments);
		setImmediate(function(){
			if(!me || !me.$ || !me.$[where]){ return }
			me.$[where].apply(me, args);
		});
		return me;
	}
	if(typeof window !== "undefined"){
		window.On = On;
	} else {
		module.exports = On;
	}
	
	;(function(){ // test
		var doSomething = function(){
			var cb = On();
			cb('now').emit(1,2,3);
			return cb;
		}
		doSomething('foo', 'bar').now(function(a,b,c){
			console.log("Oh yeah baby", a,b,c);
		})
	}());
}());