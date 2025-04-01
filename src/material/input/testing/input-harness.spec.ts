import {Component, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {getSupportedInputTypes} from '@angular/cdk/platform';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputHarness} from './input-harness';

describe('MatInputHarness', () => {
  let fixture: ComponentFixture<InputHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatInputModule, FormsModule, InputHarnessTest],
    });

    fixture = TestBed.createComponent(InputHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all input harnesses', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
  });

  it('should load input with specific id', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness.with({selector: '#myTextarea'}));
    expect(inputs.length).toBe(1);
  });

  it('should load input with specific name', async () => {
    const inputs = await loader.getAllHarnesses(
      MatInputHarness.with({selector: '[name="favorite-food"]'}),
    );
    expect(inputs.length).toBe(1);
  });

  it('should load input with a specific value', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness.with({value: 'Sushi'}));
    expect(inputs.length).toBe(1);
  });

  it('should load input with a value that matches a regex', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness.with({value: /shi$/}));
    expect(inputs.length).toBe(1);
    expect(await inputs[0].getValue()).toBe('Sushi');
  });

  it('should load input with a specific placeholder', async () => {
    const inputs = await loader.getAllHarnesses(
      MatInputHarness.with({placeholder: 'Favorite food'}),
    );
    expect(inputs.length).toBe(1);
  });

  it('should load input with a placeholder that matches a regex', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness.with({placeholder: / food$/}));
    expect(inputs.length).toBe(1);
    expect(await inputs[0].getPlaceholder()).toBe('Favorite food');
  });

  it('should be able to get id of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getId()).toMatch(/mat-input-\w+\d+/);
    expect(await inputs[1].getId()).toMatch(/mat-input-\w+\d+/);
    expect(await inputs[2].getId()).toBe('myTextarea');
    expect(await inputs[3].getId()).toBe('nativeControl');
    expect(await inputs[4].getId()).toMatch(/mat-input-\w+\d+/);
    expect(await inputs[5].getId()).toBe('has-ng-model');
  });

  it('should be able to get name of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getName()).toBe('favorite-food');
    expect(await inputs[1].getName()).toBe('');
    expect(await inputs[2].getName()).toBe('');
    expect(await inputs[3].getName()).toBe('');
    expect(await inputs[4].getName()).toBe('');
    expect(await inputs[5].getName()).toBe('has-ng-model');
  });

  it('should be able to get value of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getValue()).toBe('Sushi');
    expect(await inputs[1].getValue()).toBe('');
    expect(await inputs[2].getValue()).toBe('');
    expect(await inputs[3].getValue()).toBe('');
    expect(await inputs[4].getValue()).toBe('');
    expect(await inputs[5].getValue()).toBe('');
  });

  it('should be able to set value of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getValue()).toBe('Sushi');
    expect(await inputs[1].getValue()).toBe('');
    expect(await inputs[3].getValue()).toBe('');
    expect(await inputs[4].getValue()).toBe('');

    await inputs[0].setValue('');
    await inputs[2].setValue('new-value');
    await inputs[3].setValue('new-value');
    await inputs[4].setValue('new-value');

    expect(await inputs[0].getValue()).toBe('');
    expect(await inputs[2].getValue()).toBe('new-value');
    expect(await inputs[3].getValue()).toBe('new-value');
    expect(await inputs[4].getValue()).toBe('new-value');
  });

  it('should be able to get disabled state', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);

    expect(await inputs[0].isDisabled()).toBe(false);
    expect(await inputs[1].isDisabled()).toBe(false);
    expect(await inputs[2].isDisabled()).toBe(false);
    expect(await inputs[3].isDisabled()).toBe(false);
    expect(await inputs[4].isDisabled()).toBe(false);
    expect(await inputs[5].isDisabled()).toBe(false);

    fixture.componentInstance.disabled.set(true);

    expect(await inputs[1].isDisabled()).toBe(true);
  });

  it('should be able to get readonly state', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);

    expect(await inputs[0].isReadonly()).toBe(false);
    expect(await inputs[1].isReadonly()).toBe(false);
    expect(await inputs[2].isReadonly()).toBe(false);
    expect(await inputs[3].isReadonly()).toBe(false);
    expect(await inputs[4].isReadonly()).toBe(false);
    expect(await inputs[5].isReadonly()).toBe(false);

    fixture.componentInstance.readonly.set(true);

    expect(await inputs[1].isReadonly()).toBe(true);
  });

  it('should be able to get required state', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);

    expect(await inputs[0].isRequired()).toBe(false);
    expect(await inputs[1].isRequired()).toBe(false);
    expect(await inputs[2].isRequired()).toBe(false);
    expect(await inputs[3].isRequired()).toBe(false);
    expect(await inputs[4].isRequired()).toBe(false);
    expect(await inputs[5].isRequired()).toBe(false);

    fixture.componentInstance.required.set(true);

    expect(await inputs[1].isRequired()).toBe(true);
  });

  it('should be able to get placeholder of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getPlaceholder()).toBe('Favorite food');
    expect(await inputs[1].getPlaceholder()).toBe('');
    expect(await inputs[2].getPlaceholder()).toBe('Leave a comment');
    expect(await inputs[3].getPlaceholder()).toBe('Native control');
    expect(await inputs[4].getPlaceholder()).toBe('');
    expect(await inputs[5].getPlaceholder()).toBe('');
  });

  it('should be able to get type of input', async () => {
    const inputs = await loader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBe(7);
    expect(await inputs[0].getType()).toBe('text');
    expect(await inputs[1].getType()).toBe('number');
    expect(await inputs[2].getType()).toBe('textarea');
    expect(await inputs[3].getType()).toBe('text');
    expect(await inputs[4].getType()).toBe('textarea');
    expect(await inputs[5].getType()).toBe('text');

    fixture.componentInstance.inputType.set('text');

    expect(await inputs[1].getType()).toBe('text');
  });

  it('should be able to focus input', async () => {
    const input = await loader.getHarness(
      MatInputHarness.with({selector: '[name="favorite-food"]'}),
    );
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
  });

  it('should be able to blur input', async () => {
    const input = await loader.getHarness(
      MatInputHarness.with({selector: '[name="favorite-food"]'}),
    );
    expect(await input.isFocused()).toBe(false);
    await input.focus();
    expect(await input.isFocused()).toBe(true);
    await input.blur();
    expect(await input.isFocused()).toBe(false);
  });

  it('should be able to set the value of a control that cannot be typed in', async () => {
    // We can't test this against browsers that don't support color inputs.
    if (!getSupportedInputTypes().has('color')) {
      return;
    }

    const input = await loader.getHarness(MatInputHarness.with({selector: '#colorControl'}));
    expect(await input.getValue()).toBe('#000000'); // Color inputs default to black.
    await input.setValue('#00ff00');
    expect((await input.getValue()).toLowerCase()).toBe('#00ff00');
  });

  it('should be able to get disabled state when disabledInteractive is enabled', async () => {
    const input = (await loader.getAllHarnesses(MatInputHarness))[1];

    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.disabledInteractive.set(true);
    expect(await input.isDisabled()).toBe(false);

    fixture.componentInstance.disabled.set(true);
    expect(await input.isDisabled()).toBe(true);
  });
});

