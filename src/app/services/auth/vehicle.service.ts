import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { ObjectCarClass, ObjectCustomerCarClass } from '../../classes/car.model.class';
import { API_SERVER_NODE_LOCAL } from '../../global/API.config';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { GlobalService } from '../global/global.service';
import { MatSnackBar } from '@angular/material';
import * as firebase from 'firebase';
@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  CustomerCarRegistered: ObjectCarClass[] = [];
  // tslint:disable-next-line:variable-name
  constructor(private _http: HttpClient, cloud: AngularFireDatabase,
              private storage: AngularFireStorage, private global: GlobalService,
              private matSnack: MatSnackBar) { }

 // Función que se encarga de registrar el carro
  DBCarModels(ObjectCar: ObjectCustomerCarClass | ObjectCarClass, toRoute: string, errMsg?: string) {
    const url = `${API_SERVER_NODE_LOCAL}/client/${toRoute}`;
    return this._http.post(url, ObjectCar).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open(errMsg, null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
  // Cargar una imagen a firebase y retornar su URL para poder asociarlo con el vehiculo
  UploadImageToFirebase(image64: string, folderName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(image64);
      // Primer paso buscamos el enlace con el storage de firebase StorageBucket
      const StorageRef = this.storage.storage.ref(); // Me da el enlace con el bucket root que esta en enviroment para enlazar con firebase
      // Segundo paso creamos un nombre unico para el archivo
      const filename: string = new Date().valueOf().toString();
      // Tercer paso mandamos la imagen en base 64 a firebase
      // Child, recibe como parametro el folder, es decir el nombre de la carpeta en firebase
      // Putstring, para inyectar la imagen en el storage
      const upload: firebase.storage.UploadTask = StorageRef
        .child(`${folderName}/${filename}`)
        .putString(btoa(image64), 'base64', {contentType: 'image/jpeg'});
        // Verificamos si hizo el upload
      upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (value) => {
                  console.log(value);
                },
                // Fallo al insertar la imagen
                (err: any) => {
                  console.error(JSON.stringify(err));
                  resolve(null);
                  return;
                },
                // Cargo la imagen, necesitamos devolver la URL
                () => {
                  upload.snapshot.ref.getDownloadURL()
                    .then((urlImage: any) => {
                      resolve(urlImage);
                    }, (err) => {
                      console.error(JSON.stringify(err));
                      resolve(null);
                    });
                }
                );
    });
  }
  GetCarsRegistered(toRoute: string, errMsg?: string) {
    const url = `${API_SERVER_NODE_LOCAL}/client/${toRoute}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open(errMsg, null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
  DeleteCar(toRoute: string, errMsg?: string) {
    const url = `${API_SERVER_NODE_LOCAL}/client/${toRoute}`;
    return this._http.delete(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open(errMsg, null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
  UpdateCar(body: ObjectCustomerCarClass | ObjectCarClass | any, toRoute: string, errMsg?: string) {
    const url = `${API_SERVER_NODE_LOCAL}/client/${toRoute}`;
    return this._http.put(url, body).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError( (err: any)  => {
        setTimeout(() => {
          this.global.CloseLoader();
        }, 1000);
        this.matSnack.open(errMsg, null, {duration: 6000});
        console.error(err);
        return new Observable<string | boolean>();
      })
    );
  }
}
