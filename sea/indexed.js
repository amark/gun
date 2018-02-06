
    // This is safe class to operate with IndexedDB data - all methods are Promise
    function EasyIndexedDB(objectStoreName, dbName = 'GunDB', dbVersion = 1) {
      // Private internals, including constructor props
      const runTransaction = (fn_) => new Promise((resolve, reject) => {
        const open = indexedDB.open(dbName, dbVersion) // Open (or create) the DB
        open.onerror = (e) => {
          reject(new Error('IndexedDB error:', e))
        }
        open.onupgradeneeded = () => {
          const db = open.result // Create the schema; props === current version
          db.createObjectStore(objectStoreName, { keyPath: 'id' })
        }
        let result
        open.onsuccess = () => {    // Start a new transaction
          const db = open.result
          const tx = db.transaction(objectStoreName, 'readwrite')
          const store = tx.objectStore(objectStoreName)
          tx.oncomplete = () => {
            db.close()        // Close the db when the transaction is done
            resolve(result)   // Resolves result returned by action function fn_
          }
          result = fn_(store)
        }
      })

      Object.assign(this, {
        async wipe() {  // Wipe IndexedDB completedy!
          return runTransaction((store) => {
            const act = store.clear()
            act.onsuccess = () => {}
          })
        },
        async put(id, props) {
          const data = Object.assign({}, props, { id })
          return runTransaction((store) => { store.put(data) })
        },
        async get(id, prop) {
          return runTransaction((store) => new Promise((resolve) => {
            const getData = store.get(id)
            getData.onsuccess = () => {
              const { result = {} } = getData
              resolve(result[prop])
            }
          }))
        }
      })
    }

    let indexedDB
    let funcsSetter

    if (typeof __webpack_require__ === 'function' || typeof window !== 'undefined') {
      funcsSetter = () => window
      indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB
    } else {
      funcsSetter = () => {
        const { TextEncoder, TextDecoder } = require('text-encoding')
        // Let's have Storage for NodeJS / testing
        const sessionStorage = new require('node-localstorage').LocalStorage('.sessionStorage')
        const localStorage = new require('node-localstorage').LocalStorage('.localStorage')
        return { TextEncoder, TextDecoder, sessionStorage, localStorage }
      }
      indexedDB = require('fake-indexeddb')
    }

    const { TextEncoder, TextDecoder, sessionStorage, localStorage } = funcsSetter()

    if (typeof __webpack_require__ !== 'function' && typeof global !== 'undefined') {
      global.sessionStorage = sessionStorage
      global.localStorage = localStorage
    }

    const seaIndexedDb = new EasyIndexedDB('SEA', 'GunDB', 1) // This is IndexedDB used by Gun SEA
    EasyIndexedDB.scope = seaIndexedDb; // for now. This module should not export an instance of itself!

    module.exports = EasyIndexedDB;
  