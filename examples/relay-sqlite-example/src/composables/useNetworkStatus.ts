import { ref, watch } from 'vue';
import { useToast } from '@/composables/useToast';
import { useNetwork } from '@/composables/useNetwork';
import StorageService from '@/services/storageService';
import Gun from 'gun';
import 'gun/sea';






// 模块级别的单例状态
const networkStatus = ref<'online' | 'offline'>('online');
const peersStatus = ref<'connected' | 'disconnected'>('disconnected');
const currentMode = ref<'direct' | 'relay'>('direct');
const peerStatuses = ref<Record<string, 'connected' | 'disconnected'>>({});

// 单例初始化标志
let initialized = false;
let instance: ReturnType<typeof createNetworkStatus> | null = null;

function createNetworkStatus(storageService: StorageService) {
 
  const { showToast } = useToast();
  const { isOnline, peersConnected, updateNetworkStatus, checkPeers } = useNetwork(gun);
  const peersNotes = ref<Record<string, string>>({});

  const peersList = ref<string[]>([
    'https://peer.wallie.io/gun',
    'https://gun.defucc.me/gun',
    'https://talkflow.team/gun',
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gundb-relay-mlccl.ondigitalocean.app/gun',
  
   
  ]);

  const enabledPeer = ref<string>(peersList.value[0]);

let gun = Gun({
 
  peers: [ enabledPeer.value],
  radisk: true,
  localStorage: false,
  gunSQLiteAdapter: {
    key: 'gundb',
  },
});


  // 确保 storageService 已初始化
  async function ensureStorageReady() {
    try {
      if (!storageService.db || !(await storageService.db.isDBOpen())) {
        console.log('[useNetworkStatus] Initializing StorageService database...');
        await storageService.initializeDatabase();
        if (!storageService.db) {
          throw new Error('StorageService 初始化后仍无数据库连接');
        }
        console.log('[useNetworkStatus] StorageService database initialized');
      }
    } catch (err) {
      console.error('[useNetworkStatus] Failed to initialize StorageService:', err);
      showToast('数据库初始化失败，请重试', 'error');
      throw err;
    }
  }

  // 保存 enabledPeer 到 SQLite
  async function saveEnabledPeer() {
    try {
      await ensureStorageReady();
      await storageService.run('UPDATE network_peers SET is_enabled = 0');
      if (enabledPeer.value) {
        await storageService.run(
          'INSERT OR REPLACE INTO network_peers (url, is_enabled, note) VALUES (?, ?, ?)',
          [enabledPeer.value, 1, peersNotes.value[enabledPeer.value] || '']
        );
      }
      console.log(`Enabled peer saved: ${enabledPeer.value}`);
    } catch (err) {
      console.error('[useNetworkStatus] Failed to save enabled peer:', err);
      showToast('无法保存启用节点', 'error');
    }
  }

  // 保存节点备注
  async function savePeerNote(peer: string, note: string) {
    try {
      await ensureStorageReady();
      await storageService.run(
        'UPDATE network_peers SET note = ? WHERE url = ?',
        [note, peer]
      );
      peersNotes.value[peer] = note;
      console.log(`Peer note saved: ${peer} -> ${note}`);
    } catch (err) {
      console.error('[useNetworkStatus] Failed to save peer note:', err);
      showToast('无法保存节点备注', 'error');
    }
  }

  // 从 SQLite 加载 Peer 配置和备注
  // async function loadPeers() {
  //   try {
  //     await ensureStorageReady();
  //     const result = await storageService.query('SELECT url, is_enabled, note FROM network_peers');
  //     const peers = result.values || [];
  //     peersList.value = peers.map((peer: { url: string }) => peer.url);
  //     peersNotes.value = peers.reduce((acc: Record<string, string>, peer: { url: string; note: string }) => {
  //       acc[peer.url] = peer.note || '';
  //       return acc;
  //     }, {});
  //     const enabled = peers.find((peer: { is_enabled: number }) => peer.is_enabled === 1);
  //     if (enabled && peersList.value.includes(enabled.url)) {
  //       enabledPeer.value = enabled.url;
  //     } else if (peersList.value.length > 0) {
  //       enabledPeer.value = peersList.value[0];
  //       await saveEnabledPeer();
  //     }
  //     gun.opt({ peers: peersList.value });
  //   } catch (err) {
  //     console.error('[useNetworkStatus] Failed to load peers:', err);
  //     showToast('无法加载节点列表', 'error');
  //   }
  // }
  async function loadPeers() {
    try {
        await ensureStorageReady();
        const result = await storageService.query('SELECT url, is_enabled, note FROM network_peers');
        const peers = result.values || [];

        if (peers.length === 0) {
            // 如果 SQLite 表为空，插入 TalkFlowCore 的预设节点
            console.log('[useNetworkStatus] network_peers 表为空，插入预设节点');
            const { peersList: defaultPeersList } = getTalkFlowCore(); // 获取预设节点
            for (const peerUrl of defaultPeersList.value) {
                await storageService.run(
                    'INSERT OR IGNORE INTO network_peers (url, is_enabled, note) VALUES (?, ?, ?)',
                    [peerUrl, 0, '']
                );
            }
            // 重新查询以确保数据已插入
            const newResult = await storageService.query('SELECT url, is_enabled, note FROM network_peers');
            peersList.value = newResult.values.map((peer: { url: string }) => peer.url);
        } else {
            // 使用 SQLite 中的节点
            peersList.value = peers.map((peer: { url: string }) => peer.url);
        }

        // 加载备注
        peersNotes.value = peers.reduce((acc: Record<string, string>, peer: { url: string; note: string }) => {
            acc[peer.url] = peer.note || '';
            return acc;
        }, {});

        // 设置 enabledPeer
        const enabled = peers.find((peer: { is_enabled: number }) => peer.is_enabled === 1);
        if (enabled && peersList.value.includes(enabled.url)) {
            enabledPeer.value = enabled.url;
        } else if (peersList.value.length > 0) {
            enabledPeer.value = peersList.value[0];
            await saveEnabledPeer();
        }

        // 更新 Gun 配置
        gun.opt({ peers: peersList.value });
        console.log('[useNetworkStatus] Gun 配置节点:', peersList.value);
    } catch (err) {
        console.error('[useNetworkStatus] 加载节点失败:', err);
        showToast('无法加载节点列表', 'error');
    }
}
  // 更新网络和 Peer 状态
  async function updateStatus() {
    networkStatus.value = isOnline.value ? 'online' : 'offline';
    peersStatus.value = peersConnected.value ? 'connected' : 'disconnected';
    currentMode.value = peersConnected.value && enabledPeer.value ? 'relay' : 'direct';
    await updatePeerStatuses();
  }

  // 检查单个 Peer 的状态（用于 UI 展示）
  async function checkPeerStatus(peer: string): Promise<'connected' | 'disconnected'> {
    return new Promise((resolve) => {
      const tempGun = Gun({ peers: [peer] });
      let connected = false;
      tempGun.on('hi', () => {
        connected = true;
        resolve('connected');
      });
      setTimeout(() => {
        if (!connected) resolve('disconnected');
      }, 5000);
    });
  }

  // 更新所有 Peer 的状态（用于 UI 展示）
  async function updatePeerStatuses() {
    for (const peer of peersList.value) {
      const status = await checkPeerStatus(peer);
      peerStatuses.value[peer] = status;
    }
  }

  // 用户手动启用某个 Peer
  async function enablePeer(peer: string) {
    if (!peersList.value.includes(peer)) {
      showToast(`节点 ${peer} 不在列表中`, 'warning');
      return;
    }
    if (enabledPeer.value === peer) {
      showToast(`${peer} 已是启用状态`, 'info');
      return;
    }

    enabledPeer.value = peer;
    await saveEnabledPeer();
    gun.opt({ peers: peersList.value, priorityPeer: peer });
    showToast(`启用节点: ${peer}`, 'success');

    const connected = await checkPeers();
    if (!connected) {
      showToast(`无法连接到 ${peer}，将回退到其他节点`, 'warning');
    }
    await updateStatus();
  }

  // 用户禁用当前启用的 Peer
  async function disablePeer() {
    if (!enabledPeer.value) {
      showToast('无启用的节点', 'info');
      return;
    }
    const oldPeer = enabledPeer.value;
    enabledPeer.value = peersList.value.length > 1 ? peersList.value.find(p => p !== oldPeer) || '' : '';
    await saveEnabledPeer();
    gun.opt({ peers: peersList.value });
    showToast(`禁用节点: ${oldPeer}`, 'success');
    await updateStatus();
  }

  // 添加 Peer（允许任意输入）
  async function addPeer(url: string) {
    if (!url) {
        showToast('请输入节点地址', 'warning');
        return;
    }
    const trimmedUrl = url.trim();
    if (peersList.value.includes(trimmedUrl)) {
        showToast('该节点已存在', 'warning');
        return;
    }
    try {
        await ensureStorageReady();
        console.log('[useNetworkStatus] 添加节点:', trimmedUrl);
        await storageService.run(
            'INSERT INTO network_peers (url, is_enabled, note) VALUES (?, ?, ?)',
            [trimmedUrl, 0, '']
        );

        // 重新查询 network_peers 表，确保数据一致
        const result = await storageService.query('SELECT url FROM network_peers');
        peersList.value = result.values.map((peer: { url: string }) => peer.url);
        console.log('[useNetworkStatus] 更新 peersList:', peersList.value);

        gun.opt({ peers: peersList.value });
        showToast(`节点已添加: ${trimmedUrl}`, 'success');
        await updatePeerStatuses();
    } catch (err: any) {
        console.error('[useNetworkStatus] Failed to add peer:', err);
        showToast(`添加节点失败: ${err.message || '未知错误'}`, 'error');
    }
}

  // 移除 Peer
  async function removePeer(peer: string) {
    try {
      await ensureStorageReady();
      if (enabledPeer.value === peer) {
        await disablePeer();
      }
      await storageService.run('DELETE FROM network_peers WHERE url = ?', [peer]);
      peersList.value = peersList.value.filter(p => p !== peer);
      delete peerStatuses.value[peer];
      gun.opt({ peers: peersList.value });
      showToast(`删除节点 ${peer}`, 'success');
      await updatePeerStatuses();
    } catch (err) {
      console.error('[useNetworkStatus] Failed to remove peer:', err);
      showToast('删除节点失败', 'error');
    }
  }

  // 处理网络状态变化
  function handleOnline() {
    updateNetworkStatus();
    updateStatus();
  }

  function handleOffline() {
    updateNetworkStatus();
    updateStatus();
  }

  // 初始化逻辑，只执行一次
  if (!initialized) {
    initialized = true;
    loadPeers();
    updateStatus();

    // 添加网络事件监听
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听 peersList 和 enabledPeer 的变化
    watch(peersList, () => {
      updatePeerStatuses();
    });
    watch(enabledPeer, () => {
      saveEnabledPeer();
      updateStatus();
    });
  }

  return {
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
    updateStatus,
    peersNotes,
    savePeerNote,
  };
}

