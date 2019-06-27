import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { VehicleSignComponent } from '../../shared/vehicle-sign/vehicle-sign.component';
import { ProfileComponent } from '../../shared/profile/profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(public modal: ModalController, private GalleryController: ActionSheetController) { }

  ngOnInit() {
  }
  async OpenVehiclePage(booleanTest: boolean) {
    const modal = await this.modal.create({
      component: VehicleSignComponent,
      componentProps: {
        booleanTest
      },
      backdropDismiss: booleanTest,
    });
    await modal.present();
  }
  async GalleryControllerFunction() {
    const controller = await this.GalleryController.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {}
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {}
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ],
    });
    await controller.present();
  }
  async OpenProfile() {
    const modal = await this.modal.create({
      component: ProfileComponent,
      cssClass: ['profile-modal']
    });
    await modal.present();
  }
}
