import {Component, NgModule} from '@angular/core';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';

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

