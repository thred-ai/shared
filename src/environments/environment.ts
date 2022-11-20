// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { Network } from 'alchemy-sdk';

export const environment = {
  production: false,

  firebase: {
    apiKey: 'AIzaSyCCV1HUWCeM0kaSVM7FcpDyHrTanse6BAk',
    authDomain: 'thred-protocol.firebaseapp.com',
    projectId: 'thred-protocol',
    storageBucket: 'thred-protocol.appspot.com',
    messagingSenderId: '313615470277',
    appId: '1:313615470277:web:76f4e51ce27c1338aa2aac',
    measurementId: 'G-4NPVBWK3NK',
  },

  rpc: {
    '1': {
      apiKey: '6ITDh9cH13O7QaI61cL0QRvBQS-Js1km',
      network: Network.ETH_MAINNET,
      prefix: 'https://eth-mainnet.g.alchemy.com/v2/',
    },
    '137': {
      apiKey: 'zZ_J8XGhVME0rH8TX0aiqEX8C37rlPIG',
      network: Network.MATIC_MAINNET,
      prefix: 'https://polygon-mainnet.g.alchemy.com/v2/',
    },
    '5': {
      apiKey: 'Y8B464dfKs682bqUJY_gLNST5RLr3XV_',
      network: Network.ETH_GOERLI,
      prefix: 'https://eth-goerli.g.alchemy.com/v2/',
    },
    '80001': {
      apiKey: 'ub1yRG4Xbh8bD0ON_SoB2qFO0txkHbxU',
      network: Network.MATIC_MUMBAI,
      prefix: 'https://polygon-mumbai.g.alchemy.com/v2/',
    },
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
