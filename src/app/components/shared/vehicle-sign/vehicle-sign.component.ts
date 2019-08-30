import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ActionSheetController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { GlobalService } from '../../../services/global/global.service';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { AuthService } from '../../../services/auth/auth.service';
import * as $ from 'jquery';
import { NgForm } from '@angular/forms';
import { ObjectCustomerCarClass, ObjectCarClass } from '../../../classes/car.model.class';
import { VehicleService } from '../../../services/auth/vehicle.service';
@Component({
  selector: 'app-vehicle-sign',
  templateUrl: './vehicle-sign.component.html',
  styleUrls: ['./vehicle-sign.component.scss'],
})
export class VehicleSignComponent implements OnInit {
  withprofile: boolean = false;
  imagePreview: string;
  imageBase64: string;
  PlatformType: string;
  Role: string = 'create';
  ObjectCar: ObjectCarClass = new ObjectCarClass('', new ObjectCustomerCarClass('', '', '', '', '', ''));
  constructor(public modal: ModalController, private navparm: NavParams,
              private media: ActionSheetController, private camera: Camera,
              private global: GlobalService, private imagePicker: ImagePicker,
              public auth: AuthService, private carSign: VehicleService) {
    console.log(this.navparm);
    this.Role = this.navparm.data.role;
    if (this.navparm.data.car !== null) {
      // this.ObjectCar = this.navparm.data.car;
      this.ObjectCar = new ObjectCarClass(this.navparm.data.car.car_image, this.navparm.data.car.car_model);
      this.ObjectCar._id = this.navparm.data.car._id;
      console.log(this.ObjectCar);
    }
    this.withprofile = this.navparm.data.display;
  }

  ngOnInit() {
    // Verificamos el tipo de plataforma
    this.PlatformType = this.auth.GivePlatformInfo();
  }
  // Para seleccionar el tipo de galería
  async MediaPicker() {
    const mediaPicker = await this.media.create({
      header: 'Select an option',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            // Camara del dispositivo
            const options: CameraOptions = {
              quality: 30,
              destinationType: this.camera.DestinationType.DATA_URL,
              encodingType: this.camera.EncodingType.JPEG,
              mediaType: this.camera.MediaType.PICTURE
            };
            // Obtener foto y transformarla en base 64
            this.camera.getPicture(options).then(
              (data) => {
                this.imagePreview = `data:image/jpeg;base64,${data}`;
                this.imageBase64 = data;
              }, (err) => {
                this.global.snackBar.open('Failure to open camera', null, {duration: 5000});
                throw new Error(JSON.stringify(err));
              }
            );
          }
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            const options: ImagePickerOptions = {
              quality: 100,
              maximumImagesCount: 1,
              outputType: 1
            };
            this.imagePicker.getPictures(options).then(
              (data) => {
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < data.length; i++) {
                  this.imagePreview = `data:image/jpeg;base64,${data[i]}`;
                  this.imageBase64 = data[i];
                 // console.log('Image URI: ' + results[i]);
                  }
              }, (err) => {
                this.global.snackBar.open('Failure to open gallery thumbnails', null, {duration: 5000});
                throw new Error(JSON.stringify(err));
              }
            );
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ],
    });
    await mediaPicker.present();
  }
  // Disparar web input
  TriggerInputFile(id: string): void {
    $(`#${id}`).trigger('click');
    return;
  }
  // Para cargar archivos desde el navegador, respetando el base 64 como en cordova
  DisplayWebPhoto(FileInput: any): void {
    console.log(FileInput);
    // Verificamos el tipo de archivo que intenta subir el usuario en la web
    if (FileInput) {
      this.global.OpenLoader('Uploading file');
      if (FileInput.type === 'image/jpeg' || FileInput.type === 'image/png'
      || FileInput.type === 'image/jpg' || FileInput.type === 'image/gif') {
        const reader = new FileReader(); // para hacer la lectura del archivo
        reader.onload = (e: any): void => {
          this.imagePreview = e.target.result; // Mostramos la previsualización
          this.imageBase64 = e.target.result;
          setTimeout(() => {
            this.global.CloseLoader();
          }, 700);
        };
        reader.readAsDataURL(FileInput);
     } else {
       this.global.snackBar.open('Image invalid, format accepted: JPG, PNG, JPEG, GIF', null, {duration: 5000});
       return;
     }
   } else {
     return;
   }
 }
 /*
 Lo primero que debemos hacer es, registrar el vehiculo, eso nos retorna una ID
 que sería el ID del car model en nodejs, ese car Model, lo seteamos en una nueva consulta
 para registrar el id, junto con la imagen en caso de ser cargada
 una vez que haya sido cargado dicha imagen, la mandamos a firebase y lo almacenamos alli
 */
