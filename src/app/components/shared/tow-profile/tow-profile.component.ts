import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-tow-profile',
  templateUrl: './tow-profile.component.html',
  styleUrls: ['./tow-profile.component.scss'],
})
export class TowProfileComponent implements OnInit {

  constructor(public modal: ModalController, private param: NavParams) { }

  ngOnInit() {}

}
