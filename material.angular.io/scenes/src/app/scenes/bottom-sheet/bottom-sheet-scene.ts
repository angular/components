import {AfterViewInit, Component, ViewEncapsulation} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';


@Component({
  selector: 'app-bottom-sheet-scene',
  template: '',
  styleUrls: ['./bottom-sheet-scene.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class BottomSheetScene implements AfterViewInit {
  constructor(private _bottomSheet: MatBottomSheet) {}

  ngAfterViewInit(): void {
    this._bottomSheet.open(SampleBottomSheet);
  }
}

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-bottom-sheet-scene',
  templateUrl: './bottom-sheet-scene.html',
  styleUrls: ['./bottom-sheet-scene.scss'],
  standalone: true,
  imports: [MatListModule, MatIconModule]
})
export class SampleBottomSheet {}
