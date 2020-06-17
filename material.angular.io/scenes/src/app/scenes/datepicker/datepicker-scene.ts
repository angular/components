import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-datepicker-scene',
  templateUrl: './datepicker-scene.html',
  styleUrls: ['./datepicker-scene.scss']
})
export class DatepickerScene {
}

@NgModule({
  imports: [
    MatDatepickerModule,
  ],
  exports: [DatepickerScene],
  declarations: [DatepickerScene],
})
export class DatepickerSceneModule {
}

