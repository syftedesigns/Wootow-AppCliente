import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SignUpComponent } from '../../../shared/auth/sign-up/sign-up.component';
import { LoginPopupComponent } from '../../../shared/auth/login/login.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  constructor(public modal: ModalController) { }

  ngOnInit() {}
  async openSignUp() {
    const modal = await this.modal.create({
      backdropDismiss: false,
      component: SignUpComponent
    });
    await modal.present();
  }
  async openLogin() {
    const modal = await this.modal.create({
      backdropDismiss: false,
      component: LoginPopupComponent
    });
    await modal.present();
  }

}
