import {AfterViewInit, Component, ViewEncapsulation, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatRipple, MatRippleModule} from '@angular/material/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-ripple-scene',
  templateUrl: './ripples-scene.html',
  styleUrls: ['./ripples-scene.scss'],
  standalone: true,
  imports: [MatRippleModule, MatButtonModule],
})
export class RipplesScene implements AfterViewInit {
  readonly buttonRipple = viewChild.required('button', {read: MatRipple});
  readonly wrapperRipple = viewChild.required('wrapper', {read: MatRipple});

  ngAfterViewInit() {
    this.buttonRipple().launch(140, 100, {
      persistent: true,
      animation: {enterDuration: 0},
      radius: 50,
    });

    this.wrapperRipple().launch(300, 100, {
      persistent: true,
      animation: {enterDuration: 0},
      radius: 150,
    });
  }
}
