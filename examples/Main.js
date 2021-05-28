import { render } from './iris/js/lib/preact.js';
import { Router, route } from './iris/js/lib/preact-router.es.js';
import { createHashHistory } from './iris/js/lib/history.production.min.js';
import { Component } from './iris/js/lib/preact.js';
import { Link } from './iris/js/lib/preact.match.js';

import Helpers from './iris/js/Helpers.js';
import { html } from './iris/js/Helpers.js';
import QRScanner from './iris/js/QRScanner.js';
import PeerManager from './iris/js/PeerManager.js';
import Session from './iris/js/Session.js';
import { translate as t } from './iris/js/Translation.js';

import Settings from './iris/js/views/Settings.js';
import LogoutConfirmation from './iris/js/views/LogoutConfirmation.js';
import Chat from './iris/js/views/Chat.js';
import Store from './iris/js/views/Store.js';
import Checkout from './iris/js/views/Checkout.js';
import Product from './iris/js/views/Product.js';
import Login from './iris/js/views/Login.js';
import Profile from './iris/js/views/Profile.js';
import Group from './iris/js/views/Group.js';
import Message from './iris/js/views/Message.js';
import Follows from './iris/js/views/Follows.js';
import Feed from './iris/js/views/Feed.js';
import About from './iris/js/views/About.js';
import Explorer from './iris/js/views/Explorer.js';
import Contacts from './iris/js/views/Contacts.js';
import Torrent from './iris/js/views/Torrent.js';

import VideoCall from './iris/js/components/VideoCall.js';
import Identicon from './iris/js/components/Identicon.js';
import MediaPlayer from './iris/js/components/MediaPlayer.js';
import Footer from './iris/js/components/Footer.js';
import State from './iris/js/State.js';
import Icons from './iris/js/Icons.js';

const userAgent = navigator.userAgent.toLowerCase();
const isElectron = (userAgent.indexOf(' electron/') > -1);
if (!isElectron && ('serviceWorker' in navigator)) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('iris/serviceworker.js')
    .catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

State.init();
Session.init({autologin: true});
PeerManager.init();

Helpers.checkColorScheme();

const APPLICATIONS = [ // TODO: move editable shortcuts to State.local gun
  {url: '/', text: t('home'), icon: Icons.home},
  {url: '/feed', text: t('feed'), icon: Icons.feed},
  {url: '/media', text: t('media'), icon: Icons.play},
  {url: '/settings', text: t('settings'), icon: Icons.settings},
  {url: '/store', text: t('store'), icon: Icons.store},
  {url: '/explorer', text: t('explorer'), icon: Icons.folder},
  {url: '/chat', text: t('messages'), icon: Icons.chat},
  // {url: '/store', text: t('store'), icon: Icons.store}, // restore when it works!
  {},
  {url: '../stats.html', text: 'Gun node stats'},
  {url: '../iris/index.html', text: 'Iris', icon: html`<img src="iris/img/icon128.png" width=24/>`},
  {url: '../infinite-scroll/index.html', text: 'Infinite scroll'},
  {url: '../chat/index.html', text: 'Chat'},
  {url: '../game/space.html', text: 'Space'},
  {},
  {url: 'https://gun.eco/docs/', text: 'Gun documentation'},
  {url: 'https://examples.iris.to/components/', text: 'Iris web components'}
];

const HomeView = () => {
  return html`
  <div class="main-view">
    <div class="centered-container public-messages-view">
      <h1>Hello, world!</h1>
      <p>Here you can find sample applications and utilities for <a href="https://github.com/amark/gun">GUN</a>.</p>
      <p>If you need any help, please feel free to join the GUN community chat: <a href="http://chat.gun.eco">http://chat.gun.eco</a></p>
      <a href="/explorer" class="msg"><div class="msg-content">
        <b>Explorer</b>
        <p>Explore the data saved on the GUN database. Open to the side while using an application and see the data change in real-time.</p>
      </div></a>
      <a class="msg" href="game/space.html"><div class="msg-content">
        <div class="img-container"><img src="iris/img/space-game.jpg"/></div>
        <b>Space</b>
        <p>Spaceflight game. Open in 2 or more browser windows.</p>
      </div></a>
      <a class="msg" href="/iris/index.html"><div class="msg-content">
        <div class="img-container"><img src="iris/img/screenshot.png"/></div>
        <b>Iris</b>
        <p>Decentralized Twitter/Instagram. Provides modular components that can be reused in other applications (including this one).</p>
      </div></a>
      <a native class="msg" href="/chat/index.html"><div class="msg-content">
        <div class="img-container"><img src="iris/img/gun-chat.jpg"/></div>
        <b>Chat</b>
        <p>Shoutbox!</p>
      </div></a>
    </div>
  </div>
  `;
};

