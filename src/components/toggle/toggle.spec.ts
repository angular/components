import {
  it,
  describe,
  beforeEach,
  beforeEachProviders,
  inject,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, provide} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MD_TOGGLE_DIRECTIVES, MdToggleGroup, MdToggle, MdToggleGroupMultiple} from './toggle';
import {
  MdUniqueSelectionDispatcher
} from '@angular2-material/core/coordination/unique-selection-dispatcher';


describe('MdToggle', () => {
  let builder: TestComponentBuilder;
  let dispatcher: MdUniqueSelectionDispatcher;

  beforeEachProviders(() => [
    provide(MdUniqueSelectionDispatcher, {useFactory: () => {
      dispatcher = new MdUniqueSelectionDispatcher();
      return dispatcher;
    }})
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('inside of an exclusive selection group', () => {
    let fixture: ComponentFixture<TogglesInsideToggleGroup>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let toggleDebugElements: DebugElement[];
    let toggleNativeElements: HTMLElement[];
    let groupInstance: MdToggleGroup;
    let toggleInstances: MdToggle[];
    let testComponent: TogglesInsideToggleGroup;

    beforeEach(async(() => {
      builder.createAsync(TogglesInsideToggleGroup).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdToggleGroup));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdToggleGroup);

        toggleDebugElements = fixture.debugElement.queryAll(By.directive(MdToggle));
        toggleNativeElements = toggleDebugElements.map(debugEl => debugEl.nativeElement);
        toggleInstances = toggleDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

    it('should set individual toggle names based on the group name', () => {
      expect(groupInstance.name).toBeTruthy();
      for (let toggle of toggleInstances) {
        expect(toggle.name).toBe(groupInstance.name);
      }
    });

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      toggleNativeElements[0].click();
      expect(toggleInstances[0].checked).toBe(false);
    });

    it('should update the group value when one of the toggles changes', () => {
      expect(groupInstance.value).toBeFalsy();

      toggleNativeElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(toggleInstances[0]);
    });

    it('should update the group and toggles when one of the toggles is clicked', () => {
      expect(groupInstance.value).toBeFalsy();

      toggleNativeElements[0].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(toggleInstances[0]);
      expect(toggleInstances[0].checked).toBe(true);
      expect(toggleInstances[1].checked).toBe(false);

      toggleNativeElements[1].click();
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(toggleInstances[1]);
      expect(toggleInstances[0].checked).toBe(false);
      expect(toggleInstances[1].checked).toBe(true);
    });

    it('should check a toggle upon interaction with the underlying native radio button', () => {
      let nativeRadioInput = <HTMLElement> toggleNativeElements[0].querySelector('input');

      nativeRadioInput.click();
      fixture.detectChanges();

      expect(toggleInstances[0].checked).toBe(true);
      expect(groupInstance.value);
    });

    it('should emit a change even from toggles', fakeAsync(() => {
      expect(toggleInstances[0].checked).toBe(false);

      let changeSpy = jasmine.createSpy('toggle change listener');
      toggleInstances[0].change.subscribe(changeSpy);

      toggleInstances[0].checked = true;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      toggleInstances[0].checked = false;
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should emit a change event from the toggle group', fakeAsync(() => {
      expect(groupInstance.value).toBeFalsy();

      let changeSpy = jasmine.createSpy('toggle-group change listener');
      groupInstance.change.subscribe(changeSpy);

      groupInstance.value = 'test1';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalled();

      groupInstance.value = 'test2';
      fixture.detectChanges();
      tick();
      expect(changeSpy).toHaveBeenCalledTimes(2);
    }));

    it('should update the group and toggles when updating the group value', () => {
      expect(groupInstance.value).toBeFalsy();

      testComponent.groupValue = 'test1';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test1');
      expect(groupInstance.selected).toBe(toggleInstances[0]);
      expect(toggleInstances[0].checked).toBe(true);
      expect(toggleInstances[1].checked).toBe(false);

      testComponent.groupValue = 'test2';
      fixture.detectChanges();

      expect(groupInstance.value).toBe('test2');
      expect(groupInstance.selected).toBe(toggleInstances[1]);
      expect(toggleInstances[0].checked).toBe(false);
      expect(toggleInstances[1].checked).toBe(true);
    });
  });

  describe('inside of a multiple selection group', () => {
    let fixture: ComponentFixture<TogglesInsideToggleGroupMultiple>;
    let groupDebugElement: DebugElement;
    let groupNativeElement: HTMLElement;
    let toggleDebugElements: DebugElement[];
    let toggleNativeElements: HTMLElement[];
    let groupInstance: MdToggleGroupMultiple;
    let toggleInstances: MdToggle[];
    let testComponent: TogglesInsideToggleGroupMultiple;

    beforeEach(async(() => {
      builder.createAsync(TogglesInsideToggleGroupMultiple).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        groupDebugElement = fixture.debugElement.query(By.directive(MdToggleGroupMultiple));
        groupNativeElement = groupDebugElement.nativeElement;
        groupInstance = groupDebugElement.injector.get(MdToggleGroupMultiple);

        toggleDebugElements = fixture.debugElement.queryAll(By.directive(MdToggle));
        toggleNativeElements = toggleDebugElements.map(debugEl => debugEl.nativeElement);
        toggleInstances = toggleDebugElements.map(debugEl => debugEl.componentInstance);
      });
    }));

    it('should disable click interactions when the group is disabled', () => {
      testComponent.isGroupDisabled = true;
      fixture.detectChanges();

      toggleNativeElements[0].click();
      expect(toggleInstances[0].checked).toBe(false);
    });

    it('should check a toggle when clicked', () => {
      expect(toggleInstances.every(toggle => !toggle.checked)).toBe(true);

      toggleNativeElements[0].click();
      expect(toggleInstances[0].checked).toBe(true);
    });

    it('should allow for multiple toggles to be selected', () => {
      toggleInstances[0].checked = true;
      fixture.detectChanges();
      expect(toggleInstances[0].checked).toBe(true);

      toggleInstances[1].checked = true;
      fixture.detectChanges();
      expect(toggleInstances[1].checked).toBe(true);
      expect(toggleInstances[0].checked).toBe(true);
    });

    it('should deselect a toggle when selected twice', () => {
      toggleNativeElements[0].click();
      fixture.detectChanges();

      toggleNativeElements[0].click();
      fixture.detectChanges();

      expect(toggleInstances[0].checked).toBe(false);
    });
  });

  describe('as standalone', () => {
    let fixture: ComponentFixture<StandaloneToggle>;
    let toggleDebugElement: DebugElement;
    let toggleNativeElement: HTMLElement;
    let toggleInstance: MdToggle;
    let testComponent: StandaloneToggle;

    beforeEach(async(() => {
      builder.createAsync(StandaloneToggle).then(f => {
        fixture = f;
        fixture.detectChanges();

        testComponent = fixture.debugElement.componentInstance;

        toggleDebugElement = fixture.debugElement.query(By.directive(MdToggle));
        toggleNativeElement = toggleDebugElement.nativeElement;
        toggleInstance = toggleDebugElement.componentInstance;
      });
    }));

    it('should toggle when clicked', () => {
      toggleNativeElement.click();
      fixture.detectChanges();

      expect(toggleInstance.checked).toBe(true);

      toggleNativeElement.click();
      fixture.detectChanges();

      expect(toggleInstance.checked).toBe(false);
    });
  });
});


@Component({
  directives: [MD_TOGGLE_DIRECTIVES],
  template: `
  <md-toggle-group [disabled]="isGroupDisabled" [value]="groupValue">
    <md-toggle value="test1">Test1</md-toggle>
    <md-toggle value="test2">Test2</md-toggle>
    <md-toggle value="test3">Test3</md-toggle>
  </md-toggle-group>
  `
})
class TogglesInsideToggleGroup {
  isGroupDisabled: boolean = false;
  groupValue: string = null;
}

@Component({
  directives: [MD_TOGGLE_DIRECTIVES],
  template: `
  <md-toggle-group [disabled]="isGroupDisabled" multiple>
    <md-toggle value="eggs">Eggs</md-toggle>
    <md-toggle value="flour">Flour</md-toggle>
    <md-toggle value="sugar">Sugar</md-toggle>
  </md-toggle-group>
  `
})
class TogglesInsideToggleGroupMultiple {
  isGroupDisabled: boolean = false;
}

@Component({
  directives: [MD_TOGGLE_DIRECTIVES],
  template: `
  <md-toggle>Yes</md-toggle>
  `
})
class StandaloneToggle { }
