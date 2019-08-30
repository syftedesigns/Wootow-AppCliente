import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from '../environments/environment';
import { ServicesModule } from './services/services.module';
import { NgxStripeModule } from 'ngx-stripe';
// Cordova
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { PublicComponent } from './components/pages/public/public.component';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { SMS } from '@ionic-native/sms/ngx';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { SharedModule } from './components/shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    PublicComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapbox.token,
    }),
    ServicesModule,
    NgxStripeModule.forRoot('pk_test_CAdqELuEhU4gNp3aiTsyyCTD'),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    SharedModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeStorage,
    AngularFireDatabase,
    ImagePicker,
    Camera,
    BackgroundMode,
    OneSignal,
    LaunchNavigator,
    CallNumber,
    SMS,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
