import { Component, Inject, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent implements OnInit {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransactionDialogComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    console.log(data)
  }

  ngOnInit(): void {}
}
