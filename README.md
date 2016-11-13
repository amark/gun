<h1>
	<a href="http://gundb.io">
		<img src='https://cldup.com/TEy9yGh45l.svg'
			width='40%'
			alt="gun" />
	</a>
</h1>

[![npm](https://img.shields.io/npm/dm/gun.svg)](https://www.npmjs.com/package/gun)
[![Travis](https://img.shields.io/travis/amark/gun/master.svg)](https://travis-ci.org/amark/gun)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.js.svg)](https://gitter.im/amark/gun)

GUN is a realtime, distributed, offline-first, graph database engine. Lightweight and powerful, at just **~9KB** gzipped.

<a href="https://youtu.be/-i-11T5ZI9o" title="1 minute demo of fault tolerance"><img src="http://img.youtube.com/vi/-i-11T5ZI9o/0.jpg" width="425px"></a>
<a href="https://youtu.be/-FN_J3etdvY" title="1 minute demo of fault tolerance"><img src="http://img.youtube.com/vi/-FN_J3etdvY/0.jpg" width="425px"></a>

## Why?

 - **Realtime** - It may be trivial to get realtime updates with socket.io or something, but what you do not get is *state synchronization*. GUN does this for you out of the box, assuring that two users' simultaneous updates won't concurrently break each other.
 - **Distributed** - GUN is peer-to-peer by design, meaning you have no centralized database server to maintain or that could crash. This lets you sleep through the night without worrying about database DevOps - we call this "NoDB". From that, you can build decentralized, federated, or centralized apps.
 - **Offline-first** - GUN works even if your internet or cell reception doesn't. Users can still plug away and save data as normal, and then when the network comes back online GUN will automatically synchronize all the changes and handle any conflicts for you.
 - **Graph** - Most databases force you to bend over backwards to match their storage constraints. But graphs are different, they let you have any data structure you want. Whether that be traditional tables with relations, document oriented trees, or tons of circular references. You choose.

## Quickstart

Try the [interactive tutorial](http://gun.js.org/think.html) in the browser (**5min** ~ average developer). Or run the NodeJS [demo example apps](#demos) (**5min** ~ average developer).

Jump right into the [gun playground](http://jsbin.com/miredog/edit?js,console) and start testing whatever functions you want.

Quick note: All active development is happening on `0.5` branch, which has the upcoming **30M+ ops/sec** performance improvements!

## Demos

 - [Online example applications](http://gunjs.herokuapp.com/)
 - The above examples are included in this repo. You can run them locally by running the following commands in your terminal or on your command line:

   > **Note:** If you don't have [node](http://nodejs.org/) or [npm](https://www.npmjs.com/), read [this](https://github.com/amark/gun/blob/master/examples/install.sh) first.

   ```bash
   npm install gun
   cd node_modules/gun
   node examples/http.js 8080
   ```

   Then visit [http://localhost:8080](http://localhost:8080) in your browser. 

   If that did not work it is probably because npm installed it to a global directory. To fix that try `mkdir node_modules` in your desired directory and re-run the above commands. You also might have to add `sudo` in front of the commands.

### Videos
 - [Fault tolerance](https://www.youtube.com/watch?v=-i-11T5ZI9o&feature=youtu.be) (01:01)
 - [Saving relational or document based data](https://www.youtube.com/watch?v=cOO6wz1rZVY&feature=youtu.be) (06:59)
 - [Everything you want to know about GUN](https://youtu.be/qJNDplwJ8aQ) (57:50) 2x speed recommended.
 - [GUN's YouTube channel](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g/playlists) also has videos.

### <a name="gun-projects"></a>Projects
 - GUN users are encouraged to add their projects to this [running projects list](https://github.com/amark/gun/wiki/projects).

## Docs & Tradeoffs
 - [Getting Started with GUN](https://github.com/amark/gun/wiki/getting-started-(v0.3.x)) Guide. 
 - [API documentation](https://github.com/amark/gun/wiki/API-(v0.3.x)) and [examples' source code](https://github.com/amark/gun/blob/master/examples).
 - GUN is an AP system which means you should not use it for banking apps, [learn more here](https://github.com/amark/gun/wiki/CAP-Theorem).
 - Check out and add example code [snippets](https://github.com/amark/gun/wiki/snippets-(v0.3.x)) —including micro-modules— to address specific situations.

## <a name="gun-modules"></a>Modules
GUN is designed to be as minimal as possible, with any additional functionality being provided via modules.  Please refer to the [modules](https://github.com/amark/gun/wiki/modules) page for a list of existing extensions. Please refer to the [gun-extensions](https://github.com/gundb/gun-extensions/issues) repo to see what extensions have been requested or to request an extension.

## How can I help make gun even more awesome?
 - Star this repo
 - Follow us and share your appreciation via [Gitter](https://gitter.im/amark/gun), [Twitter](https://twitter.com/databasegun), [LinkedIn](https://www.linkedin.com/company/gun-inc), and [Facebook](https://www.facebook.com/databasegun)
 - [Share projects you've written](https://github.com/amark/gun/wiki/projects)
 - [Build extensions or squish bugs](https://waffle.io/amark/gun)
         - If you are working on an extension, familiarize yourself with [GUN's Module API](https://github.com/amark/gun/wiki/Building-Modules-for-Gun)

## License

Designed with ♥ by Mark Nadal, the gun team, and many amazing contributors.  Liberally licensed under [Zlib / MIT / Apache 2.0](https://github.com/amark/gun/blob/master/LICENSE.md).

## Contributors

Thanks to the following people who have contributed to GUN, via code, issues, or conversation (this list has quickly become tremendously behind! We'll probably turn this into a dedicated wiki page so you can add yourself):

[agborkowski](https://github.com/agborkowski); [alexlafroscia](https://github.com/alexlafroscia); [anubiann00b](https://github.com/anubiann00b); [bromagosa](https://github.com/bromagosa); [coolaj86](https://github.com/coolaj86); [d-oliveros](https://github.com/d-oliveros), [danscan](https://github.com/danscan); **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; [gedw99](https://github.com/gedw99); [HelloCodeMing](https://github.com/HelloCodeMing); **[JosePedroDias](https://github.com/josepedrodias) ([graph visualizer](http://acor.sl.pt:9966))**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc))**; [ndarilek](https://github.com/ndarilek); [onetom](https://github.com/onetom); [phpnode](https://github.com/phpnode); [PsychoLlama](https://github.com/PsychoLlama); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; **[robertheessels](https://github.com/swifty) ([gun-p2p-auth](https://github.com/swifty/gun-p2p-auth))**; [riston](https://github.com/riston); [rootsical](https://github.com/rootsical); [rrrene](https://github.com/rrrene); [sbeleidy](https://github.com/sbeleidy) [ssr1ram](https://github.com/ssr1ram); **[Stefdv](https://github.com/stefdv) ([Polymer/web components](http://stefdv.github.io/gun-collection/components/gun-collection/))**; [Xe](https://github.com/Xe); [zot](https://github.com/zot);
[ayurmedia](https://github.com/ayurmedia);

This list of contributors was manually compiled and alphabetically sorted. If we missed you, please submit an issue so we can get you added!

## [Changelog](https://github.com/amark/gun/blob/master/CHANGELOG.md#03)

Also see the current [Release List](https://github.com/amark/gun/releases) and [Tag List](https://github.com/amark/gun/tags) for quick access to relevant versions.

==========================
<a name="stay-up-to-date"></a>

<a href="https://gitter.im/amark/gun"><img alt="Gitter channel" src="https://badges.gitter.im/Join%20Chat.svg" /></a>
[![YouTube](https://img.shields.io/badge/You-Tube-red.svg)](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g) [![LinkedIn](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/company/gun-inc) [![Twitter Follow](https://img.shields.io/twitter/follow/databasegun.svg?style=social)](https://twitter.com/databasegun)
