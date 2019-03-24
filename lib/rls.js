;(function(){
  var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

  Gun.on('create', function(root){
    this.to.next(root);
    root.opt.store = root.opt.store || Store(root.opt);
  });

  function Store(opt){
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    if(Gun.TESTING){ opt.file = 'radatatest' }
    var ls = localStorage;

    var store = function Store(){};

    store.put = function(key, data, cb){ ls[''+key] = data; cb(null, 1) }
    store.get = function(key, cb){ cb(null, ls[''+key]) }

    return store;
  }

  if(Gun.window){
    Gun.window.RlocalStorage = Store;
  } else {
    module.exports = Store;
  }
}());