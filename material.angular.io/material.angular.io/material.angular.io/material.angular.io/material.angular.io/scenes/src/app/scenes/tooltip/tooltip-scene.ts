import {Component, NgModule, ViewChild, AfterViewInit, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule, MatTooltip} from '@angular/material/tooltip';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tooltip-scene',
  templateUrl: './tooltip-scene.html',
  styleUrls: ['./tooltip-scene.scss'],
})
export class TooltipScene implements AfterViewInit {
  @ViewChild(MatTooltip) tooltip: MatTooltip;

  ngAfterViewInit() {
    this.tooltip.toggle();
  }
}

@NgModule({
  imports: [MatButtonModule, MatTooltipModule],
  exports: [TooltipScene],
  declarations: [TooltipScene],
})
export class TooptipSceneModule {}
