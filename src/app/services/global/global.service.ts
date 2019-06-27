import { Injectable } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(public toast: ToastController, public loader: LoadingController) { }

  async OpenToastWithMsg(msgToDisplay: string, toastDuration: number = 2000) {
    const toast = await this.toast.create({
      message: msgToDisplay,
      duration: toastDuration,
      cssClass: ['toast-display']
    });
    toast.present();
  }
  async OpenLoader(msgToDisplay: string, loadDuration: number = 600000) {
    const loader = await this.loader.create({
      message: msgToDisplay,
      duration: loadDuration,
      backdropDismiss: false
    });
    await loader.present();
  }
}