RegisterNewCar(carValue: NgForm): void {
  if (carValue.invalid) {
    throw new Error('Form invalid');
  }

  this.global.OpenLoader('Registering your car');
  const car: ObjectCustomerCarClass = new ObjectCustomerCarClass(carValue.value.car_name,
    carValue.value.car_colour, carValue.value.car_plate, carValue.value.client);
    // Identificamos Si va a crear o actualizar un carrito
  if (this.Role === 'create') {
    this.carSign.DBCarModels(car, 'car/model', 'We could not register your vehicle')
      .subscribe( async (data: any) => {
        if (data.status) {
          /* Siguiente paso necesitamos verificar si el usuario cargo una imagen del vehiculo
             en este caso lo cargamos a firebase y nos retorna una URL en caso de exito
             Si retorna la URL, debemos insertar el vehiculo junto al model y la imagen
          */
         if ((this.imagePreview !== '') && (this.imageBase64 !== '') && (this.imagePreview) && (this.imageBase64)) {
           const UrlUploadedImage = await this.carSign.UploadImageToFirebase(this.imageBase64, 'customer_cars');
           // Si cargo con éxito a firebase, retorna una URL, verificamos si es cierto
           if (UrlUploadedImage !== null) {
             // Entonces registramos al foto del vehiculo
             const ModelWithImage: ObjectCarClass = new ObjectCarClass(UrlUploadedImage, data.Models._id);
             // Insertamos en la db del modelo e imagen
             this.carSign.DBCarModels(ModelWithImage, 'car/model/image/', 'We could not register your vehicle')
              .subscribe((dataWithImage) => {
                if (dataWithImage.status) {
                  this.global.CloseLoader();
                  this.global.snackBar.open('Your car data has been added successfully', null, {duration: 6000});
                  this.modal.dismiss(dataWithImage.model, 'added');
                }
              });
             console.log(data);
             console.log(UrlUploadedImage);
           } else {
             this.global.snackBar.open('Failure to upload your image', null, {duration: 5000});
             this.global.CloseLoader();
             return;
           }
         } else {
           // Significa que el usuario registro el vehiculo sin la imagen, y es perfectamente posible
           this.global.CloseLoader();
           this.global.snackBar.open('Your car data has been added successfully', null, {duration: 6000});
           this.modal.dismiss(data.Models, 'added');
         }
        }
      });
  } else {
    // Va a actualizar el carro
    console.log('Carro para actualizar');
    this.carSign.UpdateCar(car, `car/model/${this.ObjectCar.car_model_id._id}`, 'We could not update your vehicle')
    .subscribe( async (data: any) => {
      if (data.status) {
        /* Siguiente paso necesitamos verificar si el usuario cargo una imagen del vehiculo
           en este caso lo cargamos a firebase y nos retorna una URL en caso de exito
           Si retorna la URL, debemos insertar el vehiculo junto al model y la imagen
        */
       if ((this.imagePreview !== '') && (this.imageBase64 !== '') && (this.imagePreview) && (this.imageBase64)) {
         const UrlUploadedImage = await this.carSign.UploadImageToFirebase(this.imageBase64, 'customer_cars');
         // Si cargo con éxito a firebase, retorna una URL, verificamos si es cierto
         if (UrlUploadedImage !== null) {
           // Entonces registramos al foto del vehiculo
           const ModelWithImage: ObjectCarClass = new ObjectCarClass(UrlUploadedImage, null);
           // Insertamos en la db del modelo e imagen
           this.carSign.UpdateCar(ModelWithImage, `car/model/image/${this.ObjectCar._id}`, 'We could not update your vehicle')
            .subscribe((dataWithImage) => {
              if (dataWithImage.status) {
                setTimeout(() => {
                  this.global.CloseLoader();
                }, 600);
                this.global.snackBar.open('Your car data has been updated successfully', null, {duration: 6000});
                this.modal.dismiss(dataWithImage.model, 'added');
              }
            });
           console.log(data);
           console.log(UrlUploadedImage);
         } else {
           this.global.snackBar.open('Failure to upload your image', null, {duration: 5000});
           this.global.CloseLoader();
           return;
         }
       } else {
         // Significa que el usuario registro el vehiculo sin la imagen, y es perfectamente posible
         this.global.snackBar.open('Your car data has been updated successfully', null, {duration: 6000});
         this.modal.dismiss(data.Models, 'updated');
         setTimeout(() => {
           this.global.CloseLoader();
         }, 500);
       }
      }
    });
  }
}
}
