import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonToggleModule, MatButtonToggleAppearance} from '@angular/material/button-toggle';
import {MatButtonToggleGroupHarness} from './button-toggle-group-harness';

describe('MatButtonToggleGroupHarness', () => {
  let fixture: ComponentFixture<ButtonToggleGroupHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatButtonToggleModule],
      declarations: [ButtonToggleGroupHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonToggleGroupHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all button toggle group harnesses', async () => {
    const groups = await loader.getAllHarnesses(MatButtonToggleGroupHarness);
    expect(groups.length).toBe(1);
  });

  it('should load the toggles inside the group', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    const toggles = await group.getToggles();
    expect(toggles.length).toBe(2);
  });

  it('should get whether the group is disabled', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.isDisabled()).toBe(false);
    fixture.componentInstance.disabled = true;
    expect(await group.isDisabled()).toBe(true);
  });

  it('should filter by whether the group is disabled', async () => {
    let enabledGroups = await loader.getAllHarnesses(
      MatButtonToggleGroupHarness.with({disabled: false}),
    );
    let disabledGroups = await loader.getAllHarnesses(
      MatButtonToggleGroupHarness.with({disabled: true}),
    );
    expect(enabledGroups.length).toBe(1);
    expect(disabledGroups.length).toBe(0);

    fixture.componentInstance.disabled = true;

    enabledGroups = await loader.getAllHarnesses(
      MatButtonToggleGroupHarness.with({disabled: false}),
    );
    disabledGroups = await loader.getAllHarnesses(
      MatButtonToggleGroupHarness.with({disabled: true}),
    );
    expect(enabledGroups.length).toBe(0);
    expect(disabledGroups.length).toBe(1);
  });

  it('should get whether the group is vertical', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.isVertical()).toBe(false);
    fixture.componentInstance.vertical = true;
    expect(await group.isVertical()).toBe(true);
  });

  it('should get whether the group appearance', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.getAppearance()).toBe('standard');
    fixture.componentInstance.appearance = 'legacy';
    expect(await group.getAppearance()).toBe('legacy');
  });
});

@Component({
  template: `
    <mat-button-toggle-group [disabled]="disabled" [vertical]="vertical" [appearance]="appearance">
      <mat-button-toggle value="1">One</mat-button-toggle>
      <mat-button-toggle value="2">Two</mat-button-toggle>
    </mat-button-toggle-group>
  `,
})
class ButtonToggleGroupHarnessTest {
  disabled = false;
  vertical = false;
  appearance: MatButtonToggleAppearance = 'standard';
}
