import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentHarness, HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatCardModule} from '@angular/material/card';
import {MatCardHarness, MatCardSection} from './card-harness';

describe('MatCardHarness', () => {
  let fixture: ComponentFixture<CardHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatCardModule],
      declarations: [CardHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(CardHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find all cards', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness);
    expect(cards.length).toBe(2);
  });

  it('should find card with text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness.with({text: /spitz breed/}));
    expect(cards.length).toBe(1);
    expect(await cards[0].getTitleText()).toBe('Shiba Inu');
  });

  it('should find card with title', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness.with({title: 'Shiba Inu'}));
    expect(cards.length).toBe(1);
    expect(await cards[0].getTitleText()).toBe('Shiba Inu');
  });

  it('should find card with subtitle', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness.with({subtitle: 'Dog Breed'}));
    expect(cards.length).toBe(1);
    expect(await cards[0].getTitleText()).toBe('Shiba Inu');
  });

  it('should get card text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness);
    expect(await parallel(() => cards.map(c => c.getText()))).toEqual([
      '',
      'Shiba InuDog Breed The Shiba Inu is the smallest of the six original and distinct spitz' +
        ' breeds of dog from Japan. A small, agile dog that copes very well with mountainous' +
        ' terrain, the Shiba Inu was originally bred for hunting. LIKESHAREWoof woof!',
    ]);
  });

  it('should get title text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness);
    expect(await parallel(() => cards.map(c => c.getTitleText()))).toEqual(['', 'Shiba Inu']);
  });

  it('should get subtitle text', async () => {
    const cards = await loader.getAllHarnesses(MatCardHarness);
    expect(await parallel(() => cards.map(c => c.getSubtitleText()))).toEqual(['', 'Dog Breed']);
  });

  it('should get a harness loader for the card header', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const headerLoader = await card.getChildLoader(MatCardSection.HEADER);
    const headerSubcomponents = (await headerLoader?.getAllHarnesses(DummyHarness)) ?? [];
    expect(headerSubcomponents.length).toBe(2);
  });

  it('should get a harness loader for the card content', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const contentLoader = await card.getChildLoader(MatCardSection.CONTENT);
    const contentSubcomponents = (await contentLoader?.getAllHarnesses(DummyHarness)) ?? [];
    expect(contentSubcomponents.length).toBe(1);
  });

  it('should get a harness loader for the card actions', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const actionLoader = await card.getChildLoader(MatCardSection.ACTIONS);
    const actionSubcomponents = (await actionLoader?.getAllHarnesses(DummyHarness)) ?? [];
    expect(actionSubcomponents.length).toBe(2);
  });

  it('should get a harness loader for the card footer', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const footerLoader = await card.getChildLoader(MatCardSection.FOOTER);
    const footerSubcomponents = (await footerLoader?.getAllHarnesses(DummyHarness)) ?? [];
    expect(footerSubcomponents.length).toBe(1);
  });

  it('should act as a harness loader for user content', async () => {
    const card = await loader.getHarness(MatCardHarness.with({title: 'Shiba Inu'}));
    const footerSubcomponents = (await card.getAllHarnesses(DummyHarness)) ?? [];
    expect(footerSubcomponents.length).toBe(7);
  });
});

@Component({
  template: `
      <mat-card></mat-card>
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar></div>
          <mat-card-title>Shiba Inu</mat-card-title>
          <mat-card-subtitle>Dog Breed</mat-card-subtitle>
        </mat-card-header>
        <div mat-card-image></div>
        <mat-card-content>
          <p>
            The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from
            Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu
            was originally bred for hunting.
          </p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button>LIKE</button>
          <button mat-button>SHARE</button>
        </mat-card-actions>
        <mat-card-footer>
          <div>Woof woof!</div>
        </mat-card-footer>
      </mat-card>
  `,
})
class CardHarnessTest {}

class DummyHarness extends ComponentHarness {
  static hostSelector = 'div, p, button';
}
