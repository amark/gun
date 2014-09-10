'use strict';

var users = require('./users.json').results
  , Chance = require('chance')
  , chance = new Chance(1234)
  , b
  , d = Date.now()
  , num = 50
  ;

users = users.map(function(user){
	user = user.user;
	user._ = user._ || {};
	user._['#'] = user.sha1;
	user.first = user.name.first;
	user.last = user.name.last;
	user.title = user.name.title;
	delete user.name;
	user.zip = user.location.zip;
	user.street = user.location.street;
	user.city = user.location.city;
	user.state = user.location.state;
	delete user.location;
	return user;
})  
users = chance.shuffle(users).slice(0, num);
b = chance.shuffle(users.slice(0));
b.forEach(function (user, i) {
  if (0 === (i % 100)) {
    console.log((Date.now() - d) / 1000, i);
    d = Date.now();
  }
  user.friends = chance.shuffle(users).slice(chance.integer({ min: 20, max: (num < 120)? num : 120 }));
});

var gun = require('gun')({
	s3: require('../test/shotgun') // replace this with your own keys!
});

gun.set(b[0]);

console.log(b[1], b[1].friends.length);
console.log((Date.now() - d) / 1000, num);
