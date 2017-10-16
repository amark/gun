<h1>
	<a href="http://gundb.io">
		<img src='https://cldup.com/TEy9yGh45l.svg'
			width='40%'
			style='float:right;'
			alt="gun" />
	</a>
	<img width='15%'>
	<a href="http://gun.js.org">
		<img src='http://gun.js.org/see/demo.gif'
			width='40%'
			alt="gun" />
	</a>
</h1>

[![npm](https://img.shields.io/npm/dm/gun.svg)](https://www.npmjs.com/package/gun)
[![Travis](https://img.shields.io/travis/amark/gun/master.svg)](https://travis-ci.org/amark/gun)
[![Gitter](https://img.shields.io/gitter/room/amark/gun.js.svg)](https://gitter.im/amark/gun)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun.svg?size=small)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun?ref=badge_small)

GUN is a realtime, distributed, offline-first, graph database engine. Doing **[20M+](https://github.com/amark/gun/wiki/100000-ops-sec-in-IE6-on-2GB-Atom-CPU) ops/sec** in just **~9KB** gzipped.

<a href="https://youtu.be/-i-11T5ZI9o" title="1 minute demo of fault tolerance"><img src="http://img.youtube.com/vi/-i-11T5ZI9o/0.jpg" width="425px"></a>
<a href="https://youtu.be/-FN_J3etdvY" title="1 minute demo of fault tolerance"><img src="http://img.youtube.com/vi/-FN_J3etdvY/0.jpg" width="425px"></a>

## Why?

 - **Realtime** - You might use socketio for realtime updates, but what happens if you reload the page? GUN solves *state synchronization* for you, no matter what, on reloads, across all your users, and even on conflicting updates.
 - **Distributed** - GUN is peer-to-peer by design, meaning you have no centralized database server to maintain or that could crash. This lets you sleep through the night without worrying about database DevOps - we call it "NoDB". From there, you can build decentralized, federated, or centralized apps.
 - **Offline-first** - GUN works even if your internet or cell reception doesn't. Users can still plug away and save data as normal, and then when the network comes back online GUN will automatically synchronize all the changes and handle any conflicts for you.
 - **Graph** - Most databases force you to bend over backwards to match their storage constraints. But graphs are different, they let you have any data structure you want. Whether that be traditional tables with relations, document oriented trees, or tons of circular references. You choose.

## Quickstart

 - Try the [interactive tutorial](http://gun.js.org/think.html) in the browser (**5min** ~ average developer).
 - Or run the NodeJS examples `npm install gun && cd node_modules/gun && npm start` (**5min** ~ average developer).

> **Note:** If you don't have [node](http://nodejs.org/) or [npm](https://www.npmjs.com/), read [this](https://github.com/amark/gun/blob/master/examples/install.sh) first.
> If the `npm` command line didn't work, you may need to `mkdir node_modules` first or use `sudo`.

- An online demo of the examples are available here: http://gunjs.herokuapp.com/
- Or write a quick app: ([try now in jsbin](http://jsbin.com/saxewigote/edit?js,console))
```html
<script src="http://rawgit.com/amark/gun/master/gun.js"></script>
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

## Support

 - Help support development: https://www.patreon.com/gunDB !
 - Ask questions: http://stackoverflow.com/questions/tagged/gun ?
 - Chat with us: https://gitter.im/amark/gun .

## Documentation
 - [API reference](https://github.com/amark/gun/wiki/API).
 - [**A must read crash course on using GUN**](https://github.com/amark/gun/wiki/graphs).
 - [Introductory Guide](https://github.com/amark/gun/wiki/getting-started-(v0.3.x)).
 - [What tradeoffs does GUN make](https://github.com/amark/gun/wiki/CAP-Theorem)? It is an AP system, so banking apps aren't a good fit.
 - [How the Conflict Resolution algorithm works](http://gun.js.org/distributed/matters.html).
 - Check out and add example code [snippets](https://github.com/amark/gun/wiki/snippets-(v0.3.x)) —including micro-modules— to address specific situations.
 - Loose [roadmap](https://github.com/amark/gun/wiki/roadmap).
 - A [React tutorial](https://github.com/amark/gun/wiki/React-Tutorial).
 - See this [module for GraphQL support](https://github.com/brysgo/graphql-gun).
 - [A React example](https://github.com/amark/gun/tree/master/examples/react).
 - [An Angular example](https://github.com/amark/gun/tree/master/examples/angular).
 - [Some VueJS examples](https://github.com/amark/gun/tree/master/examples/vue).

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
docker run -p 8080:8080 gundb/gun
```

Or build the [Docker](https://docs.docker.com/engine/installation/) image locally:

```bash
git clone https://github.com/amark/gun.git
cd gun
docker build -t myrepo/gundb:v1 .
docker run -p 8080:8080 myrepo/gundb:v1
```

Or, if you prefer your Docker image with metadata labels (Linux/Mac only):

 ```bash
npm run docker
docker run -p 8080:8080 usenameHere/gun:git
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.


### Videos
 - [Fault tolerance](https://www.youtube.com/watch?v=-i-11T5ZI9o&feature=youtu.be) (01:01)
 - [Saving relational or document based data](https://www.youtube.com/watch?v=cOO6wz1rZVY&feature=youtu.be) (06:59)
 - [Everything you want to know about GUN](https://youtu.be/qJNDplwJ8aQ) (57:50) 1.25x speed recommended.
 - [GUN's YouTube channel](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g/playlists) also has videos.

### <a name="gun-projects"></a>Projects
 - GUN users are encouraged to add their projects to this [running projects list](https://github.com/amark/gun/wiki/projects).

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

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun.svg?size=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Famark%2Fgun?ref=badge_large)

## Contributors

Thanks to the following people who have contributed to GUN, via code, issues, or conversation (this list has quickly become tremendously behind! We'll probably turn this into a dedicated wiki page so you can add yourself):

[agborkowski](https://github.com/agborkowski); **:star:[alanmimms](https://github.com/alanmimms)**; [alexlafroscia](https://github.com/alexlafroscia); [anubiann00b](https://github.com/anubiann00b); **[BrockAtkinson](https://github.com/BrockAtkinson) ([brunch config](https://github.com/BrockAtkinson/brunch-gun))**; [bromagosa](https://github.com/bromagosa); **[Brysgo](https://github.com/brysgo) ([GraphQL](https://github.com/brysgo/graphql-gun))**; [coolaj86](https://github.com/coolaj86); **:star:[Dan Dombrowsky](https://github.com/ddombrow)**; [d-oliveros](https://github.com/d-oliveros), [danscan](https://github.com/danscan); **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; [gedw99](https://github.com/gedw99); [HelloCodeMing](https://github.com/HelloCodeMing); **[JosePedroDias](https://github.com/josepedrodias) ([graph visualizer](http://acor.sl.pt:9966))**; **[JuniperChicago](https://github.com/JuniperChicago) ([cycle.js bindings](https://github.com/JuniperChicago/cycle-gun))**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc))**; **[kristianmandrup](https://github.com/kristianmandrup) ([edge](https://github.com/kristianmandrup/gun-edge))**; [ndarilek](https://github.com/ndarilek); [onetom](https://github.com/onetom); [phpnode](https://github.com/phpnode); [PsychoLlama](https://github.com/PsychoLlama); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; **[robertheessels](https://github.com/swifty) ([gun-p2p-auth](https://github.com/swifty/gun-p2p-auth))**; [riston](https://github.com/riston); [rootsical](https://github.com/rootsical); [rrrene](https://github.com/rrrene); **:star:[samliu](https://github.com/samliu)**; [sbeleidy](https://github.com/sbeleidy); **:star:[Sean Matheson](https://github.com/ctrlplusb) ([Observable/RxJS/Most.js bindings](https://github.com/ctrlplusb/gun-most))**; [ssr1ram](https://github.com/ssr1ram); **[Stefdv](https://github.com/stefdv) (Polymer/web components)**; **[sjones6](https://github.com/sjones6) ([VueJS](https://github.com/sjones6/vue-gun))**; [Xe](https://github.com/Xe); [zot](https://github.com/zot); [ayurmedia](https://github.com/ayurmedia);

This list of contributors was manually compiled and alphabetically sorted. If we missed you, please submit an issue so we can get you added!

## [Changelog](https://github.com/amark/gun/blob/master/CHANGELOG.md#03)

Also see the current [Release List](https://github.com/amark/gun/releases) and [Tag List](https://github.com/amark/gun/tags) for quick access to relevant versions.

<a name="stay-up-to-date"></a>

<a href="https://gitter.im/amark/gun"><img alt="Gitter channel" src="https://badges.gitter.im/Join%20Chat.svg" /></a>
[![YouTube](https://img.shields.io/badge/You-Tube-red.svg)](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g) [![LinkedIn](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/company/gun-inc) [![Twitter Follow](https://img.shields.io/twitter/follow/databasegun.svg?style=social)](https://twitter.com/databasegun)