class MenuView extends Component {
  componentDidMount() {
    State.local.get('showMenu').on(showMenu => this.setState({showMenu}));
  }

  render() {
    const pub = Session.getPubKey();
    return html`
      <div class="application-list ${this.state.showMenu ? 'menu-visible-xs' : ''}">
        <a href="/profile/${pub}">
          <span class="icon"><${Identicon} str=${pub} width=40/></span>
          <span class="text" style="font-size: 1.2em;border:0;margin-left: 7px;"><iris-text user="${pub}" path="profile/name" editable="false"/></span>
        </a>
        <br/><br/>
        ${APPLICATIONS.map(a => {
          if (a.url) {
            return html`
              <a href=${a.url}>
                <span class="icon">${a.icon || Icons.circle}</span>
                <span class="text">${a.text}</span>
              </a>`;
          } else {
            return html`<br/><br/>`;
          }
        })}
      </div>
    `;
  }
};

class Main extends Component {
  constructor() {
    super();
    this.showMenu = false;
  }

  componentDidMount() {
    State.local.get('loggedIn').on(loggedIn => this.setState({loggedIn}));
  }

  handleRoute(e) {
    let activeRoute = e.url;
    if (!activeRoute && window.location.hash) {
      return route(window.location.hash.replace('#', '')); // bubblegum fix back navigation
    }
    document.title = 'Iris';
    if (activeRoute && activeRoute.length > 1) { document.title += ' - ' + Helpers.capitalize(activeRoute.replace('/', '')); }
    State.local.get('activeRoute').put(activeRoute);
    QRScanner.cleanupScanner();
  }

  onClickOverlay() {
    if (this.state.showMenu) {
      this.setState({showMenu: false});
    }
  }

  toggleMenu(show) {
    this.setState({showMenu: typeof show === 'undefined' ? !this.state.showMenu : show});
  }

  render() {
    const content = this.state.loggedIn ? html`
      <div class="visible-xs-flex" style="border-bottom:var(--sidebar-border-right)">
        <svg onClick=${() => State.local.get('showMenu').put(this.showMenu = !this.showMenu)} style="padding: 5px;cursor:pointer;" viewBox="0 -53 384 384" width="40px"><path d="m368 154.667969h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/><path d="m368 32h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/><path d="m368 277.332031h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/></svg>
      </div>
      <section class="main" style="flex-direction: row;">
        <${MenuView}/>
        <div style="flex: 3; display: flex">
          <${Router} history=${createHashHistory()} onChange=${e => this.handleRoute(e)}>
            <${HomeView} path="/"/>
            <${Feed} path="/feed"/>
            <${Feed} path="/search/:term?/:type?"/>
            <${Feed} path="/media" index="media"/>
            <${Login} path="/login"/>
            <${Chat} path="/chat/:id?"/>
            <${Message} path="/post/:hash"/>
            <${Torrent} path="/torrent/:id"/>
            <${About} path="/about"/>
            <${Settings} path="/settings"/>
            <${LogoutConfirmation} path="/logout"/>
            <${Profile} path="/profile/:id?" tab="profile"/>
            <${Profile} path="/replies/:id?" tab="replies"/>
            <${Profile} path="/likes/:id?" tab="likes"/>
            <${Profile} path="/media/:id" tab="media"/>
            <${Group} path="/group/:id?"/>
            <${Store} path="/store/:store?"/>
            <${Checkout} path="/checkout/:store?"/>
            <${Product} path="/product/:product/:store"/>
            <${Product} path="/product/new" store=Session.getPubKey()/>
            <${Explorer} path="/explorer/:node"/>
            <${Explorer} path="/explorer"/>
            <${Follows} path="/follows/:id"/>
            <${Follows} followers=${true} path="/followers/:id"/>
            <${Contacts} path="/contacts"/>
          </${Router}>
        </div>
      </section>
      <${VideoCall}/>
    ` : '';
    return html`
      <div id="main-content">
        ${content}
      </div>
    `;
  }
}

render(html`<${Main}/>`, document.body);

$('body').css('opacity', 1); // use opacity because setting focus on display: none elements fails
