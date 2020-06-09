import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatRipple, MatRippleModule} from '@angular/material/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-ripple-scene',
  templateUrl: './ripples-scene.html',
  styleUrls: ['./ripples-scene.scss']
})
export class RipplesScene implements AfterViewInit {
  @ViewChild('button', {read: MatRipple}) buttonRipple: MatRipple;
  @ViewChild('wrapper', {read: MatRipple}) wrapperRipple: MatRipple;

  ngAfterViewInit() {
    this.buttonRipple.launch(140, 100, {
      persistent: true,
      animation: {enterDuration: 0},
      radius: 50,
    });

    this.wrapperRipple.launch(300, 100, {
      persistent: true,
      animation: {enterDuration: 0},
      radius: 150,
    });
  }
}

@NgModule({
  imports: [
    MatButtonModule,
    MatRippleModule,
  ],
  exports: [RipplesScene],
  declarations: [RipplesScene]
})
export class InputSceneModule {
}

