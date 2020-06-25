import {
  ComponentFixture,
  async,
  TestBed,
} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  CdkOption,
  CdkListboxModule, CdkListbox
} from './index';
import {dispatchMouseEvent} from '@angular/cdk/testing/private';

describe('CdkOption', () => {

  describe('selection state change', () => {
    let fixture: ComponentFixture<ListboxWithCdkOptions>;
    let listbox: DebugElement;
    let listboxInstance: CdkListbox;
    let options: DebugElement[];
    let optionInstances: CdkOption[];
    let optionElements: Element[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkListboxModule],
        declarations: [ListboxWithCdkOptions],
      }).compileComponents();
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(ListboxWithCdkOptions);
      fixture.detectChanges();

      listbox = fixture.debugElement.query(By.directive(CdkListbox));
      listboxInstance = listbox.injector.get<CdkListbox>(CdkListbox);

      options = fixture.debugElement.queryAll(By.directive(CdkOption));
      optionInstances = options.map(o => o.injector.get<CdkOption>(CdkOption));
      optionElements = options.map(o => o.nativeElement);
    }));

    it('should generate a unique optionId for each option', () => {
      let optionIds: string[] = [];
      for (const instance of optionInstances) {
        const id = instance.getOptionId();

        expect(optionIds.indexOf(id)).toBe(-1);
        optionIds.push(id);

        expect(id).toMatch(/cdk-option-\d+/);
      }
    });

    it('should have set the selected input of the options to null by default', () => {
      for (const instance of optionInstances) {
        expect(instance.selected).toBeFalse();
      }
    });

    it('should update aria-selected when selected is changed programmatically', () => {
      expect(optionElements[0].getAttribute('aria-selected')).toBeNull();
      optionInstances[1].selected = true;
      fixture.detectChanges();

      expect(optionElements[1].getAttribute('aria-selected')).toBe('true');
    });

    it('should update selected option on click event', () => {
      let selectedOptions = optionInstances.filter(option => option.selected);
      spyOn(listboxInstance, "_emitChangeEvent");

      expect(selectedOptions.length).toBe(0);
      expect(optionElements[0].getAttribute('aria-selected')).toBeNull();
      expect(optionInstances[0].selected).toBeFalse();
      expect(listboxInstance._emitChangeEvent).toHaveBeenCalledTimes(0);

      dispatchMouseEvent(optionElements[0], 'click');
      fixture.detectChanges();

      selectedOptions = optionInstances.filter(option => option.selected);
      expect(selectedOptions.length).toBe(1);
      expect(optionElements[0].getAttribute('aria-selected')).toBe('true');
      expect(optionInstances[0].selected).toBeTrue();
      expect(listboxInstance._emitChangeEvent).toHaveBeenCalledTimes(1);
    });
  });

});

@Component({
    template: `
    <div cdkListbox>
      <div cdkOption>Void</div>
      <div cdkOption>Solar</div>
      <div cdkOption>Arc</div>
      <div cdkOption>Stasis</div>
    </div>`
})
class ListboxWithCdkOptions {

}
