import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

/**
 * @title Card with actions alignment option
 */
@Component({
  selector: 'card-actions-example',
  templateUrl: 'card-actions-example.html',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
})
export class CardActionsExample {}
