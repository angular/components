import {Component} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Chips avatar
 * @description An avatar inside a chip
 */
@Component({
  selector: 'chips-avatar-example',
  templateUrl: 'chips-avatar-example.html',
  styleUrls: ['chips-avatar-example.css'],
  standalone: true,
  imports: [MatChipsModule],
})
export class ChipsAvatarExample {}
