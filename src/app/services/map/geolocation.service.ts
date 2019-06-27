import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
import { ObjectCoords } from '../../classes/coords.class';
import { GlobalService } from '../global/global.service';
import { MAPBOX_SEARCH_API, MAPBOX_SEARCH_FILTERS1, MAPBOX_SEARCH_FILTERS2, MAPBOX_DIRECTIONS_API } from 'src/app/global/API.config';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { MatSnackBar } from '@angular/material';
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  public currentPosition: ObjectCoords = null;
  public Route: any = null;
  // tslint:disable-next-line:variable-name
  constructor(private _http: HttpClient, private geolocation: Geolocation,
              private platform: Platform, private global: GlobalService,
              private snackBar: MatSnackBar) {
                this.GetCurrentPosition();
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
}
