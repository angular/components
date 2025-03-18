import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Platform} from '@angular/cdk/platform';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonModule} from '../module';
import {MatIconModule} from '../../icon';
import {MatIconHarness} from '../../icon/testing';
import {MatButtonHarness} from './button-harness';

describe('MatButtonHarness', () => {
  let fixture: ComponentFixture<ButtonHarnessTest>;
  let loader: HarnessLoader;
  let platform: Platform;

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    platform = TestBed.inject(Platform);
  });

  it('should load all button harnesses', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    expect(buttons.length).toBe(16);
  });

  it('should load button with exact text', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness.with({text: 'Basic button'}));
    expect(buttons.length).toBe(1);
    expect(await buttons[0].getText()).toBe('Basic button');
  });

  it('should load button with regex label match', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness.with({text: /basic/i}));
    expect(buttons.length).toBe(2);
    expect(await buttons[0].getText()).toBe('Basic button');
    expect(await buttons[1].getText()).toBe('Basic anchor');
  });

  it('should filter by whether a button is disabled', async () => {
    const enabledButtons = await loader.getAllHarnesses(MatButtonHarness.with({disabled: false}));
    const disabledButtons = await loader.getAllHarnesses(MatButtonHarness.with({disabled: true}));
    expect(enabledButtons.length).toBe(14);
    expect(disabledButtons.length).toBe(2);
  });

  it('should get disabled state', async () => {
    // Grab each combination of [enabled, disabled] x [button, anchor]
    const [disabledFilledButton, enabledFilledAnchor] = await loader.getAllHarnesses(
      MatButtonHarness.with({text: /filled/i}),
    );
    const [enabledElevatedButton, disabledElevatedAnchor] = await loader.getAllHarnesses(
      MatButtonHarness.with({text: /elevated/i}),
    );

    expect(await enabledFilledAnchor.isDisabled()).toBe(false);
    expect(await disabledFilledButton.isDisabled()).toBe(true);
    expect(await enabledElevatedButton.isDisabled()).toBe(false);
    expect(await disabledElevatedAnchor.isDisabled()).toBe(true);
  });

  it('should get button text', async () => {
    const [firstButton, secondButton] = await loader.getAllHarnesses(MatButtonHarness);
    expect(await firstButton.getText()).toBe('Basic button');
    expect(await secondButton.getText()).toBe('Filled button');
  });

  it('should focus and blur a button', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: 'Basic button'}));
    expect(await button.isFocused()).toBe(false);
    await button.focus();
    expect(await button.isFocused()).toBe(true);
    await button.blur();
    expect(await button.isFocused()).toBe(false);
  });

  it('should click a button', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({text: 'Basic button'}));
    await button.click();

    expect(fixture.componentInstance.clicked).toBe(true);
  });

  it('should not click a disabled button', async () => {
    // Older versions of Edge have a bug where `disabled` buttons are still clickable if
    // they contain child elements. Also new versions of Firefox (starting v65) do not
    // cancel dispatched click events on disabled buttons. We skip this check on Edge and Firefox.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1582570 and:
    // https://stackoverflow.com/questions/32377026/disabled-button-is-clickable-on-edge-browser
    if (platform.FIREFOX) {
      return;
    }

    const button = await loader.getHarness(MatButtonHarness.with({text: 'Filled button'}));
    await button.click();

    expect(fixture.componentInstance.clicked).toBe(false);
  });

  it('should be able to handle nested harnesses', async () => {
    const homeBtn = await loader.getHarness(MatButtonHarness.with({selector: '#home-icon'}));
    const favBtn = await loader.getHarness(MatButtonHarness.with({selector: '#favorite-icon'}));

    const homeIcon = await homeBtn.getHarness(MatIconHarness);
    const favIcon = await favBtn.getHarness(MatIconHarness);

    expect(await homeIcon.getName()).toBe('home');
    expect(await favIcon.getName()).toBe('favorite');
  });

  it('should be able to ge the type variant of the button', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    const variants = await parallel(() => buttons.map(button => button.getVariant()));

    expect(variants).toEqual([
      'basic',
      'basic',
      'basic',
      'basic',
      'basic',
      'icon',
      'icon',
      'fab',
      'mini-fab',
      'basic',
      'basic',
      'basic',
      'basic',
      'icon',
      'fab',
      'mini-fab',
    ]);
  });

  it('should be able to get the appearance of the button', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    const appearances = await parallel(() => buttons.map(button => button.getAppearance()));

    expect(appearances).toEqual([
      'text',
      'filled',
      'elevated',
      'outlined',
      'tonal',
      null,
      null,
      null,
      null,
      'text',
      'filled',
      'elevated',
      'outlined',
      null,
      null,
      null,
    ]);
  });

  it('should be able to filter buttons based on their variant', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({variant: 'fab'}));
    expect(await button.getText()).toBe('Fab button');
  });

  it('should be able to filter buttons based on their appearance', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({appearance: 'filled'}));
    expect(await button.getText()).toBe('Filled button');
  });
});

@Component({
  // Include one of each type of button selector to ensure that they're all captured by
  // the harness's selector.
  template: `
    <button id="basic" type="button" matButton (click)="clicked = true">
      Basic button
    </button>
    <button id="flat" type="button" matButton="filled" disabled (click)="clicked = true">
      Filled button
    </button>
    <button id="raised" type="button" matButton="elevated">Elevated button</button>
    <button id="stroked" type="button" matButton="outlined">Outlined button</button>
    <button id="tonal" type="button" matButton="tonal">Tonal button</button>
    <button id="home-icon" type="button" matIconButton>
      <mat-icon>home</mat-icon>
    </button>
    <button id="favorite-icon" type="button" matIconButton>
      <mat-icon>favorite</mat-icon>
    </button>
    <button id="fab" type="button" matFab>Fab button</button>
    <button id="mini-fab" type="button" matMiniFab>Mini Fab button</button>

    <a id="anchor-basic" matButton>Basic anchor</a>
    <a id="anchor-flat" matButton="filled">Filled anchor</a>
    <a id="anchor-raised" matButton="elevated" disabled>Elevated anchor</a>
    <a id="anchor-stroked" matButton="outlined">Stroked anchor</a>
    <a id="anchor-icon" matIconButton>Icon anchor</a>
    <a id="anchor-fab" matFab>Fab anchor</a>
    <a id="anchor-mini-fab" matMiniFab>Mini Fab anchor</a>
  `,
  imports: [MatButtonModule, MatIconModule],
})
class ButtonHarnessTest {
  disabled = true;
  clicked = false;
}
