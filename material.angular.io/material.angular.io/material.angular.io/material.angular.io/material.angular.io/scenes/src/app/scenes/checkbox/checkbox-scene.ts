import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-checkbox-scene',
  templateUrl: './checkbox-scene.html',
  styleUrls: ['./checkbox-scene.scss']
})
export class CheckboxScene {
}

@NgModule({
  imports: [
    MatCheckboxModule,
  ],
  exports: [CheckboxScene],
  declarations: [CheckboxScene]
})
export class CheckboxSceneModule {
}

