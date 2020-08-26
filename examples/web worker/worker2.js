importScripts("workerdb.js");
var gun = Gun(["https://mvp-gun.herokuapp.com/gun", "https://e2eec.herokuapp.com/gun"]).get('thoughts');
self.onmessage = function (message) {
  gun.set(message.data)
}
