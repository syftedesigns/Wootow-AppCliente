import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService } from '../../../services/map/geolocation.service';
import { AuthService } from '../../../services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular';
import { OrdersComponent } from '../../shared/orders/orders.component';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit, OnDestroy {
  ServicesCompleted: any[] = []; // Arreglo que se mostrará en el HTML
  HaveServicesInList: boolean = false; // Para determinar si tiene o no servicios
  constructor(public geolocation: GeolocationService, private auth: AuthService,
              public modal: ModalController) { }

  async ngOnInit() {
    const ServicesDone: any[] = await this.GetServices();
    if (ServicesDone !== null) {
      this.ServicesCompleted = ServicesDone;
      this.HaveServicesInList = true;
      console.log(this.ServicesCompleted);
    }
  }
  // Cuando sale del componente, reiniciamos los servicios
  ngOnDestroy() {
  }
 /*
 Esta función se encarga de traer todos los servicios completados por el conductor de la grua, para hacer un historial
 */
  GetServices(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const ArrayServicesDone: any[] = new Array(); // Donde iremos colocando los servicios que ya han sido completados
      this.geolocation.GetMyCurrentService(this.auth._id)
        .subscribe((services) => {
          if (services.length >= 1) {
            // Entonces ya tiene servicios, verificamos cuales estan completados
            // Creamos un bucle donde por cada interacción buscará servicios completados
            for (const iterator of services) {
              if (iterator.tracking === 'complete') {
                // Creamos un mapa estático para mostrar de referencia
                let srcMap = `https://api.mapbox.com/styles/v1/mapbox/light-v9/static/pin-m-marker+ffff00`;
                srcMap += `(${iterator.places.origin.center[0]},${iterator.places.origin.center[1]})`;
                srcMap += `,pin-m-marker+285A98(${iterator.places.destiny.center[0]},${iterator.places.destiny.center[1]})`;
                srcMap += `/${iterator.places.origin.center[0]},${iterator.places.origin.center[1]},13,46,44/600x300@2x`;
                srcMap += `?access_token=${environment.mapbox.token}`;
                iterator.srcMap = srcMap;
                ArrayServicesDone.unshift(iterator);
              }
            }
            resolve(ArrayServicesDone);
          } else {
            // Es nuevo aun no tiene servicios completados
            resolve(null);
          }
        });
    });
  }
  // Función que dispara un modal con todos los detalles del servicio
  async ModalTrackService(TrackService: any) {
    const page = await this.modal.create({
      component: OrdersComponent,
      componentProps: {
        track: TrackService
      }
    });
    await page.present();
  }
}
