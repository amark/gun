// src/composables/useToast.ts
import { ref, onMounted } from 'vue';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  duration: number;
}

const messages = ref<ToastMessage[]>([]);
let idCounter = 0;
const isEnabled = ref(false); // 默认开启提示
const SETTINGS_FILE = 'toast_settings.json';

async function loadSettings(): Promise<{ isToastEnabled: boolean }> {
  const defaultSettings = { isToastEnabled: false };
  try {
    const result = await Filesystem.readFile({
      path: SETTINGS_FILE,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    const data = typeof result.data === 'string' ? result.data : await result.data.text();
    return JSON.parse(data) || defaultSettings;
  } catch (err) {
    console.log('未找到提示设置文件，使用默认值');
    return defaultSettings;
  }
}

async function saveSettings(): Promise<void> {
  try {
    await Filesystem.writeFile({
      path: SETTINGS_FILE,
      data: JSON.stringify({ isToastEnabled: isEnabled.value }),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    console.log('提示设置已保存:', { isToastEnabled: isEnabled.value });
  } catch (err) {
    console.error('保存提示设置失败:', err);
  }
}

export function showToast(msg: string, msgType: ToastType = 'info', customDuration = 3000) {
  if (!isEnabled.value) return; // 如果关闭则不显示

  const toast = {
    id: idCounter++,
    text: msg,
    type: msgType,
    duration: customDuration,
  };
  messages.value.push(toast);

  setTimeout(() => {
    messages.value = messages.value.filter(m => m.id !== toast.id);
  }, customDuration);
}

function hideToast(id: number) {
  messages.value = messages.value.filter(m => m.id !== id);
}

function toggleToast(enabled: boolean) {
  isEnabled.value = enabled;
  saveSettings(); // 保存设置
}

// 初始化加载设置
onMounted(async () => {
  const settings = await loadSettings();
  isEnabled.value = settings.isToastEnabled;
});

export function useToast() {
  return {
    messages,
    isEnabled,
    showToast,
    hideToast,
    toggleToast,
  };
}