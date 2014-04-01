Theory
======

Theory is an abstraction layer for server side and client side JavaScript.

Motivation
==========

1.  **Deep existence**. It all started because a program would crash via
    `if(obj.x.y.z)` rather than `if(obj && obj.x && obj.x.y && obj.x.y.z)`, so I
    wanted an elegant way to check and access deeply nested objects in a safe
    yet concise manner.

2.  **Dependency management**. You should not have to declare dependencies in
    another language (HTML) to import required code or rely on globals. Other
    tools that solve this foolishly break Node's style in order to make it work
    asynchronously.

3.  **Universal normalization**. Write once, run everywhere. This dream gets
    broken when you discover different implementations of JavaScript behave in
    unique ways, whether browsers or phones and tablets, or IE6 versus server
    side. I needed a reliable yet tiny library (at **7KB** gzipped) that would
    normalize everything so any code written would literally work everywhere.

Require
=======

As simple as `npm install theory` on Node and a single `<script
src='./theory.js'></script>` client side. The brilliant thing is that you do not
have to declare anything else after that, you can handle the rest within your
module.

	module.exports=require('theory')
	('hello', function(a){
		
		var say = "Hello World!";
		console.log(say);
		return say;
		
	}, ['./needed', './dependency']);

This is the beautiful fix that works everywhere. You get your own closure which
executes only after all your dependencies (and all of their sub-dependencies)
have loaded - then whatever you return from your closure gets exported out!

Say you name this file as 'world.js', all you have to do is run `node world.js`
on the server or put `require('world')` on the client inside the 'theory.js'
script tag (or have a normal 'world.js' script tag below theory.js). All
dependencies are relative to your file, not the HTML page or the parent module!

If the dependency you require uses some global variable, you can access it from
there (such as `jQuery`) as usual. You can access `theory` as a global, but you
should not use it globally - theory copies itself into the scope of each module
(the `a` argument, henceforth used for the rest of this documentation).

All dependencies that use exports (normal Node modules and theory specific
modules) get attached to your module's local scope with their base filename
(`a.needed` and `a.dependency` in the example above). If you have conflicting
names or just want a different name then use an object to declare dependencies
instead of an array (`{'./needed': 'foo', './dependency': 'bar'}` become `a.foo`
and `a.bar`). Theory modules also attach to their own namespace, such as
`theory.hello` in above.

