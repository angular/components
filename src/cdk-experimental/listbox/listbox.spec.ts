import {
  ComponentFixture,
  async,
  TestBed,
} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  CdkOption,
  CdkListbox,
  CdkListboxModule
} from './index';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';

describe('CdkOption', () => {

  describe('selection state change', () => {
    let fixture: ComponentFixture<CdkListboxWithCdkOptions>;
    let options: DebugElement[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [CdkListboxWithCdkOptions],
      }).compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(CdkListboxWithCdkOptions);
      fixture.detectChanges();
      options = fixture.debugElement.queryAll(By.directive(CdkOption));
    }));

    it('should generate a unique optionId for each option', () => {
      for (const option of options) {
        expect(option.injector.get<CdkOption>(CdkOption).getOptionId()).toMatch(/cdk-option-\d+/);
      }
    });

    it('should have set the selected input of the options to null by default', () => {
      for (const option of options) {
        expect(option.injector.get<CdkOption>(CdkOption).selected).toBeFalse();
      }
    });

    it('should update aria-selected when selected is changed programmatically', () => {
      expect(options[1].nativeElement.getAttribute('aria-selected')).toBeNull();
      options[1].injector.get<CdkOption>(CdkOption).selected = true;
      fixture.detectChanges();

      expect(options[1].nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should update selected option on click event', () => {
      let selectedOptions =
          options.filter(option => option.injector.get<CdkOption>(CdkOption).selected);
      expect(selectedOptions.length).toBe(0);
      expect(options[0].nativeElement.getAttribute('aria-selected')).toBeNull();
      expect(options[0].injector.get<CdkOption>(CdkOption).selected).toBeFalse();

      dispatchMouseEvent(options[0].nativeElement, 'click');
      fixture.detectChanges();

      selectedOptions =
          options.filter(option => option.injector.get<CdkOption>(CdkOption).selected);
      expect(selectedOptions.length).toBe(1);
      expect(options[0].nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(options[0].injector.get<CdkOption>(CdkOption).selected).toBeTrue();
    });
  });

});

@Component({
    template: `
    <div cdkListbox>
      <div cdkOption></div>
      <div cdkOption></div>
      <div cdkOption></div>
      <div cdkOption></div>
    </div>`
})
class CdkListboxWithCdkOptions {

}
