import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatRadioButtonHarness, MatRadioGroupHarness} from './radio-harness';

describe('radio harness', () => {
  let fixture: ComponentFixture<MultipleRadioButtonsHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatRadioModule, ReactiveFormsModule, MultipleRadioButtonsHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(MultipleRadioButtonsHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe('MatRadioGroupHarness', () => {
    it('should load all radio-group harnesses', async () => {
      const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(groups.length).toBe(3);
    });

    it('should load radio-group with exact id', async () => {
      const groups = await loader.getAllHarnesses(
        MatRadioGroupHarness.with({selector: '#my-group-2'}),
      );
      expect(groups.length).toBe(1);
    });

    it('should load radio-group by name', async () => {
      let groups = await loader.getAllHarnesses(
        MatRadioGroupHarness.with({name: 'my-group-2-name'}),
      );
      expect(groups.length).toBe(1);
      expect(await groups[0].getId()).toBe('my-group-2');

      groups = await loader.getAllHarnesses(MatRadioGroupHarness.with({name: 'my-group-1-name'}));
      expect(groups.length).toBe(1);
      expect(await groups[0].getId()).toBe('my-group-1');
    });

    it(
      'should throw when finding radio-group with specific name that has mismatched ' +
        'radio-button names',
      async () => {
        fixture.componentInstance.thirdGroupButtonName = 'other-name';
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        await expectAsync(
          loader.getAllHarnesses(MatRadioGroupHarness.with({name: 'third-group-name'})),
        ).toBeRejectedWithError(
          /locator found a radio-group with name "third-group-name".*have mismatching names/,
        );
      },
    );

    it('should get name of radio-group', async () => {
      const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(groups.length).toBe(3);
      expect(await groups[0].getName()).toBe('my-group-1-name');
      expect(await groups[1].getName()).toBe('my-group-2-name');
      expect(await groups[2].getName()).toBe('third-group-name');

      fixture.componentInstance.secondGroupId = 'new-group';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await groups[1].getName()).toBe('new-group-name');

      fixture.componentInstance.thirdGroupButtonName = 'other-button-name';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      await expectAsync(groups[2].getName()).toBeRejectedWithError(
        /Radio buttons in radio-group have mismatching names./,
      );
    });

    it('should get id of radio-group', async () => {
      const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(groups.length).toBe(3);
      expect(await groups[0].getId()).toBe('my-group-1');
      expect(await groups[1].getId()).toBe('my-group-2');
      expect(await groups[2].getId()).toBe('');

      fixture.componentInstance.secondGroupId = 'new-group-name';
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await groups[1].getId()).toBe('new-group-name');
    });

    it('should get checked value of radio-group', async () => {
      const [firstGroup, secondGroup] = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(await firstGroup.getCheckedValue()).toBe('opt2');
      expect(await secondGroup.getCheckedValue()).toBe(null);
    });

    it('should get radio-button harnesses of radio-group', async () => {
      const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(groups.length).toBe(3);

      expect((await groups[0].getRadioButtons()).length).toBe(3);
      expect((await groups[1].getRadioButtons()).length).toBe(1);
      expect((await groups[2].getRadioButtons()).length).toBe(2);
    });

    it('should get radio buttons from group with filter', async () => {
      const group = await loader.getHarness(MatRadioGroupHarness.with({name: 'my-group-1-name'}));
      expect((await group.getRadioButtons({label: 'opt2'})).length).toBe(1);
    });

    it('should get checked radio-button harnesses of radio-group', async () => {
      const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
      expect(groups.length).toBe(3);

      const groupOneChecked = await groups[0].getCheckedRadioButton();
      const groupTwoChecked = await groups[1].getCheckedRadioButton();
      const groupThreeChecked = await groups[2].getCheckedRadioButton();

      expect(groupOneChecked).not.toBeNull();
      expect(groupTwoChecked).toBeNull();
      expect(groupThreeChecked).toBeNull();
      expect(await groupOneChecked!.getId()).toBe('opt2-group-one');
    });

    it('should check radio button in group', async () => {
      const group = await loader.getHarness(MatRadioGroupHarness.with({name: 'my-group-1-name'}));
      expect(await group.getCheckedValue()).toBe('opt2');
      await group.checkRadioButton({label: 'opt3'});
      expect(await group.getCheckedValue()).toBe('opt3');
    });

    it('should throw error when checking invalid radio button', async () => {
      const group = await loader.getHarness(MatRadioGroupHarness.with({name: 'my-group-1-name'}));
      await expectAsync(group.checkRadioButton({label: 'opt4'})).toBeRejectedWithError(
        /Could not find radio button matching {"label":"opt4"}/,
      );
    });
  });

  describe('MatRadioButtonHarness', () => {
    it('should load all radio-button harnesses', async () => {
      const radios = await loader.getAllHarnesses(MatRadioButtonHarness);
      expect(radios.length).toBe(9);
    });

    it('should load radio-button with exact label', async () => {
      const radios = await loader.getAllHarnesses(MatRadioButtonHarness.with({label: 'Option #2'}));
      expect(radios.length).toBe(1);
      expect(await radios[0].getId()).toBe('opt2');
      expect(await radios[0].getLabelText()).toBe('Option #2');
    });

    it('should load radio-button with regex label match', async () => {
      const radios = await loader.getAllHarnesses(MatRadioButtonHarness.with({label: /#3$/i}));
      expect(radios.length).toBe(1);
      expect(await radios[0].getId()).toBe('opt3');
      expect(await radios[0].getLabelText()).toBe('Option #3');
    });

    it('should load radio-button with id', async () => {
      const radios = await loader.getAllHarnesses(MatRadioButtonHarness.with({selector: '#opt3'}));
      expect(radios.length).toBe(1);
      expect(await radios[0].getId()).toBe('opt3');
      expect(await radios[0].getLabelText()).toBe('Option #3');
    });

    it('should load radio-buttons with same name', async () => {
      const radios = await loader.getAllHarnesses(MatRadioButtonHarness.with({name: 'group1'}));
      expect(radios.length).toBe(2);

      expect(await radios[0].getId()).toBe('opt1');
      expect(await radios[1].getId()).toBe('opt2');
    });

    it('should get checked state', async () => {
      const [uncheckedRadio, checkedRadio] = await loader.getAllHarnesses(MatRadioButtonHarness);
      expect(await uncheckedRadio.isChecked()).toBe(false);
      expect(await checkedRadio.isChecked()).toBe(true);
    });

    it('should get label text', async () => {
      const [firstRadio, secondRadio, thirdRadio] =
        await loader.getAllHarnesses(MatRadioButtonHarness);
      expect(await firstRadio.getLabelText()).toBe('Option #1');
      expect(await secondRadio.getLabelText()).toBe('Option #2');
      expect(await thirdRadio.getLabelText()).toBe('Option #3');
    });

    it('should get value', async () => {
      const [firstRadio, secondRadio, thirdRadio] =
        await loader.getAllHarnesses(MatRadioButtonHarness);
      expect(await firstRadio.getValue()).toBe('opt1');
      expect(await secondRadio.getValue()).toBe('opt2');
      expect(await thirdRadio.getValue()).toBe('opt3');
    });

    it('should get disabled state', async () => {
      const [firstRadio] = await loader.getAllHarnesses(MatRadioButtonHarness);
      expect(await firstRadio.isDisabled()).toBe(false);

      fixture.componentInstance.disableAll = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await firstRadio.isDisabled()).toBe(true);
    });

    it('should focus radio-button', async () => {
      const radioButton = await loader.getHarness(MatRadioButtonHarness.with({selector: '#opt2'}));
      expect(await radioButton.isFocused()).toBe(false);
      await radioButton.focus();
      expect(await radioButton.isFocused()).toBe(true);
    });

    it('should blur radio-button', async () => {
      const radioButton = await loader.getHarness(MatRadioButtonHarness.with({selector: '#opt2'}));
      await radioButton.focus();
      expect(await radioButton.isFocused()).toBe(true);
      await radioButton.blur();
      expect(await radioButton.isFocused()).toBe(false);
    });

    it('should check radio-button', async () => {
      const [uncheckedRadio, checkedRadio] = await loader.getAllHarnesses(MatRadioButtonHarness);
      await uncheckedRadio.check();
      expect(await uncheckedRadio.isChecked()).toBe(true);
      // Checked radio state should change since the two radio's
      // have the same name and only one can be checked.
      expect(await checkedRadio.isChecked()).toBe(false);
    });

    it('should not be able to check disabled radio-button', async () => {
      fixture.componentInstance.disableAll = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      const radioButton = await loader.getHarness(MatRadioButtonHarness.with({selector: '#opt3'}));
      expect(await radioButton.isChecked()).toBe(false);
      await radioButton.check();
      expect(await radioButton.isChecked()).toBe(false);

      fixture.componentInstance.disableAll = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(await radioButton.isChecked()).toBe(false);
      await radioButton.check();
      expect(await radioButton.isChecked()).toBe(true);
    });

    it('should get required state', async () => {
      const radioButton = await loader.getHarness(
        MatRadioButtonHarness.with({selector: '#required-radio'}),
      );
      expect(await radioButton.isRequired()).toBe(true);
    });
  });
});

@Component({
  template: `
    @for (value of values; track value) {
      <mat-radio-button
        [name]="value === 'opt3' ? 'group2' : 'group1'"
        [disabled]="disableAll"
        [checked]="value === 'opt2'"
        [id]="value"
        [required]="value === 'opt2'"
        [value]="value">
        Option #{{$index + 1}}
      </mat-radio-button>
    }

    <mat-radio-group id="my-group-1" name="my-group-1-name">
      @for (value of values; track value) {
        <mat-radio-button
          [checked]="value === 'opt2'"
          [value]="value"
          [id]="value + '-group-one'">{{value}}</mat-radio-button>
      }
    </mat-radio-group>


    <mat-radio-group [id]="secondGroupId" [name]="secondGroupId + '-name'">
      <mat-radio-button id="required-radio" required [value]="true">
        Accept terms of conditions
      </mat-radio-button>
    </mat-radio-group>

    <mat-radio-group [name]="thirdGroupName">
      <mat-radio-button [value]="true">First</mat-radio-button>
      <mat-radio-button [value]="false" [name]="thirdGroupButtonName"></mat-radio-button>
    </mat-radio-group>
  `,
  standalone: true,
  imports: [MatRadioModule, ReactiveFormsModule],
})
class MultipleRadioButtonsHarnessTest {
  values = ['opt1', 'opt2', 'opt3'];
  disableAll = false;
  secondGroupId = 'my-group-2';
  thirdGroupName: string = 'third-group-name';
  thirdGroupButtonName: string | undefined = undefined;
}
