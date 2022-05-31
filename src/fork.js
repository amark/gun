
var Gun = require('./index');

Gun.chain.fork = function(g) {
	var gun = this._;
	var w = {},
		mesh = () => {
			var root = gun.root,
				opt = root.opt;
			return opt.mesh || Gun.Mesh(root);
		}
	w.link = function() {
		if (this._l) return this._l;
		this._l = {
			send: (msg) => {
				if (!this.l || !this.l.onmessage)
					throw 'not attached';
				this.l.onmessage(msg);
			}
		}
		return this._l;
	};
	w.attach = function(l) {
		if (this.l)
			throw 'already attached';
		var peer = { wire: l };
		l.onmessage = function(msg) {
			mesh().hear(msg.data || msg, peer);
		};
		mesh().hi(this.l = l && peer);
	};
	w.wire = function(opts) {
		var f = new Gun(opts);
		f.fork(w);
		return f;
	};
	if (g) {
		w.attach(g.link());
		g.attach(w.link());
	}
	return w;
};

	