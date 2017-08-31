var Gun = Gun || require('../gun');

Gun.chain.promise = function(cb) {
    var gun = this, cb = cb || function(ctx) { return ctx };
    return (new Promise(function(res, rej) {
        gun.val(function(node, key) {
            res({val: node, key: key, gun: gun});
        });
    })).then(cb);
};
