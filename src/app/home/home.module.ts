import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from 'src/environments/environment';
import { AngularMaterialModule } from '../angular-material.module';
import { SharedModule } from '../components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapbox.token,
    }),
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    AngularMaterialModule,
    SharedModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
