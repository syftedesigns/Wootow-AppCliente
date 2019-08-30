import { Component, OnInit } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { VehicleSignComponent } from '../../shared/vehicle-sign/vehicle-sign.component';
import { ProfileComponent } from '../../shared/profile/profile.component';
import { ObjectCarClass } from '../../../classes/car.model.class';
import { VehicleService } from '../../../services/auth/vehicle.service';
import { GlobalService } from '../../../services/global/global.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { ObjectCustomerClass } from 'src/app/classes/customer.class';
import { NgForm } from '@angular/forms';
import * as $ from 'jquery';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(public modal: ModalController, private GalleryController: ActionSheetController,
              private carSign: VehicleService, private global: GlobalService, public auth: AuthService,
              private alert: AlertController, private camera: Camera, private image: ImagePicker) { }
  ArrayCars: ObjectCarClass[] | any = [];
  isLoading: boolean = true;
  NotItems: boolean = false;
  public imagePreview: string;
  public imageBase64: string;
  async ngOnInit() {
    const ArrayCars = await this.GetCarsRegistered();
    if (ArrayCars !== null) {
      this.ArrayCars = ArrayCars;
      this.isLoading = false;
      console.log(ArrayCars);
    } else {
      this.isLoading = false;
      this.NotItems = true;
      console.log('hola');
    }
  }
  async OpenVehiclePage(ObjectCar: any, role: string, displayImage: boolean = false) {
    const modal = await this.modal.create({
      component: VehicleSignComponent,
      componentProps: {
        car: ObjectCar,
        role,
        display: displayImage
      },
      backdropDismiss: false,
    });
    await modal.present();
    modal.onDidDismiss().then(
      (data) => {
        // Despues que nos devuelve el vehiculo registrado, debemos cargarlo con los demás para visualizarlo a tiempo real
        if (data.role === 'added') {
          // Significa que el role añadio un item
          this.carSign.GetCarsRegistered(`car/model/image/${data.data.car_model}`, 'Cannot load your vehicle')
            .subscribe((newCar) => {
              if (newCar.status) {
                this.ArrayCars.unshift(newCar.resp[0]);
                console.log(newCar.resp[0]);
              }
            });
        }
      }
    );
  }
  async GalleryControllerFunction() {
    const controller = await this.GalleryController.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            // Verificamos el dispositivo
            if (this.auth.GivePlatformInfo() === 'cordova') {
              // Camara del dispositivo
              const options: CameraOptions = {
                quality: 30,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE
              };
              // Obtener foto y transformarla en base 64
              this.camera.getPicture(options).then(
                async (data) => {
                  this.imagePreview = `data:image/jpeg;base64,${data}`;
                  this.imageBase64 = data;
                  // Preguntamos si desea confirmar dicha imagen
                  const alert = await this.alert.create({
                    header: 'Confirm this picture',
                    buttons: [{
                      text: 'Confirm',
                      handler: async () => {
                        this.global.OpenLoader('Updating your profile');
                        // Si confirma, pues la mandamos a firebase y devolvemos la URL
                        const Customer: ObjectCustomerClass = new ObjectCustomerClass(
                          null, null, null, null, null, null, null, null, null, null,
                          await this.carSign.UploadImageToFirebase(this.imagePreview, 'customer_profile')
                        );
                        this.auth.UpdateUser(Customer, `login/image/${this.auth._id}`)
                          .subscribe((update) => {
                            if (update.status) {
                              this.auth.SaveStorage(update.data);
                              this.auth.LoadStorage();
                              this.imagePreview = null;
                              setTimeout(() => {
                                this.global.CloseLoader();
                              }, 500);
                            }
                          }, (err) => {
                            throw err;
                          });
                      }
                    }, {
                      text: 'Cancel',
                      role: 'cancel',
                      handler: () => {
                        this.imageBase64 = null;
                        this.imagePreview = null;
                      }
                    }],
                  });
                  await alert.present();
                }, (err) => {
                  this.global.snackBar.open('Failure to open camera', null, {duration: 5000});
                  throw new Error(JSON.stringify(err));
                }
              );
            } else { // Via web
              console.log('platform not supported');
              $('input[name=webphoto]').trigger('click');
              return;
            }
          }
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            // Verificamos la plataforma
            if (this.auth.GivePlatformInfo() === 'cordova') {
              const options: ImagePickerOptions = {
                quality: 100,
                maximumImagesCount: 1,
                outputType: 1
              };
              this.image.getPictures(options).then(
                async (data) => {
                  // tslint:disable-next-line:prefer-for-of
                  for (let i = 0; i < data.length; i++) {
                    this.imagePreview = `data:image/jpeg;base64,${data[i]}`;
                    this.imageBase64 = data[i];
                   // console.log('Image URI: ' + results[i]);
                    }
                  // Preguntamos si desea confirmar dicha imagen
                  const alert = await this.alert.create({
                    header: 'Confirm this picture',
                    buttons: [{
                      text: 'Confirm',
                      handler: async () => {
                        this.global.OpenLoader('Updating your profile');
                        // Si confirma, pues la mandamos a firebase y devolvemos la URL
                        const Customer: ObjectCustomerClass = new ObjectCustomerClass(
                          null, null, null, null, null, null, null, null, null, null,
                          await this.carSign.UploadImageToFirebase(this.imagePreview, 'customer_profile')
                        );
                        this.auth.UpdateUser(Customer, `login/image/${this.auth._id}`)
                          .subscribe((update) => {
                            if (update.status) {
                              this.auth.SaveStorage(update.data);
                              this.auth.LoadStorage();
                              this.imagePreview = null;
                              setTimeout(() => {
                                this.global.CloseLoader();
                              }, 500);
                            }
                          }, (err) => {
                            throw err;
                          });
                      }
                    }, {
                      text: 'Cancel',
                      role: 'cancel',
                      handler: () => {
                        this.imageBase64 = '';
                        this.imagePreview = '';
                      }
                    }],
                  });
                  await alert.present();
                }, (err) => {
                  this.global.snackBar.open('Failure to open gallery thumbnails', null, {duration: 5000});
                  throw new Error(JSON.stringify(err));
                }
              );
            } else { // Plataforma web
              console.log('platform not supported');
              $('input[name=webphoto]').trigger('click');
              return;
            }
          }
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
  // Busca todos los carros que estan registrados
  GetCarsRegistered(): Promise<ObjectCarClass[]> {
    return new Promise((resolve, reject) => {
        this.carSign.GetCarsRegistered(`car/model/image/cars/${this.auth._id}`)
          .subscribe((data) => {
            if (data.status) {
              if (data.data.length >= 1) {
                resolve(data.data);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          });
    });
  }
  // Mandamos un alert de confirmación por si desea eliminar el carrito
  async DisplayAlertOptions(i: number, objectCar: any) {
    console.log(objectCar);
    const alert = await this.alert.create({
      header: 'Confirmation required',
      message: 'You must confirm this <strong>action to eliminate</strong> this vehicle, you can not undo later',
      buttons: [
        {
        text: 'Confirm',
        role: 'confirmation',
        handler: async () => {
          if (await this.RemoveCar(objectCar._id, objectCar.car_model._id)) {
            // Borro el carro
            this.ArrayCars.splice(i);
            this.global.snackBar.open('Your car has been removed', null, {duration: 4000});
          } else {
            this.global.snackBar.open('Cannot remove your car, please try again later.', null, {duration: 4000});
            return;
          }
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ],
    });
    await alert.present();
  }
  // Elimina un carro registrado
  // Recibe dos parametros, de dos bases de datos distintas, en una db esta la URL de firebase
  // En la otra Los datos del carro, asi que eliminamos ambas
  RemoveCar(idDBSchemaFirebase: string, IdDBModelCar: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.carSign.DeleteCar(`car/model/${idDBSchemaFirebase}/${IdDBModelCar}`)
        .subscribe((data) => {
          if (data.status) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }
  async Webphoto(pictureData: NgForm) {
    if (pictureData.invalid) {
      return;
    }
    this.global.OpenLoader('Updating your profile');
    // Si confirma, pues la mandamos a firebase y devolvemos la URL
    const Customer: ObjectCustomerClass = new ObjectCustomerClass(
      null, null, null, null, null, null, null, null, null, null,
      await this.carSign.UploadImageToFirebase(pictureData.value.photo, 'customer_profile')
    );
    this.auth.UpdateUser(Customer, `login/image/${this.auth._id}`)
      .subscribe((update) => {
        if (update.status) {
          this.auth.SaveStorage(update.data);
          this.auth.LoadStorage();
          this.imagePreview = null;
          setTimeout(() => {
            this.global.CloseLoader();
            this.global.snackBar.open('Picture addedd', null, {duration: 3000});
          }, 500);
        }
      }, (err) => {
        throw err;
      });
  }

  // Para cargar fotos via web
  WebsitePhotos(photo: File, operationType?: string): void {
    const target = photo[0];
    if (target.type === 'image/jpeg' || target.type === 'image/png'
    || target.type === 'image/jpg' || target.type === 'image/gif') {
      const size = (target.size);
      if (size < (1024 * 1024)) {
        const reader = new FileReader();
        reader.onload = (e: any): void => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(target);
      } else {
        this.global.snackBar.open('The file size is very big', null, {duration: 3000});
        return;
      }
    } else {
      this.global.snackBar.open('You are sending an invalid file, please verify the extension', null, {duration: 3000});
      return;
    }
  }
}
