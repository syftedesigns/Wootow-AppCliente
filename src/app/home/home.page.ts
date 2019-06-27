import { Component, OnInit } from '@angular/core';
import { Map } from 'mapbox-gl';
import { GeolocationService } from '../services/map/geolocation.service';
import { ModalController } from '@ionic/angular';
import { ExplorerComponent } from '../components/shared/explorer/explorer.component';
import { ObjectCoords } from '../classes/coords.class';
import { GlobalService } from '../services/global/global.service';
import { MatBottomSheet } from '@angular/material';
import { TowPickerComponent } from '../components/shared/tow-picker/tow-picker.component';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  // Mapa
  Map: Map;
  CurrentPosition: ObjectCoords; // Detecta mi ubicación
  IsRoutePicked: boolean = false; // Booleano que permite determinar cuando se ha iniciado una operación
  Route: any = null; // Obtiene la información de la ruta trazada
  Layer: any; // Marca la ruta del mapa

  // Logicos
  Origin: number[]; // Origen en Coordenadas
  PlaceOriginAllData: any; // Obtenemos toda la ifnromación acerca del origen
  PlaceDestinyAllData: any; // Obtenemos toda la información acerca del Destino
  Destiny: number[]; // Destino en Coordenadas para el marcador
  Duration: number; // Duración estimado del viaje
  DurationPX: boolean = false; // Arrima la tarjeta dependiendo de la acción del mapa

  constructor(public geolocation: GeolocationService, public modal: ModalController,
              private global: GlobalService, private bottomSheet: MatBottomSheet) {
    setTimeout(() => {
      // Al inicializar la home, buscamos a través del gps o navigator la ubicación exacta del dispositivo
      if (this.geolocation.currentPosition !== null) {
        this.CurrentPosition = new ObjectCoords(this.geolocation.currentPosition.latitude, this.geolocation.currentPosition.longitude);
        console.log(this.CurrentPosition);
      }
    }, 500);
  }
  async ngOnInit() {
  }
// Se encarga de desplegar el buscador
  async DisplaySearchPopup() {
    const modal = await this.modal.create({
      component: ExplorerComponent,
      componentProps: {
        origin: this.geolocation.currentPosition || 0
      },
      backdropDismiss: false
    });
    await modal.present();
    // Verificamos que punto a punto eligio el usuario
    modal.onDidDismiss().then(
      async (data) => {
        // Si el usuario hizo una busqueda, retornamos con un rol y diferente de nulo
        // De esa forma sabrémos si ejecuto una operación
        if (data.role === 'geoJSON' && data.role !== null) {
          // Ejecutamos una petición a directión API de Mapbox
          // En base a los parametros que recibimos del buscador
          const ObjectGeographic = await this.GetLineMarkers(data.data);
          console.log(data.data);
          // Si es diferente de nulo significa que encontro resultados en la promesa
          if (ObjectGeographic !== null) {
            // Guardamos la petición en un servicio para que la data sea persistente
            this.geolocation.Route = ObjectGeographic.data;
            // Luego lo seteamos en el componente para refrescar el map
            this.Route = this.geolocation.Route;
            // Construimos el layer en base a las coordenadas que nos dio direction API
            this.Layer = {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: this.Route.routes[0].geometry.type,
                  coordinates: this.Route.routes[0].geometry.coordinates,
                },
              },
            };
            // Punto de origen para el marcador
            this.Origin = ObjectGeographic.originCoords.coordinates;
            // Punto de destino en el marcador
            this.Destiny = ObjectGeographic.destinyCoords.coordinates;
            // Seteamos el booleano para que haga refresh del map
            this.IsRoutePicked = true;
            // Necesitamos reservar toda la data de oren y destino para firebase en caso de que se haga el pago
            this.PlaceOriginAllData = data.data.origin;
            this.PlaceDestinyAllData = data.data.destiny;
            // Sacamos el tiempo aproximado
            console.log(ObjectGeographic);
            this.Duration = Math.round(this.MinutesConver(ObjectGeographic.data.routes[0].duration));
            console.log(this.Duration);
            // Abrimos la ventana del pago
            // Abrimos el calculador de pagos
            this.DisplayPaymentPopup(ObjectGeographic.data.routes[0].duration, ObjectGeographic.data.routes[0].distance);
          } else {
            this.global.OpenToastWithMsg('This route does not seem to be correct, try another', 3000);
            return;
          }
          this.GetLineMarkers(data.data);
        }
      }, (err) => {
        throw new Error(err);
      }
    );
  }
  SearchMylocatioN() {
    console.log('Searching my position');
    this.CurrentPosition = this.geolocation.currentPosition;
  }
  // Para obtener la ruta marcada
  GetLineMarkers(dataGEOJSON: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.geolocation.GetGEOJSONLineString(
        new ObjectCoords(dataGEOJSON.origin.geometry.coordinates[1], dataGEOJSON.origin.geometry.coordinates[0]),
        new ObjectCoords(dataGEOJSON.destiny.geometry.coordinates[1], dataGEOJSON.destiny.geometry.coordinates[0])
      ).subscribe((ObjectGEOGRAPHIC) => {
        if (ObjectGEOGRAPHIC.code === 'Ok') {
          // Tenemos para marcar la ruta
          resolve({
            data: ObjectGEOGRAPHIC,
            originCoords: dataGEOJSON.origin.geometry,
            destinyCoords: dataGEOJSON.destiny.geometry
          });
        } else {
          // Tenemos un error
          resolve(null);
        }
      });
    });
  }
  // Abrimos la ventana de pagos
  DisplayPaymentPopup(TrafficDuration: number, DistanceInMeters: number): void {
    const bottomSheet = this.bottomSheet.open(TowPickerComponent, {
      disableClose: true,
      data: {
        duration: TrafficDuration,
        distance: DistanceInMeters
      }
    });
    this.DurationPX = true;
    bottomSheet.afterDismissed().subscribe(
      () => {
        this.DurationPX = false;
      }
    );
  }
  UpdateRouting() {
    alert('quiere actualizar');
  }
  private MinutesConver(Secs: number): number {
    return (Secs * 0.0166667);
  }
}

