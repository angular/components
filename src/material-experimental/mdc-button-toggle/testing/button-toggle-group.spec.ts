import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonToggleModule} from '../index';
import {MatButtonToggleGroupHarness} from './button-toggle-group-harness';

let fixture: ComponentFixture<ButtonToggleGroupHarnessTest>;
let loader: HarnessLoader;

describe('MatButtonToggleGroup Harness', () => {
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

  it('should load the the toggles inside the group', async () => {
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

  it('should get whether the group is vertical', async () => {
    const group = await loader.getHarness(MatButtonToggleGroupHarness);
    expect(await group.isVertical()).toBe(false);
    // vertical appearance is not implemented yet so for now it is always false
  });
});

@Component({
  template: `
    <mat-button-toggle-group [disabled]="disabled" [vertical]="vertical">
      <button mat-button-toggle value="1">One</button>
      <button mat-button-toggle value="2">Two</button>
    </mat-button-toggle-group>
  `
})
class ButtonToggleGroupHarnessTest {
  disabled = false;
  vertical = false;
}
