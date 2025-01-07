import {Component} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {Platform, PlatformModule} from '@angular/cdk/platform';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatIconHarness} from '@angular/material/icon/testing';
import {MatButtonHarness} from './button-harness';

describe('MatButtonHarness', () => {
  let fixture: ComponentFixture<ButtonHarnessTest>;
  let loader: HarnessLoader;
  let platform: Platform;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonModule, MatIconModule, PlatformModule, ButtonHarnessTest],
    });

    fixture = TestBed.createComponent(ButtonHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(inject([Platform], (p: Platform) => {
    platform = p;
  }));

  it('should load all button harnesses', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    expect(buttons.length).toBe(15);
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
    expect(enabledButtons.length).toBe(13);
    expect(disabledButtons.length).toBe(2);
  });

  it('should get disabled state', async () => {
    // Grab each combination of [enabled, disabled] ⨯ [button, anchor]
    const [disabledFlatButton, enabledFlatAnchor] = await loader.getAllHarnesses(
      MatButtonHarness.with({text: /flat/i}),
    );
    const [enabledRaisedButton, disabledRaisedAnchor] = await loader.getAllHarnesses(
      MatButtonHarness.with({text: /raised/i}),
    );

    expect(await enabledFlatAnchor.isDisabled()).toBe(false);
    expect(await disabledFlatButton.isDisabled()).toBe(true);
    expect(await enabledRaisedButton.isDisabled()).toBe(false);
    expect(await disabledRaisedAnchor.isDisabled()).toBe(true);
  });

  it('should get button text', async () => {
    const [firstButton, secondButton] = await loader.getAllHarnesses(MatButtonHarness);
    expect(await firstButton.getText()).toBe('Basic button');
    expect(await secondButton.getText()).toBe('Flat button');
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

    const button = await loader.getHarness(MatButtonHarness.with({text: 'Flat button'}));
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

  it('should load all button harnesses', async () => {
    const buttons = await loader.getAllHarnesses(MatButtonHarness);
    const variants = await parallel(() => buttons.map(button => button.getVariant()));

    expect(variants).toEqual([
      'basic',
      'flat',
      'raised',
      'stroked',
      'icon',
      'icon',
      'fab',
      'mini-fab',
      'basic',
      'flat',
      'raised',
      'stroked',
      'icon',
      'fab',
      'mini-fab',
    ]);
  });

  it('should be able to filter buttons based on their variant', async () => {
    const button = await loader.getHarness(MatButtonHarness.with({variant: 'flat'}));
    expect(await button.getText()).toBe('Flat button');
  });
});

@Component({
  // Include one of each type of button selector to ensure that they're all captured by
  // the harness's selector.
  template: `
    <button id="basic" type="button" mat-button (click)="clicked = true">
      Basic button
    </button>
    <button id="flat" type="button" mat-flat-button disabled (click)="clicked = true">
      Flat button
    </button>
    <button id="raised" type="button" mat-raised-button>Raised button</button>
    <button id="stroked" type="button" mat-stroked-button>Stroked button</button>
    <button id="home-icon" type="button" mat-icon-button>
      <mat-icon>home</mat-icon>
    </button>
    <button id="favorite-icon" type="button" mat-icon-button>
      <mat-icon>favorite</mat-icon>
    </button>
    <button id="fab" type="button" mat-fab>Fab button</button>
    <button id="mini-fab" type="button" mat-mini-fab>Mini Fab button</button>

    <a id="anchor-basic" mat-button>Basic anchor</a>
    <a id="anchor-flat" mat-flat-button>Flat anchor</a>
    <a id="anchor-raised" mat-raised-button disabled>Raised anchor</a>
    <a id="anchor-stroked" mat-stroked-button>Stroked anchor</a>
    <a id="anchor-icon" mat-icon-button>Icon anchor</a>
    <a id="anchor-fab" mat-fab>Fab anchor</a>
    <a id="anchor-mini-fab" mat-mini-fab>Mini Fab anchor</a>
  `,
  imports: [MatButtonModule, MatIconModule, PlatformModule],
})
class ButtonHarnessTest {
  disabled = true;
  clicked = false;
}
