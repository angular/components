import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Basic icons
 */
@Component({
  selector: 'icon-overview-example',
  templateUrl: 'icon-overview-example.html',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconOverviewExample {}
