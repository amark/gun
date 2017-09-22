var Gun = Gun || require('../gun');

Gun.chain.promise = function(field) {
    var gun = this;
    return new Promise(function(resolve, reject) {
        gun.get(field).val(function(node, key) {
            resolve(node, key);
        });
    });
};
