import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service';
import { NgForm } from '@angular/forms';
import { GlobalService } from '../../../services/global/global.service';
import { ObjectCustomerClass } from '../../../classes/customer.class';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  constructor(public modal: ModalController, public auth: AuthService,
              private global: GlobalService) { }

  ngOnInit() {}

  UpdateForm(customerData: NgForm): void {
    if (customerData.invalid) {
      throw new Error('Form invalid');
    }
    const updating: ObjectCustomerClass = new ObjectCustomerClass(
      customerData.value.name, null, null, null, null, customerData.value.password
    );
    // Verificamos si las contraseñas son identicas
    if (customerData.value.password === customerData.value.password2) {
      // Actualizamos
      this.global.OpenLoader('Updating your profile');
      this.auth.UpdateUser(updating, `login/${this.auth._id}`)
        .subscribe((data) => {
          if (data.status) {
            // Refrescamos el Local Storage para que almacene los nuevos datos
            this.auth.SaveStorage(data.data);
            this.auth.LoadStorage();
            this.global.snackBar.open('Profile updated successfully', null, {duration: 5000});
            this.modal.dismiss();
            setTimeout(() => {
              this.global.CloseLoader();
            }, 500);
          }
        }, (err) => {
          throw new Error(err);
        });
    } else {
      this.global.snackBar.open('Passwords not match', null, {duration: 5000});
      return;
    }
  }
}
