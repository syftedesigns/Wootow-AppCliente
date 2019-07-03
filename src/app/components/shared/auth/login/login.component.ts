import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalService } from '../../../../services/global/global.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { ObjectCustomerClass } from 'src/app/classes/customer.class';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginPopupComponent implements OnInit {

  constructor(public modal: ModalController, public global: GlobalService,
              private route: Router, private auth: AuthService) { }

  ngOnInit() {}
  LoginCustomer(form: NgForm): void {
    if (form.invalid) {
      throw new Error('Form invalid');
    }
    this.global.OpenLoader('Processing your data.');
    // Creamos un objeto de tipo customer
    let customer: ObjectCustomerClass = new ObjectCustomerClass(null, form.value.email, null, null, null, form.value.password);
      // Registramos al usuario
    this.auth.CustomerOperation(customer, 'login/auth')
        .subscribe(async (affiliation) => {
          if (affiliation.status) {
            // Registro con éxito
            customer = affiliation.data;
            customer.token = affiliation.token;
            // Guardamos en el dispositivo o en el navegador
            if (await this.auth.SaveStorage(customer)) {
              this.global.OpenToastWithMsg(`Welcome back ${customer.name}`, 3000);
              this.modal.dismiss();
              setTimeout(() => {
                this.route.navigate(['/']);
                this.global.CloseLoader();
              }, 1000);
            }
          } else {
            form.reset();
            this.global.CloseLoader();
            this.global.OpenToastWithMsg('Cannot process your operation, please retype the form correctly', 3000);
            return;
          }
        }, (err) => {
          console.log(err);
          console.log('entro');
        });
  }
}
