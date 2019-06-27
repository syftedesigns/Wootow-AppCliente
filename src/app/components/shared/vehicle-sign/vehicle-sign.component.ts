import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-vehicle-sign',
  templateUrl: './vehicle-sign.component.html',
  styleUrls: ['./vehicle-sign.component.scss'],
})
export class VehicleSignComponent implements OnInit {
  withprofile: boolean = false;
  constructor(public modal: ModalController, private navparm: NavParams) {
    console.log(this.navparm);
    this.withprofile = this.navparm.data.booleanTest;
  }

  ngOnInit() {}

}
