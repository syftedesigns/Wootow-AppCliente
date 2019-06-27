import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { ObjectCoords } from '../../../classes/coords.class';
import { GeolocationService } from '../../../services/map/geolocation.service';
import { GlobalService } from '../../../services/global/global.service';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
})
export class ExplorerComponent implements OnInit {
  Origin: ObjectCoords = null; // Esto para identificar el punto de origen del usuario, solo buscariamos el destino
  Locations: any[] = [];
  LocationOrigin: any[] = [];
  TextOrigin: string = '';
  isSearchingDestiny: boolean = false;
  isSearchingOrigin: boolean = false;
  OriginPicked: any = null;
  DestinyPicked: any = null;
  constructor(private param: NavParams, public modal: ModalController,
              private geolocation: GeolocationService, private global: GlobalService) {
    if (this.param.data.origin !== 0) {
      this.Origin = this.param.data.origin;
    } else {
      this.Origin = null;
    }
  }
  async ngOnInit() {
    if (this.Origin !== null) {
      // Significa que tiene el GPS activado, y tendremos nociones de su ubicación
      const PossibleOrigin = await this.GetMyPositionReverse();
      if (PossibleOrigin.length >= 1 ) {
        console.log(PossibleOrigin);
        this.LocationOrigin = PossibleOrigin;
        this.TextOrigin = this.LocationOrigin[0].text;
        this.OriginPicked = this.LocationOrigin[0];
        this.isSearchingOrigin = true;
      }
    }
  }
  ExplorePointers(keyword: any, operationType?: string) {
    // Verificamos el tipo de busqueda
    console.log(keyword.detail);
    switch (operationType) {
      case 'destiny':
        // Verificamos si tipeo algo
        if (keyword.detail.value !== null) {
          this.geolocation.ExploreLocationsByKeywords(keyword.detail.value)
            .subscribe((locations) => {
              if (locations) {
                // this.isSearchingDestiny = true;
                this.Locations = locations.features;
                console.log(this.Locations);
              }
            }, (err) => {
              this.global.OpenToastWithMsg('Failure to process your operation, please try later', 3000);
              console.error(err);
              return;
            });
        } else {
          this.isSearchingDestiny = false;
          this.Locations = [];
        }
        break;
        case 'origin':
        // Verificamos si tipeo algo
        if (keyword.detail.value !== null) {
          this.geolocation.ExploreLocationsByKeywords(keyword.detail.value)
            .subscribe((locations) => {
              if (locations) {
                // this.isSearchingOrigin = true;
                this.LocationOrigin = locations.features;
                console.log(this.LocationOrigin);
              }
            }, (err) => {
              this.global.OpenToastWithMsg('Failure to process your operation, please try later', 3000);
              console.error(err);
              return;
            });
        } else {
          this.isSearchingOrigin = false;
          this.LocationOrigin = [];
        }
    }
  }
  GetMyPositionReverse(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.geolocation.GetReverseGeocoding(this.Origin.longitude, this.Origin.latitude)
        .subscribe((reverseGeocoding) => {
          if (reverseGeocoding.features) {
            resolve(reverseGeocoding.features);
          }
        }, (err) => {
          this.global.OpenToastWithMsg('Failure to process your operation, please try later', 3000);
          console.error(err);
          return;
        });
    });
  }
  // Para capturar los datos que vamos pickeando
  CatchOrigin(Origin: any) {
    console.log(Origin);
    this.global.OpenToastWithMsg(`You have picked <strong>${Origin.place_name}</strong> as your <strong>origin point</strong>`, 3000);
    this.OriginPicked = Origin;
    // Verificamos si la contraparte ya esta pickeada
    if (this.DestinyPicked !== null ) {
      this.modal.dismiss({
        origin: this.OriginPicked,
        destiny: this.DestinyPicked
      }, 'geoJSON');
    }
  }
  CatchDestiny(Destiny: any) {
    console.log(Destiny);
    this.global.OpenToastWithMsg(`You have picked <strong>${Destiny.place_name}</strong> as your <strong>destiny point</strong>`, 3000);
    this.DestinyPicked = Destiny;
    // Verificamos si la contraparte ya esta pickeada
    if (this.OriginPicked !== null ) {
      this.modal.dismiss({
        origin: this.OriginPicked,
        destiny: this.DestinyPicked
      }, 'geoJSON');
    }
  }
}

