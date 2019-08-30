import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material';
import { ModalController } from '@ionic/angular';
import { CardComponent } from '../card/card.component';
import { GlobalService } from '../../../services/global/global.service';
import { GeolocationService } from '../../../services/map/geolocation.service';
import { PaymentsService } from '../../../services/ssl/payments.service';

@Component({
  selector: 'app-tow-picker',
  templateUrl: './tow-picker.component.html',
  styleUrls: ['./tow-picker.component.scss'],
})
export class TowPickerComponent implements OnInit {
  TruckType1: boolean = false;
  TruckType2: boolean = false;
  Miles: number = 0;
  Meter: number = 0;
  durationSec: number = 0;
  durationMin: number = 0;
  HookPrice: number = 0;
  FlatPrice: number = 0;
  ObjectPayment: any = null;
  FirebaseObject: any; // Creamos un objeto de tipo firebase
  constructor(public BottomsheetRef: MatBottomSheetRef<TowPickerComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any, public modal: ModalController,
              private global: GlobalService, private map: GeolocationService,
              private geolocation: GeolocationService, private payment: PaymentsService) {
               this.Miles = Math.round(this.MilesConvert(Number(data.distance)));
               this.durationSec = data.duration;
               if (this.data.firebase) {
                 this.FirebaseObject = this.data.firebase;
               }
  }

  ngOnInit() {
    // Seteamos el valor total del servicio en hook y flatbet
    console.log(this.Miles);
    this.HookPrice = this.Calculator(72.00, this.Miles).Service;
    this.FlatPrice = this.Calculator(82.80, this.Miles).Service;
  }
  // Esto se encarga de hacer el calculo en base a las millas
  // Si es < 30 millas es una tarifa estatica si es > incluye tarifa extra
  Calculator(mileTax: number, miles: number): any {
      // El primer paso es verificar, si las millas es < 30 o >
      if (miles >= 30) {
        // Hay millas extras
        const ExtraMiles: number = (miles - 30); // Me va traer la cantidad de millas extras que contiene
        const ExtramilesFee = (ExtraMiles * 0.80).toFixed(2); // Valor total de las millas extras
        const dispatch: number = 24.99;
        // Calculamos el tax de la grua
        // (Tarifa + Distancia extra)*0,1+Dispatch Fee
        // Tarifa del conductor seria (Total - Grua)
        const WootowFee = (((mileTax + Number(ExtramilesFee)) * 0.1) + dispatch).toFixed(2);
        // Total del servicio
        const ServiceFee = ((mileTax + Number(ExtramilesFee)) + dispatch).toFixed(2);
        // Lo que ganará el conductor
        const ProviderFee = (Number(ServiceFee) - Number(WootowFee)).toFixed(2);
        // Retornamos los datos del servicio
        return {
          WooTow: Number(WootowFee), // Ganancia Wootow
          Service: Number(ServiceFee), // Costo total a pagar
          Provider: Number(ProviderFee), // Ganancia del conductor de la grua
          Miles: this.Miles, // Millas del servicio
          ExtraMilesFee: Number(ExtramilesFee), // Costo de millas extras
          ExtraMiles // Cantidad de millas extras
        };
      } else {
        // Tarifa normal
        const dispatch: number = 24.99;
        // Calculamos el tax de la grua
        // (Tarifa + Distancia extra)*0,1+Dispatch Fee
        // Tarifa del conductor seria (Total - Grua)
        const WootowFee = (((mileTax + 0) * 0.1) + dispatch).toFixed(2);
        // Total del servicio
        const ServiceFee = ((mileTax + 0) + dispatch).toFixed(2);
        // Lo que ganará el conductor
        const ProviderFee = ((Number(ServiceFee) - Number(WootowFee))).toFixed(2);
        // Retornamos los datos del servicio
        return {
          WooTow: Number(WootowFee), // Ganancia Wootow
          Service: Number(ServiceFee), // Costo total a pagar
          Provider: Number(ProviderFee), // Ganancia del conductor de la grua
          Miles: this.Miles // Millas del servicio
        };
      }
  }
   PickerTruck(TruckType: string) {
    switch (TruckType) {
      case 'hook':
        this.TruckType1 = true;
        this.TruckType2 = false;
        this.ObjectPayment = this.Calculator(72.00, this.Miles);
        console.log(this.ObjectPayment);
        break;
      case 'flatbet':
        this.TruckType1 = false;
        this.TruckType2 = true;
        this.ObjectPayment = this.Calculator(82.80, this.Miles);
        console.log(this.ObjectPayment);
        break;
    }
  }
  MilesConvert(toMiles: number): number {
    return (toMiles * 0.000621);
  }

  async DisplayChargeModal() {
    console.log(this.FirebaseObject);
    // Determinamos si eligio alguna tarifa
    if (this.ObjectPayment !== null) {
      const chargeModal = await this.modal.create({
        component: CardComponent,
        backdropDismiss: false,
        componentProps: {
          price: this.ObjectPayment, // Información relacionada con el pago
          miles: this.Miles, // Información de la ruta
          duration: this.durationSec, // Duración
          firebase: this.FirebaseObject // Objeto Firebase construido con toda la información
        }
      });
      this.BottomsheetRef.dismiss(null);
      await chargeModal.present();
      // Verificamos si se efectuo el pago
      chargeModal.onDidDismiss().then(
        async (charge) => {
          if (charge.role === 'accepted') {
            this.global.OpenLoader('Processing your payment');
            // Remplazamos el objeto Firebase con la nueva data
            this.FirebaseObject = charge.data.firebase;
            this.FirebaseObject.pay = charge.data.extraInfo; // Agregamos la información del vehiculo en pay
            this.FirebaseObject.prices.stripeAmount = charge.data.StripeAmount; // Agregamos el nodo que usará stripe para cargar
            // Una vez que tengamos todo el objeto de pago construido, procedemos a capturar el dinero de la tarjeta
            this.payment.CustomerCapturePayment(this.FirebaseObject).subscribe(
              async (payFrozen) => {
                if (payFrozen.status) {
                  // Significa que congeló el pago
                  // Si el pago fue congelado con éxito, el servicio ya se activo ahora hay que almacenarlo en firebase
                  this.FirebaseObject.charge = payFrozen.charge; // Colocamos el objeto de Firebase con toda la información de la operación
                  this.map.SaveServiceToFirebase(this.FirebaseObject).then(
                    (storage: boolean) => {
                      if (storage) {
                        this.global.CloseLoader();
                        this.global.snackBar.open('Your service has been approved', null, {
                          horizontalPosition: 'center',
                          verticalPosition: 'top',
                          duration: 5000
                        });
                        // Hizo el pago y almaceno en la db
                        console.log(this.FirebaseObject);
                      }
                    }
                  );
                }
              }
            );
            /*setTimeout(async () => {
              // Insertamos el registro en firebase
              if (await this.map.SaveServiceToFirebase(this.FirebaseObject)) {
                this.geolocation.FirebaseMapLoader = true;
                alert('Hizo el pago y el servicio fue almacenado');
              } else {
                return;
              }
            }, 3000);*/
          }
        }
      );
    } else {
      this.global.snackBar.open('Must select an truck option', null, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        duration: 3000
      });
    }
  }
}
