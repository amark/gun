<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import { 
  IonIcon, 
  IonToggle, 
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons
} from '@ionic/vue';
import { addCircleSharp, closeCircleSharp, searchSharp, closeSharp, refreshOutline } from 'ionicons/icons';
import StorageService from '@/services/storageService';
import { getCurrentInstance } from 'vue';


const appInstance = getCurrentInstance();
const storageServ = appInstance?.appContext.config.globalProperties.$storageServ as StorageService;


const {
  networkStatus,
  peersStatus,
  currentMode,
  peerStatuses,
  peersList,
  enabledPeer,
  addPeer,
  removePeer,
  enablePeer,
  disablePeer,
  peersNotes,
  savePeerNote,
} = useNetworkStatus(storageServ);


const newPeerUrl = ref('');
const searchQuery = ref('');
const selectedPeer = ref<string | null>(null);
const isModalOpen = ref(false);
const notes = ref<Record<string, string>>({});
const isResetting = ref(false); 

onMounted(async () => {
  try {
    const savedNotes = localStorage.getItem('relayNotes');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      for (const [peer, note] of Object.entries(notes)) {
        await savePeerNote(peer as string, note as string);
      }
      localStorage.removeItem('relayNotes'); // 迁移后删除
      console.log('Migrated relay notes to SQLite');
    }
  } catch (e) {
    console.error('Failed to migrate relay notes:', e);
  }
});


watch(peersNotes, async (newNotes) => {
  for (const [peer, note] of Object.entries(newNotes)) {
    await savePeerNote(peer, note);
  }
}, { deep: true });


const sortedPeers = computed(() => {
  return peersList.value
    .slice()
    .sort((a, b) => {
      if (a === enabledPeer.value) return -1;
      if (b === enabledPeer.value) return 1;
      return 0;
    })
    .filter((peer) => {
      const searchLower = searchQuery.value.toLowerCase();
      const peerLower = peer.toLowerCase();
      const noteLower = (peersNotes.value[peer] || '').toLowerCase();
      return peerLower.includes(searchLower) || noteLower.includes(searchLower);
    });
});

const openModal = (peer: string) => {
  selectedPeer.value = peer;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedPeer.value = null;
};

</script>

<template>
  <div class="liquid-container" >
    <div class="status-bar" :class="['indicator', networkStatus]">
   
        <div >
      
        </div>
  
      
    </div>

    <div class="add-peer">
      <input 
        v-model="newPeerUrl" 
        placeholder="Enter relay URL" 
        @keyup.enter="addPeer(newPeerUrl)"
      />
      <ion-icon
        :icon="addCircleSharp"
        class="addlink"
        @click="addPeer(newPeerUrl);newPeerUrl = ''"
      />
    </div>

    <div class="peer-list">
      <div class="peer-list-header">
        <h3>Gun Relays</h3>
        <div class="search-container">
          <ion-icon :icon="searchSharp" class="search-icon" />
          <input 
            v-model="searchQuery" 
            placeholder="Search relays..." 
            class="search-input"
          />
        </div>
      </div>
      <div class="peer-scroll-container">
        <div 
          v-for="peer in sortedPeers" 
          :key="peer" 
          class="peer-item"
          @click="openModal(peer)"
        >
          <div class="peer-header">
            <div :class="['status', peerStatuses[peer]]">
              {{ peerStatuses[peer] || 'Checking' }}
            </div>
          </div>
          <div class="peer-content">
            <span class="peer-url">{{ notes[peer] || peer }}</span>
          </div>
          <div class="peer-actions">
            <ion-toggle
            @click.stop
              :checked="enabledPeer === peer"
              @ionChange="enabledPeer === peer ? disablePeer() : enablePeer(peer)"
              color="primary"
            />
          </div>
        </div>
      </div>
    </div>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
  
      <ion-content class="ion-padding">
        <ion-item lines="none" v-if="selectedPeer">
          <ion-label position="stacked">Relay URL</ion-label>
          <ion-input :value="selectedPeer" readonly class="readonly-input" />
        </ion-item>
        <ion-item lines="none" v-if="selectedPeer">
          <ion-label position="stacked">Status</ion-label>
          <div :class="['status', peerStatuses[selectedPeer]]" class="status-display">
            {{ peerStatuses[selectedPeer] || 'Checking' }}
          </div>
        </ion-item>
        <ion-item lines="none" v-if="selectedPeer">
          <ion-label position="stacked">Note</ion-label>
          <ion-input 
            v-model="notes[selectedPeer]" 
            placeholder="" 
            clear-input
            style=" --padding-start: 12px;
  --padding-end: 12px;"
          />
        </ion-item>
        <div class="modal-actions">
          <ion-button 
            expand="block" 
            color="danger" 
            @click="removePeer(selectedPeer!); closeModal()"
          >
            Remove Relay
          </ion-button>
          <ion-button 
            expand="block" 
            color="medium" 
            @click="closeModal"
          >
            Close
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<style scoped>
.liquid-container {
  padding: 16px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  /* background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05)); */
}

.status-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 6px 8px;
  background: rgba(130, 130, 130, 0.15);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  transition: transform 0.2s ease;
}

