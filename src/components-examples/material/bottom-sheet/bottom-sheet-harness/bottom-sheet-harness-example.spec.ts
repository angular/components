import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatBottomSheetHarness} from '@angular/material/bottom-sheet/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {BottomSheetHarnessExample} from './bottom-sheet-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';

describe('BottomSheetHarnessExample', () => {
  let fixture: ComponentFixture<BottomSheetHarnessExample>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatBottomSheetModule, NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(BottomSheetHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should load harness for a bottom sheet', async () => {
    fixture.componentInstance.open();
    const bottomSheets = await loader.getAllHarnesses(MatBottomSheetHarness);
    expect(bottomSheets.length).toBe(1);
  });

  it('should be able to get aria-label of the bottom sheet', async () => {
    fixture.componentInstance.open({ariaLabel: 'Confirm purchase.'});
    const bottomSheet = await loader.getHarness(MatBottomSheetHarness);
    expect(await bottomSheet.getAriaLabel()).toBe('Confirm purchase.');
  });

  it('should be able to dismiss the bottom sheet', async () => {
    fixture.componentInstance.open();
    let bottomSheets = await loader.getAllHarnesses(MatBottomSheetHarness);

    expect(bottomSheets.length).toBe(1);
    await bottomSheets[0].dismiss();

    bottomSheets = await loader.getAllHarnesses(MatBottomSheetHarness);
    expect(bottomSheets.length).toBe(0);
  });
});
