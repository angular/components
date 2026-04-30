import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Toolbar} from '../toolbar';
import {ToolbarWidget} from '../toolbar-widget';
import {ToolbarWidgetGroup} from '../toolbar-widget-group';
import {ToolbarHarness} from './toolbar-harness';
import {ToolbarWidgetGroupHarness} from './toolbar-widget-group-harness';
import {ToolbarWidgetHarness} from './toolbar-widget-harness';

describe('ToolbarHarness', () => {
  let fixture: ComponentFixture<ToolbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should be able to load toolbar harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(ToolbarHarness);
    expect(harnesses.length).toBe(1);
  });

  it('should be able to load toolbar widget group harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(ToolbarWidgetGroupHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should be able to load toolbar widget harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(ToolbarWidgetHarness);
    expect(harnesses.length).toBe(8);
  });

  it('should be able to get the widgets in a toolbar', async () => {
    const toolbar = await loader.getHarness(ToolbarHarness);
    const widgets = await toolbar.getWidgets();
    expect(widgets.length).toBe(8);
  });

  it('should be able to get the widget groups in a toolbar', async () => {
    const toolbar = await loader.getHarness(ToolbarHarness);
    const groups = await toolbar.getWidgetGroups();
    expect(groups.length).toBe(2);
  });

  it('should be able to get the toolbar orientation', async () => {
    const toolbar = await loader.getHarness(ToolbarHarness);
    expect(await toolbar.getOrientation()).toBe('horizontal');

    fixture.componentInstance.orientation.set('vertical');
    expect(await toolbar.getOrientation()).toBe('vertical');
  });

  it('should be able to get whether the toolbar is disabled', async () => {
    const toolbar = await loader.getHarness(ToolbarHarness);
    expect(await toolbar.isDisabled()).toBe(false);

    fixture.componentInstance.toolbarDisabled.set(true);
    expect(await toolbar.isDisabled()).toBe(true);
  });

  it('should be able to get the widgets in a widget group', async () => {
    const group = await loader.getHarness(ToolbarWidgetGroupHarness);
    const widgets = await group.getWidgets();
    expect(widgets.length).toBe(3);
  });

  it('should be able to load a widget harness by text', async () => {
    const harnesses = await loader.getAllHarnesses(ToolbarWidgetHarness.with({text: /^Align/}));
    expect(harnesses.length).toBe(3);
    expect(await parallel(() => harnesses.map(harness => harness.getText()))).toEqual([
      'Align left',
      'Align center',
      'Align right',
    ]);
  });

  it('should be able to toggle the active state of a widget', async () => {
    const widget = await loader.getHarness(ToolbarWidgetHarness.with({text: 'Align left'}));
    expect(await widget.isActive()).toBe(false);

    await widget.click();
    expect(await widget.isActive()).toBe(true);
  });

  it('should be able to get whether a widget is disabled', async () => {
    const widget = await loader.getHarness(ToolbarWidgetHarness.with({text: 'Undo'}));
    expect(await widget.isDisabled()).toBe(false);

    fixture.componentInstance.undoDisabled.set(true);
    expect(await widget.isDisabled()).toBe(true);
  });

  it('should be able to get whether a widget is selected', async () => {
    const widget = await loader.getHarness(ToolbarWidgetHarness.with({text: 'Undo'}));
    expect(await widget.isSelected()).toBe(false);

    await widget.click();
    expect(await widget.isSelected()).toBe(true);
  });
});

@Component({
  template: `
    <div ngToolbar [orientation]="orientation()" [disabled]="toolbarDisabled()">
      <button ngToolbarWidget #u="ngToolbarWidget" value="undo" [disabled]="undoDisabled()" [aria-pressed]="u.selected()">Undo</button>
      <button ngToolbarWidget value="redo">Redo</button>

      <div ngToolbarWidgetGroup>
        <button ngToolbarWidget value="bold">Bold</button>
        <button ngToolbarWidget value="italic">Italic</button>
        <button ngToolbarWidget value="underlined">Underlined</button>
      </div>

      <div ngToolbarWidgetGroup>
        <button ngToolbarWidget value="aling-left">Align left</button>
        <button ngToolbarWidget value="aling-center">Align center</button>
        <button ngToolbarWidget value="aling-right">Align right</button>
      </div>
    </div>
  `,
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup],
})
class ToolbarHarnessTest {
  orientation = signal<'vertical' | 'horizontal'>('horizontal');
  toolbarDisabled = signal(false);
  undoDisabled = signal(false);
}
