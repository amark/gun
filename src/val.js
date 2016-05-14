var Gun = require('./gun');

Gun.chain.val = (function(){
	Gun.on('get.wire').event(function(gun, ctx){
		if(!ctx.soul){ return } var end;
		(end = gun.__.by(ctx.soul)).end = (end.end || -1); // TODO: CLEAN UP! This should be per peer!
	},-999);
	Gun.on('wire.get').event(function(gun, ctx, err, data){
		if(err || !ctx.soul){ return }
		if(data && !Gun.obj.empty(data, Gun._.meta)){ return }
		var end = gun.__.by(ctx.soul);
		end.end = (!end.end || end.end < 0)? 1 : end.end + 1;
	},-999);
	return function(cb, opt){
		var gun = this, args = Gun.list.slit.call(arguments);
		cb = Gun.fns.is(cb)? cb : function(val, field){ root.console.log.apply(root.console, args.concat([field && (field += ':'), val])) }; cb.hash = {};
		opt = opt || {};
		function val(at){
			var ctx = {by: gun.__.by(at.soul), at: at.at || at}, node = ctx.by.node, field = ctx.at.field, hash = Gun.on.at.hash({soul: ctx.at.key || ctx.at.soul, field: field});
			if(cb.hash[hash]){ return }
			if(at.field && Gun.obj.has(node, at.field)){
				return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node[at.field]), at.field);
			}
			if(!opt.empty && Gun.obj.empty(node, Gun._.meta)){ return } // TODO: CLEAN UP! .on already does this without the .raw!
			if(ctx.by.end < 0){ return }
			return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, Gun.obj.copy(node), field);
		}
		gun.on(val, {raw: true});
		if(gun === gun.back){ Gun.log('You have no context to `.val`!') }
		return gun;
	}
}());