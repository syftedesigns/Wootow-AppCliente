import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { ObjectCoords } from '../../classes/coords.class';
import { GlobalService } from '../global/global.service';
import { MAPBOX_SEARCH_API, MAPBOX_DIRECTIONS_API } from 'src/app/global/API.config';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { MatSnackBar } from '@angular/material';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthService } from '../auth/auth.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  public currentPosition: ObjectCoords = null;
  public Route: any = null;
  public layer: any = null;
  public FirebaseMapLoader: boolean = false;
  // tslint:disable-next-line:variable-name
  constructor(private _http: HttpClient, public geolocation: Geolocation,
              private platform: Platform, private global: GlobalService,
              private snackBar: MatSnackBar, private db: AngularFireDatabase,
              private auth: AuthService, public background: BackgroundMode) {
                this.GetCurrentPosition().then((data) => {
                  if (data !== null) {
                    this.currentPosition = data;
                  }
                });
              }

  GetCurrentPosition(): Promise<ObjectCoords> {
    return new Promise((resolve, reject) => {
      if (this.GetPlatform()) {
        console.log('cordova');
        // Si es cordova entonces lo obtenemos mediante el gps
        this.geolocation.getCurrentPosition().then(
          (gps) => {
            this.currentPosition = new ObjectCoords(gps.coords.latitude, gps.coords.longitude);
            resolve(this.currentPosition);
          }, (err) => {
            this.global.OpenToastWithMsg(err, 3000);
            resolve(null);
            return;
          }
        ).catch(() => {
          this.global.OpenToastWithMsg('Failure to process yor data', 3000);
        }
        );
      } else {
        console.log('Web');
        // Verificamos si el usuario habilito el navegador
        if ('geolocation' in navigator) {
          // Entonces sabremos su posición
          navigator.geolocation.getCurrentPosition( (gps) => {
            this.currentPosition = new ObjectCoords(gps.coords.latitude, gps.coords.longitude);
            resolve(this.currentPosition);
          }, (err) => {
            this.global.OpenToastWithMsg(err.message, 3000);
            resolve(null);
            return;
          });
        } else {
          this.currentPosition = null;
          resolve(null);
          this.global.OpenToastWithMsg('You must accept the gps integration', 3000);
          return;
        }
      }
    });
  }
  GetPlatform() {
    // Verificamos el tipo de plataforma que esta utilizando la app
    return (this.platform.is('cordova')) ? true : false;
  }
  // Obtener locaciones según el autocomplete del input
  ExploreLocationsByKeywords(keyword: string) {
      let url = `${MAPBOX_SEARCH_API}/${keyword}.json?access_token=${environment.mapbox.token}`;
      url += `&cachebuster=1561463597954&autocomplete=true`;
      url += `&types=locality%2Cpostcode%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Cneighborhood%2Caddress%2Cpoi`;
      // country region postcode
      return this._http.get(url).pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError( (err: any)  => {
          console.error(err);
          this.snackBar.open('Ops! We have problems to process your data. Please try again', null, {
            duration: 5000,
            panelClass: ['red-snackbar']
          });
          return new Observable<string | boolean>();
        })
      );
  }
  // Obtener la ubicación en la que estoy
  GetReverseGeocoding(longitude: number, latitude: number) {
    const url = `${MAPBOX_SEARCH_API}/${longitude},${latitude}.json?access_token=${environment.mapbox.token}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        console.error(err);
        this.snackBar.open('Ops! We have problems to process your data. Please try again', null, {
          duration: 5000,
          panelClass: ['red-snackbar']
        });
        return new Observable<string | boolean>();
      })
    );
  }
  // Obtener una ruta marcada en GEOJSON
  GetGEOJSONLineString(Origin: ObjectCoords, Destiny: ObjectCoords) {
    let url = `${MAPBOX_DIRECTIONS_API}/${Origin.longitude},${Origin.latitude};`;
    url += `${Destiny.longitude},${Destiny.latitude}?geometries=geojson&access_token=${environment.mapbox.token}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        console.error(err);
        this.snackBar.open('Ops! We have problems to process your data. Please try again', null, {
          duration: 5000,
          panelClass: ['red-snackbar']
        });
        return new Observable<string | boolean>();
      })
    );
  }

  // Guardar un servicio en Firebase para luego retornarlo en el mapa
  SaveServiceToFirebase(ObjectService: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.object(`services/${ObjectService.key}`)
        .update(ObjectService).then(
          () => {
            resolve(true);
          }, (err) => {
            this.global.snackBar.open('Failure to insert in firebase', null, {
              horizontalPosition: 'center',
              verticalPosition: 'top',
              duration: 5000
            });
            throw new Error(JSON.stringify(err));
          }
        );
    });
  }
  // Retornar los servicios segun mi ID
  ReturnServicesFromFirebase() {
    return this.db.list('services', ref =>
    ref.orderByChild('customer/_id')
    .equalTo(this.auth._id)).valueChanges()
    .pipe(
      map((objectPost: any) => {
          return objectPost;
    }),
    catchError( (err: any)  => {
      console.error(err);
      this.snackBar.open('Ops! We have problems to process your data. Please try again', null, {
        duration: 5000,
        panelClass: ['red-snackbar']
      });
      return new Observable<string | boolean>();
    })
  );
  }
    // Actualizar la base de datos, para introducir el tracking, status y datos del conductor
   // Una vez que es aceptado el servicio
   // KeyNode: Id del nodo a actualizar, DataToUpdate: Objeto a insertar dentro de la db
   // El objeto debe contener, datos del conductor, Tracking del servicio
   UpdateFirebaseService(dataToUpdate: any, nodeRoute: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.object(nodeRoute).update(dataToUpdate)
       .then( () => {
         resolve(true);
       }, (err) => {
         console.error(err);
         resolve(false);
       });
    });
  }
     /*
   Función que nos retorna un booleano en caso de que la aplicación este en segundo plano
   */
  IsBackground(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.background.isActive()) { // Si la app queda en segundo plano, se activa
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}
