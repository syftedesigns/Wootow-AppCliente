import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressComponent } from './address/address.component';
import { ProfileComponent } from './profile/profile.component';
import { VehicleSignComponent } from './vehicle-sign/vehicle-sign.component';
import { IonicModule } from '@ionic/angular';
import { AngularMaterialModule } from '../../angular-material.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { BudgetComponent } from './budget/budget.component';
import { TowPickerComponent } from './tow-picker/tow-picker.component';

@NgModule({
  declarations: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent
  ],
  entryComponents: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent
  ],
  exports: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    AngularMaterialModule,
    FormsModule,
    RouterModule
  ]
})
export class SharedModule { }
