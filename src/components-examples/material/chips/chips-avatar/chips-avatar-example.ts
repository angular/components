import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * @title Chips avatar
 * @description An avatar inside a chip
 */
@Component({
  selector: 'chips-avatar-example',
  templateUrl: 'chips-avatar-example.html',
  styleUrl: 'chips-avatar-example.css',
  imports: [MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsAvatarExample {}
