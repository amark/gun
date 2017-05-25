;(function(){
	/*
		Security, Encryption, and Authorization: SEA.js
	*/

	/* THIS IS AN EARLY ALPHA!!! */

	if(typeof require !== "undefined"){ var Gun = require('./gun') }
	if(typeof window !== "undefined"){ var Gun = window.Gun }

	Gun.on('opt', function(at){
		if(!at.sea){
			at.sea = {own: {}};
			at.gun.on('in', security, at);
			at.gun.on('out', signature, at);
		}
		this.to.next(at);
	});

	Gun.on('node', function(at){ // TODO: Warning: Needs to be converted to `gun.on('node')`!
		var own = (at.gun.back(-1)._).sea.own, soul = at.get, pub = own[soul] || soul.slice(4), vertex = (at.gun._).put;
		Gun.node.is(at.put, function(val, key, node){
			vertex[key] = node[key] = val = SEA.read(val, pub);
			if(val && val['#'] && (key = Gun.val.rel.is(val))){
				if('alias/' === soul.slice(0,6)){ return }
				own[key] = pub;
			}
		});
	})

	function signature(at){
		at.user = at.gun.back(-1)._.user;
		security.call(this, at);
	}

	function security(at){
		var cat = this.as, sea = cat.sea, to = this.to;
		if(at.get){
			var soul = at.get['#'];
			//console.log("SEA get", soul);
			if(soul){
				if('alias' === soul){
					return to.next(at);
				} else
				if('alias/' === soul.slice(0,6)){
					return to.next(at);
				} else {
					return to.next(at); // TODO: allow all reads?
				}
			}
		}
		if(at.put){
			var no, tmp, u;
			Gun.obj.map(at.put, function(node, soul){
				if(no){ return no = true }
				if(Gun.obj.empty(node, '_')){ return }
				if('alias' === soul){
					Gun.obj.map(node, function(val, key){
						if('_' === key){ return }
						if(!val){ return no = true }
						if('alias/'+key !== Gun.val.rel.is(val)){
							return no = true;
						}
					});
				} else
				if('alias/' === soul.slice(0,6)){
					Gun.obj.map(node, function(val, key){
						if('_' === key){ return }
						if(!val){ return no = true }
						if(key === Gun.val.rel.is(val)){ return }
						return no = true;
					});
				} else
				if('pub/' === soul.slice(0,4)){
					tmp = soul.slice(4);
					Gun.obj.map(node, function(val, key){
						if('_' === key){ return }
						if('pub' === key){
							if(val === tmp){ return }
							return no = true;
						}
						if(at.user){
							if(tmp === at.user._.pub){
								val = node[key] = SEA.write(val, at.user._.sea);
							}
						}
						if(u === (val = SEA.read(val, tmp))){
							return no = true;
						}
					});
				} else
				if(at.user && (tmp = at.user._.sea)){
					Gun.obj.map(node, function(val, key){
						if('_' === key){ return }
						node[key] = SEA.write(val, tmp);
					});
				} else
				if(tmp = sea.own[soul]){
					Gun.obj.map(node, function(val, key){
						if('_' === key){ return }
						if(u === (val = SEA.read(val, tmp))){
							return no = true;
						}
					});
				} else {
					return no = true;
				}
			});
			if(no){
				if(!at || !Gun.tag.secure){ return }
				Gun.on('secure', function(at){
					this.off();
					if(!at){ return }
					to.next(at);
				});
				Gun.on('secure', at);
				return;
			}
			//console.log("SEA put", at.put);
			return to.next(at);
		}
		to.next(at);
	}

	Gun.chain.user = function(){
		var root = this.back(-1);
		var user = root._.user || (root._.user = root.chain());
		user.create = User.create;
		user.auth = User.auth;
		return user;
	}
	function User(){};
	User.create = function(alias, pass, cb){
		var root = this.back(-1);
		cb = cb || function(){};
		root.get('alias/'+alias).get(function(at, ev){
			ev.off();
			if(at.put){
				return cb({err: Gun.log("User already created!")});
			}
			var user = {alias: alias, salt: Gun.text.random(64)};
			SEA.proof(pass, user.salt, function(proof){
				var pair = SEA.pair();
				user.pub = pair.pub;
				user.alias = SEA.write(alias, pair.priv);
				user.salt = SEA.write(user.salt, pair.priv);
				user.auth = SEA.write(SEA.en(pair.priv, proof), pair.priv);
				var tmp = 'pub/'+pair.pub;
				//console.log("create", user, pair.pub);
				root.get(tmp).put(user);
				var ref = root.get('alias/'+alias).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)));
				cb({ok: 0, pub: pair.pub});
			});
		});
	}
	User.auth = function(alias, pass, cb){
		var root = this.back(-1);
		cb = cb || function(){};
		root.get('alias/'+alias).get(function(at, ev){
			ev.off();
			if(!at.put){
				return cb({err: Gun.log("No user!")});
			}
			Gun.obj.map(at.put, function(val, key){
				root.get(key).get(function(at, ev){
					key = key.slice(4);
					ev.off();
					if(!at.put){ return cb({err: "Public key does not exist!"}) }
					SEA.proof(pass, SEA.read(at.put.salt, key), function(proof){
						var priv = SEA.de(SEA.read(at.put.auth, key), proof);
						if(priv){
							//console.log("Signed in!", at.put);
							/*if(window.sessionStorage){
								sessionStorage.tmp = data.pass;
								sessionStorage.alias = data.alias;
							}
							c.me = Gun.obj.copy(alias);
							return route('people');
							*/
							var user = root._.user;
							user._ = at.gun._;
							user._.is = user.is = {};
							user._.sea = priv;
							user._.pub = key;
							//console.log("authorized", user._);
							cb(user._);
							Gun.on('auth', user._);
							return;
						}
						console.log("Failed to sign in!");
						cb({err: "Attempt failed"});
					});
				});
			});
		});
	}
	function SEA(){};
	if(typeof CryptoJS === "undefined"){ console.log("Error: CryptoJS required!") }
	if(typeof KJUR === "undefined"){ console.log("Error: JSRSAsign required!") }
	SEA.proof = function(pass,salt,cb){
		cb(CryptoJS.PBKDF2(pass, salt, {keySize: 512/32, iterations: 100}).toString(CryptoJS.enc.Base64));
	};
	SEA.pair = function(){
		var master = new KJUR.crypto.ECDSA({"curve": 'secp256r1'});
		var pair = master.generateKeyPairHex();
		return {pub: pair.ecpubhex, priv: pair.ecprvhex};
	};
	SEA.sign = function(m, p){
		var sig = new KJUR.crypto.Signature({'alg': 'SHA256withECDSA'});
		sig.initSign({'ecprvhex': p, 'eccurvename': 'secp256r1'});
		sig.updateString(JSON.stringify(m));
		return sig.sign();
	}
	SEA.verify = function(m, p, s){
		var sig = new KJUR.crypto.Signature({'alg': 'SHA256withECDSA', 'prov': "cryptojs/jsrsa"}), yes;
		try{
			sig.initVerifyByPublicKey({'ecpubhex': p, 'eccurvename': 'secp256r1'});
			sig.updateString(JSON.stringify(m));
			yes = sig.verify(s);
		}catch(e){Gun.log(e)}
		return yes;
	}
	SEA.write = function(m, p){
		return 'SEA'+JSON.stringify([m,SEA.sign(m,p)]);
		return JSON.stringify([m,SEA.sign(m,p)]);
	}
	SEA.read = function(m, p){
		if(!m){ return }
		if(!m.slice || 'SEA[' !== m.slice(0,4)){ return m }
		m = m.slice(3);
		try{m = JSON.parse(m);
		}catch(e){ return }
		m = m || '';
		if(SEA.verify(m[0], p, m[1])){
			return m[0];
		}
	}
	SEA.en = function(m, p){
		return CryptoJS.AES.encrypt(JSON.stringify(m), p, {format:SEA.froto}).toString();
	};
	SEA.de = function(m, p){
		var r;
		try{r = CryptoJS.AES.decrypt(m, p, {format:SEA.froto}).toString(CryptoJS.enc.Utf8);
			r = JSON.parse(r);
		}catch(e){};
		return r;
	};
	SEA.froto = {stringify:function(a){var b={ct:a.ciphertext.toString(CryptoJS.enc.Base64)};a.iv&&(b.iv=a.iv.toString());a.salt&&(b.s=a.salt.toString());return JSON.stringify(b)},parse:function(a){a=JSON.parse(a);var b=CryptoJS.lib.CipherParams.create({ciphertext:CryptoJS.enc.Base64.parse(a.ct)});a.iv&&(b.iv=CryptoJS.enc.Hex.parse(a.iv));a.s&&(b.salt=CryptoJS.enc.Hex.parse(a.s));return b}};
	Gun.SEA = SEA;
	
}());

;(function(){return;
	localStorage.clear();

	var gun = window.gun = Gun();

	var user = gun.user();

	Gun.on('auth', function(at){
		// do something once logged in.
	});

	Gun.on('secure', function(at){
		// enforce some rules about shared app level data
		var no;
		if(no){ return }
		this.to.next(at);
	});

	user.create("test", "password");

	user.auth("test", "password");

}());