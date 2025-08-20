import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-system-classes-demo',
  templateUrl: './system-classes-demo.html',
  styleUrls: ['./system-classes-demo.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemClassesDemo {}
