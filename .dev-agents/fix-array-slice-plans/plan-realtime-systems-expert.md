# Real-time Systems / Event Loop Expert Analysis

## Problem Analysis

### Current CPU Scheduling Architecture

GUN implements cooperative multitasking through three layers:

1. **`setTimeout.poll`** (lines 73-76): Time-sliced scheduler, allows 9ms or 3333 iterations before yielding
2. **`setTimeout.turn`** (lines 78-87): Queue-based task scheduler, processes up to 99 callbacks
3. **`setTimeout.each`** (lines 91-98): Batched iterator, 9 items at a time with yields

### The Event Loop Problem

The `put()` function processes graph data:
- **Outer loop**: Iterates over souls (node IDs) in `nl`
- **Inner loop**: Iterates over keys in `kl`, 9 at a time

```javascript
while(o++ < 9 && (key = kl[i++])){
    // process key
}
if((kl = kl.slice(i)).length){ turn(pop); return }
```

### Specific Bottleneck

**The slice happens BEFORE yielding**, adding latency to each yield point:

1. **Synchronous Blocking**: `slice()` is O(remaining keys), blocking event loop
2. **Per-yield Overhead**: For 1000 keys = 112 yields, each slice adds microseconds to milliseconds
3. **Jank Under Load**: Total copies = `N + (N-9) + (N-18) + ... = O(N^2/18)`

**This violates real-time principle: minimize work between yield points.**

## Complexity Analysis

| Operation | Current | Proposed |
|-----------|---------|----------|
| Process N keys | O(N^2) copies | O(N) |
| Memory allocations | O(N/9) | O(1) |
| Time per yield point | O(remaining keys) | O(1) |
| Event loop latency per batch | Variable, grows | Constant |

## Proposed Solution

### Strategy: O(1) Yield Points

Replace slice with index tracking for constant-time yields.

**Line 553:**
```javascript
var ni = 0, nj, kl, ki, soul, node, states, err, tmp;
```

**Line 565:**
```javascript
kl = Object.keys(node||{}); ki = 0;
```

**Lines 573-583:**
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
++ni; ki = 0; kl = null; pop(o);
```

## Rationale

**Real-time benefits:**

1. **Predictable Latency**: Each yield takes constant time regardless of remaining keys
2. **60fps Compatible**: Max latency stays below 16ms frame budget
3. **No GC Pauses**: Zero allocations between yields
4. **Fair Scheduling**: Other tasks in `turn` queue get consistent time slices

## Optional Enhancement: Adaptive Batch Sizing

```javascript
var BATCH_SIZE = 9;
var TARGET_BATCH_MS = 2; // 2ms for 60fps compatibility

var batchStart = check.now();
while(o++ < BATCH_SIZE && ki < kl.length){
    // process
}
var duration = check.now() - batchStart;
// Adapt batch size based on actual performance
if(duration < TARGET_BATCH_MS * 0.5) BATCH_SIZE = Math.min(99, BATCH_SIZE + 3);
if(duration > TARGET_BATCH_MS) BATCH_SIZE = Math.max(3, BATCH_SIZE - 3);
```

## Risks and Tradeoffs

1. **Behavioral Equivalence**: Identical results
2. **The `_` key handling**: Preserved exactly
3. **Note**: `setTimeout.turn` also uses `s.slice(i)` (line 83) - secondary optimization target

## Verification

### Event Loop Latency Benchmark
```javascript
const gun = Gun();
const bigNode = {};
for(let i = 0; i < 1000; i++) bigNode['k'+i] = i;

let maxLatency = 0;
const checkLatency = () => {
    const start = performance.now();
    setImmediate(() => {
        maxLatency = Math.max(maxLatency, performance.now() - start);
    });
};
const interval = setInterval(checkLatency, 0);

gun.get('test').put(bigNode, () => {
    clearInterval(interval);
    console.log('Max event loop latency:', maxLatency.toFixed(2), 'ms');
});
```

**Expected:**
- Before: Max latency grows with node size (could exceed 16ms)
- After: Max latency stays constant