// 导出单例
export function useNetworkStatus(storageService: StorageService) {
  if (!instance) {
    instance = createNetworkStatus(storageService);
  }
  return instance;
}


// import { ref, watch } from 'vue';
// import { useToast } from '@/composables/useToast';
// import { useNetwork } from '@/composables/useNetwork';

// // 模块级别的单例状态
// const networkStatus = ref<'online' | 'offline'>('online');
// const peersStatus = ref<'connected' | 'disconnected'>('disconnected');
// const currentMode = ref<'direct' | 'relay'>('direct');
// const peerStatuses = ref<Record<string, 'connected' | 'disconnected'>>({});

// // 单例初始化标志
// let initialized = false;
// let instance: ReturnType<typeof createNetworkStatus> | null = null;

// // 持久化 enabledPeer 的本地存储键
// const ENABLED_PEER_KEY = 'enabledPeer';

// function createNetworkStatus() {
//   const { gun, peersList, enabledPeer } = getTalkFlowCore();
//   const { showToast } = useToast();
//   const { isOnline, peersConnected, updateNetworkStatus, checkPeers } = useNetwork(gun);

//   // 保存 enabledPeer 到 localStorage
//   function saveEnabledPeer() {
//     localStorage.setItem(ENABLED_PEER_KEY, enabledPeer.value);
//   }

