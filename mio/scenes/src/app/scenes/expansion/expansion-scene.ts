import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-expansion-scene',
  templateUrl: './expansion-scene.html',
  styleUrls: ['./expansion-scene.scss']
})
export class ExpansionScene {
}

@NgModule({
  imports: [
    MatExpansionModule,
    MatIconModule
  ],
  exports: [ExpansionScene],
  declarations: [ExpansionScene]
})
export class ExpansionSceneModule {}

