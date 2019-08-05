import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './services/auth/auth.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Perfil',
      url: '/profile',
      icon: 'contact'
    },
    {
      title: 'Ayuda',
      url: '/help',
      icon: 'help-circle'
    },
    {
      title: 'Pago',
      url: '/payments',
      icon: 'briefcase'
    },
    {
      title: 'Configuración',
      url: '/config',
      icon: 'construct'
    },
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public auth: AuthService,
    private backgroundMode: BackgroundMode,
    private oneSignal: OneSignal
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.backgroundMode.enable(); // Se dispara cuando se minimiza la aplicación
      // Configuración del push
      if (this.platform.is('cordova')) {
        this.SetUpPush();
      }
    });
  }
  SetUpPush() {
    // OneSignal Code start:
    // Enable to debug issues:
    // window['plugins'].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    // Android
    this.oneSignal.startInit(environment.oneSignal.token, environment.oneSignal.android);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
    this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
     });
    this.oneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
    });
    this.oneSignal.endInit();
 }
}
