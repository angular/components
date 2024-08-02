import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSliderHarness} from '@angular/material/slider/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatSliderModule} from '@angular/material/slider';
import {SliderHarnessExample} from './slider-harness-example';

describe('SliderHarnessExample', () => {
  let fixture: ComponentFixture<SliderHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSliderModule, SliderHarnessExample],
    });
    fixture = TestBed.createComponent(SliderHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slider harnesses', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(sliders.length).toBe(1);
  });

  it('should get value of slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    expect(await thumb.getValue()).toBe(50);
  });

  it('should get percentage of slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    expect(await thumb.getPercentage()).toBe(0.5);
  });

  it('should get max value of slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.getMaxValue()).toBe(100);
  });

  it('should be able to set value of slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    expect(await thumb.getValue()).toBe(50);

    await thumb.setValue(33);

    expect(await thumb.getValue()).toBe(33);
  });
});
