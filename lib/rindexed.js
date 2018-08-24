function Store(opt){
  opt = opt || {};
  opt.file = String(opt.file || 'radata');
  var db = null;

  // Initialize indexedDB. Version 1.
  const request = window.indexedDB.open(opt.file, 1)

  // Create schema. onupgradeneeded is called only when DB is first created or when the DB version increases.
  request.onupgradeneeded = function(event){
    const db = event.target.result;
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
    if(!db){
      const es = 'ERROR: RAD IndexedDB not yet ready.'
      console.log(es);
      cb(es, undefined);
    } else {
      // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
      const transaction = db.transaction([opt.file], 'readwrite');

      // Add or update data.
      const radStore = transaction.objectStore(opt.file);
      const putRequest = radStore.put(data, file);
      putRequest.onsuccess = radStore.onsuccess = transaction.onsuccess = function(){
        console.log('RAD IndexedDB put transaction was succesful.');
        cb(null, 1);
      };
      putRequest.onabort = radStore.onabort = transaction.onabort = function(){
        const es = 'ERROR: RAD IndexedDB put transaction was aborted.';
        console.log(es);
        cb(es, undefined);
      };
      putRequest.onerror = radStore.onerror = transaction.onerror = function(event){
        const es = 'ERROR: RAD IndexedDB put transaction was in error: ' + JSON.stringify(event)
        console.log(es);
        cb(es, undefined);
      };
    }
  };

  store.get = function(file, cb){
    cb = cb || function(){};
    if(!db){
      const es = 'ERROR: RAD IndexedDB not yet ready.';
      console.log(es);
      cb(es, undefined);
    } else {
      // Start a transaction. The transaction will be automaticallt closed when the last success/error handler took no new action.
      const transaction = db.transaction([opt.file], 'readwrite');

      // Read data.
      const radStore = transaction.objectStore(opt.file);
      const getRequest = radStore.get(file);
      getRequest.onsuccess = function(){
        console.log('RAD IndexedDB get transaction was succesful.');
        cb(null, getRequest.result);
      };
      getRequest.onabort = function(){
        const es = 'ERROR: RAD IndexedDB get transaction was aborted.';
        console.log(es);
        cb(es, undefined);
      };
      getRequest.onerror = function(event){
        const es = 'ERROR: RAD IndexedDB get transaction was in error: ' + JSON.stringify(event)
        console.log(es);
        cb(es, undefined);
      };
    }
  };

  return store;
}
