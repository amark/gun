var gun = require('gun')({
	s3: (process.env.NODE_ENV === 'production')? null : require('../../test/shotgun') // replace this with your own keys!
});

gun.load('email/mark@gundb.io').get(function(Mark){
    console.log("Hello ", Mark);
	this.path('username').set('amark'); // because we hadn't saved it yet!
    this.path('cat').get(function(Hobbes){ // `this` is context of the nodes you explore via path
		console.log(Hobbes);
		this.set({ servant: Mark, coat: "tabby" }); // oh no! Hobbes has become Mark's master.
        this.key('kitten/hobbes'); // cats are taking over the internet! Better make an index for them.
    });
});