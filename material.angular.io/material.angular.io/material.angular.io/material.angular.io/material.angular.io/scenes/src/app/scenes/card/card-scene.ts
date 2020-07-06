import {Component, NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {InputSceneModule} from '../placeholder/placeholder-scene';

@Component({
  selector: 'app-card-scene',
  templateUrl: './card-scene.html',
  styleUrls: ['./card-scene.scss'],
})
export class CardScene {}

@NgModule({
  imports: [MatCardModule, InputSceneModule],
  exports: [CardScene],
  declarations: [CardScene],
})
export class CardSceneModule {}
