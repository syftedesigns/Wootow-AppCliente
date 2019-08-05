import { Injectable } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { GlobalService } from '../global/global.service';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { ObjectPushClass } from 'src/app/classes/push.model.class';
import { API_ONESIGNAL } from 'src/app/global/API.config';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  PlayerId: string = null;
  constructor(private oneSignal: OneSignal, private global: GlobalService,
              private auth: AuthService, private _http: HttpClient,
              private matSnack: MatSnackBar) { }


  // Nos devuelve las credenciales para hacer notificaciones push
  GetPlayerId(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oneSignal.getIds().then(
        (loaded) => {
          console.log(loaded);
          resolve({
            status: true,
            playerId: loaded.userId,
            token: loaded.pushToken
          });
          // this.global.snackBar.open(JSON.stringify(loaded), null, {duration: 5000});
        }, (err) => {
          // this.global.snackBar.open(JSON.stringify(err), null, {duration: 5000});
          console.error(err);
          throw err;
        }
      );
    });
  }
  // Envia la notificación push a un usuario
    SendPushToAnUser(ObjectToPush: ObjectPushClass) {
      // const headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.post(API_ONESIGNAL, JSON.stringify(ObjectToPush), {
        headers: {
          'Content-Type': 'application/json'
        }
      }).pipe(
            map((resp: any) => {
              return resp;
            }),
            catchError( (err: any)  => {
              // this.matSnack.open(JSON.stringify(err), null, {duration: 6000});
              console.error(err);
              return new Observable<string | boolean>();
            })
      );
  }
}
