;(function(){
	/*
		Security, Encryption, and Authorization: SEA.js
	*/

	// NECESSARY PRE-REQUISITE: http://gun.js.org/explainers/data/security.html

	/* THIS IS AN EARLY ALPHA!!! */

	if(typeof require !== "undefined"){ var Gun = require('./gun') }
	if(typeof window !== "undefined"){ var Gun = window.Gun }

	// let's extend the gun chain with a `user` function.
	// only one user can be logged in at a time, per gun instance.
	Gun.chain.user = function(){
		var root = this.back(-1); // always reference the root gun instance.
		var user = root._.user || (root._.user = root.chain()); // create a user context.
		user.create = User.create; // attach a factory method to it.
		user.auth = User.auth; // and a login method.
		return user; // return the user!
	}

	// EXAMPLE! Use it this way:
	;(function(){return;
		localStorage.clear();

		var gun = Gun();
		var user = gun.user();

		gun.on('auth', function(at){
			// do something once logged in.
		});
		gun.on('secure', function(at){
			// enforce some rules about shared app level data
			var no;
			if(no){ return }
			this.to.next(at);
		});

		user.create("test", "password"); // create a user from a username alias and a password phrase.
		user.auth("test", "password"); // authenticate and log in the user!

	}());

	// How does it work?
	function User(){};
	// Well first we have to actually create a user. That is what this function does.
	User.create = function(alias, pass, cb){
		var root = this.back(-1);
		cb = cb || function(){};
		// Because more than 1 user might have the same username, we treat the alias as a list of those users.
		root.get('alias/'+alias).get(function(at, ev){
			ev.off();
			if(at.put){
				// If we can enforce that a user name is already taken, it might be nice to try, but this is not guaranteed.
				return cb({err: Gun.log("User already created!")});
			}
			var user = {alias: alias, salt: Gun.text.random(64)};
			// pseudo-randomly create a salt, then use CryptoJS's PBKDF2 function to extend the password with it.
			SEA.proof(pass, user.salt, function(proof){
				// this will take some short amount of time to produce a proof, which slows brute force attacks.
				var pair = SEA.pair();
				// now we have generated a brand new ECDSA key pair for the user account.
				user.pub = pair.pub;
				// the user's public key doesn't need to be signed. But everything else needs to be signed with it!
				user.alias = SEA.write(alias, pair.priv);
				user.salt = SEA.write(user.salt, pair.priv);
				// to keep the private key safe, we AES encrypt it with the proof of work!
				user.auth = SEA.write(SEA.en(pair.priv, proof), pair.priv);
				var tmp = 'pub/'+pair.pub;
				//console.log("create", user, pair.pub);
				// awesome, now we can actually save the user with their public key as their ID.
				root.get(tmp).put(user);
				// next up, we want to associate the alias with the public key. So we add it to the alias list.
				var ref = root.get('alias/'+alias).put(Gun.obj.put({}, tmp, Gun.val.rel.ify(tmp)));
				// callback that the user has been created. (Note: ok = 0 because we didn't wait for disk to ack)
				cb({ok: 0, pub: pair.pub});
			});
		});
	}
	// now that we have created a user, we want to authenticate them!
	User.auth = function(alias, pass, cb){
		var root = this.back(-1);
		cb = cb || function(){};
		// load all public keys associated with the username alias we want to log in with.
		root.get('alias/'+alias).get(function(at, ev){
			ev.off();
			if(!at.put){
				// if no user, don't do anything.
				return cb({err: Gun.log("No user!")});
			}
			// then attempt to log into each one until we find ours!
			// (if two users have the same username AND the same password... that would be bad)
			Gun.obj.map(at.put, function(val, key){
				// grab the account associated with this public key.
				root.get(key).get(function(at, ev){
					key = key.slice(4);
					ev.off();
					if(!at.put){ return cb({err: "Public key does not exist!"}) }
					// attempt to PBKDF2 extend the password with the salt. (Verifying the signature gives us the plain text salt.)
					SEA.proof(pass, SEA.read(at.put.salt, key), function(proof){
						// the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
						var priv = SEA.de(SEA.read(at.put.auth, key), proof);
						// now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
						if(priv){ // if we were successful, then that means...
							// we're logged in!
							var user = root._.user;
							// add our credentials in-memory only to our root gun instance
							user._ = at.gun._;
							// so that way we can use the credentials to encrypt/decrypt data
							user._.is = user.is = {};
							// that is input/output through gun (see below)
							user._.sea = priv;
							user._.pub = key;
							//console.log("authorized", user._);
							// callbacks success with the user data credentials.
							cb(user._);
							// emit an auth event, useful for page redirects and stuff.
							root.on('auth', user._);
							return;
						}
						// Or else we failed to log in...
						console.log("Failed to sign in!");
						cb({err: "Attempt failed"});
					});
				});
			});
		});
	}
	// After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

	// We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
	Gun.on('opt', function(at){
		if(!at.sea){ // only add SEA once per instance, on the "at" context.
			at.sea = {own: {}};
			at.gun.on('in', security, at); // now listen to all input data, acting as a firewall.
			at.gun.on('out', signature, at); // and output listeners, to encrypt outgoing data.
			at.gun.on('node', every, at);
		}
		this.to.next(at); // make sure to call the "next" middleware adapter.
	});

	// Alright, this next adapter gets run at the per node level in the graph database.
	// This will let us verify that every property on a node has a value signed by a public key we trust.
	// If the signature does not match, the data is just `undefined` so it doesn't get passed on.
	// If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
	// Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
	// This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
	// From the self-enforced data, we can see all the edges in the graph that belong to a public key.
	// Example: pub/ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
	// its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
	// Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
	// Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
	// This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
	// I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
	function every(at){
		var own = (at.gun.back(-1)._).sea.own, soul = at.get, pub = own[soul] || soul.slice(4), vertex = (at.gun._).put;
		Gun.node.is(at.put, function(val, key, node){ // for each property on the node.
			vertex[key] = node[key] = val = SEA.read(val, pub); // verify signature and get plain value.
			if(val && val['#'] && (key = Gun.val.rel.is(val))){ // if it is a relation / edge
				if('alias/' === soul.slice(0,6)){ return } // if it is itself
				own[key] = pub; // associate the public key with a node
			}
		});
	};

	// signature handles data output, it is a proxy to the security function.
	function signature(at){
		at.user = at.gun.back(-1)._.user;
		security.call(this, at);
	}

	// okay! The security function handles all the heavy lifting.
	// It needs to deal read and write of input and output of system data, account/public key data, and regular data.
	// This is broken down into some pretty clear edge cases, let's go over them:
	function security(at){
		var cat = this.as, sea = cat.sea, to = this.to;
		if(at.get){
			// if there is a request to read data from us, then...
			var soul = at.get['#'];
			if(soul){ // for now, only allow direct IDs to be read.
				if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
					return to.next(at); // yes.
				} else
				if('alias/' === soul.slice(0,6)){ // Allow reading the list of public keys associated with an alias?
					return to.next(at); // yes.
				} else { // Allow reading everything?
					return to.next(at); // yes // TODO: No! Make this a callback/event that people can filter on.
				}
			}
		}
		if(at.put){
			// if there is a request to write data to us, then...
			var no, tmp, u;
			Gun.obj.map(at.put, function(node, soul){ // for each over every node in the graph
				if(no){ return no = true }
				if(Gun.obj.empty(node, '_')){ return } // ignore empty updates, don't reject them.
				if('alias' === soul){ // special case for shared system data, the list of aliases.
					Gun.obj.map(node, function(val, key){ // for each over the node to look at each property/value.
						if('_' === key){ return } // ignore meta data
						if(!val){ return no = true } // data MUST exist
						if('alias/'+key !== Gun.val.rel.is(val)){ // in fact, it must be EXACTLY equal to itself
							return no = true; // if it isn't, reject.
						}
					});
				} else
				if('alias/' === soul.slice(0,6)){ // special case for shared system data, the list of public keys for an alias.
					Gun.obj.map(node, function(val, key){ // for each over the node to look at each property/value.
						if('_' === key){ return } // ignore meta data
						if(!val){ return no = true } // data MUST exist
						if(key === Gun.val.rel.is(val)){ return } // and the ID must be EXACTLY equal to its property
						return no = true; // that way nobody can tamper with the list of public keys.
					});
				} else
				if('pub/' === soul.slice(0,4)){ // special case, account data for a public key.
					tmp = soul.slice(4); // ignore the 'pub/' prefix on the public key.
					Gun.obj.map(node, function(val, key){ // for each over the account data, looking at each property/value.
						if('_' === key){ return } // ignore meta data.
						if('pub' === key){
							if(val === tmp){ return } // the account MUST have a `pub` property that equals the ID of the public key.
							return no = true; // if not, reject the update.
						}
						if(at.user){ // if we are logged in
							if(tmp === at.user._.pub){ // as this user
								val = node[key] = SEA.write(val, at.user._.sea); // then sign our updates as we output them.
							} // (if we are lying about our signature, other peer's will reject our update)
						}
						if(u === (val = SEA.read(val, tmp))){ // make sure the signature matches the account it claims to be on.
							return no = true; // reject any updates that are signed with a mismatched account.
						}
					});
				} else
				if(at.user && (tmp = at.user._.sea)){ // not special case, if we are logged in, then
					Gun.obj.map(node, function(val, key){ // any data we output needs to
						if('_' === key){ return }
						node[key] = SEA.write(val, tmp); // be signed by our logged in account.
					});
				} else // TODO: BUG! These two if-statements are not exclusive to each other!!!
				if(tmp = sea.own[soul]){ // not special case, if we receive an update on an ID associated with a public key, then
					Gun.obj.map(node, function(val, key){ // for each over the property/values
						if('_' === key){ return } 
						if(u === (val = SEA.read(val, tmp))){ // and verify they were signed by the associated public key!
							return no = true; // reject the update if it fails to match.
						}
					});
				} else { // reject any/all other updates by default.
					return no = true;
				}
			});
			if(no){ // if we got a rejection then...
				if(!at || !Gun.tag.secure){ return }
				cat.on('secure', function(at){ // (below) emit a special event for the developer to handle security.
					this.off();
					if(!at){ return }
					to.next(at); // and if they went ahead and explicitly called "next" (to us) with data, then approve.
				});
				cat.on('secure', at);
				return; // else wise, reject.
			}
			//console.log("SEA put", at.put);
			// if we did not get a rejection, then pass forward to the "next" adapter middleware.
			return to.next(at);
		}
		to.next(at); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
	}

	function SEA(){};
	// create a wrapper library around CryptoJS and JSRSAsign.
	// of course, these libraries are required. A bundle is included in lib/cryptography.js
	if(typeof CryptoJS === "undefined"){ console.log("Error: CryptoJS required!") }
	if(typeof KJUR === "undefined"){ console.log("Error: JSRSAsign required!") }
	// now wrap the various AES, ECDSA, PBKDF2 functions we called above.
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

	// all done!
	// Obviously it is missing MANY necessary features. This is only an alpha release.
	// Please experiment with it, audit what I've done so far, and complain about what needs to be added.
	// SEA should be a full suite that is easy and seamless to use.
	// Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
	// Once logged in, the rest of the code you just read handled automatically signing/validating data.
	// But all other behavior needs to be equally easy, like opinionated ways of
	// Adding friends (trusted public keys), sending private messages, etc.
	// Cheers! Tell me what you think.

}());