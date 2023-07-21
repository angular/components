import {HarnessLoader, TestKey} from '@angular/cdk/testing';
import {COMMA} from '@angular/cdk/keycodes';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChipsModule} from '../index';
import {MatChipInputHarness} from './chip-input-harness';

describe('MatChipInputHarness', () => {
  let fixture: ComponentFixture<ChipInputHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [ChipInputHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipInputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get correct number of chip input harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipInputHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should load chip inputs with disabled state match', async () => {
    const enabledChips = await loader.getAllHarnesses(MatChipInputHarness.with({disabled: false}));
    const disabledChips = await loader.getAllHarnesses(MatChipInputHarness.with({disabled: true}));
    expect(enabledChips.length).toBe(1);
    expect(disabledChips.length).toBe(1);
  });

  it('should get the disabled state', async () => {
    const harnesses = await loader.getAllHarnesses(MatChipInputHarness);
    expect(await harnesses[0].isDisabled()).toBe(false);
    expect(await harnesses[1].isDisabled()).toBe(true);
  });

  it('should get whether the input is required', async () => {
    const harness = await loader.getHarness(MatChipInputHarness);
    expect(await harness.isRequired()).toBe(false);

    fixture.componentInstance.required = true;
    expect(await harness.isRequired()).toBe(true);
  });

  it('should get whether the input placeholder', async () => {
    const harness = await loader.getHarness(MatChipInputHarness);
    expect(await harness.getPlaceholder()).toBe('Placeholder');
  });

  it('should get and set the input value', async () => {
    const harness = await loader.getHarness(MatChipInputHarness);
    expect(await harness.getValue()).toBe('');

    await harness.setValue('value');
    expect(await harness.getValue()).toBe('value');
  });

  it('should control the input focus state', async () => {
    const harness = await loader.getHarness(MatChipInputHarness);
    expect(await harness.isFocused()).toBe(false);

    await harness.focus();
    expect(await harness.isFocused()).toBe(true);

    await harness.blur();
    expect(await harness.isFocused()).toBe(false);
  });

  it('should be able to trigger a separator key', async () => {
    const input = await loader.getHarness(MatChipInputHarness);
    await input.setValue('Hello');
    await input.sendSeparatorKey(TestKey.COMMA);
    expect(fixture.componentInstance.add).toHaveBeenCalled();
  });
});

@Component({
  template: `
    <mat-chip-grid #grid1>
      <input
        [matChipInputFor]="grid1"
        [required]="required"
        placeholder="Placeholder"
        (matChipInputTokenEnd)="add()"
        [matChipInputSeparatorKeyCodes]="separatorKeyCodes"/>
    </mat-chip-grid>

    <mat-chip-grid #grid2>
      <input [matChipInputFor]="grid2" disabled />
    </mat-chip-grid>
  `,
})
class ChipInputHarnessTest {
  required = false;
  add = jasmine.createSpy('add spy');
  separatorKeyCodes = [COMMA];
}