You can also specify sub dependencies, such as `{'./jquery':['./jquery-ui',
'./jquery-ext']}`. Define environment specific dependencies by checking for
`root.page` or `root.node`. Finally, [imports.js](https://gist.github.com/amark/6291429) 
is an unmaintained version of just the require feature, without anything below.

*Now let's dive into the API.*

Binary
======

-   **is** `a.bi.is(what)`

    -   determines to see if what is a boolean or not.

    -   Examples

        -   `a.bi.is(false)` → `true`

        -   `a.bi.is(true)` → `true`

        -   `a.bi.is(0)` → `false`

        -   `a.bi.is('yes')` → `false`

Numbers
=======

-   **is** `a.num.is(what)`

    -   determines to see if what is a number or not.

    -   Examples

        -   `a.num.is(0)` → `true`

        -   `a.num.is(NaN)` → `false`

        -   `a.num.is(1.1)` → `true`

        -   `a.num.is(Infinity)` → `true`

-   **ify** `a.num.ify(what, opt)`

    -   what is the number, text, whatever that needs to be converted into a
        number.

    -   opt is options parameter.

        -   `[]` indicates you want a list of numbers returned.

    -   Examples

        -   `a.num.ify("A37")` → `37`

        -   `a.num("It is -22.7 degrees").ify()` → `-22.7`

        -   `a.num("My values are 33, -2.2, and 6.").ify([])` → `[33, -2.2, 6]`

-   **random** `a.num.random(what)` or `a.num.r(what)`

    -   if what is a number, it represents how many digits long you want your
        random number.

    -   if what is a list, it represents the inclusive range you want your
        random number to be in.

    -   *Note:* Maximum length is 14, what defaults to 6.

    -   Examples

        -   `a.num.random()` → `583587`

        -   `a.num(2).r()` → `64`

        -   `a.num([-10,10]).random()` → `-7`

        -   `a.num.r([1,99])` → `99`

Text
====

-   **is** `a.text.is(what)`

    -   determines to see if what is text or not.

    -   Examples

        -   `a.text.is("")` → `true`

        -   `a.text.is([])` → `false`

        -   `a.text.is("Hello World!")` → `true`

-   **ify** `a.text.ify(what)`

    -   what is the number, text, list, object, whatever you want to turn into
        text.

    -   *Note:* Essentially just a wrapper for `JSON.stringify()` for now.

    -   Examples

        -   `a.text.ify({a:0,b:'1',c:[0,'1'],d:{e:'f'}})` →
            `"{a:0,b:'1',c:[0,'1'],d:{e:'f'}}"`

-   **random** `a.text.random(what, length)` or `a.text.r(what, length)`

    -   what is a text of allowed characters to be used. Defaults to
        alpha-numeric characters.

    -   length is how many characters long you want your random text. Defaults
        to 16.

    -   *Note:* Does not matter what order you call the parameters in.

    -   Examples

        -   `a.text.random()` → `"uTkphuTCmzQ7Pl3e"`

        -   `a.text.r("AaSsDdFf",4)` → `"fDds"`

        -   `a.text(4).random("j$k4")` → `"kj$k"`

        -   `a.text("randomize").r()` → `"oadomneradnimarz"`

-   **clip** `a.text(what).clip(split, start, end)`

    -   what is the text to clip.

    -   split is the text or regex to split and rejoin upon.

    -   start is the start position of the slice.

    -   end is the end position of the slice.

    -   Examples

        -   `a.text('A B C D').clip(' ',0,-1)` → `"A B C"`

        -   `a.text.clip("path/to/awesome.js",'.',-1)` → `"js"`

-   **caps** `a.text.caps(what)`

    -   what is the text you want to capitalize.

    -   Examples

        -   `a.text.caps("shout1")` → `"SHOUT1"`

-   **low** `a.text.low(what)`

    -   what is the text you want to make lower case.

    -   Examples

        -   `a.text.low("HUSH!")` → `"hush!"`

-   **find** a collection of Regular Expressions.

    -   *Note:* No guarantee of these working or being available in future
        versions.

Lists
=====

-   **is** `a.list.is(what)`

    -   determines to see if what is a list or not.

    -   Examples

        -   `a.list.is([])` → `true`

        -   `a.list.is("list")` → `false`

        -   `a.list.is([0,false])` → `true`

-   **ify** `a.list.ify(what, opt)`

    -   what is the text or object that you want to convert into a list.

    -   opt is the options parameter.

        -   split: what to divide upon for text, whitespace auto handled. `','`
            is default.

        -   wedge: what token to use as the divider between an object’s key and
            value. `':'` default.

    -   Examples

        -   `a.list.ify("Bob, Joe,Isaac , Fred")` →
            `["Bob","Joe","Isaac","Fred"]`

        -   `a.list({a:1,b:'c',d:[1,2,3]}).ify()` → `['a:1','b:c','d:0,1,2']`

        -   `a.list({session:'AK41795'}).ify({wedge:'='})` →
            `['session=AK41795']`

        -   `a.list.ify("1,2,3 ; 4,5,6",{split:';'})` → `["1,2,3", "4,5,6"]`

-   **at** `a.list.at(what, index, opt)`

    -   what is the list you want to access.

    -   index is the where in the list you want to retrieve the value.

    -   opt is the options parameter.

        -   ebb: causes an over reaching index to cascade till it finds the
            closest item.

    -   Examples

        -   `a.list.at([5,6,7,8,9],-2)` → `8`

        -   `a.list([5,6,7,8,9]).at(2)` → `6`

        -   `a.list.at([2,3,4],9,{ebb:true})` → `4`

        -   `a.list([0,1,2]).at(-9,{ebb:true})` → `0`

        -   `a.list.at([5,6,7],-2,{ebb:true})` → `6`

-   **fuse** `a.list.fuse(what, ...)`

    -   what is the list that other lists will fuse into.

    -   … any number of extra list parameters.

    -   Examples

        -   `a.list.fuse([2,3],[4,5],[6,7])` → `[2,3,4,5,6,7]`

        -   `a.list([2,3]).fuse([3,4],[4,5])` → `[2,3,3,4,4,5]`

-   **less** `a.list.less(what, ...)`

    -   what is the list you want to subtract items from.

    -   … the items you want to remove from the list,

    -   Examples

        -   `a.list.less([0,1,false,'a',false],false)` → `[0,1,'a']`

        -   `a.list([2,2,7,['a'],1,9,0,31]).less(0,['a'],2)` → `[7, 1, 9, 31]`

    -   *Note:* An option to pass a list of items to be removed exists by
        indicating you only want `2` parameters, such that
        `a.list(2).less([0,1,2,2,3,4],[0,2])` → `[1,3,4]`.

-   **find** `a.list.find(list, what)`

    -   list is the list you want to search.

    -   what is the item you are looking for.

    -   Examples

        -   `a.list([4,5]).find(9)` → `0`

        -   `a.list([4,5]).find(5)` → `2`

        -   `a.list.find([4,5],4)` → `1`

-   **each** `a.list.each(list, function, this)`

    -   list is the list you want to iterate through each of its items.

    -   function is your callback which gets executed sequentially, on each
        item.

        -   the first parameter is the current item’s value.

        -   the second parameter is the current index of that value in the list.

        -   the third parameter is a map function, which when called pushes its
            argument into a list that is returned by default by `each`.

        -   `return;` or `return undefined;` immediately proceeds to the next
            item.

        -   return anything else and the loop breaks, then `each` returns the
            value you returned instead.

    -   this is an optional argument that will become the `this` inside the
        function.

    -   Examples

        -   `a.list([1,2,3]).each(function(val, i, map){ map(val + i) })` → `[2,
            4, 6]`

        -   `a.list([1,2,3]).each(function(){ return "Hello World!"; })` →
            `"Hello World!"`

        -   `a.list([1,2,3]).each(function(val, i, map){ if(val == 2){ return }
            map(val); })` → `[1,3]`

        -   `a.list([1,2,3]).each(function(val, i, map){ map(val); if(val == 2){
            return val } })` → `2`

        -   `a.list([{name:'joe',age:27},{name:'bob',age:42}]).each(function(val,
            i, map){ map(val.name) })` → `['joe','bob']`

        -   `a.list(['a','b','c']).each(function(){ return this })` → `//
            current context`

        -   `a.list(['a','b','c']).each(function(){ return this }, {z:1})` →
            `{z:1}`

Notes
-----

Theory uses lists and index notation, not arrays and offset notation. Offset
notation is the common practice of describing the position of an element in an
array by its corresponding location in the physically allocated space of
contiguous memory, which logically starts at a zeroth initial. This is otherwise
shortened to "0 based index arrays", despite the misnomer of it actually being
an offset. The author of this library has chosen index notation instead because
it offers the following advantages:

1.  Naturally, the first element in a list cardinally corresponds to `1`.
    Contrarily, even official documentation of JavaScript has explicit
    disclaimers that the "first element of an array is actually at index 0" -
    this is easily forgotten, especially by novices, and can lead to errors.

2.  Mathematically, a closed interval is properly represented in code as `for(i
    = 1; i <= items.length; i++)`, because it includes its endpoints. Offset
    notation instead is technically a left-closed right-open interval set,
    represented in code as `for(i = 0; i < items.length; i++)`. This matters
    because code deals with integer intervals, because all elements have a fixed
    size - you can not access a fractional part of an element. Integer intervals
    are closed intervals, thus conclusively proving this importance.

3.  Mathematically, matrix notation also starts with `1`.

4.  The last element in a list cardinally corresponds to the length of the list,
    thus allowing easy access with `items.length` rather than having frustrating
    `(items.length - 1)` arithmetic everywhere in your code.

5.  Negative indices are symmetric with positive indices. Such that `-1` and `1`
    respectively refer to the last and first element, and in the case where
    there is only one item in the list, it matches the same element. This
    convenience allows for simple left and right access that offset notation
    does not provide.

6.  Non existence of an element can be represented by `0`, which would
    conveniently code elegantly as `if( !items.indexOf('z') ) return;`. Rather,
    one must decide upon whether `if( items.indexOf('z') == -1 ) return;` is
    philosophically more meaningful than `if( items.indexOf('z') < 0 ) return;`
    with offset notation despite ignoring the asymmetry of the equation.

Still irrational? Then switch it back via `a.list.index = 0` in your closure.

Objects
=======

-   **is** `a.obj.is(what)`

    -   determines to see if what is an object or not.

    -   Examples

        -   `a.obj.is({})` → `true`

        -   `a.obj.is(function(){})` → `false`

        -   `a.obj.is([])` → `false`

-   **ify** `a.obj.ify(what)`

    -   what is the text-ified object you want to parse into an object.

    -   *Note:* Essentially just a wrapper for `JSON.parse()` for now.

    -   Examples

        -   `a.obj.ify('[0,1]')` → `[0,1]`

        -   `a.obj('{"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}}').ify()` →
            `{"a":false,"b":1,"c":"d","e":[0,1],"f":{"g":"h"}}`

-   **has** `a.obj.has(what, key)`

    -   what is the object you want to test the existence of a key or property
        on.

    -   key is the property you want to see if exists in what.

    -   Examples

        -   `a.obj.has({yay:false},'yay')` → `true`

        -   `a.obj({yay:false}).has('toString')` → `false`

-   **empty** `a.obj.empty(what)`

    -   what is the object you want to test to see if it is empty.

    -   Examples

        -   `a.obj.empty({})` → `true`

        -   `a.obj({a:0}).empty()` → `false`

-   **copy** `a.obj.copy(what)`

    -   what is the object or list that you want to make a deep duplicate of.

    -   Examples

        -   `a.obj.copy({a:[0,1],b:function(){ return 1 }})` →
            `{a:[0,1],b:function(){ return 1 }}`

        -   `a.obj([{a:1},{b:2}]).copy()` → `[{a:1},{b:2}]`

-   **union** `a.obj.union(what, ...)` or `a.obj(what).u(...)`

    -   what is the object you want to merge into, or a list of objects to
        merge.

    -   ... are more objects to be merged.

    -   *Note:* You can provide a list of objects instead, which will be merged.

    -   Examples

        -   `a.obj.union({a:'b',c:'d'},{c:1,z:2})` → `{a:'b',c:'d',z:2}`

        -   `a.obj([{a:1},{b:2}]).union()` → `{a:1,b:2}`

        -   `a.obj({a:'b',c:'d'}).u({c:1,z:2},{x:3,y:4})` →
            `{a:'b',c:'d',x:3,y:4,z:2}`

        -   `a.obj.u([{a:1,b:2},{b:3,x:4},{y:5}])` → `{a:1,b:2,x:4,y:5}`

-   **get** `a.obj.get(what, where)` or `a(what, where)`

    -   what is the object you want to get something from.

    -   where is a dot separated text of keys to the thing you want to get.

        -   numbers indicate a list index, if not specified it will scan through
            the list.

        -   "-\>" postfix indicates you will be calling a function, but if not
            found it will return a fail safe function.

    -   *Note:* Warning, fails if the property name itself contains a '.' dot in
        it.

    -   Examples

        -   `a.obj.get({a:4,b:6,c:8},'b')` → `6`

        -   `a.obj({a:4,b:6,c:8}).get('z')` → `undefined`

        -   `a.obj({a:{z:{b:{y:{c:{x:'deep'}}}}}}).get('a.z.b.y.c.x')` →
            `'deep'`

        -   `a.obj({a:[1,[2,{b:{c:'scan'}},3],4]}).get('a.b.c')` → `'scan'`

        -   `a.obj({a:[1,{b:'index'},3]}).get('a.2.b')` → `'index'`

        -   `a.obj({a:[1,{b:'index'},3]}).get('a.-2.b')` → `'index'`

        -   `a.obj({a:{b:function(c){return c*c}}}).get('a.b->')(2)` → `4`

        -   `a.obj({a:1}).get('a.b->')(2)` → `undefined // fail safe`

        -   `a.obj({a:1}).get('a.b')(2)` → `TypeError: undefined is not a
            function`

-   **each** `a.obj.each(object, function, this)`

    -   object is the object you want to iterate through each of its key/value
        pairs.

    -   function is your callback which gets executed on each pair.

        -   the first parameter is the current value.

        -   the second parameter is the key of the value in the object.

        -   the third parameter is a map function, which when called adds a
            key/value pair to the object that is returned by default by `each`.

        -   `return;` or `return undefined;` immediately proceeds to the next
            pair.

        -   return anything else and the loop breaks, then `each` returns the
            value you returned instead.

    -   this is an optional argument that will become the `this` inside the
        function.

    -   Examples

        -   `a.obj({a:'z',b:'y'}).each(function(val, key, map){ map(val,key) })`
            → `{y:'b',z:'a'}`

        -   `a.obj({a:'z',b:'y'}).each(function(){ return "Hello World!"; })` →
            `"Hello World!"`

        -   `a.obj({a:1,b:2,c:3}).each(function(val, key, map){ if(val == 2){
            return } map(key,val); })` → `{a:1,c:3}`

        -   `a.obj({a:1,b:2,c:3}).each(function(val, key, map){ map(key,val);
            if(val == 2){ return val } })` → `2`

        -   `a.obj({z:4}).each(function(){ return this })` → `// current
            context`

        -   `a.obj({z:4}).each(function(){ return this }, [1,2])` → `[1,2]`

Functions
=========

-   **is** `a.fns.is(what)`

    -   determines to see if what is a function or not.

    -   Examples

        -   `a.fns.is(function(){})` → `true`

        -   `a.fns.is({})` → `false`

-   **pass** `a.fns.pass(function, this)`

    -   function is the function that you want this bound to.

    -   this will become the `this` inside the function.

    -   *Note:* The original function is returned for you to then immediately
        call.

    -   Examples

        -   `a.fns.pass(function(z){ return this.b + z  },{b:1})(2)` → `3`

        -   `a.fns(function(z){ return this.b + z }).pass({b:2})(3)` → `5`

-   **sort** `a.fns.sort(what)`

    -   what is the arguments object of the function you want sorted.

    -   *Note:* An object containing the first letter of each type is returned.
        The value of these keys is a list with the corresponding arguments of
        that type, in the same order as they appeared in the original function
        call.

    -   *Note:* If something goes wrong, an error type is included, with a text
        value explaining why.

    -   Examples

        -   `(function(){ return a.fns.sort(arguments) })("a",0,"b",1,{z:2})` →
            `{b:[],n:[0,1],t:['a','b'],l:[],o:[{z:2}],f:[]}`

        -   `a.fns.sort()` → `{e:"Empty"}`

-   **flow** `a.fns.flow(what, function)`

    -   what is a sequential list of functions to asynchronously iterate
        through.

        -   the last parameter of each function is the next function in the
            list.

        -   at any point, the flow can be canceled by calling `.end()` on the
            last parameter.

    -   function is the callback to be executed at the end of the operations.

    -   Examples

        -   `a.fns.flow([function(next){ next(6) },function(six, next){ next(six
            / 3) }],function(two){ alert(two) })`

        -   `a.fns.flow([function(next){ next.end(2) },function(){ /* skipped */
            }],function(two){ alert(two) })`

Events
======

-   **event** `a.on(what).event(function)`

    -   what is a string name of the event you want to listen on.

    -   function is the callback function that will be called when the event is
        emitted.

        -   the `this` object of the callback is the listener object.

    -   returns the listener, which you can call `.off()` on to stop receiving
        events.

    -   Examples

        -   `a.on('alarm').event(function(task){ alert('Remember to ' + task);
            this.off(); })`

-   **emit** `a.on(what).emit(data, ...)`

    -   what is a string name of the event you want to emit on.

    -   data and ... are your parameters to emit to the receivers.

    -   Examples

        -   `a.on('alarm').emit('exercise!')`

Time
====

-   **is** `a.time.is()`

    -   timestamp wrapper for `new Date().getTime()`, but if a parameter is
        provided it will test if it is an instance of `Date`.

    -   Examples

        -   `a.time.is()` → `1357457565462`

        -   `a.time(new Date()).is()` → `true`

-   **now** `a.time.now()`

    -   hyper precise timestamp, up to four decimals longer than the above.

    -   Examples

        -   `a.time.now()` → `1357457866774.292`

-   **loop** `a.time.loop(function, interval)`

    -   repeatedly calls function every interval millisecond, wrapper for
        `setInterval`.

    -   *Note:* Does not matter what order you call the parameters in.

    -   Examples

        -   `a.time.loop(function(){ alert('loop') },1000)` → `// returns ID for
            clearing`

-   **wait** `a.time.wait(function, delay)`

    -   calls function after waiting millisecond delay, wrapper for
        `setTimeout`.

    -   *Note:* Does not matter what order you call the parameters in.

    -   Examples

        -   `a.time.wait(1000,function(){ alert('wait') })` → `// returns ID for
            clearing`

-   **stop** `a.time.stop(ID)`

    -   stops the wait or loop associated with the ID from further being
        executed.

    -   Examples

        -   `a.time.stop(1111)` → `true`

Tests
=====

-   **is** `a.test.is(what, thing)`

    -   what is what you want to compare equivalency against thing.

    -   thing is the thing you want to compare equivalency to what.

    -   Examples

        -   `a.test.is({a:1,b:'c',d:{f:function(){return
            false}}},{a:1,b:'c',d:{f:function(){return false}}})` → `true`

        -   `a.test(NaN).is(NaN)` → `true`

        -   `a.test.is(function(){return true},function(){ return true; })` →
            `false`

        -   `a.test(undefined).is(null)` → `false`

-   **test** `a.test(function)()`

    -   function is the function that might break, and you want to test.

    -   *Note:* all this does is wrap it in a `try{}catch(){}` block.

    -   Examples

        -   `a.test(function(){ explode_with_spam })()` → `// error object`

        -   `a.test(function(){ return 'ok'; })()` → `'ok'`

Run them! Using mocha, just `mocha` with Node or `./test/mocha.html` in any
browser.  
  
Crafted with love by Mark Nadal, whom is not responsible for any liabilities
from the use of this code.
