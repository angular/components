import {Component, ViewEncapsulation} from '@angular/core';
import {MatPaginatorModule} from '@angular/material/paginator';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-paginator-scene',
  templateUrl: './paginator-scene.html',
  styleUrls: ['./paginator-scene.scss'],
  standalone: true,
  imports: [MatPaginatorModule]
})
export class PaginatorScene {}
