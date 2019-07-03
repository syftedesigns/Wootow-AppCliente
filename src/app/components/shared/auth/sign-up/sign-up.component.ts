import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../services/global/global.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { NgForm } from '@angular/forms';
import { ObjectCustomerClass } from '../../../../classes/customer.class';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {

  constructor(private global: GlobalService, private route: Router,
              private auth: AuthService, public modal: ModalController) { }

  ngOnInit() {}

  SignUpNewCustomer(form: NgForm): void {
    if (form.invalid) {
      throw new Error('Form invalid');
    }
    this.global.OpenLoader('Wait until we process your registration.');
    // Creamos un objeto de tipo customer
    let customer: ObjectCustomerClass = new ObjectCustomerClass(form.value.name, form.value.email,
      form.value.phone, false, false, form.value.password);
      // Registramos al usuario
    this.auth.CustomerOperation(customer, 'login')
        .subscribe(async (affiliation) => {
          if (affiliation.status) {
            // Registro con éxito
            customer = affiliation.client;
            customer.token = affiliation.token;
            // Guardamos en el dispositivo o en el navegador
            if (await this.auth.SaveStorage(customer)) {
              this.global.OpenToastWithMsg('Your registration has been processed successfully', 3000);
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
