import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-paginator-scene',
  templateUrl: './paginator-scene.html',
  styleUrls: ['./paginator-scene.scss']
})
export class PaginatorScene {
}

@NgModule({
  imports: [
    MatPaginatorModule
  ],
  exports: [PaginatorScene],
  declarations: [PaginatorScene]
})
export class PaginatorSceneModule {}
