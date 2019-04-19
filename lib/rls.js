;(function(){

  function Store(opt){
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var store = function Store(){};

    var ls = localStorage;
    store.put = function(key, data, cb){ ls[''+key] = data; cb(null, 1) }
    store.get = function(key, cb){ cb(null, ls[''+key]) }

    return store;
  }

  if(typeof window !== "undefined"){
    (Store.window = window).RlocalStorage = Store;
  } else {
    try{ module.exports = Store }catch(e){}
  }

  try{
    var Gun = Store.window.Gun || require('../gun');
    Gun.on('create', function(root){
      this.to.next(root);
      root.opt.store = root.opt.store || Store(root.opt);
    });
  }catch(e){}

}());