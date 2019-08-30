import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-msg',
  templateUrl: './msg.component.html',
  styleUrls: ['./msg.component.scss'],
})
export class MsgComponent implements OnInit {

  constructor(public _bottomSheetRef: MatBottomSheetRef<MsgComponent>) { }

  ngOnInit() {}

  MsgForm(msg: NgForm): void {
    if (msg.invalid) {
      return;
    }
    this._bottomSheetRef.dismiss(msg.value);
  }

}
