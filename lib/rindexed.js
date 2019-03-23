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
    opt.chunk = opt.chunk || (1024 * 1024); // 1MB
    var db = null, u;

    try{opt.indexedDB = opt.indexedDB || indexedDB}catch(e){}
    try{if(!opt.indexedDB || 'file:' == location.protocol){
      var store = {}, s = {};
      store.put = function(f, d, cb){ s[f] = d; cb(null, 1) };
      store.get = function(f, cb){ cb(null, s[f] || u) };
      console.log('Warning: No indexedDB exists to persist data to!');
      return store;
    }}catch(e){}
    
    var store = function Store(){};
    store.start = function(){
      var o = indexedDB.open(opt.file, 1);
      o.onupgradeneeded = function(eve){ (eve.target.result).createObjectStore(opt.file) }
      o.onsuccess = function(){ db = o.result }
      o.onerror = function(eve){ console.log(eve||1); }
    }; store.start();

    store.put = function(key, data, cb){
      if(!db){ setTimeout(function(){ store.put(key, data, cb) },1); return }
      var tx = db.transaction([opt.file], 'readwrite');
      var obj = tx.objectStore(opt.file);
      var req = obj.put(data, ''+key);
      req.onsuccess = obj.onsuccess = tx.onsuccess = function(){ cb(null, 1) }
      req.onabort = obj.onabort = tx.onabort = function(eve){ cb(eve||'put.tx.abort') }
      req.onerror = obj.onerror = tx.onerror = function(eve){ cb(eve||'put.tx.error') }
    }

    store.get = function(key, cb){
      if(!db){ setTimeout(function(){ store.get(key, cb) },9); return }
      var tx = db.transaction([opt.file], 'readonly');
      var obj = tx.objectStore(opt.file);
      var req = obj.get(''+key);
      req.onsuccess = function(){ cb(null, req.result) }
      req.onabort = function(eve){ cb(eve||4) }
      req.onerror = function(eve){ cb(eve||5) }
    }
    setInterval(function(){ db && db.close(); db = null; store.start() }, 1000 * 15); // reset webkit bug?
    return store;
  }

  if(Gun.window){
    Gun.window.RindexedDB = Store;
  } else {
    module.exports = Store;
  }
}());