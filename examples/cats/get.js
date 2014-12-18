var gun = require('gun')({
	s3: (process.env.NODE_ENV === 'production')? null : require('../../test/shotgun') // replace this with your own keys!
});

gun.load('kitten/hobbes').path('servant.cat.servant.name').get(function(name){ console.log(name) })