@Component({
  template: `
    <mat-form-field>
      <input matInput placeholder="Favorite food" value="Sushi" name="favorite-food">
    </mat-form-field>

    <mat-form-field>
      <input
        matInput
        [type]="inputType()"
        [readonly]="readonly()"
        [disabled]="disabled()"
        [disabledInteractive]="disabledInteractive()"
        [required]="required()">
    </mat-form-field>

    <mat-form-field>
      <textarea id="myTextarea" matInput placeholder="Leave a comment"></textarea>
    </mat-form-field>

    <mat-form-field>
      <input matNativeControl placeholder="Native control" id="nativeControl">
    </mat-form-field>

    <mat-form-field>
      <textarea matNativeControl></textarea>
    </mat-form-field>

    <mat-form-field>
      <!--
        Select native controls should not be handled as part of the input harness. We add this
        to assert that the harness does not accidentally match it.
      -->
      <select matNativeControl>
        <option value="first">First</option>
      </select>
    </mat-form-field>

    <mat-form-field>
      <input [(ngModel)]="ngModelValue" [name]="ngModelName" id="has-ng-model" matNativeControl>
    </mat-form-field>

    <mat-form-field>
      <input matNativeControl placeholder="Color control" id="colorControl" type="color">
    </mat-form-field>
  `,
  imports: [MatInputModule, FormsModule],
})
class InputHarnessTest {
  inputType = signal('number');
  readonly = signal(false);
  disabled = signal(false);
  disabledInteractive = signal(false);
  required = signal(false);
  ngModelValue = '';
  ngModelName = 'has-ng-model';
}
