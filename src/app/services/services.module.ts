import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GeolocationService } from './map/geolocation.service';
import { GlobalService } from './global/global.service';
import { AngularMaterialModule } from '../angular-material.module';

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
    GlobalService
  ]
})
export class ServicesModule { }
