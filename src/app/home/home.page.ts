import { Component, OnInit } from '@angular/core';
import { Map } from 'mapbox-gl';
import { GeolocationService } from '../services/map/geolocation.service';
import { ModalController, Platform } from '@ionic/angular';
import { ExplorerComponent } from '../components/shared/explorer/explorer.component';
import { ObjectCoords } from '../classes/coords.class';
import { GlobalService } from '../services/global/global.service';
import { MatBottomSheet } from '@angular/material';
import { TowPickerComponent } from '../components/shared/tow-picker/tow-picker.component';
import { CardComponent } from '../components/shared/card/card.component';
import { AuthService } from '../services/auth/auth.service';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { PushService } from '../services/auth/push.service';
import { environment } from 'src/environments/environment';
import { TowProfileComponent } from '../components/shared/tow-profile/tow-profile.component';
import { ObjectProviderClass } from '../classes/provider.class';
import { ReviewComponent } from '../components/shared/review/review.component';
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
  Driver: number[]; // Ubicación del conductor
  Duration: number; // Duración estimado del viaje
  DurationPX: boolean = false; // Arrima la tarjeta dependiendo de la acción del mapa
  idLayer: string; // 213121231231
  // MAP FIREBASE UPDATE
  LoadedByFirebaseMap: boolean = false;
  RandomService: any; // Información general del servicio que nos trae firebase
  loadingFirebaseService: boolean = false;
  NavigationRunning: boolean = false; // El conductor se esta desplazando
  Tracking: string; // Tracking que va estar pendiente a los cambios de Firebase
  constructor(public geolocation: GeolocationService, public modal: ModalController,
              private global: GlobalService, private bottomSheet: MatBottomSheet,
              private auth: AuthService, private launchNavigator: LaunchNavigator,
              private platform: Platform, private _push: PushService) {
    this.global.OpenLoader('Loading modules');
    setTimeout(() => {
      // Al inicializar la home, buscamos a través del gps o navigator la ubicación exacta del dispositivo
      if (this.geolocation.currentPosition !== null) {
        this.CurrentPosition = new ObjectCoords(this.geolocation.currentPosition.latitude, this.geolocation.currentPosition.longitude);
        this.RenderMap = true;
        this.global.CloseLoader();
        console.log(this.CurrentPosition);
      } else {
        this.global.CloseLoader();
        this.CurrentPosition = new ObjectCoords(10.12506593304704, -67.30198255765055);
        this.RenderMap = true;
      }
    }, 3000);
  }
  async ngOnInit() {
        // Setter para captar el PlayerId
    setTimeout(async () => {
      // Verificamos primero si esta logeado
      if (this.auth.isLogged()) {
        // Luego hacemos la verificación para captar los datos
        if (await this.SetterParamsFromThisCustomer() !== null) {
          // Ya existe, no hizo ninguna configuración
          console.log('Ya tiene los datos guardados');
        } else {
          // No tenia el PlayerId, por lo que hizo el refresh
          console.log('Player Id ya existe');
        }
      }
    }, 3500);
    // Buscamos si hay un servicio en curso, para mostrarlo en el mapa
    // Si el mapa renderiza en 3 segundos, en 3.5 segundos buscamos los servicios
    // Ya que sino el mapa no va a renderizar
    const TrackServices: any = await this.TrackingCurrentServices();
    if (TrackServices !== null) {
          // Hay servicio actual, sin completar
          this.RandomService = TrackServices;
          // Renderizamos el mapa con el servicio actual
          if (this.RenderMap) { // Verifica siel mapa ya fue renderizado
              if (this.Map && (this.Map.loaded())) { // Verifica si el mapa además de ser renderizado, ya fue cargado
                if (await this.SetterMap(this.RandomService)) {
                  this.PlaceDestinyAllData = this.RandomService.places.destiny;
                  this.PlaceOriginAllData = this.RandomService.places.origin;
                  this.IsRoutePicked = true;
                  console.log(this.RandomService);
                  // Dibujo la ruta, ahora lo actualizamos en fb
                  // Condicional si hizo el update en firebase
                }
              } else {
              // Conexión mas rapida
              // Esto se ejecuta cuando firebase carga primero que el mapa, debemos evaluar cada tiempo hasta que se renderize el mapa
               const TryRenderService = setInterval(async () => {
                if (this.RenderMap) {
                  if (await this.SetterMap(this.RandomService)) {
                    this.PlaceDestinyAllData = this.RandomService.places.destiny;
                    this.PlaceOriginAllData = this.RandomService.places.origin;
                    this.IsRoutePicked = true;
                    console.log(this.RandomService);
                    clearInterval(TryRenderService);
                    // Dibujo la ruta, ahora lo actualizamos en fb
                    // Condicional si hizo el update en firebase
                  }
                } else {
                  console.log('No ha renderizado');
                }
              }, 3000);
              }
            } else {
              // Conexión mas rapida
              // Esto se ejecuta cuando firebase carga primero que el mapa, debemos evaluar cada tiempo hasta que se renderize el mapa
               const TryRenderService = setInterval(async () => {
                if (this.RenderMap) {
                  if (await this.SetterMap(this.RandomService)) {
                    this.PlaceDestinyAllData = this.RandomService.places.destiny;
                    this.PlaceOriginAllData = this.RandomService.places.origin;
                    this.IsRoutePicked = true;
                    console.log(this.RandomService);
                    clearInterval(TryRenderService);
                    // Dibujo la ruta, ahora lo actualizamos en fb
                    // Condicional si hizo el update en firebase
                  }
                } else {
                  console.log('No ha renderizado');
                }
              }, 3000);
            }
        }
    setTimeout(() => {
      this.RoutingTracker();
    }, 10000);
  }
  /*
  Este ciclo de vida lo que hace es evaluar de forma de infinita
  los cambios en el componente, lo usaremos para detectar
  cuando la aplicación queda en segundo plano e inicia el navigation app
  Su función es actualizar las coordenadas en firebase, para que el cliente
  pueda monitorear la ubicación del conductor
  */
  async RoutingTracker() {
    if (this.auth.GivePlatformInfo() === 'cordova') {
      // Si es cordova, entonces ejecutamos la operación que se encarga de verificar
      // si la app esta en segundo plano o no
        // Verificamos si el conductor esta conduciendo
          // Quedo en segundo plano
          // Evaluamos si hay cambios en la posición del dispositivo
          // En caso de que haya cambios refrsecamos la db
          if (this.Tracking === 'engaged') {
            this.geolocation.geolocation.watchPosition()
              .subscribe(async (newPosition) => {
                  this.geolocation.currentPosition = new ObjectCoords(
                    newPosition.coords.latitude, newPosition.coords.longitude
                  );
                  this.CurrentPosition = this.geolocation.currentPosition;
                  // Ahora actualizamos la DB, para que el cliente vea nuestra ubicación
                  const positionFirebase: any = {
                    currentLat: newPosition.coords.latitude,
                    currentLng: newPosition.coords.longitude
                  };
                  if (await this.geolocation.UpdateFirebaseService(
                      positionFirebase,
                     `services/${this.RandomService.key}/customer`)) {
                       // Actualizo la db
                       this.IsRoutePicked = false;
                       this.Origin = [positionFirebase.currentLng, positionFirebase.currentLat];
                       this.IsRoutePicked = true;
                       // this.global.snackBar.open(JSON.stringify(positionFirebase), null, {duration: 5000});
                     } else {
                       return;
                     }
              });
          }
    }
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
              key: new Date().valueOf().toString(), // ID unico para firebase
              tracking: 'pending'
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
  SetterMap(ObjectMap: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Punto de origen para el marcador
      // this.Origin = ObjectGeographic.originCoords.coordinates;
      this.Origin = ObjectMap.places.origin.geometry.coordinates;
      // Punto de destino en el marcador
      this.Destiny = ObjectMap.places.destiny.geometry.coordinates;
      // Ubicación del conductor
      if (this.Tracking !== 'pending' && (this.Tracking !== 'complete')) {
        this.Driver = [ObjectMap.provider.currentLng, ObjectMap.provider.currentLat];
      }
      console.log(this.Driver);
      console.log(this.Destiny);
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
      resolve(true);
    });
  }
    // Esto se encarga de verificar si en la DB, ya esta las coordeandas o el Payer ID del conductor
  // Sino, Carga y actualiza
  SetterParamsFromThisCustomer(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      console.log(this.CurrentPosition);
      // Condicional para verificar si el usuario ya el sistema coloco estos datos antes
      if (this.auth.Customer.AppPlayerId ) {
           // Verifica si en el almacenamiento se encuentra estos datos
           resolve(null);
           return;
         } else {
           // Entonces, debemos proporcionar los datos para actualizarlo en el almacenamiento
           const playerId: string = await this.GetExtraInfoFromProvider();
           // Si devuelve null, significa que es un browser
           if (playerId !== null) {
             // Entonces es un dispositivo y proporciono un ID
             // Lo actualizamos en el sistema y refrescamos el Storage
             const ObjectCustomer = this.auth.Customer;
             ObjectCustomer.currentLat = this.CurrentPosition.latitude;
             ObjectCustomer.currentLng = this.CurrentPosition.longitude;
             ObjectCustomer.AppPlayerId = playerId;
             this.auth.UpdateUser(ObjectCustomer, `login/customer/${this.auth._id}`)
              .subscribe((data) => {
                // Si actualiza, entonces debemos refrescar el Storage
                if (data.status) {
                  this.auth.Customer = data.updated;
                  this.auth.SaveStorage(this.auth.Customer);
                  resolve(true);
                }
              });
           } else {
              // Es nulo, por lo que no puede enviar notificaciones push
              // Hacemos lo mismo pero con datos de preuba
              const ObjectCustomer = this.auth.Customer;
              ObjectCustomer.currentLat = this.CurrentPosition.latitude;
              ObjectCustomer.currentLng = this.CurrentPosition.longitude;
              ObjectCustomer.AppPlayerId = environment.oneSignal.testingUser;
              this.auth.UpdateUser(ObjectCustomer, `login/customer/${this.auth._id}`)
               .subscribe((data) => {
                 // Si actualiza, entonces debemos refrescar el Storage
                 if (data.status) {
                   this.auth.Customer = data.updated;
                   this.auth.SaveStorage(this.auth.Customer);
                   resolve(true);
                 }
               });
           }
         }
    });
  }
  // Función que nos devuelve el Player ID
  GetExtraInfoFromProvider(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (this.auth.GivePlatformInfo() === 'cordova') {
        const PushData: any = await this._push.GetPlayerId();
        if (PushData.status) {
          resolve(PushData.playerId);
        }
      } else {
        console.log('Web no soporta push');
        resolve(null);
      }
    });
  }
  TrackingCurrentServices(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadingFirebaseService = true;
      this.geolocation.ReturnServicesFromFirebase()
        .subscribe((trackingMap: any[]) => {
          if (trackingMap) {
            // Nos devuelve todos los servicios, debemos filtrarlos para obtener el tracking
            if (trackingMap.length >= 1) {
              // Hacemos un bucle en caso de que haya mas servicios
              // En el bucle debemos buscar los que sean != complete
              for (const services of trackingMap) {
                if (services.tracking !== 'complete') {
                  this.loadingFirebaseService = false;
                  this.Tracking = services.tracking; // Actualiza siempre el tracking para el HTML
                  console.log(this.Tracking);
                  resolve(services);
                } else {
                  // Si todos son complete, no hay servicio actual
                  this.loadingFirebaseService = false;
                  // resolve(null);
                }
              }
            } else {
              this.loadingFirebaseService = false;
              return;
            }
          }
        });
    });
  }
  // Popup del conductor
  async DisplayProviderPopup() {
    const modal = await this.modal.create({
      component: TowProfileComponent,
      componentProps: this.RandomService,
      backdropDismiss: false
    });
    await modal.present();
  }
  // Popup para finalizar el servicio
  async DisplayReviewPopup() {
    const modal = await this.modal.create({
      component: ReviewComponent,
      componentProps: this.RandomService,
      backdropDismiss: false
    });
    await modal.present();
  }
  // Función que dispara el navigator, para que el conductor pueda moverse en un map
  // Operador significa que tipo de acción realizar, si de origenCliente a origenConductor, Origenconductor DestinoConductor
  async StartNavigation() {
    // Verificamos que sea cordova
    if (this.platform.is('cordova')) {
      // Seteamos la configuración del navigator
      const options: LaunchNavigatorOptions = {
        startName: 'My Place',
        start: `${this.PlaceOriginAllData.text}`, // Mi ubicación
        app: await this.AppTriggerMap(), // La aplicación que desplegara el mapa de conducción
        successCallback: () => { // Se dispara cuando se ejecuta la app
          this.NavigationRunning = true; // Inicia la navegación
        },
        errorCallback: (err) => { // Se dispara cuando hay un error
          this.NavigationRunning = false;
          console.error(err);
          alert('Failure to trigger navigation app');
        }
      };
      // Lanzamos por defecto Google maps, sino cualquier app que tenga el cliente
      setTimeout(() => {
        // Iniciamos al navegación
        this.launchNavigator.navigate(this.RandomService.places.destiny.text, options).then(
          (navigator) => {
            console.log('Lanzo la navegación');
            console.log(navigator);
          },
          (err) => {
            this.global.snackBar.open(JSON.stringify(err), null, {duration: 3000});
            console.error(err);
            throw new Error('No pudo lanzar la app');
          }
        );
      }, 1000);
    } else {
      // Testing
      console.log('web no soporta push');
    }
  }
  // Para identificar que tipo de navigator app lanzara el usuario
    AppTriggerMap(): Promise<string> {
      return new Promise((resolve, reject) => {
        this.launchNavigator.isAppAvailable(this.launchNavigator.APP.GOOGLE_MAPS)
          .then((isAvailable) => {
            if (isAvailable) {
              resolve(this.launchNavigator.APP.GOOGLE_MAPS);
            } else {
              resolve(this.launchNavigator.APP.USER_SELECT);
            }
          }, (err) => {
            this.global.snackBar.open(JSON.stringify(err), null, {duration: 3000});
            console.error(err);
            // throw new Error(err);
          });
      });
    }
}
