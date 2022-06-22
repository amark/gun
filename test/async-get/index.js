const Gun = require("../../index");
const {get, inject} = require("../../lib/async-get");

const gun = Gun({ peers:["https://gunpoint.herokuapp.com/gun"] });

// Add test data!
for (let i = 0; i < 5; i++) {
    gun.get("this is a test").set(`Hello, ${i}`)
}

(async () => {

    /*

        I had to find a way to allow the user to have HIS gun configuration used 
        with the peers he decided to use, and so on...

        So I created the `inject` function which allow to use 
        YOUR custom configuration. 

    */ 
    inject(gun);


    let data = await get("this is a test");

    console.log(data.list())

})();