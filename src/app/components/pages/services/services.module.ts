import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ServicesPage } from './services.page';
import { AngularMaterialModule } from '../../../angular-material.module';

const routes: Routes = [
  {
    path: '',
    component: ServicesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AngularMaterialModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ServicesPage]
})
export class ServicesPageModule {}
