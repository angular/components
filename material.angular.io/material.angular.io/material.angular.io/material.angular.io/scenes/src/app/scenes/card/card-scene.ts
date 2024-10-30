import {Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'app-card-scene',
  templateUrl: './card-scene.html',
  styleUrls: ['./card-scene.scss'],
  standalone: true,
  imports: [MatCardModule],
})
export class CardScene {}
