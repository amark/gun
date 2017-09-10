var Gun = require('./gun');
require('./lib/promise');

var gun = new Gun();

gun.get('mark').put({
    name: 'mark'
})

async function getField(field) {
    var node = await gun.promise(field);
    console.log(node);
    return node;
};

setTimeout(async () => {
    var mark = await getField('mark');
    console.log(mark);
    process.exit();
}, 100);