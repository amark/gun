importScripts("workerdb.js");
var gun = Gun(["https://mvp-gun.herokuapp.com/gun", "https://e2eec.herokuapp.com/gun"]).get('thoughts');
self.onmessage = function (message) {
  gun.get(message.data).put(null);
}

gun.map().on((thought, id) => {
array = [id, thought]
 self.postMessage(array)
})
