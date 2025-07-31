import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

interface RoleCategory {
  /** Display name of a category for grouping related roles. */
  name: string;
  roles: ColorGroup[];
}

interface ColorGroup {
  /** List of role names used for background colors in this group. */
  backgroundColors: string[];

  /** List of role names used for foreground colors in this group. */
  foregroundColors: string[];

  /**
   * Optional color role name to use for displaying titles. If not specified,
   * the first foreground color is used.
   */
  titleColorRole?: string;
}

/**
 * Demo showing color swatches for Material Color Roles in the default GM3 and
 * Angular Material color palettes.
 */
@Component({
  selector: 'system-demo',
  templateUrl: 'system-demo.html',
  styleUrls: ['system-demo.css'],
  imports: [CommonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemDemo {
  /**
   * Color roles grouped into categories for display. Each role group is
   * rendered into a card showing the background colors for that role, with text
   * labels written in the foreground colors for that role.
   */
  protected readonly colorGroups: RoleCategory[] = [
    {
      name: 'Primary',
      roles: [
        {
          backgroundColors: ['primary'],
          foregroundColors: ['on-primary'],
        },
        {
          backgroundColors: ['primary-container'],
          foregroundColors: ['on-primary-container'],
        },
        {
          backgroundColors: ['primary-fixed', 'primary-fixed-dim'],
          foregroundColors: ['on-primary-fixed', 'on-primary-fixed-variant'],
        },
      ],
    },
    {
      name: 'Secondary',
      roles: [
        {
          backgroundColors: ['secondary'],
          foregroundColors: ['on-secondary'],
        },
        {
          backgroundColors: ['secondary-container'],
          foregroundColors: ['on-secondary-container'],
        },
        {
          backgroundColors: ['secondary-fixed', 'secondary-fixed-dim'],
          foregroundColors: ['on-secondary-fixed', 'on-secondary-fixed-variant'],
        },
      ],
    },
    {
      name: 'Surface',
      roles: [
        {
          backgroundColors: ['surface-bright', 'surface', 'surface-dim'],
          foregroundColors: ['on-surface', 'on-surface-variant'],
        },
        {
          backgroundColors: [
            'surface-container-lowest',
            'surface-container-low',
            'surface-container',
            'surface-container-high',
            'surface-container-highest',
          ],
          foregroundColors: ['on-surface', 'on-surface-variant'],
        },
        {
          backgroundColors: ['inverse-surface'],
          foregroundColors: ['inverse-on-surface', 'inverse-primary'],
        },
      ],
    },
    {
      name: 'Utility',
      roles: [
        {
          backgroundColors: ['error'],
          foregroundColors: ['on-error'],
        },
        {
          backgroundColors: ['error-container'],
          foregroundColors: ['on-error-container'],
        },
        {
          backgroundColors: ['outline', 'outline-variant', 'scrim', 'shadow'],
          foregroundColors: [],
          titleColorRole: 'on-primary',
        },
      ],
    },
  ];
}
