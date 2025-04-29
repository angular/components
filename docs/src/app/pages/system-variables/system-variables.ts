/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';

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
  styleUrl: 'system-variables.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeDemoColors {
  colors = input<Color[]>();
}

@Component({
  selector: 'app-system-variables',
  templateUrl: './system-variables.html',
  styleUrls: ['./system-variables.scss'],
  imports: [MatExpansionPanel, MatExpansionPanelHeader, ThemeDemoColors],
})
export class SystemVariables {
  alternativeThemeColors: Color[] = [
    {
      name: 'Primary Container',
      background: '--mat-sys-primary-container',
      text: '--mat-sys-on-primary-container',
    },
    {
      name: 'Secondary',
      background: '--mat-sys-secondary',
      text: '--mat-sys-on-secondary',
    },
    {
      name: 'Secondary Container',
      background: '--mat-sys-secondary-container',
      text: '--mat-sys-on-secondary-container',
    },
    {
      name: 'Tertiary',
      background: '--mat-sys-tertiary',
      text: '--mat-sys-on-tertiary',
    },
    {
      name: 'Tertiary Container',
      background: '--mat-sys-tertiary-container',
      text: '--mat-sys-on-tertiary-container',
    },
    {
      name: 'Error Container',
      background: '--mat-sys-error-container',
      text: '--mat-sys-on-error-container',
    },
  ];

  surfaceColors: Color[] = [
    {
      name: 'Surface Dim',
      background: '--mat-sys-surface-dim',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Bright',
      background: '--mat-sys-surface-bright',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Lowest',
      background: '--mat-sys-surface-container-lowest',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Low',
      background: '--mat-sys-surface-container-low',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container',
      background: '--mat-sys-surface-container',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container High',
      background: '--mat-sys-surface-container-high',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
    {
      name: 'Surface Container Highest',
      background: '--mat-sys-surface-container-highest',
      text: '--mat-sys-on-surface',
      hideText: true,
    },
  ];

  fixedColors: Color[] = [
    {
      name: 'Primary Fixed',
      background: '--mat-sys-primary-fixed',
      text: '--mat-sys-on-primary-fixed',
    },
    {
      name: 'Primary Fixed Dim',
      background: '--mat-sys-primary-fixed-dim',
      text: '--mat-sys-on-primary-fixed',
    },
    {
      name: 'Secondary Fixed',
      background: '--mat-sys-secondary-fixed',
      text: '--mat-sys-on-secondary-fixed',
    },
    {
      name: 'Secondary Fixed Dim',
      background: '--mat-sys-secondary-fixed-dim',
      text: '--mat-sys-on-secondary-fixed',
    },
    {
      name: 'Tertiary Fixed',
      background: '--mat-sys-tertiary-fixed',
      text: '--mat-sys-on-tertiary-fixed',
    },
    {
      name: 'Tertiary Fixed Dim',
      background: '--mat-sys-tertiary-fixed-dim',
      text: '--mat-sys-on-tertiary-fixed',
    },
  ];
}
