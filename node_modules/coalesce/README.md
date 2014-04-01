Coalesce
========

_Fuses your code into an emergent superstructure._

[![The Tech Talk](http://dl.dropboxusercontent.com/u/4374976/screenshots/coalesce.png)](http://vimeo.com/85853754)

As simple as:
```
npm install coalesce && node -e "require('coalesce')({port:8888, sec: -2})"
```

That is it, now you can create infinite new projects, like this one:

**hello.html**
```
<!DOCTYPE html>
<html>
	<body>
		<form name="hello">
			Hello <input name="to">!
		</form>
		<script src="/theory.js">
			require('./hello')
		</script>
	</body>
</html>
```
**hello.js**
```
module.exports = require('theory')
('hello', function(a){

    a.com.send({ what: "World", where: {on: 'magic'} });

    return (document.hello.to.onkeyup = function(m){
	
		m && m.what? document.hello.to.value = m.what :
		a.com.send({what: document.hello.to.value, where: 'magic' });
		
    });

});
```
Save these two files in a subfolder called 'play' in the same directory as the install. (Don't want to copy/paste? Just clone this repo and run `node init.js` in it instead of the npm command.)

Now load <http://localhost:8888/play/hello.html> in 2 windows, side by side, the inputs will synchronize when you type!

Curiosity perked? Check out the two test apps in the playground by simply navigating to them in your browser. Or, read on. Here are some quick hints at why it is awesome (skip this to continue to code examples).

##Summary of Thoughts##
1. Your module is automatically available to be asynchronously required anywhere else, node or browser - allowing you to manage your dependencies in your JS and not the HTML.
2. Your modules get magically deployed and initialized when a browser requests them, or if otherwise specified in a startup configuration.
3. Your module can optionally receive the request and provide a response, even though it runs in a separate process, already distributed and in parallel. Same setup for multiple machines when connected.
4. Your module's primary communication practically runs off of function calls, even if it is across systems or multiple systems. Module to module communication is easy, loosely coupled directly to their functions.
5. Not opinionated, works whether your code only wants to be RESTful, or only a thick client with sockets, or entirely P2P being relayed through the server.

###...continued code examples###
But then you are like, "yo, where is my $?" and I reply "I ain't your sugar daddy, foo'." so you then:
```
module.exports = require('theory')
('hello', function(a){
	
	// your initialization code here.
	
	return { world: $('input').val() }; // the module you export. 

},['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js']);
```
Yupe, that is right, you can declare and manage your dependencies all within your javascript!

All you need in your HTML is one script tag that requires your app from inside, as seen above:
```
<script src="/theory.js">
	require('./hello')
</script>
```
Now once your modularized code loads, it won't execute until all of your dependencies are loaded.

This finally makes it easy to manage any type of large project.
If one of your dependencies is also a module, which has dependencies within it, everything asynchronously cascades.
The Theory library makes sure any Inception style depth level of dependencies is all stacked up properly before your code runs.

Hey, afterall, Cobb's wife Mal lives in the Unconstructed Dream Space, and she is named after me*mAl*locate, which is a nightmare for your memory.
(if you didn't laugh... ignore this ever happened)

So you are probably like, hey, that is what Theory does, but what is Coalesce? 
>Coalesce is the web that connects all of your modules, both Node and in the browser.
But it provides more than just a seamless TCP / HTTP / AJAX / Websocket communication layer for your apps, it also automatically distributes and deploys them.

This is kind of a throwback to PHP, but don't worry, in a good way.
Restart Coalesce with `node -e "require('coalesce')({port:8888})"`, you run this once and it acts as the master web server.
You then create your app - let's overwrite hello.js, again, to this:
```
module.exports = require('theory')
('hello', function(a){
	
	console.log("Running in both Node and on the page.");

});
```
When you fire up <http://localhost:8888/play/hello.html> from your browser, your browser makes a request to load 'hello.js'.
Coalesce then attempts to execute 'hello.js' as a separate Node process. 
If it crashes, it assumes it is a client only script, like jQuery, and serves it as a static file and remembers to do so in future.
(Note: The assumptions and static server behaviors can be modified or overwritten, as described in the API).
However, if the code can run in Node it does, and in particular, if it is a Theory module, it automagically integrates.

Now take this example, let's overwrite hello.js again:
```
module.exports = require('theory')
('hello', function(a){
	
	console.log("Running in both Node and on the page.");
	
	if( root.page ){
		a.com.send("Hello World, from the page!");
	}
	
	return (function(m){
		
		if( root.node ){
			console.log(m.what);	
		}
		
	});

});
```
Now when you refresh <http://localhost:8888/play/hello.html> you should see your Node console print out the message that had been sent from the browser.
There are several things to learn from this.

###Conclusion###
1. Coalesce should have automatically roll reloaded (since hot reloading is dangerous) your server side hello.js for you without needing to restart Coalesce.
2. Your module is exported and available on both client and server via `theory.hello` namespace, which is a function that takes the parameter `m` for 'message'.
3. Your single file app should be running on both the server and the client, by using the globally available `root.node` and `root.page` we can determine the corresponding logic.
4. Your module is initialized with a copy of Theory in the parameter, called `a` which is local to your module and provides an interface to your module's dependencies.
5. It also holds the default utilities of Theory, such as the communication layer in `a.com` which is used to send a message to your server side 'hello' module.
6. The returned function exported out in (3) receives this message, and then logs it out.

Note, this is the same thing that happened earlier with the synchronizing inputs - except since that was client side only 
(the module crashed when it tried to access the `document` element, which is undefined in node) and security was disabled via `{sec: -2}`,
the message relayed through the server to all other windows where they were on 'magic' and displayed the message in the input.
(Javascript's native `keyup` listener was bound to the exported module, which was responsible for then sending the input value).

At this point, you feel like you were following along, but now everything just exploded and you are probably confused.

The reason why, is because in just 20 LOC or less, you get access to a ton of power, which is exposed to you via raw primitives.

Remember, elegant complexity is created from the emergence of simplicity. This is coalescence.

## Messages ##
Before we talk about how to intercept HTTP requests and such, you must understand how the magic behaves.
Coalesce hates opinionated frameworks, and is as unopinionated as possible. The one catch is how a message is structured.
Messages are the glue that causes all your apps to work in unison, so they are vital to the core of everything.
Pardon the cross-disciplinary worlds, but Coalesce borrows the 'W's of journalism to describe information.

**Who . What . When . Where . Why . How**

These little goodies are what produce the powerful flexibility of Coalesce, and therefore are required for the magic to happen.
If you cannot accept this one opinion, which enables you to be free from opinions everywhere else, then Coalesce is not for you.

- **Who** An expandable object containing data relating to the recipient and the sender.
	- `{who: 'Mark'}` expands into `{who: { to: 'Mark' }}` which indicates the message is to be sent to Mark.
	- In Node, `m.who.tid` is the ID of the specific tab that sent the socket message.
	- In Node, `m.who.sid` is the session ID from the original HTTP request.
	- Server Examples:
		- `a.com.send({ what: "This is sent back to the same tab which sent me this message.", who: m.who.tid })`
		- `a.com.send({ what: "I will be sent to every tab that is in this session.", who: m.who.sid })`
- **What** An expandable anything. This is the crux of the data you are actually sending, everything else is just metadata relating to the payload.
	- Client Examples:
		- `a.com.send("Hello world!")` expands into and is accessible via `m.what`.
		- `a.com.send({ foo: 'bar' })` the value of 'bar' is accessible via `m.what.foo`.
		- `a.com.send({ foo: 'bar', who: 'Mark' })` expands into `{ who: {to: 'Mark'}, what: {foo: 'bar'} }`.
		- `a.com.send({ what: {foo: 'bar'}, who: {to: 'Mark'} })` is already expanded.
- **When** Is a hyper precise millisecond timestamp of when the message was created.
	- It is 17 digits long, which is 4 digits longer than the normal `new Date().getTime()`.
	- It is not expandable.
- **Where** Is an expandable object pertaining to pub/sub and where the message has been processed.
	- `{where: 'magic'}` expands into `{where: {at: 'magic'}}` which broadcasts the message to subscribers of the 'magic' channel.
	- `{where: {on: 'magic'}}` subscribes and broadcasts to the 'magic' channel.
	- `{where: {off: 'magic'}}` broadcasts and unsubscribes to the 'magic' channel.
- **Why** Is not used, but can be optionally added if you want to provide an arbitrary comment about why the message was sent.
- **How** Mandatory Metadata Object.
	- `m.how.way` holds the magical key which routes which way the object goes, by default is the name of the module.
	- Can overwrite the 'way' property to communicate with other modules, or directly to functions of a module using the dot notation.
	- Usage of the 'way' property, for now, will be described elsewhere.
	- You can attach any critical metadata, such as version numbers, etc.

Because communication between modules is so important, the Theory library provides many helper functions.
Despite this, it is strongly recommended and encouraged you write your own helper functions ontop of the helper functions.
Not to get too meta, but the Theory library also has helper functions to assist you in writing your own helper functions.
If this is not already an emphasis enough on how important this is,
then also note that the entire security of your app is controlled by what information you allow to flow through these APIs you create.
Because Coalesce is not opinionated, you have to enforce your own validation, sanitation, and app specific authorization.

Therefore, writing your own abstraction ontop of the communication layer will substantially ease your own development and prevent vulnerabilities.

## Intercepting HTTP ##

Now we get to start to use Coalesce's API.
This means we're going to use the more robust and explicit form of declaring a module, rather than just the shorthand we have been using.
```
module.exports = require('theory')
({name: 'hello'
, author: 'Mark Nadal'
, version: 5
, dependencies: [
    'fs'
],state: { way: 'server' }
, invincible: true
, init: function(a){
    return {
        server: function(m){
            // HTTP Intercept:
            console.log(m);
            a.fs.writeFileSync(__dirname+'./lastReq.js', "alert('The last request was at "+Date()+"')");
            m.what.body = "alert('Hello World!')";
            a.com.reply(m);
        }
    }
}});
```
Now refresh the page, we should get an ugly ol'alert message. What we are learning...

1. Rather than parameters of name, initializing function, and optional dependencies - we can just have a single parameter that is similar to a package.json file.
2. This also allows you to wrap it inside another self calling closure that returns an object, if you would like. This is the style seen in the examples, but not demonstrated here.
3. The `state` property tells Coalesce where your module will intercept HTTP requests. In this case, we want to receive it in the 'server' function of our exported module.
4. Because Coalesce will assume a script is client side only if it crashes, we activate the `invincible` tag to tell Coalesce to respawn this module server side if it does crash.
5. As the console will show, we have access to the request `m.what.url`, `m.what.headers`, and `m.what.cookies`.
6. In the same way the communication module is available via `a.com`, our dependencies are available, so we can easily use the filesystem module via `a.fs`. A dependency of `['./subdir/module-name']` is accessible via `a['module-name']`.
7. We can modify the response, by setting a `m.what.body`, `m.what.type`, and so on.
8. `a.com.reply` is a helper that accepts the message passed into the function, which you modify directly, and sends it back to whatever had sent it. It is used by Coalesce for HTTP replies, and by `a.com.ask` client side.
9. You should never write code with alert messages, writing useless data directly to the filesystem on every request, and inline javascript code. Bleck, do as I say, not as I do.

So let's fiddle with the http function by overwriting it with this:
```
            // HTTP Intercept:
            console.log(m);
            m.what.url.pathname = '/play/lastReq.js';
            m.what.type = 'js';
            a.com.reply(m);
```
Refresh and bam. It delivered the file we created previously by changing the route of the pathname.

This is interesting, though, because a lot of times we don't want our REST endpoint to be at some ugly path to filename, let alone then only be used to redirect to some other filename. We want the opposite, we want some pretty (extensionless) endpoint name which maps request(s) to our process. That way we could do things like `/hello` or `/hello/user/mark` or `/hello?name=mark`. Not all apps are like this, and therefore Coalesce should not force this, nor should it prevent it.

In order to configure this, we can't dynamically wait for our app to automatically be deployed - because the browser will never be requesting that file, but the pretty route instead! Therefore we must tell Coalesce to run our app at start up, so that way it will be ready and listening on that route. First, we need to update or create the initialization.

**init.js**
```
require('coalesce')({
	port: 8888
	,run: ['./play/hello']
});
```
Save or replace this to the install or repo folder, and restart Coalesce now with `node init.js`. Next update your hello.js to have a state proprety of `{ way: 'server', match: '/asdf', flow: -1 }`. Some quick points:

1. Coalesce takes a single parameter which is an options object.
2. You declare your routes in your app itself with the state property, not in the configuration - this makes things super flexible.
3. Flow controls the priority or weight or ordering of your route. The static file server is at `0`, so negative numbers allow you to catch and respond to a request before the file on disk is sent - thus blocking or overwriting it, if you want, for security purposes. Positive numbers will only be received if the file doesn't already exist.
4. Match is pretty much self descriptive, it is the path relative to the server that you want to listen on. You can also have dynamic routes, using basic string pattern matching symbols, that map into parameters.
5. For anything more complex, do not use the `state.match`, instead send a regex as a string on `state.regex` and `state.flags` which Coalesce will evaluate.

Alright, now let's update the http function of our hello.js file again:
```
            // HTTP Intercept:
            console.log(m.what.url);
			m.what.body = "Hello, "+ (m.what.url.query.name || 'World') +"!";
            a.com.reply(m);
```
Awesome sauce, hit up <http://localhost:8888/asdf?name=Mark> and look what it says! Now try playing around with it yourself. That's all for now on this topic, folks.

## Intercepting Sockets ##
This is done by default, upon `a.com.send` and mapped directly to your main module function. You can also communicate to other modules, via `a.com('yourOtherModule').send`, which will always pass through the server side module first. Once received, you then decide if you want to `a.com.reply` back to the client, or `m.where` client side you want to `a.com.send` it out to. Server to browser communication can only be emitted from and to the same module, unless you enable the `relay` property in the security options on your Coalesce initialization - but warning, this is a security vulnerability. This relay option was necessary for the examples to work.

Despite this flexibility of intricacy, it is going to be highly recommended that you use Redis' pubsub anyways inside of your module, because it gives you an extra layer of control over the flow points of your app. Consider this comparison, by default Coalesce provides:

1. Client emit --> 2. Server receive, sanitize, validate, process. Emit --> to another module 3. process, then Server emit --> 4. Client(s) receive.

Adding in Redis, you can get this kind of fine grain precision:

1. Client emit --> 2. Server receive, sanitize, validate, process in the context of the sender. Publish to recipients --> 3. Server receives, processes in the context of recipient, then Server emits --> each 4. Client receives.

If you think about this it pretty much gives you complete control over every possible aspect of any type of app logic, yet it is all within a fairly elegant flow structure. Although you are left with the added complexity of having to manage and handle Redis subscriptions for the clients in the server and making sure everything is atomic, especially in the context of your app being possibly run in parallel processes. Coalesce will not do this for you, because it treads on too many opinions, however helper modules for this may be released in the future to ease managing this for you - then you just include the corresponding module which matches whatever particular assumption you need for that specific app.

## API ##

### Config Options ###

- `host` the hostname you want for the server. *`'localhost'`*
- `port` the port which you want the server to listen on. *`80`*
- `dir` the root directory for the server. *(defaults to the directory of file requiring coalesce)*
- `sec` the security options object.
    - `relay` allows messages to pass through the server to other clients automatically if there is no matching module to route to. *`false`*
    - `incognito` no session cookie tracking, equivalent to a browser's incognito mode, except for the server. *`false`*
    - `key` same as https.createServer's key option, such as the contents of a key.pem file. *`''`*
    - `cert` same as https.createServer's cert option, such as the contents of a cert.pem file. *`''`*
    - rather than declaring `sec` as an object, you can set its value to one of the following **shorthands**:
    - `-2` == `{relay: true, incognito: true}`
- `run` an array of paths you want to run when the server spins up. *`[]`*
- `hook` some special hooks for debugging purposes that will get embedded into Coalesce such as:
	- `pre` a function which gets called at the beginning of every request. Good for any global request monitoring, like `console.log`ing the `req.url` for logging purposes. *`function(req,res){ }`*
	- `aft` a function which gets called after the request is handled. *`function(req,res){ }`*
	- `err` a function which gets called in case the static server encounters an error. *`function(req,res){ }`*
- `com` the SockJS config options object, see SockJS's docs.

**miscellaneous:**

- `no_global_theory_src` prevents auto linking and caching Theory for global server side reference as well as client side HTML reference. *`false`*
- `impatient` the millisecond timeout of how long a request should wait for a module to auto deploy itself and intercept the request before Coalesce hands it to the static server. *`3000`*

Example:
```
var Coalesce = require('coalesce')
	,opt = {};

opt.port = 8888;
opt.sec = { relay: true };
opt.hook = { pre: function(req,res){
	console.log(req.url);
}}
opt.impatient = 5*1000;
opt.com = {
	log: function(level, m){
		if(level === 'error') 
			console.log(m);
	}
}

Coalesce(opt);

console.log("Coalesce @ "+ opt.port);
```

### Module Options ###

- `state` the state object, for intercepting HTTP requests, as detailed in the examples. *`{}`*
    - `m.what.headers` are the default headers from the request.
    - `m.what.method` whether 'post' or 'get' etc., always lower case.
    - `m.what.url` is an object concerning the URL.
    - `m.what.cookies` is the cookie object from the request. To set your own cookie, just add a property, like `m.what.cookies.name = 'value'`. Or if you want to add options, do `m.what.cookies.name = {value: 'value', httpOnly: true, 'Max-Age': 99999}` instead.
    - `m.what.form` if a form happened to be submitted, this is it.
    - `m.what.files` if files were uploaded, this is where you deal with them.
    - `m.what.body` assign anything to this, and it will become the body of the response.
    - `m.what.type` allows you to set the Content-Type.
    - `m.what.encoding` to set the Content-Encoding.
    - `m.what.cache` use `0` for forcing no cache, or manually provide a cache control value.
    - `m.what.status` in case you need to set an explicit status code.
    - `m.what.redirect` to redirect to another URL.
- `invincible` a boolean as to whether you want this module to respawn server side, in case it crashes. *`false`*

Example:
>scroll up to see the example in the HTTP intercept section.

### Messages ###
>scroll up to see Messages section.

## Random Ramblings... ##
This is just tossing up a quick getting started guide, but it obviously is pretty vague.
So I'll just explain as much as I can really quickly in a garbled mess.
Programming is just 9 primitives - booleans, numbers, strings, texts, arrays, objects combined with loops, functions, and if statements.
Given these constructs, you then have and do 3 basic things - data, manipulation, and communication.
The Theory library provides a solid foundation for this, an abstraction layer for modular Javascript regardless of server, client, or IE6.
Coalesce creates the communication layer between all these modules, whether server to server, client to client, or server to client and vice versa,
for all protocols - TCP, HTTP, Websocket, or AJAX, all with proper dependency, routing, and event pub/sub.
This means when you write beautiful modules for your app, Coalesce automatically becomes a distributed scalable system because your files are physically separated.

## Future ##
Obviously this is still under development, and my todo list is huge. Immediately, there needs to be configuration options for adding message queues (Redis, ZeroMQ, etc.), swapping websocket libraries (SockJS, Socket.IO, ws, etc.), and cookie storage, and so on - these are all things that should "plug-in" to replace the sensible defaults. Tests are critical to add. Further out, it is intended to be cross-machine, not just cross-processes, the setup and config for that should be easy-peasy. Perhaps not within the scope of Coalesce core, but to facilitate with cross-machine fusing, it would make sense if scaling features existed to detect disk/cpu/ram overload and then auto-spawn new machines that then linked up. Lots of devops there!

Here is to the future, help me create it! In the meanwhile, please experiment and play with it, and join me!

*Note:* If you run into any problems or if anything is confusing or not easy please let me know. I'll help you and then make sure to clarify and update things. Thanks!

Crafted with love by Mark Nadal, whom is not responsible for any liabilities from the use of this code.
