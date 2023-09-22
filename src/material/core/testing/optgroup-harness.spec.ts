import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatOptionModule} from '@angular/material/core';
import {MatOptgroupHarness} from './optgroup-harness';

describe('MatOptgroupHarness', () => {
  let fixture: ComponentFixture<OptgroupHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatOptionModule],
      declarations: [OptgroupHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(OptgroupHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all option group harnesses', async () => {
    const groups = await loader.getAllHarnesses(MatOptgroupHarness);
    expect(groups.length).toBe(2);
  });

  it('should filter groups based on their text', async () => {
    const groups = await loader.getAllHarnesses(
      MatOptgroupHarness.with({
        labelText: 'Disabled group',
      }),
    );

    expect(groups.length).toBe(1);
  });

  it('should filter group label text by a pattern', async () => {
    const groups = await loader.getAllHarnesses(MatOptgroupHarness.with({labelText: /group/}));
    expect(groups.length).toBe(2);
  });

  it('should get the group label text', async () => {
    const groups = await loader.getAllHarnesses(MatOptgroupHarness);
    const texts = await parallel(() => groups.map(group => group.getLabelText()));
    expect(texts).toEqual(['Plain group', 'Disabled group']);
  });

  it('should get the group disabled state', async () => {
    const groups = await loader.getAllHarnesses(MatOptgroupHarness);
    const disabledStates = await parallel(() => groups.map(group => group.isDisabled()));
    expect(disabledStates).toEqual([false, true]);
  });

  it('should get the options inside the groups', async () => {
    const group = await loader.getHarness(MatOptgroupHarness);
    const optionTexts = await group.getOptions().then(async options => {
      return await parallel(() => options.map(option => option.getText()));
    });

    expect(optionTexts).toEqual(['Option 1', 'Option 2']);
  });
});

@Component({
  template: `
    <mat-optgroup label="Plain group">
      <mat-option>Option 1</mat-option>
      <mat-option>Option 2</mat-option>
    </mat-optgroup>

    <mat-optgroup label="Disabled group" disabled>
      <mat-option>Disabled option 1</mat-option>
    </mat-optgroup>
  `,
})
class OptgroupHarnessTest {}
