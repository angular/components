import {Component} from '@angular/core';
import {ComponentHarness, HarnessLoader} from '@angular/cdk/testing';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatToolbarHarness, MatToolbarSection} from '@angular/material/toolbar/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

describe('MatToolbarHarness', () => {
  let fixture: ComponentFixture<ToolbarHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatToolbarModule, ToolbarHarnessTest],
    });

    fixture = TestBed.createComponent(ToolbarHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find all toolbars', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness);

    expect(toolbars.length).toBe(2);
  });

  it('should find toolbar with text', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness.with({text: 'My App'}));

    expect(toolbars.length).toBe(1);
    expect(await toolbars[0].hasMultipleRows()).toBeFalse();
  });

  it('should find toolbar with regex', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness.with({text: /Row/}));

    expect(toolbars.length).toBe(1);
    expect(await toolbars[0].hasMultipleRows()).toBeTrue();
  });

  it('should get toolbar text', async () => {
    const toolbars = await loader.getAllHarnesses(MatToolbarHarness);

    expect(await toolbars[0].getRowsAsText()).toEqual(['My App']);
    expect(await toolbars[1].getRowsAsText()).toEqual(['Row 1', 'Row 2 Button 1  Button 2']);
  });

  it('should get harness loaders for toolbar row', async () => {
    const toolbar = await loader.getHarness(MatToolbarHarness.with({text: /Button/}));
    const rowLoaders = await toolbar.getAllChildLoaders(MatToolbarSection.ROW);
    const row1 = rowLoaders[0] as HarnessLoader;
    const row1Subcomponents = await row1.getAllHarnesses(DummyHarness);
    const row2 = rowLoaders[1] as HarnessLoader;
    const row2Subcomponents = await row2.getAllHarnesses(DummyHarness);

    expect(row1Subcomponents.length).toBe(1);
    expect(row2Subcomponents.length).toBe(3);
  });
});

@Component({
  template: `
    <mat-toolbar><span>My App</span></mat-toolbar>
    <mat-toolbar>
      <mat-toolbar-row><span>Row 1</span></mat-toolbar-row>
      <mat-toolbar-row><span>Row 2</span>
        <button mat-button>
          Button 1
        </button>
        <button mat-button>
          Button 2
        </button>
      </mat-toolbar-row>
    </mat-toolbar>
  `,
  imports: [MatToolbarModule],
})
class ToolbarHarnessTest {}

class DummyHarness extends ComponentHarness {
  static hostSelector = 'span, button';
}
