import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatBadgeModule, MatBadgePosition, MatBadgeSize} from '@angular/material/badge';
import {MatBadgeHarness} from './badge-harness';

describe('MatBadgeHarness', () => {
  let fixture: ComponentFixture<BadgeHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all badge harnesses', async () => {
    const badges = await loader.getAllHarnesses(MatBadgeHarness);
    expect(badges.length).toBe(6);
  });

  it('should be able to get the text of a badge', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#simple'}));

    expect(await badge.getText()).toBe('Simple badge');
    fixture.componentInstance.simpleContent = 'Changed simple badge';
    expect(await badge.getText()).toBe('Changed simple badge');
  });

  it('should load badge with exact text', async () => {
    const badges = await loader.getAllHarnesses(MatBadgeHarness.with({text: 'Simple badge'}));
    expect(badges.length).toBe(1);
    expect(await badges[0].getText()).toBe('Simple badge');
  });

  it('should load badge with regex label match', async () => {
    const badges = await loader.getAllHarnesses(MatBadgeHarness.with({text: /sized|disabled/i}));
    expect(badges.length).toBe(2);
    expect(await badges[0].getText()).toBe('Sized badge');
    expect(await badges[1].getText()).toBe('Disabled badge');
  });

  it('should get whether a badge is overlapping', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#overlapping'}));

    expect(await badge.isOverlapping()).toBe(true);
    fixture.componentInstance.overlap = false;
    expect(await badge.isOverlapping()).toBe(false);
  });

  it('should get whether a badge is disabled', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#disabled'}));

    expect(await badge.isDisabled()).toBe(true);
    fixture.componentInstance.disabled = false;
    expect(await badge.isDisabled()).toBe(false);
  });

  it('should get whether a badge is hidden', async () => {
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#hidden'}));

    expect(await badge.isHidden()).toBe(true);
    fixture.componentInstance.hidden = false;
    expect(await badge.isHidden()).toBe(false);
  });

  it('should get the position of a badge', async () => {
    const instance = fixture.componentInstance;
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#positioned'}));

    expect(await badge.getPosition()).toBe('above after');

    instance.position = 'below';
    expect(await badge.getPosition()).toBe('below after');

    instance.position = 'below before';
    expect(await badge.getPosition()).toBe('below before');

    instance.position = 'above';
    expect(await badge.getPosition()).toBe('above after');

    instance.position = 'above before';
    expect(await badge.getPosition()).toBe('above before');
  });

  it('should get the size of a badge', async () => {
    const instance = fixture.componentInstance;
    const badge = await loader.getHarness(MatBadgeHarness.with({selector: '#sized'}));

    expect(await badge.getSize()).toBe('medium');

    instance.size = 'small';
    expect(await badge.getSize()).toBe('small');

    instance.size = 'large';
    expect(await badge.getSize()).toBe('large');
  });
});

@Component({
  template: `
    <button id="simple" [matBadge]="simpleContent">Simple</button>
    <button
      id="positioned"
      matBadge="Positioned badge"
      [matBadgePosition]="position">Positioned</button>
    <button
      id="sized"
      matBadge="Sized badge"
      [matBadgeSize]="size">Sized</button>
    <button
      id="overlapping"
      matBadge="Overlapping badge"
      [matBadgeOverlap]="overlap">Overlapping</button>
    <button
      id="hidden"
      matBadge="Hidden badge"
      [matBadgeHidden]="hidden">Hidden</button>
    <button
      id="disabled"
      matBadge="Disabled badge"
      [matBadgeDisabled]="disabled">Disabled</button>
  `,
})
class BadgeHarnessTest {
  simpleContent = 'Simple badge';
  position: MatBadgePosition = 'above after';
  size: MatBadgeSize = 'medium';
  overlap = true;
  hidden = true;
  disabled = true;
}
