import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-toolbar-scene',
  templateUrl: './toolbar-scene.html',
  styleUrls: ['./toolbar-scene.scss']
})
export class ToolbarScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatToolbarModule
  ],
  exports: [ToolbarScene],
  declarations: [ToolbarScene]
})
export class ToolbarSceneModule {}

