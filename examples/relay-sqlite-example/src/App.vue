<template>
  <ion-app>




    <ion-router-outlet  />


 
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';



function setupNetworkListener() {
  let debounceTimer: NodeJS.Timeout;
  window.addEventListener('online', async () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
    
    
  
    }, 500); 
  });

}






// 保存原始 console.warn
 const originalConsoleWarn = console.warn;


function filterGunWarnings(...args: any[]) {
  const message = args[0]?.toString() || '';
  if (message.includes('Deprecated internal utility will break in next version')) {
    return; // 忽略 Gun.js 警告
  }
  originalConsoleWarn.apply(console, args); 
}





onMounted(async () => {
   console.warn = filterGunWarnings;
   await setupNetworkListener(); 

});

onUnmounted(() => {
   window.removeEventListener('online', () => {});
   window.removeEventListener('offline', () => {});
});


</script>

<style scoped>


/* 滚动条样式 */
::-webkit-scrollbar {
  width: 0px; /* 滚动条宽度 */
  background-color: transparent; /* 透明背景 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: transparent; /* 半透明的滑块颜色 */
  border-radius: 4px; /* 圆角 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: transparent; /* 透明轨道 */
}


.ion-page,
ion-content {
  background: transparent !important;
  --background: transparent !important;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* touch-action: none;
  touch-action: pan-x pan-y;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none; */
  background-color: transparent;
  overflow: hidden;
}


body {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>