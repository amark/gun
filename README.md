<h1>
	<a href="http://gundb.io">
		<img src='https://cldup.com/TEy9yGh45l.svg'
			width='40%'
			alt="gun" />
	</a>
</h1>
[![NPM downloads](https://img.shields.io/npm/dm/gun.svg?style=flat)](https://npmjs.org/package/gun) [![Build Status](https://travis-ci.org/amark/gun.svg?branch=master)](https://travis-ci.org/amark/gun) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/amark/gun?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Docker Automated buil](https://img.shields.io/docker/automated/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![](https://images.microbadger.com/badges/image/gundb/gun.svg)](https://microbadger.com/images/gundb/gun "Get your own image badge on microbadger.com") [![Docker Pulls](https://img.shields.io/docker/pulls/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) [![Docker Stars](https://img.shields.io/docker/stars/gundb/gun.svg)](https://hub.docker.com/r/gundb/gun/) 

GUN is a realtime, distributed, offline-first, graph database engine. Lightweight and powerful, at just **~9KB** gzipped.

## Why?

 - **Realtime** - It may be trivial to get realtime updates with socket.io or something, but what you do not get is *state synchronization*. GUN does this for you out of the box, assuring that two users' simultaneous updates won't concurrently break each other.
 - **Distributed** - GUN is peer-to-peer by design, meaning you have no centralized database server to maintain or that could crash. This lets you sleep through the night without worrying about database DevOps - we call this "NoDB". From that, you can build decentralized, federated, or centralized apps.
 - **Offline-first** - GUN works even if your internet or cell reception doesn't. Users can still plug away and save data as normal, and then when the network comes back online GUN will automatically synchronize all the changes and handle any conflicts for you.
 - **Graph** - Most databases force you to bend over backwards to match their storage constraints. But graphs are different, they let you have any data structure you want. Whether that be traditional tables with relations, document oriented trees, or tons of circular references. You choose.

## Quickstart

Try the [interactive tutorial](http://gun.js.org/think.html) in the browser (**5min** ~ average developer). Or run the NodeJS [demo example apps](#demos) (**5min** ~ average developer).

## Table of Contents
 - [Demos](#demos)
   - [Videos](#videos)
   - [Projects](#gun-projects)  
 - [How to get started](#how-to-get-started)
 - [Modules](#gun-modules)
 - [How can I help make gun even more awesome?](#how-can-i-help-make-gun-even-more-awesome)
 - [License](#license)
   - [Contributors](#contributors)
 - [Changelog](#changelog)
 - [Stay up-to-date](#stay-up-to-date)
 - **[API Reference](https://github.com/amark/gun/wiki/API-(v0.3.x))**  :arrow_upper_right:

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

## Quick dev/test Deployments

 - To quickly spin up a Gun test server for your development team, uilize eiher [Heroku](http://heroku.com) or [Docker](http://docker.com) or any variant thereof ([Dokku](http://dokku.viewdocs.io/dokku/), [Flynn.io](http://flynn.io), [now.sh](https://zeit.co/now), etc)
 
### [Docker](https://www.docker.com/) 
 - Either (fastest) from the [Docker Hub](https://hub.docker.com/r/gundb/gun/)(Built at [![](https://images.microbadger.com/badges/commit/gundb/gun.svg)](https://microbadger.com/images/gundb/gun "Get your own commit badge on microbadger.com")):

```bash
   docker run -p 8080:8080 gundb/gun
```
 - Or build the [Docker](https://docs.docker.com/engine/installation/) image locally:

```bash
   git clone https://github.com/amark/gun.git
   cd gun
   docker build -t myrepo/gundb:v1 .
   docker run -p 8080:8080 myrepo/gundb:v1
```
 - Or, if you prefer your Docker image with metadata labels (Linux/Mac only):
 
 ```bash
   npm run docker
   docker run -p 8080:8080 usenameHere/gun:git
```
   Then visit [http://localhost:8080](http://localhost:8080) in your browser.
   
### [Heroku](https://www.heroku.com/)
 - Eihe click [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy) to deploy to your existing Heroku account immediately, OR:

   ```bash
   git clone https://github.com/amark/gun.git
   cd gun
   heroku create
   git push -f heroku HEAD:master
   ```
   Then visit the URL in the output of the 'heroku create' step, in your browser.

### [Now.sh](https://zeit.co/now/)
   ```bash
   npm install -g now
   git clone https://github.com/amark/gun.git
   cd gun
   now --npm
   ```
   Then visit the URL in the output of the 'now --npm' step, in your browser.
   
### Videos
 - [Fault tolerance](https://www.youtube.com/watch?v=-i-11T5ZI9o&feature=youtu.be) (01:01)
 - [Saving relational or document based data](https://www.youtube.com/watch?v=cOO6wz1rZVY&feature=youtu.be) (06:59)
 - [GUN's YouTube channel](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g/playlists) also has videos

### <a name="gun-projects"></a>Projects
 - GUN users are encouraged to add their projects to this [running projects list](https://github.com/amark/gun/wiki/projects).

## How to get started
 - Until we complete the [Getting Started with GUN](https://github.com/amark/gun/wiki/getting-started-(v0.3.x)) Guide, please review the [API documentation](https://github.com/amark/gun/wiki/API-(v0.3.x)) and [examples' source code](https://github.com/amark/gun/blob/master/examples).
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

[agborkowski](https://github.com/agborkowski); [alexlafroscia](https://github.com/alexlafroscia); [anubiann00b](https://github.com/anubiann00b); [bromagosa](https://github.com/bromagosa); [coolaj86](https://github.com/coolaj86); [d-oliveros](https://github.com/d-oliveros), [danscan](https://github.com/danscan); **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; [gedw99](https://github.com/gedw99); [HelloCodeMing](https://github.com/HelloCodeMing); **[Hillct](https://github.com/hillct) (Deployment Tools); **[JosePedroDias](https://github.com/josepedrodias) (graph visualizer)**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc) [live demo](http://todos.loqali.com/))**; [ndarilek](https://github.com/ndarilek); [onetom](https://github.com/onetom); [phpnode](https://github.com/phpnode); [PsychoLlama](https://github.com/PsychoLlama); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; [riston](https://github.com/riston); [rootsical](https://github.com/rootsical); [rrrene](https://github.com/rrrene); [ssr1ram](https://github.com/ssr1ram); [Xe](https://github.com/Xe); [zot](https://github.com/zot);
[ayurmedia](https://github.com/ayurmedia);

This list of contributors was manually compiled and alphabetically sorted. If we missed you, please submit an issue so we can get you added!

## [Changelog](https://github.com/amark/gun/blob/master/CHANGELOG.md#03)

Also see the current [Release List](https://github.com/amark/gun/releases) and [Tag List](https://github.com/amark/gun/tags) for quick access to relevant versions.

==========================
<a name="stay-up-to-date"></a>

<a href="https://gitter.im/amark/gun"><img alt="Gitter channel" src="https://badges.gitter.im/Join%20Chat.svg" /></a>
[![YouTube](https://img.shields.io/badge/You-Tube-red.svg)](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g) [![LinkedIn](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/company/gun-inc) [![Twitter Follow](https://img.shields.io/twitter/follow/databasegun.svg?style=social)](https://twitter.com/databasegun)
