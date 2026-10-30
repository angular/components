import {Component} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';

/**
 * @title Chips with icons
 */
@Component({
  selector: 'chips-icons-example',
  templateUrl: 'chips-icons-example.html',
  styleUrl: 'chips-icons-example.css',
  imports: [MatChipsModule, MatIconModule],
})
export class ChipsIconsExample {}