//   // 从 localStorage 加载 Peer 配置
//   function loadPeers() {
//     const savedPeers = localStorage.getItem('peers');
//     if (savedPeers) {
//       peersList.value = JSON.parse(savedPeers);
//     }
//     const savedPeer = localStorage.getItem(ENABLED_PEER_KEY);
//     if (savedPeer && peersList.value.includes(savedPeer)) {
//       enabledPeer.value = savedPeer;
//     } else if (peersList.value.length > 0) {
//       enabledPeer.value = peersList.value[0];
//       saveEnabledPeer();
//     }
//     // 初始化时使用完整的 peersList
//     gun.opt({ peers: peersList.value });
//   }

//   // 更新网络和 Peer 状态
//   async function updateStatus() {
//     networkStatus.value = isOnline.value ? 'online' : 'offline';
//     peersStatus.value = peersConnected.value ? 'connected' : 'disconnected';
//     currentMode.value = peersConnected.value && enabledPeer.value ? 'relay' : 'direct';
//     await updatePeerStatuses();
//   }

//   // 检查单个 Peer 的状态（用于 UI 展示）
//   async function checkPeerStatus(peer: string): Promise<'connected' | 'disconnected'> {
//     return new Promise((resolve) => {
//       const tempGun = Gun({ peers: [peer] });
//       let connected = false;
//       tempGun.on('hi', () => {
//         connected = true;
//         resolve('connected');
//       });
//       setTimeout(() => {
//         if (!connected) resolve('disconnected');
//       }, 5000);
//     });
//   }

