var Gun = require('./gun');
require('./lib/promise');

var gun = new Gun();

/* prep */
var mark = gun.get('mark').put({
    name: 'mark'
})
var cat = gun.get('cat').put({
    name: 'sylvester'
});
mark.get('boss').put(cat);
cat.get('slave').put(mark);

/* async/await syntax */
async function getField(field) {
    var node = await gun.get(field).promise();
    console.log({1: node.val});
    return node;
};

setTimeout(async () => {
    var mark = await getField('mark');
    console.log({2: mark.val});
}, 100);

/* chained thens */
setTimeout(() => {
    gun.get('mark')
    .promise(ctx => {
        console.log({a: ctx.val});
        return mark.get('boss').promise();
    })
    .then(cat => {
        console.log({b: cat.val});
        return cat.gun.get('slave').promise();
    })
    .then(mark => {
        console.log({c: mark.val});
        process.exit();
    });
}, 200);

