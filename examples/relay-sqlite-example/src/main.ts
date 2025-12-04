import { createApp } from 'vue'
import App from './src/App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';


import { useRouter } from 'vue-router'





/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/ionic.bundle.css'
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { Capacitor } from '@capacitor/core';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';
import { defineCustomElements as pwaElements} from '@ionic/pwa-elements/loader';
import SqliteService from './services/sqliteService'; 
import DbVersionService from './services/dbVersionService';
import StorageService from './services/storageService';
import InitializeAppService from './services/initializeAppService';




pwaElements(window);
customElements.define('jeep-sqlite', JeepSqlite);
const platform = Capacitor.getPlatform();

const app = createApp(App)

  .use(IonicVue)
  .use(useRouter)

  .use(router);
 

// Set the platform as global properties on the app
app.config.globalProperties.$platform = platform;

// Define and instantiate the required services
const sqliteServ = new SqliteService();
const dbVersionServ = new DbVersionService();
const storageServ = new StorageService(sqliteServ, dbVersionServ);
// Set the services as global properties on the app
app.config.globalProperties.$sqliteServ = sqliteServ;
app.config.globalProperties.$dbVersionServ = dbVersionServ;
app.config.globalProperties.$storageServ = storageServ;

//Define and instantiate the InitializeAppService
const initAppServ = new InitializeAppService(sqliteServ, storageServ);
 
const mountApp = () => {
  initAppServ.initializeApp()
  .then(() => {
    router.isReady().then(() => {

      app.mount('#app');
    });
  })
  .catch((error) => {
    console.error('App Initialization error:', error);
  });
}

if (platform !== "web") {
  mountApp();
} else {
  window.addEventListener('DOMContentLoaded', async () => {
      const jeepEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepEl);
      customElements.whenDefined('jeep-sqlite').then(() => {
        mountApp();
      })
      .catch ((err) => {
        console.error('jeep-sqlite creation error:', err);
      });
  });
}