//   // 更新所有 Peer 的状态（用于 UI 展示）
//   async function updatePeerStatuses() {
//     for (const peer of peersList.value) {
//       const status = await checkPeerStatus(peer);
//       peerStatuses.value[peer] = status;
//     }
//   }

//   // 用户手动启用某个 Peer
//   async function enablePeer(peer: string) {
//     if (!peersList.value.includes(peer)) {
//       showToast(`Peer ${peer} not in list`, 'warning');
//       return;
//     }
//     if (enabledPeer.value === peer) {
//       showToast(`${peer} is already enabled`, 'info');
//       return;
//     }

//     enabledPeer.value = peer;
//     saveEnabledPeer();
//     gun.opt({ peers: peersList.value, priorityPeer: peer }); // 自定义选项，优先尝试该 Peer
//     showToast(`Enabled peer: ${peer}`, 'success');

//     // 检查连接状态
//     const connected = await checkPeers();
//     if (!connected) {
//       showToast(`Failed to connect to ${peer}, falling back to other peers`, 'warning');
//     }
//     await updateStatus();
//   }

//   // 用户禁用当前启用的 Peer
//   function disablePeer() {
//     if (!enabledPeer.value) {
//       showToast('No peer enabled', 'info');
//       return;
//     }
//     const oldPeer = enabledPeer.value;
//     enabledPeer.value = peersList.value.length > 1 ? peersList.value.find(p => p !== oldPeer) || '' : '';
//     saveEnabledPeer();
//     gun.opt({ peers: peersList.value }); // 重置为完整列表
//     showToast(`Disabled peer: ${oldPeer}`, 'success');
//     updateStatus();
//   }

//   // 添加 Peer
//   function addPeer(url: string) {
//     if (!url) {
//       showToast('Please enter the node URL', 'warning');
//       return;
//     }
//     if (peersList.value.includes(url)) {
//       showToast('This node already exists.', 'warning');
//       return;
//     }
//     peersList.value.push(url);
//     localStorage.setItem('peers', JSON.stringify(peersList.value));
//     gun.opt({ peers: peersList.value });
//     showToast(`Node added: ${url}`, 'success');
//     updatePeerStatuses();
//   }

//   // 移除 Peer
//   function removePeer(peer: string) {
//     if (enabledPeer.value === peer) {
//       disablePeer();
//     }
//     peersList.value = peersList.value.filter(p => p !== peer);
//     delete peerStatuses.value[peer];
//     localStorage.setItem('peers', JSON.stringify(peersList.value));
//     gun.opt({ peers: peersList.value });
//     showToast(`Deleted node ${peer}`, 'success');
//     updatePeerStatuses();
//   }

//   // 处理网络状态变化
//   function handleOnline() {
//     updateNetworkStatus();
//     updateStatus();
//   }

//   function handleOffline() {
//     updateNetworkStatus();
//     updateStatus();
//   }

//   // 初始化逻辑，只执行一次
//   if (!initialized) {
//     initialized = true;
//     loadPeers();
//     updateStatus();

//     // 添加网络事件监听
//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     // 监听 peersList 和 enabledPeer 的变化
//     watch(peersList, () => {
//       // gun.opt({ peers: peersList.value });
//       updatePeerStatuses();
//     });
//     watch(enabledPeer, () => {
//       saveEnabledPeer();
//       updateStatus();
//     });
//   }

//   return {
//     networkStatus,
//     peersStatus,
//     currentMode,
//     peerStatuses,
//     peersList,
//     enabledPeer,
//     addPeer,
//     removePeer,
//     enablePeer,
//     disablePeer,
//     updateStatus,
//   };
// }

// // 导出单例
// export function useNetworkStatus() {
//   if (!instance) {
//     instance = createNetworkStatus();
//   }
//   return instance;
// }

// 清理函数（用于测试或应用卸载时）
// export function cleanupNetworkStatus() {
//   if (instance) {
//     window.removeEventListener('online', instance.updateStatus);
//     window.removeEventListener('offline', instance.updateStatus);
//     instance = null;
//     initialized = false;
//   }
// }