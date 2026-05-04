/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Combobox, ComboboxPopup, ComboboxWidget} from '../index';
import {Listbox, Option} from '../../listbox';
import {ListboxHarness, ListboxOptionHarness} from '../../listbox/testing/listbox-harness';
import {SimpleComboboxHarness} from './simple-combobox-harness';
import {OverlayModule} from '@angular/cdk/overlay';

describe('SimpleComboboxHarness', () => {
  let fixture: ComponentFixture<any>;
  let loader: HarnessLoader;

  function setupTest(component: any) {
    fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }

  describe('Basic usage', () => {
    beforeEach(() => setupTest(SimpleComboboxTestApp));

    it('should load combobox harness', async () => {
      await expectAsync(loader.getHarness(SimpleComboboxHarness)).toBeResolved();
    });

    it('should get and set values', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      await combobox.setValue('California');
      fixture.detectChanges();

      expect(await combobox.getValue()).toBe('California');
    });

    it('should correctly report disabled state', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      expect(await combobox.isDisabled()).toBeFalse();

      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();

      expect(await combobox.isDisabled()).toBeTrue();
    });

    it('should open and close the popup', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      expect(await combobox.isOpen()).toBeFalse();

      await combobox.open();
      fixture.detectChanges();
      expect(await combobox.isOpen()).toBeTrue();

      await combobox.close();
      fixture.detectChanges();
      expect(await combobox.isOpen()).toBeFalse();
    });

    it('should allow loading nested harnesses within the popup content via unified container API', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      await combobox.open();
      fixture.detectChanges();

      // We access the main widget harness using getPopupWidget.
      const listbox = await combobox.getPopupWidget(ListboxHarness);
      const options = await listbox.getOptions();
      expect(options.length).toBe(3);
    });

    it('should fail to resolve nested items when closed', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      // Popup isn't open yet, so getPopupWidget should fail.
      await expectAsync(combobox.getPopupWidget(ListboxHarness)).toBeRejectedWithError(
        /Cannot retrieve popup content because the combobox is closed/,
      );
    });

    it('should support getting explicit popup loader for descendant matching', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      await combobox.open();
      fixture.detectChanges();

      const popupLoader = await combobox.getPopupLoader();
      // We are testing that the loader works for finding actual children (Options).
      const option = await popupLoader.getHarness(ListboxOptionHarness);
      expect(option).toBeDefined();
    });

    it('should support focusing and blurring', async () => {
      const combobox = await loader.getHarness(SimpleComboboxHarness);
      await combobox.focus();
      expect(await combobox.isFocused()).toBeTrue();

      await combobox.blur();
      expect(await combobox.isFocused()).toBeFalse();
    });
  });

  describe('Overlay and Popover integrations', () => {
    it('should find and resolve harnesses nested inside standard CdkOverlay', async () => {
      setupTest(SimpleComboboxOverlayTestApp);
      const combobox = await loader.getHarness(SimpleComboboxHarness);

      await combobox.open();
      fixture.detectChanges();

      // Should find listbox inside the dynamically attached cdk overlay root container
      const listbox = await combobox.getPopupWidget(ListboxHarness);
      expect(listbox).toBeDefined();
      expect((await listbox.getOptions()).length).toBe(2);
    });

    it('should resolve nested harnesses when using Native Popover API', async () => {
      setupTest(SimpleComboboxNativePopoverTestApp);
      const combobox = await loader.getHarness(SimpleComboboxHarness);

      await combobox.open();
      fixture.detectChanges();

      const listbox = await combobox.getPopupWidget(ListboxHarness);
      expect(listbox).toBeDefined();
      expect((await listbox.getOptions()).length).toBe(2);
    });
  });
});

@Component({
  template: `
    <div>
      <input
        ngCombobox
        #combobox="ngCombobox"
        placeholder="Search states"
        [disabled]="disabled()"
      />

      <ng-template ngComboboxPopup [combobox]="combobox">
        <div ngComboboxWidget #listbox="ngListbox" ngListbox id="listbox-widget" focusMode="activedescendant" [activeDescendant]="listbox.activeDescendant()">
          <div ngOption value="CA" label="California">California</div>
          <div ngOption value="WA" label="Washington">Washington</div>
          <div ngOption value="OR" label="Oregon">Oregon</div>
        </div>
      </ng-template>
    </div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
})
class SimpleComboboxTestApp {
  disabled = signal(false);
}

@Component({
  template: `
    <div #origin>
      <input ngCombobox #combobox="ngCombobox" [(expanded)]="popupExpanded" />
    </div>

    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOrigin]="origin" [cdkConnectedOverlayOpen]="popupExpanded()">
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div ngComboboxWidget ngListbox id="overlay-listbox">
          <div ngOption value="A">A</div>
          <div ngOption value="B">B</div>
        </div>
      </ng-template>
    </ng-template>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
class SimpleComboboxOverlayTestApp {
  popupExpanded = signal(false);
}

@Component({
  template: `
    <div #origin>
      <input ngCombobox #combobox="ngCombobox" [(expanded)]="popupExpanded" />
    </div>

    <ng-template [cdkConnectedOverlay]="{origin, usePopover: 'inline'}" [cdkConnectedOverlayOpen]="popupExpanded()">
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div ngComboboxWidget ngListbox id="popover-listbox">
          <div ngOption value="A">A</div>
          <div ngOption value="B">B</div>
        </div>
      </ng-template>
    </ng-template>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
class SimpleComboboxNativePopoverTestApp {
  popupExpanded = signal(false);
}
