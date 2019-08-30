import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { GlobalService } from 'src/app/services/global/global.service';
import { MatBottomSheet } from '@angular/material';
import { MsgComponent } from '../msg/msg.component';
import { SMS } from '@ionic-native/sms/ngx';

@Component({
  selector: 'app-tow-profile',
  templateUrl: './tow-profile.component.html',
  styleUrls: ['./tow-profile.component.scss'],
})
export class TowProfileComponent implements OnInit {
  currentService: any;
  constructor(public modal: ModalController, private param: NavParams,
              private auth: AuthService, private call: CallNumber,
              private global: GlobalService, private _bottomSheet: MatBottomSheet,
              private sms: SMS) {
                this.currentService = this.param.data;
              }

  ngOnInit() {}

  // Función que se encarga de llamar por telefono al conductor de la grua
  callTo() {
    if (this.auth.GivePlatformInfo() === 'cordova') {
      // puede llamar
      this.call.callNumber((this.currentService.provider.phone).toString(), true)
        .then((called) => {
          this.global.snackBar.open('Call started', null, {duration: 5000});
          console.log(called);
        }).catch(
          (err) => {
            console.error(err);
            alert(JSON.stringify(err));
            return;
          }
        );
    } else {
      console.log('Web not support');
      return;
    }
  }
  // Enviar mensaje de texto
  SendSMS() {
      const msgBox = this._bottomSheet.open(MsgComponent);
      msgBox.afterDismissed().subscribe(
        async (msg) => {
          if (msg) {
            // Retorno un mensaje
            if (this.auth.GivePlatformInfo() === 'cordova') {
              // Preguntamos si hay permiso de enviar mensajes
              if (await this.sms.hasPermission()) {
                // Tiene permiso, asi que iniciamos
                this.sms.send((this.currentService.provider.phone).toString(), msg.msg).then(
                  () => {
                    console.log('Msg send');
                  }, (err) => {
                    console.error(err);
                    return;
                  }
                );
              } else {
                // No proporciono el permiso, mandamos un error
                this.global.snackBar.open('We need permissions to send a text message.', null, {duration: 3000});
                return;
              }
            } else { // Not support
              console.log('No soporta mensajeria');
              return;
            }
          }
        }
      );
  }
}
