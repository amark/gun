;(function(){

  /**
  Radix AsyncStorage adapter
  make sure to pass AsyncStorage instance in opt.AsyncStorage
  **/
  function Store(opt){
    opt = opt || {};
    const store = () => {
      const as = opt.AsyncStorage;
      const put = (key, data, cb) =>
      { 
        as.setItem(''+key,data)
          .then(_ => cb(null,1))
          .catch(_ => {
            console.error(`failed saving to asyncstorage`,{key, data})
            cb(null,0)
          })
      }

      const get = (key,cb) => {
        as.getItem(''+key)
          .then(data => cb(null,data))
          .catch(_ => {
            console.error(`failed fetching from asyncstorage`,{key})
            cb(null,0)
          })
      }
    }
    
    return store;
  }

  if(typeof window !== "undefined"){
    (Store.window = window).RasyncStorage = Store;
  } else {
    try{ module.exports = Store }catch(e){}
  }

}());