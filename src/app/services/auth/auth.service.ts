import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Platform } from '@ionic/angular';
import { MatSnackBar } from '@angular/material';
import { ObjectCustomerClass } from '../../classes/customer.class';
import { Router } from '@angular/router';
import { API_SERVER_NODE_LOCAL } from '../../global/API.config';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { GlobalService } from '../global/global.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // tslint:disable-next-line:variable-name
  public _id: string;
  public Customer: ObjectCustomerClass;
  public token: string;
  public stripePaymenToken: any;
  // tslint:disable-next-line:variable-name
  constructor(private _http: HttpClient, private storage: NativeStorage,
              private platform: Platform, private matSnack: MatSnackBar,
              private router: Router, private global: GlobalService) {
                this.LoadStorage();
              }


  public GivePlatformInfo(): string {
  return (this.platform.is('cordova')) ? 'cordova' : 'web';
  }
  // Carga en el dispositivo apenas se inyecta el servicio
  LoadStorage() {
    if (this.GivePlatformInfo() === 'cordova') {
      // Storage native
      this.storage.getItem('sessionCustomer').then(
        (mobileStorage) => {
          this.matSnack.open(JSON.stringify(mobileStorage));
          if (mobileStorage !== '' && mobileStorage !== undefined && mobileStorage !== null) {
            this.Customer = JSON.parse(mobileStorage);
            this._id = this.Customer._id;
            this.token = this.Customer.token;
          } else {
            this.Customer = null;
            this._id = '';
            this.token = '';
          }
        },
        (err) => {
          this.matSnack.open('Failure to load your session auth, please try later', null, {duration: 5000});
          throw new Error(err);
        }
      );
    } else {
      // Web localstorage
      console.log('WebStorage');
      this._id = localStorage.getItem('id') || '';
      this.Customer = JSON.parse(localStorage.getItem('sessionCustomer')) || null;
      this.token = localStorage.getItem('token') || '';
    }
  }
  // Guarda en el dispositivo
  SaveStorage(ObjectCustomer: ObjectCustomerClass): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.GivePlatformInfo() === 'cordova') {
        // Guardamos en el telefono
         this.storage.setItem('sessionCustomer', JSON.stringify(ObjectCustomer))
          .then( () => {
            this.Customer = ObjectCustomer;
            this._id = ObjectCustomer._id;
            this.token = ObjectCustomer.token;
            resolve(true);
          },
          (err) => {
            this.matSnack.open('Failure to save your session auth, please try later', null, {duration: 5000});
            throw new Error(err);
          });
      } else {
        // Guardamos en el browser
        console.log('Browser save');
        localStorage.setItem('sessionCustomer', JSON.stringify(ObjectCustomer));
        localStorage.setItem('id', ObjectCustomer._id);
        localStorage.setItem('token', ObjectCustomer.token);
        this.Customer = ObjectCustomer;
        this._id = ObjectCustomer._id;
        resolve(true);
      }
    });
  }
  // Destruye la sessión y lo manda al login
  Logout() {
    if (this.GivePlatformInfo() === 'cordova') {
      // Clear from native storage
      this.storage.remove('sessionCustomer')
        .then(() => {
          this.Customer = null;
          this._id = '';
          this.token = '';
          this.router.navigate(['/auth/login']);
          this.matSnack.open('Your session has been closed', null, {duration: 4000});
        }, (err) => {
          this.matSnack.open('Failure to remove your session auth, please try later', null, {duration: 5000});
          throw new Error(err);
        });
    } else {
      localStorage.removeItem('sessionCustomer');
      localStorage.removeItem('id');
      localStorage.removeItem('token');
      this.Customer = null;
      this._id = '';
      this.router.navigate(['/auth/login']);
      this.matSnack.open('Your session has been closed', null, {duration: 4000});
    }
  }
    // Verificamos si esta autenticado
    isLogged(): boolean {
      return ((this.Customer !== null) &&
         (this.Customer !== undefined) &&
         (this._id !== undefined) &&
         (this._id !== '')) ? true : false;
    }
  // Registra o Logea un cliente
  CustomerOperation(objectCustomer: ObjectCustomerClass, route: string) {
    const URL = `${API_SERVER_NODE_LOCAL}/client/${route}`;
    return this._http.post(URL, objectCustomer).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open('Credentials pair incorrect.', null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
  // Actualizar contraseña de un usuario
  UpdateUser(objectCustomer: ObjectCustomerClass, route: string) {
    const URL = `${API_SERVER_NODE_LOCAL}/client/${route}`;
    return this._http.put(URL, objectCustomer).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open('Credentials pair incorrect.', null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
}
