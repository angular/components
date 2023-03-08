import {Component, NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-tabs-scene',
  templateUrl: './tabs-scene.html',
  styleUrls: ['./tabs-scene.scss']
})
export class TabsScene {
}

@NgModule({
  imports: [
    MatTabsModule,
  ],
  exports: [TabsScene],
  declarations: [TabsScene]
})
export class TabsSceneModule {
}

