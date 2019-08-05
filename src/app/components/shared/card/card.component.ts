import { Component, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardComponent, ElementOptions } from 'ngx-stripe';
import { NgForm } from '@angular/forms';
import { GlobalService } from '../../../services/global/global.service';
import { ModalController, NavParams } from '@ionic/angular';
import { VehicleService } from '../../../services/auth/vehicle.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @ViewChild(StripeCardComponent, null) card: StripeCardComponent;
  cardOptions: ElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#636363',
        lineHeight: '40px',
        fontWeight: 500,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };
  VehiclesRegistered: any[] = [];
  constructor(private stripe: StripeService, private global: GlobalService,
              public modal: ModalController, private params: NavParams,
              private car: VehicleService, private auth: AuthService,
              private route: Router) { }

  async ngOnInit() {
    const Vehicle = await this.GetAllVehiclesSignUp();
    if (Vehicle !== null) {
      this.VehiclesRegistered = Vehicle;
      console.log(this.VehiclesRegistered);
    }
  }
  CreateToken(DATA: NgForm): void {
    const name = DATA.value.payer_name;
    this.stripe.createToken(this.card.getCard(), {name})
      .subscribe((result) => {
        if (result.token) {
          // this.global.snackBar.open('Demo Finished, We must wait for app driver to continue', null, {duration: 5000});
          this.modal.dismiss({
            token: result.token,
            data: this.params.data,
            extraInfo: {
              country: DATA.value.country,
              vehicle: this.VehiclesRegistered[DATA.value.vehicle]
            }
          }, 'paid');
        } else {
          this.global.snackBar.open('Failure to charge your card, please try again later', null, {duration: 3000});
          this.modal.dismiss(null, 'cancel');
        }
        console.log(result);
      }, (err) => {
        this.global.snackBar.open('We cannot charge your card, please try again later', null, {duration: 3000});
        console.error(err);
        return;
      });
  }
  // Función que me devuelve todos los carros registrados, para yo en el servicio decirle al conductor
  // Cual es el carro que tiene que recoger
  GetAllVehiclesSignUp(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.car.GetCarsRegistered(`car/model/image/cars/${this.auth._id}`, 'Cannot connect with your vehicles')
        .subscribe((data) => {
          if (data.status) {
            resolve(data.data);
          } else {
            resolve(null);
          }
        });
    });
  }
  NavigateToProfile() {
    this.route.navigate(['/profile']);
    this.modal.dismiss(null);
  }
}
