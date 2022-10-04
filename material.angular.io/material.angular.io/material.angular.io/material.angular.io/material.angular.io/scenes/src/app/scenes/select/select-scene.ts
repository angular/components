import {AfterViewInit, Component, NgModule, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelect as MatSelect, MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-select-scene',
  templateUrl: './select-scene.html',
  styleUrls: ['./select-scene.scss']
})
export class SelectScene implements AfterViewInit {
  @ViewChild(MatSelect) select!: MatSelect;

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