.status-item:hover {
  transform: translateY(-1px);
}


.reset-button-container {
  margin-left: auto;
}

.reset-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 204, 255, 0.2), rgba(102, 204, 255, 0.4));
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 6px;
  color: inherit;
  font-weight: 500;
  font-size: 13px;
}

.reset-button:hover {
  background: linear-gradient(135deg, rgba(102, 204, 255, 0.3), rgba(102, 204, 255, 0.5));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.reset-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.reset-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-icon {
  font-size: 16px;
}

.rotating {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.label {
  font-weight: 600;
  font-size: 13px;
  margin-right: 6px;
  /* color: #333; */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.indicator {
  width: 100%;
  /* padding: 4px 8px; */
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.indicator.online,
.indicator.connected,
.indicator.relay {
  background: linear-gradient(135deg, #88ff88, #55ccaa);
  color: #2a2a2a;
}

.indicator.offline,
.indicator.disconnected,
.indicator.direct {
  background: linear-gradient(135deg, #ff7777, #cc5555);
  color: #fff;
}

.add-peer {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.add-peer input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: rgba(150, 150, 150, 0.2);
  font-size: 14px;
  /* color: #333; */
  transition: all 0.2s ease;
}

.add-peer input:hover,
.add-peer input:focus {
  background: rgba(150, 150, 150, 0.25);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  outline: none;
}

.addlink {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* color: #66ccff; */
  cursor: pointer;
  transition: all 0.2s ease;
}

.addlink:hover {
  /* color: #88ddff; */
  transform: scale(1.1);
}

.peer-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.peer-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.peer-list h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  /* color: #333; */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.search-container {
  position: relative;
  width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: none;
  border-radius: 12px;
  background: rgba(150, 150, 150, 0.2);
  font-size: 14px;
  
  transition: all 0.2s ease;
}

.search-input:hover,
.search-input:focus {
  background: rgba(150, 150, 150, 0.25);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  outline: none;
}

.peer-scroll-container {
  border-radius: 12px;
  max-height: 539px;
  overflow-y: auto;
  flex: 1;
}

.peer-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.peer-scroll-container::-webkit-scrollbar-track {
  background: rgba(150, 150, 150, 0.2);
  border-radius: 6px;
}

.peer-scroll-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #66ccff, #88ddff);
  border-radius: 6px;
}

.peer-scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #55bbff, #77ccff);
}

.peer-item {
  padding: 12px;
  background: linear-gradient(135deg, rgba(150, 150, 150, 0.15), rgba(255, 255, 255, 0.05));
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.peer-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.peer-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.status {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  backdrop-filter: blur(4px);
  text-transform: capitalize;
}

.status.connected {
  background: linear-gradient(135deg, #88ff88, #55ccaa);
  color: #2a2a2a;
}

.status.disconnected {
  background: linear-gradient(135deg, #ff7777, #cc5555);
  color: #fff;
}

.status.checking {
  background: linear-gradient(135deg, #ffcc66, #ffaa33);
  color: #333;
}

.peer-content {
  margin-bottom: 10px;
}

.peer-url {
  display: block;
  word-break: break-all;
  font-size: 13px;
  line-height: 1.5;
  padding: 6px 10px;
  background: rgba(150, 150, 150, 0.1);
  border-radius: 8px;
  /* color: #444; */
}

.peer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

ion-toggle {
  /* --background: rgba(150, 150, 150, 0.2);
  --background-checked: linear-gradient(135deg, #66ccff, #88ddff);
  --handle-background: #fff;
  --handle-background-checked: #fff; */
  width: 48px;
  height: 24px;
  /* --handle-width: 20px;
  --handle-height: 20px; */
}

/* Modal Styles */
ion-modal {
  --border-radius: 12px;
  --max-width: 400px;
  --max-height: 46%;

  --backdrop-opacity: 0.4;
}

/* ion-header {
  --background: rgba(150, 150, 150, 0.1);
} */

ion-toolbar {
  --background: transparent;
  --border-width: 0;

}

ion-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 0 12px;
}

ion-buttons {
  margin-right: 8px;
}

ion-button {
  --background-activated: transparent;
}

ion-button ion-icon {
  font-size: 24px;
  color: #666;
}

ion-button:hover ion-icon {
  color: #333;
}

.ion-padding {
  padding: 16px;
}

ion-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  /* margin-bottom: 16px; */
}

ion-label {
  /* color: #333 !important; */
  font-weight: 500;
  margin-bottom: 4px;
}

ion-input {
  --background: rgba(150, 150, 150, 0.15);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  border-radius: 8px;
  font-size: 14px;

}

.readonly-input {
  --padding-start: 12px;
  --padding-end: 12px;

  --color: #666;
  --background: rgba(150, 150, 150, 0.1);
 
}

.status-display {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions ion-button {
  --border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  flex: 1;
}

.modal-actions ion-button[color="danger"] {
  --background: #ff6666;
  --background-hover: #ff8888;
  --background-activated: #ff5555;
}

.modal-actions ion-button[color="medium"] {
  --background: #ccc;
  --background-hover: #ddd;
  --background-activated: #bbb;
}
</style>