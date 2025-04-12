import {TestBed} from '@angular/core/testing';
import {ThemePicker} from './theme-picker';
import {provideRouter} from '@angular/router';

describe('ThemePicker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should install theme based on name', () => {
    const fixture = TestBed.createComponent(ThemePicker);
    const component = fixture.componentInstance;
    const name = 'magenta-violet';
    spyOn(component.styleManager, 'setStyle');
    component.selectTheme(name);
    expect(component.styleManager.setStyle).toHaveBeenCalled();
    expect(component.styleManager.setStyle).toHaveBeenCalledWith('theme', `${name}.css`);
  });
});
