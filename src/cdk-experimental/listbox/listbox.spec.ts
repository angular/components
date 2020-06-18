import {
  ComponentFixture,
  async,
  TestBed,
} from '@angular/core/testing';
import {Component} from '@angular/core';
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
    let listboxInstance: CdkListbox;
    let options: CdkOption[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [CdkListboxWithCdkOptions],
      }).compileComponents();

      fixture = TestBed.createComponent(CdkListboxWithCdkOptions);
      fixture.detectChanges();
      listboxInstance = fixture.debugElement.query(By.directive(CdkListbox)).injector.get(CdkListbox);
      options = listboxInstance._options.toArray();
    }));

    it('should generate a unique optionid for each option', () => {
      options.forEach(option => {
        expect(option.getOptionId()).toMatch(/cdk-option-\d+/);
      });
    });

    it('should have set the selected input of the options to null by default', () => {
      options.forEach(option => {
        expect(option.selected).toBe(null);
      });
    });

    it('should update aria-selected when selected is changed programmatically', () => {
      expect(options[1].getElementRef().nativeElement.getAttribute('aria-selected')).toBe(null);
      options[1].selected = true;
      fixture.detectChanges();

      expect(options[1].getElementRef().nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('should be able to return the currently selected options', () => {
      expect(listboxInstance.getSelectedOptions().length).toBe(0);
      options[0].selected = true;
      fixture.detectChanges();
      const selectedOptions = listboxInstance.getSelectedOptions();

      expect(selectedOptions.length).toBe(1);
      expect(selectedOptions[0].selected).toBeTruthy();
    });

    it('should update selected option on click event', () => {
      expect(listboxInstance.getSelectedOptions().length).toBe(0);
      expect(options[0].getElementRef().nativeElement.getAttribute('aria-selected')).toBe(null);
      expect(options[0].selected).toBeFalsy();

      dispatchMouseEvent(options[0].getElementRef().nativeElement, 'click');
      fixture.detectChanges();

      expect(listboxInstance.getSelectedOptions().length).toBe(1);
      expect(options[0].getElementRef().nativeElement.getAttribute('aria-selected')).toBe('true');
      expect(options[0].selected).toBeTruthy();
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
