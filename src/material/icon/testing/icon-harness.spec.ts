import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconHarness} from './icon-harness';
import {IconType} from './icon-harness-filters';

describe('MatIconHarness', () => {
  let fixture: ComponentFixture<IconHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [IconHarnessTest],
    }).compileComponents();

    const registry = TestBed.inject(MatIconRegistry);
    const sanitizer = TestBed.inject(DomSanitizer);

    registry.addSvgIconLiteralInNamespace(
      'svgIcons',
      'svgIcon',
      sanitizer.bypassSecurityTrustHtml('<svg></svg>'),
    );
    fixture = TestBed.createComponent(IconHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all icon harnesses', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    expect(icons.length).toBe(6);
  });

  it('should filter icon harnesses based on their type', async () => {
    const [svgIcons, fontIcons] = await parallel(() => [
      loader.getAllHarnesses(MatIconHarness.with({type: IconType.SVG})),
      loader.getAllHarnesses(MatIconHarness.with({type: IconType.FONT})),
    ]);

    expect(svgIcons.length).toBe(1);
    expect(fontIcons.length).toBe(5);
  });

  it('should filter icon harnesses based on their name', async () => {
    const [regexFilterResults, stringFilterResults] = await parallel(() => [
      loader.getAllHarnesses(MatIconHarness.with({name: /^font/})),
      loader.getAllHarnesses(MatIconHarness.with({name: 'fontIcon'})),
    ]);

    expect(regexFilterResults.length).toBe(1);
    expect(stringFilterResults.length).toBe(1);
  });

  it('should filter icon harnesses based on their namespace', async () => {
    const [regexFilterResults, stringFilterResults, nullFilterResults] = await parallel(() => [
      loader.getAllHarnesses(MatIconHarness.with({namespace: /^font/})),
      loader.getAllHarnesses(MatIconHarness.with({namespace: 'svgIcons'})),
      loader.getAllHarnesses(MatIconHarness.with({namespace: null})),
    ]);

    expect(regexFilterResults.length).toBe(1);
    expect(stringFilterResults.length).toBe(1);
    expect(nullFilterResults.length).toBe(4);
  });

  it('should get the type of each icon', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const types = await parallel(() => icons.map(icon => icon.getType()));
    expect(types).toEqual([
      IconType.FONT,
      IconType.SVG,
      IconType.FONT,
      IconType.FONT,
      IconType.FONT,
      IconType.FONT,
    ]);
  });

  it('should get the name of an icon', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const names = await parallel(() => icons.map(icon => icon.getName()));
    expect(names).toEqual([
      'fontIcon',
      'svgIcon',
      'ligature_icon',
      'ligature_icon_by_attribute',
      'ligature_icon_with_additional_content',
      'ligature_icon_with_indirect_name',
    ]);
  });

  it('should get the namespace of an icon', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const namespaces = await parallel(() => icons.map(icon => icon.getNamespace()));
    expect(namespaces).toEqual(['fontIcons', 'svgIcons', null, null, null, null]);
  });

  it('should get whether an icon is inline', async () => {
    const icons = await loader.getAllHarnesses(MatIconHarness);
    const inlineStates = await parallel(() => icons.map(icon => icon.isInline()));
    expect(inlineStates).toEqual([false, false, true, false, false, false]);
  });
});

@Component({
  template: `
    <mat-icon fontSet="fontIcons" fontIcon="fontIcon"></mat-icon>
    <mat-icon svgIcon="svgIcons:svgIcon"></mat-icon>
    <mat-icon inline>ligature_icon</mat-icon>
    <mat-icon fontIcon="ligature_icon_by_attribute"></mat-icon>
    <mat-icon>ligature_icon_with_additional_content <span class="fake-badge">Hello</span></mat-icon>
    <mat-icon><span>ligature_icon_with_indirect_name</span></mat-icon>
  `,
})
class IconHarnessTest {}
