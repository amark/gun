
function use(plugin){
	var _self = this;
	this.on('opt', function(ctx) {
		this.to.next(ctx);
		if (!plugin || !(plugin.install instanceof 'function')) {
			throw "Plugins must implement a `install` method";
		}
		plugin.install(_self, ctx);
	});
}
module.exports = use;
	