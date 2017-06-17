import {MaterialModule} from '@angular/material';
import {async, TestBed} from '@angular/core/testing';

import {ThemeStorage} from './theme-storage/theme-storage';
import {ThemePicker} from './theme-picker';
import {StyleManager} from '../style-manager';


describe('ThemePicker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [ThemePicker],
      providers: [StyleManager, ThemeStorage]
    });

    TestBed.compileComponents();
  }));

  it('should install theme based on href', () => {
    const fixture = TestBed.createComponent(ThemePicker);
    const component = fixture.componentInstance;
    const href = 'pink-bluegrey.css';
    spyOn(component.styleManager, 'setStyle');
    component.installTheme(href);
    expect(component.styleManager.setStyle).toHaveBeenCalled();
    expect(component.styleManager.setStyle).toHaveBeenCalledWith('theme', `assets/${href}`);
  });
});
