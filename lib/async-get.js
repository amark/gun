let gun;

let used = false;

Object.prototype.list = function (data) {

    let all = Object.entries(this);

    all.shift();

    let mapped = []

    for(let i = 0; i < all.length; i++) {
        mapped.push(all[i][1]);
    }
    
    return mapped;
}

const inject = (instance) => {
    used = true;
    gun = instance;
}

const get = async (what) => {

    if (!used) {
        console.log(new Error("You must inject Gun into the packager by passing its reference to the `inject` function."))
        process.exit(1);
    }

    if (!what) {
        console.log(new Error("You did not provide any soul. EXAMPLE: let whatever = await get(<soul>);"))
        process.exit(1);
    }

    let result;
    await gun.get(what).once(data => {
        result = data;
    })

    return await result;

}

module.exports = {
    get:get,
    inject: inject
}