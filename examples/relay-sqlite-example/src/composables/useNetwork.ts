
import { ref } from 'vue';
import Gun, { IGunInstance } from 'gun';

// 模块级别的单例状态
const isOnline = ref(navigator.onLine);
const peersConnected = ref(false);
const checkInterval = 60000; // 每 60 秒检查一次

// 单例初始化标志和变量
let initialized = false;
let intervalId: number | null = null;
let currentGunInstance: IGunInstance<any> | null = null;
let instance: ReturnType<typeof createNetwork> | null = null;

function createNetwork(gunInstance: IGunInstance<any>) {
  // 检查 Gun.js 对等节点，反复尝试直到成功
  async function checkPeers(): Promise<boolean> {
    const maxAttempts = 3; 
    let attempt = 0;
    const retryDelay = 1000; // 每次尝试间隔 1 秒

    while (attempt < maxAttempts) {
      attempt++;
      const result = await new Promise<boolean>((resolve) => {
        let alive = false;
        const off = gunInstance.get('~public').once((data) => {
          alive = true;
          off.off();
          resolve(true);
        });
        setTimeout(() => {
          if (!alive) {
            resolve(false);
          }
        }, 5000); // 10 秒超时
      });

      if (result) {
        peersConnected.value = true;
        return true;
      } else {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    return false; // 理论上不会到达这里，因为 maxAttempts 是 Infinity
  }

  async function updateNetworkStatus() {
    isOnline.value = navigator.onLine;
    peersConnected.value = await checkPeers();
  }

  function handleOnline() {
    updateNetworkStatus();
  }

  function handleOffline() {
    isOnline.value = false;
    peersConnected.value = false;
  }

  function startChecking() {
    updateNetworkStatus();
    intervalId = window.setInterval(updateNetworkStatus, checkInterval);
  }

  function stopChecking() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // 单例初始化逻辑
  if (!initialized || currentGunInstance !== gunInstance) {
    if (initialized && currentGunInstance !== gunInstance) {
      // 如果 Gun 实例变了，清理旧的事件监听器和定时器
      stopChecking();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }

    initialized = true;
    currentGunInstance = gunInstance;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    startChecking();
  }

  return {
    isOnline,
    peersConnected,
    updateNetworkStatus,
    checkPeers,
  };
}

// 导出单例
export function useNetwork(gunInstance: IGunInstance<any>) {
  if (!instance || currentGunInstance !== gunInstance) {
    instance = createNetwork(gunInstance);
  }
  return instance;
}

// 清理函数（可选，用于测试或应用卸载时）
export function cleanupNetwork() {
  if (instance) {
    window.removeEventListener('online', instance.updateNetworkStatus);
    window.removeEventListener('offline', instance.updateNetworkStatus);
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    instance = null;
    initialized = false;
    currentGunInstance = null;
  }
}