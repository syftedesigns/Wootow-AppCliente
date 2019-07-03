import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material';
import { ModalController } from '@ionic/angular';
import { CardComponent } from '../card/card.component';
import { GlobalService } from '../../../services/global/global.service';
import { GeolocationService } from '../../../services/map/geolocation.service';

@Component({
  selector: 'app-tow-picker',
  templateUrl: './tow-picker.component.html',
  styleUrls: ['./tow-picker.component.scss'],
})
export class TowPickerComponent implements OnInit {
  TruckType1: boolean = true;
  TruckType2: boolean = false;
  Miles: number = 0;
  Meter: number = 0;
  durationSec: number = 0;
  durationMin: number = 0;
  HookPrice: number = 0;
  FlatPrice: number = 0;
  PriceHookWithDistance: number = 0;
  PriceFlatbetWithDistance: number = 0;
  FirebaseObject: any; // Creamos un objeto de tipo firebase
  constructor(public BottomsheetRef: MatBottomSheetRef<TowPickerComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any, public modal: ModalController,
              private global: GlobalService, private map: GeolocationService,
              private geolocation: GeolocationService) {
               this.Miles = Math.round(this.MilesConvert(data.distance));
               this.durationSec = data.duration;
               if (this.data.firebase) {
                 this.FirebaseObject = this.data.firebase;
               }
  }

  ngOnInit() {
    this.HookPrice = this.ValueFeeDistanceCalculator(72);
    this.FlatPrice = this.ValueFeeDistanceCalculator(82.80);
  }
  PickerTruck(TruckType: string) {
    switch (TruckType) {
      case 'hook':
        this.TruckType1 = true;
        this.TruckType2 = false;
        this.ValueFeeDistanceCalculator(72);
        this.PriceHookWithDistance = this.ValueFeeDistanceCalculator(72);
        break;
      case 'flatbet':
        this.TruckType1 = false;
        this.TruckType2 = true;
        this.ValueFeeDistanceCalculator(82.80);
        this.PriceFlatbetWithDistance = this.ValueFeeDistanceCalculator(82.80);
        break;
    }
  }
  MilesConvert(toMiles: number): number {
    return (toMiles * 0.000621);
  }
  ValueFeeDistanceCalculator(Tax: number) {
      let tax: number = 0;
      let extraMiles: number = 0;
      let TotalExtraMiles: number = 0;
      let distanceExtra: number = 0;
      if (this.Miles <= 30) {
        tax = Tax;
        extraMiles = 0;
        TotalExtraMiles = 0;
      } else {
        // Tiene mas de 30 millas
        TotalExtraMiles = Number((this.Miles - 30) * 0.80);
        extraMiles = Number((this.Miles - 30));
        tax +=  TotalExtraMiles;
        distanceExtra = (extraMiles * 0.80);
      }
      // woowtow Percent
      const wowtowFee: number = (tax * (10 / 100) + 19.98);
      const employerFee: number = (tax * 0.90);
      tax += (19.98); // Dispatch
      /*console.log(`Tarifa: ${tax}`);
      console.log(`Wootow: ${wowtowFee}`);
      console.log(`Provider: ${employerFee}`);
      console.log(`Miles: ${this.Miles}`);*/
      return tax;
  }
  async DisplayChargeModal() {
    console.log(this.FirebaseObject);
    // Determinamos si eligio alguna tarifa
    if (this.PriceFlatbetWithDistance !== 0 || this.PriceHookWithDistance !== 0) {
      const chargeModal = await this.modal.create({
        component: CardComponent,
        backdropDismiss: false,
        componentProps: {
          price: {
            hook: this.PriceHookWithDistance,
            flat: this.PriceFlatbetWithDistance
          },
          miles: this.Miles,
          duration: this.durationSec
        }
      });
      this.BottomsheetRef.dismiss(null);
      await chargeModal.present();
      // Verificamos si se efectuo el pago
      chargeModal.onDidDismiss().then(
        async (charge) => {
          if (charge.role === 'paid') {
            console.log(charge);
            this.FirebaseObject.pay = {
               token: charge.data.token,
               price: charge.data.data.price
            };
            setTimeout(async () => {
              console.log(this.FirebaseObject);
              // Insertamos el registro en firebase
              if (await this.map.SaveServiceToFirebase(this.FirebaseObject)) {
                this.geolocation.FirebaseMapLoader = true;
                console.log('Hizo el pago y el servicio fue almacenado');
              } else {
                return;
              }
            }, 500);
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
