import {Component, NgModule, ViewChild, AfterViewInit, ViewEncapsulation} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyTooltipModule as MatTooltipModule, MatLegacyTooltip as MatTooltip} from '@angular/material/legacy-tooltip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tooltip-scene',
  templateUrl: './tooltip-scene.html',
  styleUrls: ['./tooltip-scene.scss'],
})
export class TooltipScene implements AfterViewInit {
  @ViewChild(MatTooltip) tooltip!: MatTooltip;

  ngAfterViewInit() {
    this.tooltip.toggle();
  }
}

@NgModule({
  imports: [MatButtonModule, MatTooltipModule, MatIconModule],
  exports: [TooltipScene],
  declarations: [TooltipScene],
})
export class TooptipSceneModule {}
