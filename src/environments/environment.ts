// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mapbox: {
    token: 'pk.eyJ1IjoiaW5nY2FybG9zZSIsImEiOiJjanVoNDR3cmkwdnY2NDlwcHE5czU2MmhiIn0._ztgGFw7U3hBvZz9qsMA0A'
  },
  firebase: {
    apiKey: 'AIzaSyCBoicQd3-QqmtTL9YfAi6ykoS6M0NlyIM',
    authDomain: 'wootow-1537559306941.firebaseapp.com',
    databaseURL: 'https://wootow-1537559306941.firebaseio.com',
    projectId: 'wootow-1537559306941',
    storageBucket: 'wootow-1537559306941.appspot.com',
    messagingSenderId: '321851810301',
    appId: '1:321851810301:web:ca52ccc4b3f3f29d'
  },
  oneSignal: {
    token: 'a1da1802-8ed8-4f65-99a3-3b1aa6fa37ab',
    android: '1090236473786',
    testingUser: 'e1979f19-88cb-48c4-b80d-ab8d3d5d45f4'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
