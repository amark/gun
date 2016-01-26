# gun

<a href="https://npmjs.org/package/gun"><img align="right" alt="npm downloads" src="https://img.shields.io/npm/dm/gun.svg?style=flat" /></a>
<a href="https://travis-ci.org/amark/gun"><img align="right" alt="Build status" src="https://travis-ci.org/amark/gun.svg?branch=master" /></a>
<a href="https://gitter.im/amark/gun?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img align="right" alt="Gitter channel" src="https://badges.gitter.im/Join%20Chat.svg" /></a>

GUN is a realtime, distributed, offline-first, graph database engine.

## But what makes gun **awesome**?

 - **Realtime** - GUN shares data across connected peers in real-time.  There's no need for plugins, extensions, or anything else, just use gun as directed and enjoy realtime data sharing.
 - **Distributed** - GUN is peer-to-peer by design and doesn't rely on a central data server.  This results in all kinds of data deliciousness, including being able to work offline by default.  Peers can be configured into more traditional centralized or federated systems, as appropriate for application needs.
 - **Graph** - All data in gun is encapsulated as nodes in a graph.  Graphs allow data to be related in traditional table formats, as well as tree format, and circular formats.  In other words, gun lets your data needs determine your data storage structure.


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

[agborkowski](https://github.com/agborkowski); [alexlafroscia](https://github.com/alexlafroscia); [anubiann00b](https://github.com/anubiann00b); [bromagosa](https://github.com/bromagosa); [coolaj86](https://github.com/coolaj86); [d-oliveros](https://github.com/d-oliveros), [danscan](https://github.com/danscan); **[forrestjt](https://github.com/forrestjt) ([file.js](https://github.com/amark/gun/blob/master/lib/file.js))**; [gedw99](https://github.com/gedw99); [HelloCodeMing](https://github.com/HelloCodeMing); **[JosePedroDias](https://github.com/josepedrodias) (graph visualizer)**; **[jveres](https://github.com/jveres) ([todoMVC](https://github.com/jveres/todomvc) [live demo](http://todos.loqali.com/))**; [ndarilek](https://github.com/ndarilek); [onetom](https://github.com/onetom); [phpnode](https://github.com/phpnode); [PsychoLlama](https://github.com/PsychoLlama); **[RangerMauve](https://github.com/RangerMauve) ([schema](https://github.com/gundb/gun-schema))**; [riston](https://github.com/riston); [rootsical](https://github.com/rootsical); [rrrene](https://github.com/rrrene); [ssr1ram](https://github.com/ssr1ram); [Xe](https://github.com/Xe); [zot](https://github.com/zot);
[ayurmedia](https://github.com/ayurmedia);

This list of contributors was manually compiled and alphabetically sorted. If we missed you, please submit an issue so we can get you added!

## [Changelog](https://github.com/amark/gun/blob/master/CHANGELOG.md#03)

Also see the current [Release List](https://github.com/amark/gun/releases) and [Tag List](https://github.com/amark/gun/tags) for quick access to relevant versions.

==========================
<a name="stay-up-to-date"></a>

<a href="https://gitter.im/amark/gun"><img alt="Gitter channel" src="https://badges.gitter.im/Join%20Chat.svg" /></a>
[![YouTube](https://img.shields.io/badge/You-Tube-red.svg)](https://www.youtube.com/channel/UCQAtpf-zi9Pp4__2nToOM8g) [![LinkedIn](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/company/gun-inc) [![Twitter Follow](https://img.shields.io/twitter/follow/databasegun.svg?style=social)](https://twitter.com/databasegun)