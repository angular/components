import {Component, AfterViewInit, ViewEncapsulation, viewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule, MatTooltip} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tooltip-scene',
  templateUrl: './tooltip-scene.html',
  styleUrls: ['./tooltip-scene.scss'],
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, MatIconModule],
})
export class TooltipScene implements AfterViewInit {
  readonly tooltip = viewChild.required(MatTooltip);

  ngAfterViewInit() {
    this.tooltip().toggle();
  }
}
