import { render } from './iris/js/lib/preact.js';
import { Router, route } from './iris/js/lib/preact-router.es.js';
import { createHashHistory } from './iris/js/lib/history.production.min.js';
import { Component } from './iris/js/lib/preact.js';

import Helpers from './iris/js/Helpers.js';
import { html } from './iris/js/Helpers.js';
import QRScanner from './iris/js/QRScanner.js';
import PeerManager from './iris/js/PeerManager.js';
import Session from './iris/js/Session.js';
import PublicMessages from './iris/js/PublicMessages.js';
import { translate as t } from './iris/js/Translation.js';

import Settings from './iris/js/components/Settings.js';
import LogoutConfirmation from './iris/js/components/LogoutConfirmation.js';
import ChatView from './iris/js/components/ChatView.js';
import StoreView from './iris/js/components/StoreView.js';
import CheckoutView from './iris/js/components/CheckoutView.js';
import ProductView from './iris/js/components/ProductView.js';
import Login from './iris/js/components/Login.js';
import Profile from './iris/js/components/Profile.js';
import Header from './iris/js/components/Header.js';
import Footer from './iris/js/components/Footer.js';
import MessageView from './iris/js/components/MessageView.js';
import FollowsView from './iris/js/components/FollowsView.js';
import FeedView from './iris/js/components/FeedView.js';
import ExplorerView from './iris/js/components/ExplorerView.js';
import VideoCall from './iris/js/components/VideoCall.js';
import Identicon from './iris/js/components/Identicon.js';
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

const peers = [`${window.location.protocol}//${window.location.host}/gun`];
State.init({peers});
Session.init({autologin: true});
PeerManager.init();
PublicMessages.init();

Helpers.checkColorScheme();

function handleRoute(e) {
  document.title = 'GUN — the database for freedom fighters';
  const activeRoute = e.url;
  if (!activeRoute && window.location.hash) {
    return route(window.location.hash.replace('#', '')); // bubblegum fix back navigation
  }
  const activeProfile = activeRoute.indexOf('/profile') === 0 ? activeRoute.replace('/profile/', '') : null;
  localState.get('activeRoute').put(activeRoute);
  QRScanner.cleanupScanner();
}

const APPLICATIONS = [ // TODO: move editable shortcuts to localState gun
  {url: '/', text: t('home'), icon: Icons.home},
  {url: '/settings', text: t('settings'), icon: Icons.settings},
  {url: '/explorer', text: t('explorer'), icon: Icons.folder},
  {url: '/chat', text: t('messages'), icon: Icons.chat},
  {url: '/feed', text: t('feed'), icon: Icons.feed},
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
    localState.get('loggedIn').on(loggedIn => this.setState({loggedIn}));
  }

  render() {
    const content = this.state.loggedIn ? html`
      <div class="visible-xs-flex" style="border-bottom:var(--sidebar-border-right)">
        <svg onClick=${() => State.local.get('showMenu').put(this.showMenu = !this.showMenu)} style="padding: 5px;cursor:pointer;" viewBox="0 -53 384 384" width="40px"><path d="m368 154.667969h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/><path d="m368 32h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/><path d="m368 277.332031h-352c-8.832031 0-16-7.167969-16-16s7.167969-16 16-16h352c8.832031 0 16 7.167969 16 16s-7.167969 16-16 16zm0 0"/></svg>
      </div>
      <section class="main" style="flex-direction: row;">
        <${MenuView}/>
        <div style="flex: 3; display: flex">
          <${Router} history=${createHashHistory()} onChange=${e => handleRoute(e)}>
            <${HomeView} path="/"/>
            <${FeedView} path="/feed"/>
            <${Login} path="/login"/>
            <${ChatView} path="/chat/:id?"/>
            <${MessageView} path="/message/:hash"/>
            <${Settings} path="/settings" showSwitchAccount=${true}/>
            <${LogoutConfirmation} path="/logout"/>
            <${Profile.Profile} path="/profile/:id?"/>
            <${StoreView} path="/store/:store?"/>
            <${CheckoutView} path="/checkout/:store"/>
            <${ProductView} path="/product/:product/:store"/>
            <${ProductView} path="/product/new" store=Session.getPubKey()/>
            <${ExplorerView} path="/explorer/:node"/>
            <${ExplorerView} path="/explorer"/>
            <${FollowsView} path="/follows/:id"/>
            <${FollowsView} followers=${true} path="/followers/:id"/>
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
