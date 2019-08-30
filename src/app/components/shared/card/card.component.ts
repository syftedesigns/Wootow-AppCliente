import { Component, OnInit, ViewChild } from '@angular/core';
import { StripeService, StripeCardComponent, ElementOptions } from 'ngx-stripe';
import { NgForm } from '@angular/forms';
import { GlobalService } from '../../../services/global/global.service';
import { ModalController, NavParams } from '@ionic/angular';
import { VehicleService } from '../../../services/auth/vehicle.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { PaymentsService } from 'src/app/services/ssl/payments.service';

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
  ObjectPayment: any = null;
  FirebaseObject: any = null;
  constructor(private stripe: StripeService, private global: GlobalService,
              public modal: ModalController, private params: NavParams,
              private car: VehicleService, private auth: AuthService,
              private route: Router, private payment: PaymentsService) {
                this.ObjectPayment = this.params.data.price;
                this.FirebaseObject = this.params.data.firebase;
                console.log(this.params.data);
              }

  async ngOnInit() {
    const Vehicle = await this.GetAllVehiclesSignUp();
    if (Vehicle !== null) {
      this.VehiclesRegistered = Vehicle;
      console.log(this.VehiclesRegistered);
    }
  }
  async CreateToken(DATA: NgForm) {
    const name = DATA.value.payer_name;
    this.stripe.createToken(this.card.getCard(), {name})
      .subscribe(async (result) => {
        if (result.token) {
          // Si procesa la tarjeta, procedemos a validar todo en la plataforma de pagos
          const customerCapture = await this.CustomerAffiliationPay();
          if (customerCapture !== null) {
            console.log(customerCapture);
            // Los clientes que han pagado, se les llama subscriptores, nosotros tenemos esa información en el pago
            this.FirebaseObject.subscription = customerCapture;
            // Una vez que tenemos la info del cliente, necesitamos capturar el pago
            this.FirebaseObject.token = result.token; // Información del pago con la tarjeta con un token unico
            this.FirebaseObject.prices = this.ObjectPayment; // Información del monto a pagar
            const StripeAmount: number = this.ReplacePoints((this.FirebaseObject.prices.Service).toString()); // Monto valido para Stripe
            this.modal.dismiss({
              extraInfo: { // Información adicional
                country: DATA.value.country,
                vehicle: this.VehiclesRegistered[DATA.value.vehicle]
              },
              firebase: this.FirebaseObject, // Mandamos nuevamente el objeto firebase actualizado
              StripeAmount
            }, 'accepted'); // Aceptado, con el objeto de pago construido
          }
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
  /*
  Afilia al cliente a la base de datos de pago, o retorna los datos si ya existe y ha pagado antes
  */
 CustomerAffiliationPay(): Promise<any> {
  return new Promise((resolve, reject) => {
    this.payment.CustomersPayments(this.auth.Customer)
      .subscribe((customer) => {
        if (customer.status) {
          resolve(customer.customer);
        } else {
          resolve(null);
        }
      });
  });
 }
 /*
 Procede a congelar el dinero de la tarjeta, para verifciar si tiene saldo
 sino, lo rechaza, si funciona el dinero quedará pending hasta que el conductor
 tome el servicip
 */
CapturePayment(FirebaseObject: any): Promise<any> {
  return new Promise((resolve, reject) => {
    this.payment.CustomerCapturePayment(FirebaseObject)
      .subscribe((charge) => {
        if (charge.status) {
          resolve(charge.charge);
        } else {
          resolve(null);
        }
      });
  });
 }
 // Stripe no soporta montos con "." o "," asi que debemos limpiar el string
private ReplacePoints(amount: string): number {
  return Number(amount.replace('.', ''));
 }
}
