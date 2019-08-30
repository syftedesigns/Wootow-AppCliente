import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  currentService: any = null;
  constructor(public modal: ModalController, public params: NavParams,
              public alert: AlertController) {
                this.currentService = this.params.data.currentService;
                console.log(this.params.data);
              }

  ngOnInit() {}

  async FinishService() {
    // tslint:disable-next-line:max-line-length
    if (await this.FinishConfirmation('Are you sure?', 'If you confirm the service, it will be automatically completed and this action cannot be undone, confirm if the service has already been completed')) {
      // Entonces Finalizamos el servicio
      this.modal.dismiss(null, 'approved');
    }
  }
  // El servicio aun no ha sido completado  el cliente rechaza que el servicio ha sido completado
  async ConfirmCancelation() {
    // tslint:disable-next-line:max-line-length
    if (await this.FinishConfirmation('Are you sure?', 'By declining the service will continue, to avoid delays please check if the service has really already been completed.')) {
      this.modal.dismiss(null, 'engaged');
    }
  }
  // Confirma si el gruero finalizó el servicio
  async FinishConfirmation(header: string, msg: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alert.create({
        header,
        message: `<strong>${msg}</strong>`,
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
