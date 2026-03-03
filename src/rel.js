;(function(){

var Gun = require('./root');
var u;

function padId(id, size){
	var s = '' + id;
	while(s.length < size){ s = '0' + s }
	return s;
}

function relSoul(name){ return 'rel:' + name }
function rowSoul(name, id){ return 'rel:' + name + ':row:' + id }
function seqSoul(name){ return 'rel:' + name + ':seq' }
function idxSoul(name, field){ return 'rel:' + name + ':idx:' + field }

function normalizeSchema(name, schema){
	schema = schema || {};
	if(typeof schema === 'string'){ schema = {name: schema} }
	return {
		type: 'rel',
		name: schema.name || name,
		primary: schema.primary || 'id',
		autoInc: schema.autoInc !== false,
		indexes: schema.indexes || [],
		foreign: schema.foreign || {}
	};
}

function isRelSoul(soul){
	return soul && soul.indexOf('rel:') === 0;
}

function relType(soul){
	if(!isRelSoul(soul)){ return null }
	if(soul.indexOf(':row:') > -1){ return 'row' }
	if(soul.indexOf(':idx:') > -1){ return 'idx' }
	if(soul.indexOf(':seq') > -1){ return 'seq' }
	if(soul.split(':').length === 2){ return 'meta' }
	return 'other';
}

function isNumeric(v){
	if(typeof v === 'number'){ return v === v && v !== Infinity && v !== -Infinity }
	if(typeof v === 'string'){ return v !== '' && !isNaN(parseInt(v, 10)) }
	return false;
}

function isLink(v){
	return !!(v && typeof v === 'object' && typeof v['#'] === 'string');
}

function isSameValue(a, b){
	if(a === b){ return true }
	if(typeof a === 'object' && typeof b === 'object'){
		try{ return JSON.stringify(a) === JSON.stringify(b) }catch(e){ return false }
	}
	return false;
}

function validateRelPut(put, root){
	var soul = put['#'], key = put['.'], val = put[':'];
	if(!isRelSoul(soul)){ return null }
	var type = relType(soul);
	if(type === 'other' || type === 'row'){ return null }
	if(key === '_' || key === u){ return null }
	if(type === 'meta'){
		var node = root && root.graph && root.graph[soul];
		var existing = node && node[key];
		if(existing !== u && !isSameValue(existing, val)){ return 'meta.locked.' + key }
		if(key === 'type' || key === 'name' || key === 'primary'){
			return (typeof val === 'string') ? null : 'meta.' + key;
		}
		if(key === 'autoInc'){ return (typeof val === 'boolean') ? null : 'meta.autoInc' }
		if(key === 'indexes'){ return (Array.isArray(val) || (val && typeof val === 'object')) ? null : 'meta.indexes' }
		if(key === 'foreign'){ return (val && typeof val === 'object') ? null : 'meta.foreign' }
		return 'meta.' + key;
	}
	if(type === 'seq'){
		return (key === 'value' && isNumeric(val)) ? null : 'seq.' + key;
	}
	if(type === 'idx'){
		if(key === 'field'){ return (typeof val === 'string') ? null : 'idx.field' }
		if(val === null){ return null }
		return isLink(val) ? null : 'idx.' + key;
	}
	return null;
}

Gun.on('create', function(root){
	this.to.next(root);
	if(root.relValidated){ return }
	root.relValidated = true;
	root.on('put', function(msg){
		var put = msg.put || {};
		var reason = validateRelPut(put, root);
		if(!reason){ this.to.next(msg); return }
		var id = msg['#'];
		var ctx = msg._ || {};
		var r = ctx.root || root;
		if(r){ r.on('in', {'@': id, err: "Invalid rel data: " + reason}) }
	});
});

function ensureRelMeta(gun, name, schema){
	var meta = normalizeSchema(name, schema);
	gun.get(relSoul(name)).put(meta);
	if(meta.primary){
		gun.get(idxSoul(name, 'primary')).put({field: 'primary'});
	}
	if(meta.indexes && meta.indexes.length){
		meta.indexes.forEach(function(field){
			gun.get(idxSoul(name, field)).put({field: field});
		});
	}
	var seqRef = gun.get(seqSoul(name));
	readSeq(seqRef).then(function(current){
		if(!current && current !== 0){
			seqRef.get('value').put(0);
		}
	});
	return meta;
}

Gun.chain.rel = function(name, schema){
	var gun = this;
	var chain = gun.chain();
	chain._.rel = {name: name, root: gun.back(-1)};
	if(schema){ chain.relSchema(schema) }
	return chain;
};

Gun.chain.relSchema = function(schema){
	var gun = this;
	var meta = normalizeSchema(gun._.rel.name, schema);
	gun._.rel.schema = meta;
	ensureRelMeta(gun._.rel.root, gun._.rel.name, meta);
	return gun;
};

function getSchema(gun){
	var rel = gun._.rel || {};
	if(rel.schema){ return Promise.resolve(rel.schema) }
	return new Promise(function(res){
		rel.root.get(relSoul(rel.name)).once(function(data){
			if(data){ rel.schema = normalizeSchema(rel.name, data); return res(rel.schema) }
			res(normalizeSchema(rel.name, {}));
		});
	});
}

function readSeq(seqRef){
	return new Promise(function(resolve){
		seqRef.get('value').once(function(val){
			var num = parseInt(val, 10);
			if(!num && num !== 0){
				seqRef.once(function(raw){
					var data = raw;
					if(data && typeof data === 'object' && data.value !== u && data.value !== null){
						data = data.value;
					}
					var fallback = parseInt(data, 10);
					if(!fallback && fallback !== 0){ resolve(null); return }
					resolve(fallback);
				});
				return;
			}
			resolve(num);
		});
	});
}

Gun.chain.insert = function(row, cb){
	var gun = this, rel = gun._.rel;
	if(!rel){ return gun }
	var root = rel.root;
	var seqRef = root.get(seqSoul(rel.name));
	var p = readSeq(seqRef).then(function(current){
		return new Promise(function(resolve, reject){
			if(!current || current < 0){ current = 0 }
			getSchema(gun).then(function(schema){
				var id = current + 1;
				var soul = rowSoul(rel.name, id);
				var payload = Object.assign({}, row);
				payload[schema.primary] = id;
				root.get(soul).put(payload, function(ack){
					if(ack && ack.err){ reject(ack.err); return }
					var key = schema.primary + ':' + padId(id, 10);
					root.get(idxSoul(rel.name, 'primary')).get(key).put({'#': soul});
					(schema.indexes || []).forEach(function(field){
						var value = payload[field];
						if(value === u || value === null){ return }
						var idxKey = field + ':' + value + ':' + padId(id, 10);
						root.get(idxSoul(rel.name, field)).get(idxKey).put({'#': soul});
					});
					seqRef.get('value').put(id);
					resolve({id: id, soul: soul});
				});
			});
		});
	});
	if(cb){
		p.then(function(r){ cb(null, r) }).catch(function(err){ cb(err) });
	}
	return p;
};

Gun.chain.upsert = function(id, row, cb){
	var gun = this, rel = gun._.rel;
	if(!rel){ return gun }
	var root = rel.root;
	var p = getSchema(gun).then(function(schema){
		var soul = rowSoul(rel.name, id);
		var payload = Object.assign({}, row);
		payload[schema.primary] = id;
		return new Promise(function(resolve, reject){
			root.get(soul).put(payload, function(ack){
				if(ack && ack.err){ reject(ack.err); return }
				var key = schema.primary + ':' + padId(id, 10);
				root.get(idxSoul(rel.name, 'primary')).get(key).put({'#': soul});
				(schema.indexes || []).forEach(function(field){
					var value = payload[field];
					if(value === u || value === null){ return }
					var idxKey = field + ':' + value + ':' + padId(id, 10);
					root.get(idxSoul(rel.name, field)).get(idxKey).put({'#': soul});
				});
				resolve({id: id, soul: soul});
			});
		});
	});
	if(cb){
		p.then(function(r){ cb(null, r) }).catch(function(err){ cb(err) });
	}
	return p;
};

Gun.chain.page = function(opts, cb){
	var gun = this, rel = gun._.rel;
	if(!rel){ return gun }
	opts = opts || {};
	var root = rel.root;
	var limit = opts.limit || 20;
	var reverse = !!opts.reverse;
	var startId = opts.startId;
	var keyPrefix = 'id:';
	var lex = {'*': keyPrefix, '%': limit};
	if(reverse){ lex['-'] = 1 }
	if(startId !== u && startId !== null){
		var boundKey = keyPrefix + padId(startId, 10);
		if(reverse){ lex['<'] = boundKey } else { lex['>'] = boundKey }
	}
	var list = [];
	var done;
	var p = new Promise(function(resolve){
		var map = root.get(idxSoul(rel.name, 'primary')).map({'.': lex});
		map.once(function(link, key){
			if(!link || !link['#']){ return }
			list.push({key: key, soul: link['#']});
			if(list.length >= limit && !done){
				done = true;
				resolve(list);
			}
		});
		setTimeout(function(){
			if(done){ return }
			done = true;
			resolve(list);
		}, opts.wait || 120);
	}).then(function(items){
		return new Promise(function(resolve){
			if(items.length){ resolve(items); return }
			root.get(idxSoul(rel.name, 'primary')).once(function(node){
				if(!node){ resolve([]); return }
				var keys = Object.keys(node).filter(function(k){
					return k.indexOf(keyPrefix) === 0;
				});
				if(startId !== u && startId !== null){
					var boundKey = keyPrefix + padId(startId, 10);
					keys = keys.filter(function(k){
						return reverse ? (k < boundKey) : (k > boundKey);
					});
				}
				keys.sort();
				if(reverse){ keys.reverse() }
				if(limit && keys.length > limit){ keys = keys.slice(0, limit) }
				var scanned = [];
				keys.forEach(function(key){
					var link = node[key];
					if(link && link['#']){ scanned.push({key: key, soul: link['#']}); }
				});
				resolve(scanned);
			});
		});
	}).then(function(items){
		return new Promise(function(resolve){
			if(!items.length){ resolve({items: [], next: null}); return }
			var result = [];
			var pending = items.length;
			items.forEach(function(item){
				root.get(item.soul).once(function(data){
					result.push(data);
					pending -= 1;
					if(pending === 0){
						result.sort(function(a, b){
							return (a && a.id ? a.id : 0) - (b && b.id ? b.id : 0);
						});
						if(reverse){ result.reverse() }
						var next = result.length ? result[result.length - 1].id : null;
						resolve({items: result, next: next});
					}
				});
			});
		});
	});
	if(cb){
		p.then(function(r){ cb(null, r) }).catch(function(err){ cb(err) });
	}
	return p;
};

}());
