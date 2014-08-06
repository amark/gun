'use strict';

var users = require('./users.json').results
  , Chance = require('chance')
  , chance = new Chance(1234)
  , b
  , d = Date.now()
  , num = 10000
  ;

users = chance.shuffle(users).slice(0, num);
b = chance.shuffle(users.slice(0));
b.forEach(function (user, i) {
  if (0 === (i % 100)) {
    console.log((Date.now() - d) / 1000, i);
    d = Date.now();
  }
  user.friends = chance.shuffle(users).slice(chance.integer({ min: 20, max: 120 }));
});
console.log((Date.now() - d) / 1000, num);
