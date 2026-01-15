# Plan: Fix O(n²) Array Slice in put() Hot Path

## Problem
Line 583 in `gun.js`:
```javascript
if((kl = kl.slice(i)).length){ turn(pop); return }
```

Creates a new array on every CPU yield. For a node with 1000 keys (processed 9 at a time), this causes ~111 array allocations totaling O(n²) operations.

## Solution
Track key index persistently instead of slicing.

### Changes to `/Users/jasonvongsay/codespacee/gun/gun.js`

**Line 553** - Add `ki` to persisted variables:
```javascript
var ni = 0, nj, kl, ki, soul, node, states, err, tmp;
```

**Line 565** - Reset `ki` when loading new node's keys:
```javascript
kl = Object.keys(node||{}); ki = 0; // TODO: .keys( is slow
```

**Lines 573-583** - Use `ki` instead of `i`, remove slice:
```javascript
var key; o = o || 0;
while(o++ < 9 && ki < kl.length && (key = kl[ki++])){
    if('_' === key){ continue }
    var val = node[key], state = states[key];
    if(u === state){ err = ERR+cut(key)+"on"+cut(soul)+"no state."; break }
    if(!valid(val)){ err = ERR+cut(key)+"on"+cut(soul)+"bad "+(typeof val)+cut(val); break }
    ham(val, key, soul, state, msg);
    ++C;
}
if(ki < kl.length){ turn(pop); return }
++ni; kl = null; pop(o);
```

## Verification
1. Run `npm test` - all 164 tests should pass
2. Benchmark with large nodes:
```javascript
// Before/after comparison with 1000-key nodes
const gun = Gun();
const bigNode = {};
for(let i=0; i<1000; i++) bigNode['k'+i] = i;
console.time('put');
gun.get('test').put(bigNode, () => console.timeEnd('put'));
```

## Risk
Low - logic is identical, just avoids array allocation.
