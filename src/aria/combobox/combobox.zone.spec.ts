/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, signal, provideZoneChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Combobox} from './combobox';
import {ComboboxPopup} from './combobox-popup';
import {ComboboxWidget} from './combobox-widget';
import {Listbox, Option} from '../listbox';

describe('Combobox Zone.js integration', () => {
  let fixture: ComponentFixture<ComboboxListboxZoneExample>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
    fixture = TestBed.createComponent(ComboboxListboxZoneExample);
    await fixture.whenStable();
    const inputDebugElement = fixture.debugElement.query(By.directive(Combobox));
    inputElement = inputDebugElement.nativeElement as HTMLInputElement;
  });

  const focus = () => {
    inputElement.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    fixture.detectChanges();
  };

  const keydown = (key: string) => {
    focus();
    inputElement.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
      }),
    );
    fixture.detectChanges();
  };

  function getOption(text: string): HTMLElement | null {
    const options = Array.from(document.querySelectorAll('[ngoption]')) as HTMLElement[];
    return options.find(option => option.textContent?.trim() === text) || null;
  }

  it('should relay ArrowDown to the listbox and update active descendant', fakeAsync(() => {
    // Open the popup (sets active descendant to Alabama via default state)
    keydown('ArrowDown');
    tick();
    fixture.detectChanges();

    // Check if expanded is true
    expect(inputElement.getAttribute('aria-expanded')).toBe('true');
    // Active descendant is bound to host:
    const alabama = getOption('Alabama')!;
    expect(inputElement.getAttribute('aria-activedescendant')).toBe(alabama.id);

    // Press ArrowDown again to move to Alaska
    keydown('ArrowDown');
    tick();
    fixture.detectChanges();

    const alaska = getOption('Alaska')!;
    expect(inputElement.getAttribute('aria-activedescendant')).toBe(alaska.id);
  }));
});

@Component({
  template: `
    <div class="parent">
      <input
        ngCombobox
        #combobox="ngCombobox"
        [(value)]="searchString"
        [(expanded)]="popupExpanded"
        (click)="popupExpanded.set(true)"
      />
      <ng-template ngComboboxPopup [combobox]="combobox">
        <ul ngListbox ngComboboxWidget #listbox="ngListbox" [activeDescendant]="listbox.activeDescendant()" focusMode="activedescendant" selectionMode="explicit">
          @for (option of options(); track option) {
            <li ngOption [value]="option">{{option}}</li>
          }
        </ul>
      </ng-template>
    </div>
  `,
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option],
})
class ComboboxListboxZoneExample {
  popupExpanded = signal(false);
  searchString = signal('');
  value = signal<string[]>([]);
  options = computed(() => ['Alabama', 'Alaska', 'Arizona', 'Arkansas']);
}
