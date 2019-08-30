import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  CurrentService: any = '';
  constructor(public modal: ModalController, private params: NavParams) {
    this.CurrentService = this.params.data.track;
    console.log(this.CurrentService);
  }

  ngOnInit() {}

}
