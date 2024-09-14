import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatFormFieldHarness} from '@angular/material/form-field/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {FormFieldHarnessExample} from './form-field-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputHarness} from '@angular/material/input/testing';

describe('FormFieldHarnessExample', () => {
  let fixture: ComponentFixture<FormFieldHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(FormFieldHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be able to load harnesses', async () => {
    const formFields = await loader.getAllHarnesses(MatFormFieldHarness);
    expect(formFields.length).toBe(1);
  });

  it('should be able to get control of form-field', async () => {
    const formField = await loader.getHarness(MatFormFieldHarness);
    expect((await formField.getControl()) instanceof MatInputHarness).toBe(true);
  });

  it('should be able to get error messages and hints of form-field', async () => {
    const formField = await loader.getHarness(MatFormFieldHarness);
    expect(await formField.getTextErrors()).toEqual([]);
    expect(await formField.getTextHints()).toEqual(['Hint']);

    fixture.componentInstance.requiredControl.setValue('');
    await ((await formField.getControl()) as MatInputHarness)?.blur();
    expect(await formField.getTextErrors()).toEqual(['Error']);
    expect(await formField.getTextHints()).toEqual([]);
  });

  it('should be able to check if form field is invalid', async () => {
    const formField = await loader.getHarness(MatFormFieldHarness);
    expect(await formField.isControlValid()).toBe(true);

    fixture.componentInstance.requiredControl.setValue('');
    expect(await formField.isControlValid()).toBe(false);
  });
});
