import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MatChipsModule} from '@angular/material/chips';

export interface ChipColor {
  name: string;
  color: ThemePalette;
}

/**
 * @title Stacked chips
 */
@Component({
  selector: 'chips-stacked-example',
  templateUrl: 'chips-stacked-example.html',
  styleUrl: 'chips-stacked-example.css',
  standalone: true,
  imports: [MatChipsModule],
})
export class ChipsStackedExample {
  availableColors: ChipColor[] = [
    {name: 'none', color: undefined},
    {name: 'Primary', color: 'primary'},
    {name: 'Accent', color: 'accent'},
    {name: 'Warn', color: 'warn'},
  ];
}
