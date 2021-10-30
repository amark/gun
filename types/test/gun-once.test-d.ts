
import Gun = require('../../index');
const gun= Gun()
let view;
gun.get('peer').get('userID').get('profile').once(function(profile){
    // render it, but only once. No updates.
    view.show.user(profile)
  })
  
  gun.get('IoT').get('temperature').once(function(number){
    view.show.temp(number)
  })


  gun.once(function(data, key) {
    gun.get('something').put('something')
  })