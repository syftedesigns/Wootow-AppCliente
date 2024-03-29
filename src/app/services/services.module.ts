import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GeolocationService } from './map/geolocation.service';
import { GlobalService } from './global/global.service';
import { AngularMaterialModule } from '../angular-material.module';
import { AuthService } from './auth/auth.service';
import { VehicleService } from './auth/vehicle.service';
import { PushService } from './auth/push.service';
import { PaymentsService } from './ssl/payments.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    AngularMaterialModule
  ],
  providers: [
    GeolocationService,
    GlobalService,
    AuthService,
    VehicleService,
    PushService,
    PaymentsService
  ]
})
export class ServicesModule { }
