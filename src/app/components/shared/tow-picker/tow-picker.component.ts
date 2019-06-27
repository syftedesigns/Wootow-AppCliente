import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

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
  constructor(public BottomsheetRef: MatBottomSheetRef<TowPickerComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
               this.Miles = Math.round(this.MilesConvert(data.distance));
               this.durationSec = data.duration;
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
        break;
      case 'flatbet':
        this.TruckType1 = false;
        this.TruckType2 = true;
        this.ValueFeeDistanceCalculator(82.80);
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
      console.log(`Tarifa: ${tax}`);
      console.log(`Wootow: ${wowtowFee}`);
      console.log(`Provider: ${employerFee}`);
      console.log(`Miles: ${this.Miles}`);
      return tax;
  }
}
