import { Component, OnInit } from '@angular/core';
import { Map } from 'mapbox-gl';
import { GeolocationService } from '../services/map/geolocation.service';
import { ModalController } from '@ionic/angular';
import { ExplorerComponent } from '../components/shared/explorer/explorer.component';
import { ObjectCoords } from '../classes/coords.class';
import { GlobalService } from '../services/global/global.service';
import { MatBottomSheet } from '@angular/material';
import { TowPickerComponent } from '../components/shared/tow-picker/tow-picker.component';
import { CardComponent } from '../components/shared/card/card.component';
import { AuthService } from '../services/auth/auth.service';
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
  Layer: any = null; // Marca la ruta del mapa
  RenderMap: boolean = false;
  // Logicos
  Origin: number[]; // Origen en Coordenadas
  PlaceOriginAllData: any; // Obtenemos toda la ifnromación acerca del origen
  PlaceDestinyAllData: any; // Obtenemos toda la información acerca del Destino
  Destiny: number[]; // Destino en Coordenadas para el marcador
  Duration: number; // Duración estimado del viaje
  DurationPX: boolean = false; // Arrima la tarjeta dependiendo de la acción del mapa
  idLayer: string; // 213121231231
  // MAP FIREBASE UPDATE
  LoadedByFirebaseMap: boolean = false;
  constructor(public geolocation: GeolocationService, public modal: ModalController,
              private global: GlobalService, private bottomSheet: MatBottomSheet,
              private auth: AuthService) {
    this.global.OpenLoader('Loading modules');
    setTimeout(() => {
      // Al inicializar la home, buscamos a través del gps o navigator la ubicación exacta del dispositivo
      if (this.geolocation.currentPosition !== null) {
        this.CurrentPosition = new ObjectCoords(this.geolocation.currentPosition.latitude, this.geolocation.currentPosition.longitude);
        this.RenderMap = true;
        this.global.CloseLoader();
        this.global.snackBar.open('Wecolme to Wootow', null, {duration: 3000});
        console.log(this.CurrentPosition);
      } else {
        this.global.CloseLoader();
        this.CurrentPosition = new ObjectCoords(10.12506593304704, -67.30198255765055);
        this.RenderMap = true;
      }
    }, 3000);
  }
  async ngOnInit() {
    setTimeout(async () => {
        const Map_loaded = await this.GetServices();
        if (Map_loaded !== null) {
          // Significa que tiene un servicio activo
          this.SetterMap(Map_loaded[0]);
          this.geolocation.FirebaseMapLoader = true;
          this.LoadedByFirebaseMap = this.geolocation.FirebaseMapLoader;
          console.log(Map_loaded[0]);
        }
    }, 5000);
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
          if (this.Layer !== null && this.idLayer !== '') {
              this.Map.removeLayer(this.idLayer); // Removemos el layer anterior
              console.log(this.Map);
              console.log('Layer eliminado');
          }
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
            // Generamos un ID unico para cada layer, debido a que Mapbox no permite sobrescribir el layer anterior
            // Me costo mucho entender que Mapbox una vez que carga el mapa y renderiza, no hace updates a tiempo real como google maps
            // Por lo que añadimos cada layer, cada vez que actualizamos la ruta
            const id = this.RandomString();
            this.idLayer = id;
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
            // Lo añadimos al map ya que desde el HTML no funciona, debe ser generado de forma autoamtica
            this.Map.addLayer({
                type: 'line',
                id: this.idLayer,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#78849E',
                  'line-width': 6
                },
                source: this.Layer
              });
            // Punto de origen para el marcador
            this.Origin = ObjectGeographic.originCoords.coordinates;
            // Punto de destino en el marcador
            this.Destiny = ObjectGeographic.destinyCoords.coordinates;
            // Seteamos el booleano para que haga refresh del map
            this.IsRoutePicked = true;
            // Necesitamos reservar toda la data de oren y destino para firebase en caso de que se haga el pago
            this.PlaceOriginAllData = data.data.origin;
            this.PlaceDestinyAllData = data.data.destiny;
            // Trasladamos el mapa
            // tslint:disable-next-line:max-line-length
            this.CurrentPosition = new ObjectCoords(ObjectGeographic.originCoords.coordinates[1], ObjectGeographic.originCoords.coordinates[0]);
            // Sacamos el tiempo aproximado
            this.Duration = Math.round(this.MinutesConver(ObjectGeographic.data.routes[0].duration));

            // Creamos un objeto para luego mandarlos a firebase
            const FirebaseObject: any = {
              geographic: ObjectGeographic.data, // Waypoints, lineas, etc
              duration: this.Duration, // Duración en minutos
              places: data.data, // Origen, destino
              status: false, // Sin aceptado por el conductor por defecto
              provider: null, // Se actualiza si acepta un proveedor
              customer: this.auth.Customer, // Datos del cliente quien solicita el servicio
              pay: null,
              key: new Date().valueOf().toString() // ID unico para firebase
            };
            // console.log(FirebaseObject);
            // Abrimos la ventana del pago
            // Abrimos el calculador de pagos
            this.DisplayPaymentPopup(ObjectGeographic.data.routes[0].duration, ObjectGeographic.data.routes[0].distance, FirebaseObject);
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
  DisplayPaymentPopup(TrafficDuration: number, DistanceInMeters: number, FirebaseObject: any): void {
    const bottomSheet = this.bottomSheet.open(TowPickerComponent, {
      disableClose: true,
      data: {
        duration: TrafficDuration,
        distance: DistanceInMeters,
        firebase: FirebaseObject
      }
    });
    this.DurationPX = true;
    bottomSheet.afterDismissed().subscribe(
      (data) => {
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
  private RandomString(): string {
    return new Date().getTime().toString();
  }
  // Para obtener nuestro servicio en Firebase segun nuestra ID
  private GetServices(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.geolocation.ReturnServicesFromFirebase()
        .subscribe((data) => {
          if (data && data.length >= 1) {
            resolve(data);
          } else {
            resolve(null);
          }
        });
    });
  }
  // Setter del map en caso de tener registros por firebase
  SetterMap(ObjectMap: any): void {
     console.log(ObjectMap);
     // Punto de origen para el marcador
     // this.Origin = ObjectGeographic.originCoords.coordinates;
     this.Origin = ObjectMap.places.origin.geometry.coordinates;
     // Punto de destino en el marcador
     this.Destiny = ObjectMap.places.destiny.geometry.coordinates;
     // Estructuramos el map
     this.geolocation.Route = ObjectMap.geographic.routes[0].geometry.coordinates;
     this.Route = this.geolocation.Route;
     // Generamos el layer
     const id = this.RandomString();
     this.idLayer = id;
     this.Layer = {
       type: 'geojson',
       data: {
         type: 'Feature',
         properties: {},
         geometry: {
           type: ObjectMap.geographic.routes[0].geometry.type,
           coordinates: this.Route,
         },
       },
     };
      // Lo añadimos al map ya que desde el HTML no funciona, debe ser generado de forma autoamtica
     this.Map.addLayer({
                  type: 'line',
                  id: this.idLayer,
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  paint: {
                    'line-color': '#78849E',
                    'line-width': 6
                  },
                  source: this.Layer
                });
     // Seteamos el centro del map
     this.CurrentPosition = new ObjectCoords(
       ObjectMap.places.origin.geometry.coordinates[1],
       ObjectMap.places.origin.geometry.coordinates[0]);
    // Marcamos la duración
     this.Duration = ObjectMap.duration;
     /*
                 this.PlaceOriginAllData = data.data.origin;
            this.PlaceDestinyAllData = data.data.destiny;
            */
     this.PlaceOriginAllData = ObjectMap.places.origin;
     this.PlaceDestinyAllData = ObjectMap.places.destiny;
     this.IsRoutePicked = true;
  }
}
