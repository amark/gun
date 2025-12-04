import { CapacitorConfig } from '@capacitor/cli';
import { CapacitorHttp } from '@capacitor/core';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard'
const config: CapacitorConfig = {
  appId: 'com.gun.relay',
  appName: 'Relay',
  webDir: 'dist',

 
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
   
    Keyboard: {
      resize: KeyboardResize.None,
      resizeOnFullScreen: true,
   
    },
    CapacitorSQLite: {
      migrate: true,
    iosDatabaseLocation: 'Library/CapacitorDatabase',
    iosIsEncryption: true,
    iosKeychainPrefix: 'gundb',
    iosBiometric: {
        biometricAuth: false,
        biometricTitle : "Biometric login for capacitor sqlite"
    },
    androidIsEncryption: true,
    androidBiometric: {
        biometricAuth : false,
        biometricTitle : "Biometric login for capacitor sqlite",
        biometricSubTitle : "Log in using your biometric"
    },
    electronIsEncryption: true,
    electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
    electronMacLocation: "~/Databases/",
    electronLinuxLocation: "Databases"
    }
  }
};

export default config;
