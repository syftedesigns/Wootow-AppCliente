import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { GeolocationService } from '../../../../services/map/geolocation.service';
import { PaymentsService } from 'src/app/services/ssl/payments.service';
import { API_SERVER_NODE_LOCAL } from 'src/app/global/API.config';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss'],
})
export class CancelComponent implements OnInit {
  CurrentService: any = null;
  constructor(public modal: ModalController, private data: NavParams,
              private geolocation: GeolocationService, private payment: PaymentsService,
              private alert: AlertController) {
    this.CurrentService = this.data.data.currentService;
    console.log(this.data.data);
  }

  ngOnInit() {}

  RequestCancellation(cancelForm: NgForm): void {
    if (cancelForm.invalid) {
      console.error('Form invalid');
      return;
    }
    // Hacemos un ultimo validate
    this.CancelConfirmation().then(
      (confirmed: boolean) => {
        if (confirmed) {
          // Entonces eliminamos la operación y devolvemos el dinero
          this.payment.CardTransactionsTypes(
            `${API_SERVER_NODE_LOCAL}/client/payment/stripe/newAPI/charge/refund`,
            this.CurrentService.charge.id)
              .subscribe((refunded) => {
                if (refunded.status) {
                  // Hizo el reembolso, ahora debemos cancelar este servicio
                  this.modal.dismiss(refunded.refund, 'refunded');
                }
              });
        }
      }
    );
    console.log(cancelForm.value);
  }
  async CancelConfirmation(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alert.create({
        header: 'Must confirm',
        message: '<strong>this operation cannot be undone</strong>',
        buttons: [{
          text: 'cancel',
          role: 'cancel',
          handler: () => {
            resolve(false);
          }
        }, {
          text: 'Confirm',
          handler: () => {
            resolve(true);
          }
        }]
      });
      return await alert.present();
    });
  }
}
