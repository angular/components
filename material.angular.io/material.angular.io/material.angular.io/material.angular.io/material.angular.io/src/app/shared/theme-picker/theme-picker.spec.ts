import {async, TestBed} from '@angular/core/testing';
import {ThemePicker, ThemePickerModule} from './theme-picker';
import {DocsAppTestingModule} from '../../testing/testing-module';


describe('ThemePicker', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ThemePickerModule, DocsAppTestingModule],
    }).compileComponents();
  }));

  it('should install theme based on href', () => {
    const fixture = TestBed.createComponent(ThemePicker);
    const component = fixture.componentInstance;
    const href = 'pink-bluegrey.css';
    spyOn(component.styleManager, 'setStyle');
    component.installTheme({
      primary: '#E91E63',
      accent: '#607D8B',
      href,
    });
    expect(component.styleManager.setStyle).toHaveBeenCalled();
    expect(component.styleManager.setStyle).toHaveBeenCalledWith('theme', `assets/${href}`);
  });
});
