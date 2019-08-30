import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalService } from '../global/global.service';
import { ObjectCustomerClass } from '../../classes/customer.class';
import { API_SERVER_NODE_LOCAL } from '../../global/API.config';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(private _http: HttpClient, private global: GlobalService) { }

  /*
  Registra a un cliente en la base de datos de los pagos
  es decir, un cliente al intentar pagarnos por un servicio
  formará ser parte de la base de datos de apgo
  */
 CustomersPayments(customer: ObjectCustomerClass) {
   const urlService = `${API_SERVER_NODE_LOCAL}/client/payment/stripe/newAPI/customer`;
   return this._http.post(urlService, JSON.stringify(customer), {
     headers: {
      'Content-Type': 'application/json'
     }
   }).pipe(
    map((resp: any) => {
      return resp;
    }),
    catchError( (err: any)  => {
      setTimeout(() => {
        this.global.CloseLoader();
      }, 1000);
      this.global.snackBar.open('Failure tu process this operation', null, {duration: 6000});
      console.error(err);
      return new Observable<string | boolean>();
    })
  );
 }
 /*
 Congelar el pago, el cliente una vez que paga el servicio
 el sistema hace una verificación para ver si cumple con las condiciones del pago
 Si cumple, se congela el dinero, cuando el conductor toma el servicio, se procede
 a cargar la tarjeta, esto permitirá que el cliente pueda cancelar el servicio
 y emitir un reembolso
 */
// Pasamos el objeto de Firebase que se construye con el servicio
CustomerCapturePayment(FirebaseObject: any) {
  const urlService = `${API_SERVER_NODE_LOCAL}/client/payment/stripe/newAPI/charge/capture`;
  return this._http.post(urlService, JSON.stringify(FirebaseObject), {
    headers: {
     'Content-Type': 'application/json'
    }
  }).pipe(
   map((resp: any) => {
     return resp;
   }),
   catchError( (err: any)  => {
     setTimeout(() => {
       this.global.CloseLoader();
     }, 1000);
     this.global.snackBar.open('Failure tu process this operation', null, {duration: 6000});
     console.error(err);
     return new Observable<string | boolean>();
    })
  );
 }
 /*
 Función que se encargará de cargar la tarjeta y solicitar reembolso
 Cuando el conductor toma el servicio, se le carga la tarjeta al cliente
 a su vez el cliente podrá solicitar un reembolso del dinero
 */
// Url Operation, la petición que se desea
// Transaction ID el prefix es #ch que es el ID de una transacción creada
CardTransactionsTypes(urlOperation: string, transactionId: string) {
   const urlService = `${urlOperation}/${transactionId}`;
   return this._http.post(urlService, null).pipe(
    map((resp: any) => {
      return resp;
    }),
    catchError( (err: any)  => {
      setTimeout(() => {
        this.global.CloseLoader();
      }, 1000);
      this.global.snackBar.open('Failure tu process this operation', null, {duration: 6000});
      console.error(err);
      return new Observable<string | boolean>();
     }),
   );
  }
}
