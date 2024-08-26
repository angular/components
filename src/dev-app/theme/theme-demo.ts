/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {getAppState} from '../dev-app/dev-app-state';

interface Color {
  name: string;
  background: string;
  text: string;
  hideText?: boolean;
}

@Component({
  selector: 'theme-demo-colors',
  template: `
    <div class="demo-compact-color-container">
      @for (color of colors(); track $index) {
      <div class="demo-heading"
           [style.background-color]="'var(' + color.background + ')'"
           [style.color]="'var(' + color.text + ')'">
        <div class="demo-name"> {{color.name}} </div>
        <div class="demo-variables">
          <div class="demo-variable demo-code">{{color.background}}</div>
          @if (!color.hideText) {
      <div class="demo-variable demo-code">{{color.text}}</div>
      }
      </div>
    </div>
      }
    </div>
  `,
  styleUrl: 'theme-demo.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDemoColors {
  colors = input<Color[]>();
}

@Component({
  selector: 'theme-demo',
  templateUrl: 'theme-demo.html',
  styleUrl: 'theme-demo.css',
  standalone: true,
  imports: [MatCardModule, MatExpansionModule, MatIconModule, ThemeDemoColors],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDemo {
  state = getAppState();

  alternativeThemeColors: Color[] = [
    {
      name: 'Primary Container',
      background: '--mat-app-primary-container',
      text: '--mat-app-on-primary-container',
    },
    {
      name: 'Secondary',
      background: '--mat-app-secondary',
      text: '--mat-app-on-secondary',
    },
    {
      name: 'Secondary Container',
      background: '--mat-app-secondary-container',
      text: '--mat-app-on-secondary-container',
    },
    {
      name: 'Tertiary',
      background: '--mat-app-tertiary',
      text: '--mat-app-on-tertiary',
    },
    {
      name: 'Tertiary Container',
      background: '--mat-app-tertiary-container',
      text: '--mat-app-on-tertiary-container',
    },
    {
      name: 'Error Container',
      background: '--mat-app-error-container',
      text: '--mat-app-on-error-container',
    },
  ];

  surfaceColors: Color[] = [
    {
      name: 'Surface Dim',
      background: '--mat-app-surface-dim',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Bright',
      background: '--mat-app-surface-bright',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Lowest',
      background: '--mat-app-surface-container-lowest',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Low',
      background: '--mat-app-surface-container-low',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container',
      background: '--mat-app-surface-container',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container High',
      background: '--mat-app-surface-container-high',
      text: '--mat-app-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Highest',
      background: '--mat-app-surface-container-highest',
      text: '--mat-app-on-surface',
      hideText: true,
    },
  ];

  fixedColors: Color[] = [
    {
      name: 'Primary Fixed',
      background: '--mat-app-primary-fixed',
      text: '--mat-app-on-primary-fixed',
    },
    {
      name: 'Primary Fixed Dim',
      background: '--mat-app-primary-fixed-dim',
      text: '--mat-app-on-primary-fixed',
    },
    {
      name: 'Secondary Fixed',
      background: '--mat-app-secondary-fixed',
      text: '--mat-app-on-secondary-fixed',
    },
    {
      name: 'Secondary Fixed Dim',
      background: '--mat-app-secondary-fixed-dim',
      text: '--mat-app-on-secondary-fixed',
    },
    {
      name: 'Tertiary Fixed',
      background: '--mat-app-tertiary-fixed',
      text: '--mat-app-on-tertiary-fixed',
    },
    {
      name: 'Tertiary Fixed Dim',
      background: '--mat-app-tertiary-fixed-dim',
      text: '--mat-app-on-tertiary-fixed',
    },
  ];
}
