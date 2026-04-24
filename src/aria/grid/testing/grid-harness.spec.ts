/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

import {GridHarness, GridRowHarness, GridCellHarness} from './grid-harness';
import {Grid, GridRow, GridCell} from '../index';

describe('Grid Harness', () => {
  let fixture: ComponentFixture<GridHarnessTestComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GridHarnessTestComponent],
    });
    fixture = TestBed.createComponent(GridHarnessTestComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('finds the grid harness', async () => {
    await expectAsync(loader.getHarness(GridHarness)).toBeResolved();
  });

  it('returns all rows scoped within the grid', async () => {
    const grid = await loader.getHarness(GridHarness);
    const rows = await grid.getRows();
    expect(rows.length).toBe(2);
  });

  it('returns all cells scoped within the grid', async () => {
    const grid = await loader.getHarness(GridHarness);
    const cells = await grid.getCells();
    expect(cells.length).toBe(4);
  });

  it('returns cells scoped within a row', async () => {
    const rows = await loader.getAllHarnesses(GridRowHarness);
    expect(rows.length).toBe(2);

    const cellsInRow0 = await rows[0].getCells();
    expect(cellsInRow0.length).toBe(2);
    expect(await cellsInRow0[0].getText()).toBe('Cell 1.1');

    const cellsInRow1 = await rows[1].getCells();
    expect(cellsInRow1.length).toBe(2);
    expect(await cellsInRow1[0].getText()).toBe('Cell 2.1');
  });

  it('filters cells by exact text content', async () => {
    const grid = await loader.getHarness(GridHarness);
    const cells = await grid.getCells({text: 'Cell 1.1'});
    expect(cells.length).toBe(1);
  });

  it('reports the disabled state of the grid', async () => {
    const grid = await loader.getHarness(GridHarness);
    const isDisabled = await grid.isDisabled();
    expect(isDisabled).toBeFalse();
  });

  it('reports the multi-selectable state of the grid', async () => {
    const grid = await loader.getHarness(GridHarness);
    const isMulti = await grid.isMultiSelectable();
    expect(isMulti).toBeTrue();
  });

  it('reports the selected state of a cell', async () => {
    const cell = await loader.getHarness(GridCellHarness.with({text: 'Cell 1.1'}));
    expect(await cell.isSelected()).toBeTrue();
  });

  it('reports the disabled state of a cell', async () => {
    const cell = await loader.getHarness(GridCellHarness.with({text: 'Cell 2.2'}));
    expect(await cell.isDisabled()).toBeTrue();
  });

  it('gets the text of cells organized by rows', async () => {
    const grid = await loader.getHarness(GridHarness);
    const text = await grid.getCellTextByIndex();
    expect(text).toEqual([
      ['Cell 1.1', 'Cell 1.2'],
      ['Cell 2.1', 'Cell 2.2'],
    ]);
  });

  it('gets the text of cells in a row', async () => {
    const rows = await loader.getAllHarnesses(GridRowHarness);
    expect(await rows[0].getCellTextByIndex()).toEqual(['Cell 1.1', 'Cell 1.2']);
  });
});

@Component({
  imports: [Grid, GridRow, GridCell],
  template: `
    <table ngGrid [multi]="true" [disabled]="false" [enableSelection]="true">
      <tr ngGridRow>
        <td ngGridCell [selected]="true">Cell 1.1</td>
        <td ngGridCell>Cell 1.2</td>
      </tr>
      <tr ngGridRow>
        <td ngGridCell>Cell 2.1</td>
        <td ngGridCell [disabled]="true">Cell 2.2</td>
      </tr>
    </table>
  `,
})
class GridHarnessTestComponent {}
