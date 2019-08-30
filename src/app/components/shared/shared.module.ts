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
import { CardComponent } from './card/card.component';
import { NgxStripeModule } from 'ngx-stripe';
import { LoginPopupComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { NoImagePipe } from '../../services/pipes/no-image.pipe';
import { TowProfileComponent } from './tow-profile/tow-profile.component';
import { ReviewComponent } from './review/review.component';
import { CancelComponent } from './card/cancel/cancel.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { OrdersComponent } from './orders/orders.component';
import { MsgComponent } from './msg/msg.component';

@NgModule({
  declarations: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent,
    CardComponent,
    LoginPopupComponent,
    SignUpComponent,
    NoImagePipe,
    TowProfileComponent,
    ReviewComponent,
    CancelComponent,
    ConfirmationComponent,
    OrdersComponent,
    MsgComponent
  ],
  entryComponents: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent,
    CardComponent,
    LoginPopupComponent,
    SignUpComponent,
    TowProfileComponent,
    ReviewComponent,
    CancelComponent,
    ConfirmationComponent,
    OrdersComponent,
    MsgComponent
  ],
  exports: [
    AddressComponent,
    ProfileComponent,
    VehicleSignComponent,
    ExplorerComponent,
    BudgetComponent,
    TowPickerComponent,
    CardComponent,
    LoginPopupComponent,
    SignUpComponent,
    NoImagePipe,
    TowProfileComponent,
    ReviewComponent,
    CancelComponent,
    ConfirmationComponent,
    OrdersComponent,
    MsgComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    AngularMaterialModule,
    FormsModule,
    RouterModule,
    NgxStripeModule.forRoot('pk_test_CAdqELuEhU4gNp3aiTsyyCTD'),
  ]
})
export class SharedModule { }
