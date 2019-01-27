;(function(){
  var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

  Gun.on('create', function(root){
    this.to.next(root);
    root.opt.store = root.opt.store || Store(root.opt);
  });

  function Store(opt){
    opt = opt || {};
    opt.file = String(opt.file || 'radata');
    var db = null;

    opt.indexedDB = opt.indexedDB || window.indexedDB;
    // Initialize indexedDB. Version 1.
    var request = opt.indexedDB.open(opt.file, 1)

    // Create schema. onupgradeneeded is called only when DB is first created or when the DB version increases.
    request.onupgradeneeded = function(event){
      var db = event.target.result;
      db.createObjectStore(opt.file);
    }

    // onsuccess is called when the DB is ready.
    request.onsuccess = function(){
      db = request.result;
    }

    request.onerror = function(event){
      console.log('ERROR: RAD IndexedDB generic error:', event);
    };

    var store = function Store(){}, u;

    store.put = function(file, data, cb){
      cb = cb || function(){};
      var doPut = function(){
        // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
        var transaction = db.transaction([opt.file], 'readwrite');

        // Add or update data.
        var radStore = transaction.objectStore(opt.file);
        var putRequest = radStore.put(data, file);
        putRequest.onsuccess = radStore.onsuccess = transaction.onsuccess = function(){
          //console.log('RAD IndexedDB put transaction was succesful.');
          cb(null, 1);
        };
        putRequest.onabort = radStore.onabort = transaction.onabort = function(){
          var es = 'ERROR: RAD IndexedDB put transaction was aborted.';
          console.log(es);
          cb(es, undefined);
        };
        putRequest.onerror = radStore.onerror = transaction.onerror = function(event){
          var es = 'ERROR: RAD IndexedDB put transaction was in error: ' + JSON.stringify(event)
          console.log(es);
          cb(es, undefined);
        };
      }
      if(!db){
        waitDbReady(doPut, 100, function(){
          var es = 'ERROR: Timeout: RAD IndexedDB not ready.';
          console.log(es);
          cb(es, undefined);
        }, 10)
      } else {
        doPut();
      }
    };

    store.get = function(file, cb){
      cb = cb || function(){};
      var doGet = function(){
        // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
        var transaction = db.transaction([opt.file], 'readwrite');

        // Read data.
        var radStore = transaction.objectStore(opt.file);
        var getRequest = radStore.get(file);
        getRequest.onsuccess = function(){
          //console.log('RAD IndexedDB get transaction was succesful.');
          cb(null, getRequest.result);
        };
        getRequest.onabort = function(){
          var es = 'ERROR: RAD IndexedDB get transaction was aborted.';
          console.log(es);
          cb(es, undefined);
        };
        getRequest.onerror = function(event){
          var es = 'ERROR: RAD IndexedDB get transaction was in error: ' + JSON.stringify(event)
          console.log(es);
          cb(es, undefined);
        };
      }
      if(!db){
        waitDbReady(doGet, 100, function(){
          var es = 'ERROR: Timeout: RAD IndexedDB not ready.';
          console.log(es);
          cb(es, undefined);
        }, 10)
      } else {
        doGet();
      }
    };

    var waitDbReady = function(readyFunc, checkInterval, timeoutFunc, timeoutSecs){
      var startTime = new Date();
      var checkFunc = function(){
        if(db){
          readyFunc(); 
        } else {
          if((new Date() - startTime) / 1000 >= timeoutSecs){
            timeoutFunc();
          } else {
            setTimeout(checkFunc, checkInterval);
          }
        }
      };
      checkFunc();
    };

    return store;
  }

  if(Gun.window){
    Gun.window.RindexedDB = Store;
  } else {
    module.exports = Store;
  }
}());
