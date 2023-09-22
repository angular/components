import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatNativeSelectHarness} from './native-select-harness';

describe('MatNativeSelectHarness', () => {
  let fixture: ComponentFixture<SelectHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatInputModule, FormsModule],
      declarations: [SelectHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all select harnesses', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    expect(selects.length).toBe(2);
  });

  it('should get the id of a select', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    expect(await parallel(() => selects.map(select => select.getId()))).toEqual(['food', 'drink']);
  });

  it('should get the name of a select', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);

    expect(await parallel(() => selects.map(select => select.getName()))).toEqual([
      'favorite-food',
      'favorite-drink',
    ]);
  });

  it('should get whether a select is disabled', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    expect(
      await parallel(() => {
        return selects.map(select => select.isDisabled());
      }),
    ).toEqual([false, false]);

    fixture.componentInstance.favoriteDrinkDisabled = true;
    expect(await parallel(() => selects.map(select => select.isDisabled()))).toEqual([false, true]);
  });

  it('should get whether the select is in multi-selection mode', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    expect(await parallel(() => selects.map(select => select.isMultiple()))).toEqual([false, true]);
  });

  it('should get whether a select is required', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    expect(
      await parallel(() => {
        return selects.map(select => select.isRequired());
      }),
    ).toEqual([false, false]);

    fixture.componentInstance.favoriteFoodRequired = true;
    expect(await parallel(() => selects.map(select => select.isRequired()))).toEqual([true, false]);
  });

  it('should be able to focus a select', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    expect(await select.isFocused()).toBe(false);
    await select.focus();
    expect(await select.isFocused()).toBe(true);
  });

  it('should be able to blur a select', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    expect(await select.isFocused()).toBe(false);
    await select.focus();
    expect(await select.isFocused()).toBe(true);
    await select.blur();
    expect(await select.isFocused()).toBe(false);
  });

  it('should get the options of a select', async () => {
    const selects = await loader.getAllHarnesses(MatNativeSelectHarness);
    const options = await parallel(() => selects.map(select => select.getOptions()));

    expect(options.length).toBe(2);
    expect(options[0].length).toBe(3);
    expect(options[1].length).toBe(4);
  });

  it('should select an option inside of a single-selection select', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    expect(fixture.componentInstance.favoriteFood).toBeFalsy();

    await select.selectOptions({text: 'Ramen'});
    expect(fixture.componentInstance.favoriteFood).toBe('ramen');
  });

  it('should select an option inside of a multi-selection select', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#drink'}));
    expect(fixture.componentInstance.favoriteDrink).toEqual([]);

    await select.selectOptions({text: /Water|Juice/});
    expect(fixture.componentInstance.favoriteDrink).toEqual(['water', 'juice']);
  });

  it('should get the text of select options', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#drink'}));
    const options = await select.getOptions();

    expect(await parallel(() => options.map(option => option.getText()))).toEqual([
      'Water',
      'Soda',
      'Coffee',
      'Juice',
    ]);
  });

  it('should get the index of select options', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    const options = await select.getOptions();

    expect(await parallel(() => options.map(option => option.getIndex()))).toEqual([0, 1, 2]);
  });

  it('should get the disabled state of select options', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    const options = await select.getOptions();

    expect(await parallel(() => options.map(option => option.isDisabled()))).toEqual([
      false,
      false,
      false,
    ]);

    fixture.componentInstance.pastaDisabled = true;

    expect(await parallel(() => options.map(option => option.isDisabled()))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('should get the selected state of an option in a single-selection list', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#food'}));
    const options = await select.getOptions();

    expect(await parallel(() => options.map(option => option.isSelected()))).toEqual([
      false,
      false,
      false,
    ]);

    await select.selectOptions({index: 2});

    expect(await parallel(() => options.map(option => option.isSelected()))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('should get the selected state of an option in a multi-selection list', async () => {
    const select = await loader.getHarness(MatNativeSelectHarness.with({selector: '#drink'}));
    const options = await select.getOptions();

    expect(await parallel(() => options.map(option => option.isSelected()))).toEqual([
      false,
      false,
      false,
      false,
    ]);

    await select.selectOptions({text: /Water|Coffee/});

    expect(await parallel(() => options.map(option => option.isSelected()))).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });
});

@Component({
  template: `
    <mat-form-field>
      <select
        id="food"
        matNativeControl
        name="favorite-food"
        [(ngModel)]="favoriteFood"
        [required]="favoriteFoodRequired">
        <option value="pizza">Pizza</option>
        <option value="pasta" [disabled]="pastaDisabled">Pasta</option>
        <option value="ramen">Ramen</option>
      </select>
    </mat-form-field>

    <mat-form-field>
      <select
        id="drink"
        matNativeControl
        name="favorite-drink"
        [(ngModel)]="favoriteDrink"
        [disabled]="favoriteDrinkDisabled"
        multiple>
        <option value="water">Water</option>
        <option value="soda">Soda</option>
        <option value="coffee">Coffee</option>
        <option value="juice">Juice</option>
      </select>
    </mat-form-field>
  `,
})
class SelectHarnessTest {
  favoriteFood: string;
  favoriteDrink: string[] = [];
  favoriteFoodRequired = false;
  favoriteDrinkDisabled = false;
  pastaDisabled = false;
}
