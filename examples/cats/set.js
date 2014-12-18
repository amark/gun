var gun = require('gun')({
	s3: (process.env.NODE_ENV === 'production')? null : require('../../test/shotgun') // replace this with your own keys!
});

gun.set({ name: "Mark Nadal", email: "mark@gunDB.io", cat: { name: "Hobbes", species: "kitty" } })
	.key('email/mark@gundb.io')
;