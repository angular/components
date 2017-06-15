import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {DocsSiteTheme} from '../theme-chooser/theme-storage/theme-storage';

import * as Color from 'color';


// Accent isn't currently used in SVGs.. uncomment to use it again in colour schemes
export interface ThemeColors {
  gradientPrimaryDark: string;
  gradientPrimary: string;
  washedOutPrimary: string;
  offWhitePrimary: string;
  lighterPrimary: string;
  lightPrimary: string;
  deepPrimary: string;
  primary: string;
  darkerPrimary: string;
  // accent: string;
};


@Injectable()
export class SvgBuilder {
  static DEFAULT_THEME: ThemeColors = {
    gradientPrimary: '#0CBFD6',
    gradientPrimaryDark: '#05BED5',
    washedOutPrimary: '#E1F7FA',
    offWhitePrimary: '#B9EDF3',
    lighterPrimary: '#CCF2F6',
    lightPrimary: '#00BCD4',
    primary: '#89E0EB',
    deepPrimary: '#00BDD5',
    darkerPrimary: '#5CD8E7',
    // accent: '#274C51',
  };

  constructor(private http: Http) {
  }

  public buildSvg(theme: DocsSiteTheme, template: string, previousThemeColors) {
    const colors = theme ? this.createThemeColors(theme) : SvgBuilder.DEFAULT_THEME;
    const newTemplate = this.replaceColorCodes(template, colors, previousThemeColors);
    return {newTemplate, colors};
  }

  public createThemeColors(theme: DocsSiteTheme): ThemeColors {
    const {primary} = theme;
    return {
      primary,
      gradientPrimaryDark: Color(primary).lighten(0.3).hex(),
      gradientPrimary: Color(primary).lighten(0.4).hex(),
      washedOutPrimary: Color(primary).lighten(0.85).hex(),
      offWhitePrimary: Color(primary).lighten(0.8).hex(),
      lighterPrimary: Color(primary).lighten(0.6).hex(),
      lightPrimary: Color(primary).lighten(0.2).hex(),
      deepPrimary: Color(primary).darken(0.3).hex(),
      darkerPrimary: Color(primary).darken(0.4).hex(),
    };
  }

  // Used by svg-viewer class
  public getSvgAsString(path: string): Promise<string> {
    const svgAbsPath = this._getAbsPath(path);
    return this.http.get(svgAbsPath).toPromise()
      .then((data: any) => data._body);
  }

  private _getAbsPath(path: string): string {
    // SVG assets all come from the /assets/ path
    const svgBasePath = 'assets/';
    return path.slice((path.indexOf(svgBasePath)-1));
  }

  public replaceColorCodes(template: string, colors: ThemeColors, previousThemeColors: ThemeColors): string {
    let finalTemplate = template;
    Object.keys(colors).forEach(key => {
      const prevColor = previousThemeColors[key];
      const newColor = colors[key];
      if (prevColor && newColor) {
        finalTemplate = this._replaceColor(finalTemplate, prevColor, newColor);
      }
    });
    return finalTemplate;
  }

  public _replaceColor(template: string, color: string, replacement: string): string {
    return template.replace(new RegExp(color, 'gi'), replacement);
  }
}
