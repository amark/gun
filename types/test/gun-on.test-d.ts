
import Gun = require('../../index');
const gun = Gun()
var listenerHandler = (value, key, _msg, _ev) => {

}

Gun().on(listenerHandler)

// add listener to foo
gun.get('foo').on(listenerHandler, true)

// remove listener to foo
gun.get('foo').off()

gun.get('users').get('username').on(function(user : any){
    // update in real-time
    if (user.online) {
    } else {
    }
  })

  gun.get('home').get('lights').on(listenerHandler,true);