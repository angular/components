import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelect, MatSelectModule} from '@angular/material/select';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-select-scene',
  templateUrl: './select-scene.html',
  styleUrls: ['./select-scene.scss']
})
export class SelectScene implements AfterViewInit {
  @ViewChild(MatSelect) select: MatSelect;

  ngAfterViewInit() {
    this.select.open();
  }
}

@NgModule({
  imports: [
    MatFormFieldModule,
    MatSelectModule
  ],
  exports: [SelectScene],
  declarations: [SelectScene]
})
export class SelectSceneModule {}

