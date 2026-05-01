/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

import {ListboxHarness, ListboxOptionHarness} from './listbox-harness';
import {Listbox, Option} from '../index';

describe('Listbox Harness', () => {
  let fixture: any;
  let loader: any;

  @Component({
    imports: [Listbox, Option],
    template: `
      <ul ngListbox [disabled]="false" [multi]="true" orientation="horizontal">
        <li ngOption [value]="1" label="Apple" aria-selected="true">Apple</li>
        <li ngOption [value]="2" label="Banana">Banana</li>
        <div class="test-item">Inside Listbox</div>
      </ul>
    `,
  })
  class ListboxHarnessTestComponent {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListboxHarnessTestComponent],
    });
    fixture = TestBed.createComponent(ListboxHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('finds the listbox container harness', async () => {
    const listbox = await loader.getHarness(ListboxHarness);
    expect(listbox).toBeTruthy();
  });

  it('returns all options scoped within the listbox', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    const options = await listbox.getOptions();

    expect(options.length).toBe(2);
  });

  it('filters options by exact text content', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    const options = await listbox.getOptions({text: 'Apple'});

    expect(options.length).toBe(1);
  });

  it('reports the disabled state of the listbox', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    const isDisabled = await listbox.isDisabled();

    expect(isDisabled).toBeFalse();
  });

  it('reports the multi-selectable state of the listbox', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    const isMulti = await listbox.isMulti();

    expect(isMulti).toBeTrue();
  });

  it('reports the orientation of the listbox', async () => {
    const listbox = await loader.getHarness(ListboxHarness);

    const orientation = await listbox.getOrientation();

    expect(orientation).toBe('horizontal');
  });

  it('gets the active descendant ID', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ListboxActiveDescendantTestComponent],
    });
    const customFixture = TestBed.createComponent(ListboxActiveDescendantTestComponent);
    customFixture.detectChanges();
    const customLoader = TestbedHarnessEnvironment.loader(customFixture);

    const listbox = await customLoader.getHarness(ListboxHarness);
    const options = await listbox.getOptions();

    await options[0].click();
    expect(await listbox.getActiveDescendantId()).toBe('apple-id');
  });

  it('clicks an option inside the listbox', async () => {
    const option = await loader.getHarness(ListboxOptionHarness.with({text: 'Apple'}));

    await option.click();

    expect(await option.isSelected()).toBeTrue();
  });
});

@Component({
  imports: [Listbox, Option],
  template: `
    <ul ngListbox focusMode="activedescendant">
      <li ngOption [value]="1" id="apple-id">Apple</li>
      <li ngOption [value]="2" id="banana-id">Banana</li>
    </ul>
  `,
})
class ListboxActiveDescendantTestComponent {}
