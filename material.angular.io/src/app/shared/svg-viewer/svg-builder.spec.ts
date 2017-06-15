import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, inject, TestBed} from '@angular/core/testing';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';

import {DocsSiteTheme} from '../theme-chooser/theme-storage/theme-storage';
import {SvgBuilder} from './svg-builder';


describe('SVG Builder', () => {
  const defaultData = SvgBuilder.DEFAULT_THEME;
  const black = '#000000';
  const white = '#ffffff';
  const primary = '#FFA669';
  const accent = '#F0F8FF';
  let testTheme: DocsSiteTheme;
  let template;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, HttpModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [SvgBuilder],
    });
  }));

  beforeEach(() => {
    testTheme = {
      isDark: false,
      href: 'coolland.py',
      primary: '#FFA669',
      accent,
    };

    template = '';
    Object.keys(defaultData).forEach(key => {
      if (defaultData[key]) {
        template += `someRandomData fill="${defaultData[key]}"`;
      }
    });
  });

  it('replaceColor should return a string with all instances of a hex code replaced',
     inject([SvgBuilder], (service: SvgBuilder) => {
       const oneHexCode = `<someTemplate fill="${black}"></someTemplate>`;
       const twoHexCodes = `<someTemplate fill="${black}" stroke-fill="${black}"></someTemplate>`;
       const checkStringMissingIn = (template, search) => !~template.indexOf(search);
       const result1 = service._replaceColor(oneHexCode, black, white);
       const result2 = service._replaceColor(twoHexCodes, black, white);
       [result1, result2].forEach(result => {
         expect(checkStringMissingIn(result, black)).toBeTruthy();
         expect(checkStringMissingIn(result, white)).toBeFalsy();
       });
     }));

  it('should build a ThemeColors object based off a primary and secondary hex code',
     inject([SvgBuilder], (service: SvgBuilder) => {
       const result = service.createThemeColors(testTheme);
       const expectedKeys = Object.keys(defaultData);
       Object.keys(result).forEach(key => {
         expect(result[key]).toBeTruthy();
         expect(expectedKeys.find(ek => ek === key)).toBeTruthy();
       });
     }));

  it('replaceColorCodes will replace all instances of a previous theme\'s colors, with new ones',
     inject([SvgBuilder], (service: SvgBuilder) => {
       const colors = service.createThemeColors(testTheme);
       const newTemplate = service.replaceColorCodes(template, colors, defaultData);
       Object.keys(colors).forEach(key => {
         expect(~newTemplate.indexOf(colors[key])).toBeTruthy();
         if (defaultData[key]) {
           expect(~newTemplate.indexOf(defaultData[key])).toBeFalsy();
         }
       });
     }));

  it('should return a new template and theme colors when calling buildSvg',
     inject([SvgBuilder], (service: SvgBuilder) => {
       const result = service.buildSvg(testTheme, template, defaultData);
       expect(result.colors).toEqual(service.createThemeColors(testTheme));
       expect(result.newTemplate).toEqual(service.replaceColorCodes(
         template, result.colors, defaultData));
     }));
});
