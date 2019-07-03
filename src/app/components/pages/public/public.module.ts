import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../../../angular-material.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { PublicRoutingModule } from './public.routes';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    AngularMaterialModule,
    FormsModule,
    SharedModule,
    PublicRoutingModule
  ]
})
export class PublicModule { }
