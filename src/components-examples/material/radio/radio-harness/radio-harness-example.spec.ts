import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatRadioButtonHarness, MatRadioGroupHarness} from '@angular/material/radio/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {RadioHarnessExample} from './radio-harness-example';

describe('RadioHarnessExample', () => {
  let fixture: ComponentFixture<RadioHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all radio-group harnesses', async () => {
    const groups = await loader.getAllHarnesses(MatRadioGroupHarness);
    expect(groups.length).toBe(1);
  });

  it('should get name of radio-group', async () => {
    const group = await loader.getHarness(MatRadioGroupHarness);
    const name = await group.getName();
    expect(name).toBe('flavors');
  });

  it('should check radio button', async () => {
    const buttons = await loader.getAllHarnesses(MatRadioButtonHarness);
    expect(await buttons[0].isChecked()).toBeTrue();

    await buttons[1].check();
    expect(await buttons[1].isChecked()).toBeTrue();
    expect(await buttons[0].isChecked()).toBeFalse();
  });

  it('should get label text of buttons', async () => {
    const [firstRadio, secondRadio, thirdRadio] =
      await loader.getAllHarnesses(MatRadioButtonHarness);
    expect(await firstRadio.getLabelText()).toBe('Chocolate');
    expect(await secondRadio.getLabelText()).toBe('Vanilla');
    expect(await thirdRadio.getLabelText()).toBe('Strawberry');
  });
});
