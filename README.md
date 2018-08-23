<p><a href="https://gun.eco/"><img width="40%" src="https://cldup.com/TEy9yGh45l.svg"/></a><img width="50%" align="right" vspace="25" src="https://gun.eco/see/demo.gif"/></p> 

[![npm](https://img.shields.io/npm/dm/gun.svg)](https://www.npmjs.com/package/gun)
[![Travis](https://img.shields.io/travis/amark/gun/master.svg)](https://travis-ci.org/amark/gun)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun.svg?size=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun?ref=badge_shield)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.js.svg)](https://gitter.im/amark/gun)
[![](https://data.jsdelivr.com/v1/package/npm/gun/badge?style=rounded)](https://www.jsdelivr.com/package/npm/gun)

**GUN** is an _ecosystem_  of tools that let you <u>build tomorrow's dApps, today</u>.

Decentralized alternatives to [Reddit](https://notabug.io/), [YouTube](https://d.tube/), [Wikipedia](https://news.ycombinator.com/item?id=17685682), etc. are already pushing terabytes of daily P2P traffic on GUN. We are a [friendly community](https://gitter.im/amark/gun) creating a free fun future for freedom:

<table>
<tr>
<a href=""><img width="31%" align="left" src="https://gun.eco/see/3dvr.gif" title="3D VR"/></a>
<a href="https://github.com/cstefanache/cstefanache.github.io/blob/master/_posts/2016-08-02-gun-db-artificial-knowledge-sharing.md#gundb"><img width="31%" align="left" src="https://gun.eco/see/aiml.gif" title="AI/ML"/></a>
<a href="http://gps.gunDB.io/"><img width="31%" align="left" src="https://gun.eco/see/gps.gif" title="GPS"/></a>
<a href="https://github.com/lmangani/gun-scape#gun-scape"><img width="31%" align="left" src="https://gun.eco/see/dataviz.gif" title="Data Viz"/></a>
<a href="https://github.com/amark/gun/wiki/Auth"><img width="31%" align="left" src="https://gun.eco/see/p2p.gif" title="P2P"/></a>
<a href="https://github.com/Stefdv/gun-ui-lcd#okay-what-about-gundb-"><img width="31%" align="left" src="https://gun.eco/see/iot.gif" title="IoT"/></a>
</tr>
</table>

The ecosystem is one nice stack of technologies that looks like this:

<div><img width="48%" src="https://gun.eco/see/stack.png"/>
<img width="48%" align="right" src="https://gun.eco/see/layers.png"/></div>

For now, it is best to start with GUN and _just use it_ to learn the basics, since it is _**so easy**_: (**or** want to read more? Skip ahead to the "[What is GUN?](#what-is-gun)" section.)

## Quickstart

 - Try the [interactive tutorial](https://gun.eco/think.html) in the browser (**5min** ~ average developer).
 - Or `npm install gun` and run the examples with `cd node_modules/gun && npm start` (**5min** ~ average developer).

> **Note:** If you don't have [node](http://nodejs.org/) or [npm](https://www.npmjs.com/), read [this](https://github.com/amark/gun/blob/master/examples/install.sh) first.
> If the `npm` command line didn't work, you may need to `mkdir node_modules` first or use `sudo`.

- An online demo of the examples are available here: http://gunjs.herokuapp.com/
- Or write a quick app: ([try now in jsbin](http://jsbin.com/sovihaveso/edit?js,console))
```html
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
<script>
// var Gun = require('gun'); // in NodeJS
// var Gun = require('gun/gun'); // in React
var gun = Gun();

gun.get('mark').put({
  name: "Mark",
  email: "mark@gunDB.io",
});

gun.get('mark').on(function(data, key){
  console.log("update:", data);
});
</script>
```
- Or try something **mind blowing**, like saving circular references to a table of documents! ([play](http://jsbin.com/wefozepume/edit?js,console))
```javascript
var cat = {name: "Fluffy", species: "kitty"};
var mark = {boss: cat};
cat.child = mark;

// partial updates merge with existing data!
gun.get('mark').put(mark);

// access the data as if it is a document.
gun.get('mark').get('boss').get('name').once(function(data, key){
  // `val` grabs the data once, no subscriptions.
  console.log("Mark's boss is", data);
});

// traverse a graph of circular references!
gun.get('mark').get('boss').get('child').once(function(data, key){
  console.log("Mark is the child!", data);
});

// add both of them to a table!
gun.get('list').set(gun.get('mark').get('boss'));
gun.get('list').set(gun.get('mark'));

// grab each item once from the table, continuously:
gun.get('list').map().once(function(data, key){
  console.log("Item:", data);
});

// live update the table!
gun.get('list').set({type: "cucumber", goal: "scare cat"});
```

Want to keep building more? **Jump to [THE DOCUMENTATION](#documentation)!**

# What is GUN?

First & foremost, GUN is **a community of the nicest and most helpful people** out there. So [I want to invite you](https://gitter.im/amark/gun) to come tell us about what **you** are working on & wanting to build (new or old school alike! Just be nice as well.) and ask us your questions directly. :)

On that note, let's get some official shout outs covered first:

### Support

<p align="center">
Thanks to:<br/>
<a href="http://qxip.net/">Lorenzo Mangani</a>, 
<a href="http://github.com/samliu">Sam Liu</a>, 
<a href="http://github.com/ddombrow">Daniel Dombrowsky</a>, 
<a href="http://github.com/vincentwoo">Vincent Woo</a>, 
<a href="http://github.com/coolaj86">AJ ONeal</a>, 
<a href="http://github.com/ottman">Bill Ottman</a>,
<a href="http://github.com/ctrlplusb">Sean Matheson</a>, 
<a href="http://github.com/alanmimms">Alan Mimms</a>,
<a href="https://github.com/dfreire">Dário Freire</a>,
<a href="http://github.com/velua">John Williamson</a>
</p>

 - Join others in sponsoring code: https://www.patreon.com/gunDB !
 - Ask questions: http://stackoverflow.com/questions/tagged/gun ?
 - Found a bug? Report at: https://github.com/amark/gun/issues ;
 - **Need help**? Chat with us: https://gitter.im/amark/gun .

### History

[GUN](https://gun.eco) was created by [Mark Nadal](https://twitter.com/marknadal) in 2014 after he had spent 4 years trying to get his collaborative web app to scale up with traditional databases. 

<img width="250px" src="https://gun.eco/see/problem.png" align="left" title="pain point" style="margin: 0 1em 1em 0"> After he realized [Primary-Replica database architecture causes one big bottleneck](https://gun.eco/distributed/matters.html), he (as a complete newbie outsider) naively decided **to question the status quo** and shake things up with controversial, heretical, and contrarian experiments:

**The NoDB** - no master, no servers, no "single source of truth", not built with a real programming language or real hardware, no DevOps, no locking, not *just* SQL or NoSQL but both (**all** - graphs, documents, tables, key/value).

The goal was to build a P2P database that could survive living inside **any** browser, and could correctly sync data between **any** device after assuming **any** offline-first activity.

<img src="https://gun.eco/see/compare.png" title="comparison table">

Technically, **GUN is a graph synchronization protocol** with a *lightweight embedded engine*, capable of doing *[20M+ API ops/sec](https://gun.eco/docs/100000-ops-sec-in-IE6-on-2GB-Atom-CPU)* in **just ~9KB gzipped size**.

## Documentation

<table>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/API">API reference</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/think.html">Tutorials</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/tree/master/examples">Examples</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/brysgo/graphql-gun">GraphQL</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/PenguinMan98/electrontest">Electron</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/React-Native">React Native</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/sjones6/vue-gun">Vue</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/React-Tutorial">React</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/Stefdv/gun-ui-lcd#syncing">Webcomponents</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/CAP-Theorem">CAP Theorem Tradeoffs</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/distributed/matters.html">How Data Sync Works</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/porting-gun">How GUN is Built</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/auth">Crypto Auth</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/Modules">Modules</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/roadmap">Roadmap</a></h3></td>
  </tr>
</table>

This would not be possible without **community contributors**, big shout out to:

**[anywhichway](https://github.com/anywhichway) ([Block Storage](https://github.com/anywhichway/gun-block))**; **[beebase](https://github.com/beebase) ([Quasar](https://github.com/beebase/gun-vuex-quasar))**; **[BrockAtkinson](https://github.com/BrockAtkinson) ([brunch config](https://github.com/BrockAtkinson/brunch-gun))**; **[Brysgo](https://github.com/brysgo) ([GraphQL](https://github.com/brysgo/graphql-gun))**; **[d3x0r](https://github.com/d3x0r) ([SQLite](https://github.com/d3x0r/gun-db))**; **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; **[hillct](https://github.com/hillct) (Docker)**; **[JosePedroDias](https://github.com/josepedrodias) ([graph visualizer](http://acor.sl.pt:9966))**; **[JuniperChicago](https://github.com/JuniperChicago) ([cycle.js bindings](https://github.com/JuniperChicago/cycle-gun))**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc))**; **[kristianmandrup](https://github.com/kristianmandrup) ([edge](https://github.com/kristianmandrup/gun-edge))**; **[Lightnet](https://github.com/Lightnet)** ([User Kitchen Sink Playground](https://gdb-auth-vue-node.glitch.me/)); **[lmangani](https://github.com/lmangani) ([Cytoscape Visualizer](https://github.com/lmangani/gun-scape), [Cassandra](https://github.com/lmangani/gun-cassandra), [Fastify](https://github.com/lmangani/fastify-gundb), [LetsEncrypt](https://github.com/lmangani/polyGun-letsencrypt))**; **[mhelander](https://github.com/mhelander) ([SEA](https://github.com/amark/gun/blob/master/sea.js))**; [omarzion](https://github.com/omarzion) ([Sticky Note App](https://github.com/omarzion/stickies)); [PsychoLlama](https://github.com/PsychoLlama) ([LevelDB](https://github.com/PsychoLlama/gun-level)); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; **[robertheessels](https://github.com/swifty) ([gun-p2p-auth](https://github.com/swifty/gun-p2p-auth))**; [sbeleidy](https://github.com/sbeleidy); **[Sean Matheson](https://github.com/ctrlplusb) ([Observable/RxJS/Most.js bindings](https://github.com/ctrlplusb/gun-most))**; **[Stefdv](https://github.com/stefdv) (Polymer/web components)**; **[sjones6](https://github.com/sjones6) ([Flint](https://github.com/sjones6/gun-flint))**; **[zrrrzzt](https://github.com/zrrrzzt) ([JWT Auth](https://gist.github.com/zrrrzzt/6f88dc3cedee4ee18588236756d2cfce))**; **[88dev](https://github.com/88dev) ([Database Viewer](https://github.com/88dev/gun-show))**;

I am missing many others, apologies, will be adding them soon!

## Deploy

To quickly spin up a Gun test server for your development team, utilize either [Heroku](http://heroku.com) or [Docker](http://docker.com) or any variant thereof [Dokku](http://dokku.viewdocs.io/dokku/), [Flynn.io](http://flynn.io), [now.sh](https://zeit.co/now), etc. !

### [Heroku](https://www.heroku.com/)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/amark/gun)

Or:

```bash
git clone https://github.com/amark/gun.git
cd gun
heroku create
git push -f heroku HEAD:master
```

Then visit the URL in the output of the 'heroku create' step, in a browser.

### [Now.sh](https://zeit.co/now/)

```bash
npm install -g now
now --npm amark/gun
```

Then visit the URL in the output of the 'now --npm' step, in your browser.

### [Docker](https://www.docker.com/)

[![Docker Automated buil](https://img.shields.io/docker/automated/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![](https://images.microbadger.com/badges/image/gundb/gun.svg)](https://microbadger.com/images/gundb/gun "Get your own image badge on microbadger.com") [![Docker Pulls](https://img.shields.io/docker/pulls/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![Docker Stars](https://img.shields.io/docker/stars/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/)

Pull from the [Docker Hub](https://hub.docker.com/r/gundb/gun/) [![](https://images.microbadger.com/badges/commit/gundb/gun.svg)](https://microbadger.com/images/gundb/gun). Or:

```bash
docker run -p 8765:8765 gundb/gun
```

Or build the [Docker](https://docs.docker.com/engine/installation/) image locally:

```bash
git clone https://github.com/amark/gun.git
cd gun
docker build -t myrepo/gundb:v1 .
docker run -p 8765:8765 myrepo/gundb:v1
```

Or, if you prefer your Docker image with metadata labels (Linux/Mac only):

```bash
npm run docker
docker run -p 8765:8765 username/gun:git
```

Then visit [http://localhost:8765](http://localhost:8765) in your browser.

## License

Designed with ♥ by Mark Nadal, the GUN team, and many amazing contributors.

Openly licensed under [Zlib / MIT / Apache 2.0](https://github.com/amark/gun/blob/master/LICENSE.md).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun.svg?size=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun?ref=badge_large)

[YouTube](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g) . [Twitter](https://twitter.com/marknadal)
