<p id="readme"><a href="https://gun.eco/"><img width="40%" src="https://cldup.com/TEy9yGh45l.svg"/></a><img width="50%" align="right" vspace="25" src="https://gun.eco/see/demo.gif"/></p>

[![](https://data.jsdelivr.com/v1/package/gh/amark/gun/badge?style=rounded)](https://data.jsdelivr.com/v1/package/gh/amark/gun/stats)
![Build](https://github.com/amark/gun/actions/workflows/ci.yml/badge.svg)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.js.svg)](http://chat.gun.eco)

**GUN** is an [ecosystem](https://gun.eco/docs/Ecosystem) of **tools** that let you build [community run](https://www.nbcnews.com/tech/tech-news/these-technologists-think-internet-broken-so-they-re-building-another-n1030136) and [encrypted applications](https://gun.eco/docs/Cartoon-Cryptography) - like an Open Source Firebase or a Decentralized Dropbox.

The [Internet Archive](https://news.ycombinator.com/item?id=17685682) and [100s of other apps](https://github.com/amark/gun/wiki/awesome-gun) run GUN in-production. GUN is also part of [Twitter's Bluesky](https://blueskycommunity.net/) initiative!

 + Multiplayer by default with realtime p2p state synchronization!
 + Graph data lets you use key/value, tables, documents, videos, & more!
 + Local-first, offline, and decentralized with end-to-end encryption.

Decentralized alternatives to [Zoom](https://www.zdnet.com/article/era-hatches-meething-an-open-source-browser-based-video-conferencing-system/), [Reddit](https://notabug.io/t/whatever/comments/36588a16b9008da4e3f15663c2225e949eca4a15/gpu-bot-test), [Instagram](https://iris.to/), [Slack](https://iris.to/), [YouTube](https://d.tube/), [Stripe](https://twitter.com/marknadal/status/1422717427427647489), [Wikipedia](https://news.ycombinator.com/item?id=17685682), Facebook [Horizon](https://twitter.com/marknadal/status/1424476179189305347) and more have already pushed terabytes of daily P2P traffic on GUN. We are a [friendly community](http://chat.gun.eco/) creating a [free fun future for freedom](https://youtu.be/1HJdrBk3BlE):

<table>
<tr>
<a href="https://youtu.be/s_m16-w6bBI"><img width="31%" src="https://gun.eco/see/3dvr.gif" title="3D VR"/></a>
<a href="https://github.com/cstefanache/cstefanache.github.io/blob/06697003449e4fc531fd32ee068bab532976f47b/_posts/2016-08-02-gun-db-artificial-knowledge-sharing.md"><img width="31%" src="https://gun.eco/see/aiml.gif" title="AI/ML"/></a>
<a href="http://gps.gunDB.io/"><img width="31%" src="https://gun.eco/see/gps.gif" title="GPS"/></a>
</tr>
<tr>
<a href="https://github.com/lmangani/gun-scape#gun-scape"><img width="31%" src="https://gun.eco/see/dataviz.gif" title="Data Viz"/></a>
<a href="https://github.com/amark/gun/wiki/Auth"><img width="31%" src="https://gun.eco/see/p2p.gif" title="P2P"/></a>
<a href="https://github.com/Stefdv/gun-ui-lcd#okay-what-about-gundb-"><img width="31%" src="https://gun.eco/see/iot.gif" title="IoT"/></a>
</tr>
<tr>
<a href="http://chat.gun.eco"><img width="31%" src="https://gun.eco/see/vr-world.gif" title="VR World"/></a>
<a href="https://youtu.be/1ASrmQ-CwX4"><img width="31%" src="https://gun.eco/see/ar.gif" title="AR"/></a>
<a href="https://meething.space/"><img width="31%" src="https://gun.eco/see/video-conf.gif" title="Video Confernece"/></a>
</tr>
</table>

## Quickstart

GUN is *super easy* to get started with:

 - Try the [interactive tutorial](https://gun.eco/docs/Todo-Dapp) in the browser (**5min** ~ average developer).
 - Or `npm install gun` and run the examples with `cd node_modules/gun && npm start` (**5min** ~ average developer).

> **Note:** If you don't have [node](http://nodejs.org/) or [npm](https://www.npmjs.com/), read [this](https://github.com/amark/gun/blob/master/examples/install.sh) first.
> If the `npm` command line didn't work, you may need to `mkdir node_modules` first or use `sudo`.

- An online demo of the examples are available here: http://gunjs.herokuapp.com/
- Or write a quick app: ([try now in a playground](https://jsbin.com/kadobamevo/edit?js,console))
```html
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
<script>
// import GUN from 'gun'; // in ESM
// GUN = require('gun'); // in NodeJS
// GUN = require('gun/gun'); // in React
gun = GUN();

gun.get('mark').put({
  name: "Mark",
  email: "mark@gun.eco",
});

gun.get('mark').on((data, key) => {
  console.log("realtime updates:", data);
});

setInterval(() => { gun.get('mark').get('live').put(Math.random()) }, 9);
</script>
```
- Or try something **mind blowing**, like saving circular references to a table of documents! ([play](http://jsbin.com/wefozepume/edit?js,console))
```javascript
cat = {name: "Fluffy", species: "kitty"};
mark = {boss: cat};
cat.slave = mark;

// partial updates merge with existing data!
gun.get('mark').put(mark);

// access the data as if it is a document.
gun.get('mark').get('boss').get('name').once(function(data, key){
  // `once` grabs the data once, no subscriptions.
  console.log("Mark's boss is", data);
});

// traverse a graph of circular references!
gun.get('mark').get('boss').get('slave').once(function(data, key){
  console.log("Mark is the cat's slave!", data);
});

// add both of them to a table!
gun.get('list').set(gun.get('mark').get('boss'));
gun.get('list').set(gun.get('mark'));

// grab each item once from the table, continuously:
gun.get('list').map().once(function(data, key){
  console.log("Item:", data);
});

// live update the table!
gun.get('list').set({type: "cucumber", goal: "jumping cat"});
```

Want to keep building more? **Jump to [THE DOCUMENTATION](#documentation)!**

# About
First & foremost, GUN is **a community of the nicest and most helpful people** out there. So [I want to invite you](http://chat.gun.eco) to come tell us about what **you** are working on & wanting to build (new or old school alike! Just be nice as well.) and ask us your questions directly. :)

<p align="center"><a href="https://www.youtube.com/watch?v=oTQXzhm8w_8"><img width="250" src="https://img.youtube.com/vi/oTQXzhm8w_8/0.jpg"><br/>Watch the 100 second intro!</a></p>

The GUN ecosystem stack is a collection of independent and modular tools covering everything from [CRDT](https://crdt.tech/) [conflict resolution](https://gun.eco/distributed/matters.html), [cryptographic security](https://gun.eco/docs/Cartoon-Cryptography) & [encryption](https://gun.eco/docs/SEA), [radix storage serialization](https://gun.eco/docs/RAD), [mesh networking](https://gun.eco/docs/DAM) & [routing algorithms](https://gun.eco/docs/Routing), to distributed systems [correctness & load testing](https://github.com/gundb/panic-server), CPU scheduled [JSON parser](https://github.com/amark/gun/blob/master/lib/yson.js) to prevent UI lag, and more!

<div><img width="48%" src="https://gun.eco/see/stack.png"/>
<img width="48%" align="right" src="https://gun.eco/see/layers.png"/></div>

On that note, let's get some official shout outs covered first:

### Support

<p align="center">
Thanks to:

<table>
<tr>
<td vlign="center"><a href="https://mozilla.org/builders"><img height="100" src="https://user-images.githubusercontent.com/1423657/81992335-85346480-9643-11ea-8754-8275e98e06bc.png"></a></td>
<td vlign="center"><a href="http://unstoppabledomains.com/"><img src="https://gun.eco/img/unstoppable.png"></a></td>
<td vlign="center"><a href="https://mask.io/"><img src="https://dimensiondev.github.io/Mask-VI/assets/Logo/MB--Logo--CombH-Circle--Blue.svg" width="250"></a></td>
</tr>
<tr>
<td vlign="center">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://www.ajar.org/"><img src="https://www.ajar.org/logo.png" height="120"></a></td>
<td vlign="center"><a href="https://wallie.io/"><img src="https://raw.githubusercontent.com/gundb/gun-site/master/img/wallie.png" width="250"></a></td>
<td vlign="center">&nbsp;&nbsp;<a href="https://ghostdrive.com/"><img src="https://gun.eco/img/ghostdrive.png" height="120"></a></td>
</tr>
</table>

<a href="https://github.com/robertheessels">Robert Heessels</a>,
<a href="http://qxip.net/">Lorenzo Mangani</a>,
<a href="https://nlnet.nl/">NLnet Foundation</a>,
<a href="http://github.com/samliu">Sam Liu</a>,
<a href="http://github.com/ddombrow">Daniel Dombrowsky</a>,
<a href="http://github.com/vincentwoo">Vincent Woo</a>,
<a href="http://github.com/coolaj86">AJ ONeal</a>,
<a href="http://github.com/ottman">Bill Ottman</a>,
<a href="http://github.com/mikewlange">Mike Lange</a>,
<a href="http://github.com/ctrlplusb">Sean Matheson</a>,
<a href="http://github.com/alanmimms">Alan Mimms</a>,
<a href="https://github.com/dfreire">Dário Freire</a>,
<a href="http://github.com/velua">John Williamson</a>,
<a href="http://github.com/finwo">Robin Bron</a>,
<a href="http://github.com/ElieMakhoul">Elie Makhoul</a>,
<a href="http://github.com/mikestaub">Mike Staub</a>,
<a href="http://github.com/bmatusiak">Bradley Matusiak</a>,
<a href="https://github.com/sjuxax">Jeff Cook</a>,
<a href="https://github.com/nmauersberg">Nico</a>,
<a href="https://github.com/ajartille">Aaron Artille</a>,
<a href="https://github.com/timjrobinson">Tim Robinson</a>,
<a href="https://github.com/hibas123">Fabian Stamm</a>,
<a href="https://twitter.com/mikestaub">Mike Staub</a>,
<a href="https://hunterowens.com/">Hunter Owens</a>,
<a href="https://github.com/JacobMillner">Jacob Millner</a>,
<a href="https://github.com/b-lack">Gerrit Balindt</a>,
<a href="https://github.com/gabriellemon">Gabriel Lemon</a>
</p>

 - Join others in sponsoring code: https://www.patreon.com/gunDB !
 - Ask questions: http://stackoverflow.com/questions/tagged/gun ?
 - Found a bug? Report at: https://github.com/amark/gun/issues ;
 - **Need help**? Chat with us: http://chat.gun.eco .

### History

[GUN](https://gun.eco) was created by [Mark Nadal](https://twitter.com/marknadal) in 2014 after he had spent 4 years trying to get his collaborative web app to scale up with traditional databases.

<img width="250px" src="https://gun.eco/see/problem.png" align="left" title="pain point" style="margin: 0 1em 1em 0"> After he realized [Master-Slave database architecture causes one big bottleneck](https://gun.eco/distributed/matters.html), he (as a complete newbie outsider) naively decided **to question the status quo** and shake things up with controversial, heretical, and contrarian experiments:

**The NoDB** - no master, no servers, no "single source of truth", not built with a real programming language or real hardware, no DevOps, no locking, not *just* SQL or NoSQL but both (**all** - graphs, documents, tables, key/value).

The goal was to build a P2P database that could survive living inside **any** browser, and could correctly sync data between **any** device after assuming **any** offline-first activity.

<img src="https://gun.eco/see/compare.png" title="comparison table">

Technically, **GUN is a graph synchronization protocol** with a *lightweight embedded engine*, capable of doing *[20M+ API ops/sec](https://gun.eco/docs/Performance)* in **just ~9KB gzipped size**.

## Documentation

<table>
  <tr>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/API">API reference</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/Todo-Dapp">Tutorials</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/tree/master/examples">Examples</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/brysgo/graphql-gun">GraphQL</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/PenguinMan98/electrontest">Electron</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/React-Native">React & Native</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://github.com/sjones6/vue-gun">Vue</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/Svelte">Svelte</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/Stefdv/gun-ui-lcd#syncing">Webcomponents</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/CAP-Theorem">CAP Theorem Tradeoffs</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/distributed/matters.html">How Data Sync Works</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/Porting-GUN">How GUN is Built</a></h3></td>
  </tr>
  <tr>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/Auth">Crypto Auth</a></h3></td>
    <td style="border: 0;"><h3><a href="https://github.com/amark/gun/wiki/Awesome-GUN">Modules</a></h3></td>
    <td style="border: 0;"><h3><a href="https://gun.eco/docs/Roadmap">Roadmap</a></h3></td>
  </tr>
</table>

This would not be possible without **community contributors**, big shout out to:

**[ajmeyghani](https://github.com/ajmeyghani) ([Learn GUN Basics with Diagrams](https://medium.com/@ajmeyghani/gundb-a-graph-database-in-javascript-3860a08d873c))**; **[anywhichway](https://github.com/anywhichway) ([Block Storage](https://github.com/anywhichway/gun-block))**; **[beebase](https://github.com/beebase) ([Quasar](https://github.com/beebase/gun-vuex-quasar))**; **[BrockAtkinson](https://github.com/BrockAtkinson) ([brunch config](https://github.com/BrockAtkinson/brunch-gun))**; **[Brysgo](https://github.com/brysgo) ([GraphQL](https://github.com/brysgo/graphql-gun))**; **[d3x0r](https://github.com/d3x0r) ([SQLite](https://github.com/d3x0r/gun-db))**; **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; **[hillct](https://github.com/hillct) (Docker)**; **[JosePedroDias](https://github.com/josepedrodias) ([graph visualizer](http://acor.sl.pt:9966))**; **[JuniperChicago](https://github.com/JuniperChicago) ([cycle.js bindings](https://github.com/JuniperChicago/cycle-gun))**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc))**; **[kristianmandrup](https://github.com/kristianmandrup) ([edge](https://github.com/kristianmandrup/gun-edge))**; **[Lightnet](https://github.com/Lightnet)** ([Awesome Vue User Examples](https://glitch.com/edit/#!/jsvuegunui?path=README.md:1:0) & [User Kitchen Sink Playground](https://gdb-auth-vue-node.glitch.me/)); **[lmangani](https://github.com/lmangani) ([Cytoscape Visualizer](https://github.com/lmangani/gun-scape), [Cassandra](https://github.com/lmangani/gun-cassandra), [Fastify](https://github.com/lmangani/fastify-gundb), [LetsEncrypt](https://github.com/lmangani/polyGun-letsencrypt))**; **[mhelander](https://github.com/mhelander) ([SEA](https://github.com/amark/gun/blob/master/sea.js))**; [omarzion](https://github.com/omarzion) ([Sticky Note App](https://github.com/omarzion/stickies)); [PsychoLlama](https://github.com/PsychoLlama) ([LevelDB](https://github.com/PsychoLlama/gun-level)); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; **[robertheessels](https://github.com/swifty) ([gun-p2p-auth](https://github.com/swifty/gun-p2p-auth))**; **[rogowski](https://github.com/rogowski) (AXE)**; [sbeleidy](https://github.com/sbeleidy); **[sbiaudet](https://github.com/sbiaudet) ([C# Port](https://github.com/sbiaudet/cs-gun))**; **[Sean Matheson](https://github.com/ctrlplusb) ([Observable/RxJS/Most.js bindings](https://github.com/ctrlplusb/gun-most))**; **[Shadyzpop](https://github.com/Shadyzpop) ([React Native example](https://github.com/amark/gun/tree/master/examples/react-native))**; **[sjones6](https://github.com/sjones6) ([Flint](https://github.com/sjones6/gun-flint))**; RIP **[Stefdv](https://github.com/stefdv) (Polymer/web components)**; **[zrrrzzt](https://github.com/zrrrzzt) ([JWT Auth](https://gist.github.com/zrrrzzt/6f88dc3cedee4ee18588236756d2cfce))**; **[xmonader](https://github.com/xmonader) ([Python Port](https://github.com/xmonader/pygundb))**; 

I am missing many others, apologies, will be adding them soon! This list is infinitely old & way out of date, if you want to be listed in it please make a PR! :)

## Testing

You will need to `npm install -g mocha` first. Then in the gun root folder run `npm test`. Tests will trigger persistent writes to the DB, so subsequent runs of the test will fail. You must clear the DB before running the tests again. This can be done by running `rm -rf *data*` command in the project directory.

## Shims

 > These are only needed for NodeJS & React Native, they shim the native Browser WebCrypto API.

If you want to use [SEA](https://gun.eco/docs/SEA) for `User` auth and security, you will need to install:

`npm install @peculiar/webcrypto --save`

Please see [our React Native docs](https://gun.eco/docs/React-Native) for installation instructions!

Then you can require [SEA](https://gun.eco/docs/SEA) without an error:

```javascript
GUN = require('gun/gun');
SEA = require('gun/sea');
```

## Deploy

 > Note: The default examples that get auto-deployed on `npm start` CDN-ify all GUN files, modules, & storage.
 
 > Note: Moving forward, AXE will start to automatically cluster your peer into a shared DHT. You may want to disable this to run an isolated network.
 
 > Note: When deploying a web application using GUN on a cloud provider, you may have to set `CI=false` in your `.env`. This prevents GUN-specific warnings from being treated as errors when deploying your app. You may also resolve this by modifying your webpack config to not try to build the GUN dependencies.

To quickly spin up a GUN relay peer for your development team, utilize [Heroku](http://heroku.com), [Docker](http://docker.com), or any others listed below. Or some variant thereof [Dokku](http://dokku.viewdocs.io/dokku/), K8s, etc. ! Or use all of them so your relays are decentralized too!

### Linux

`SSH` into the home directory of a clean OS install with `sudo` ability. Set any environment variables you need (see below), then do:

```bash
curl -o- https://raw.githubusercontent.com/amark/gun/master/examples/install.sh | bash
```

 > Read [install.sh](https://github.com/amark/gun/blob/master/examples/install.sh) first!
 > If `curl` is not found, *copy&paste* the contents of install.sh into your ssh.

You can now safely `CTRL+A+D` to escape without stopping the peer. To stop everything `killall screen` or `killall node`.

Environment variables may need to be set like `export HTTPS_CERT=~/cert.pem HTTPS_KEY=~/key.pem PORT=443`. You can also look at a sample [nginx](https://gun.eco/docs/nginx) config. For production deployments, you probably will want to use something like `pm2` or better to keep the peer alive after machine reboots.

### [Heroku](https://www.heroku.com/)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/amark/gun)

 > Heroku deletes your data every 15 minutes, one way to fix this is by adding [cheap storage](https://gun.eco/docs/Using-Amazon-S3-for-Storage).

Or:

```bash
git clone https://github.com/amark/gun.git
cd gun
heroku create
git push -f heroku HEAD:master
```

Then visit the URL in the output of the 'heroku create' step, in a browser. Make sure to set any environment config vars in the settings tab.

### [Zeet.co](https://www.zeet.co/)

[![Deploy](https://deploy.zeet.co/gun.svg)](https://deploy.zeet.co/?url=https://github.com/amark/gun)

Then visit the URL in the output of the 'now --npm' step, in your browser.

### [Docker](https://www.docker.com/)

 > Warning: Docker image is community contributed and may be old with missing security updates, please check version numbers to compare.

[![Docker Automated build](https://img.shields.io/docker/automated/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![](https://images.microbadger.com/badges/image/gundb/gun.svg)](https://microbadger.com/images/gundb/gun "Get your own image badge on microbadger.com") [![Docker Pulls](https://img.shields.io/docker/pulls/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![Docker Stars](https://img.shields.io/docker/stars/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/)

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
