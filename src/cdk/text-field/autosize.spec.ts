import {Component, ViewChild} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {dispatchFakeEvent} from '../testing/private';
import {CdkTextareaAutosize} from './autosize';
import {TextFieldModule} from './text-field-module';

describe('CdkTextareaAutosize', () => {
  let fixture: ComponentFixture<AutosizeTextAreaWithContent>;
  let textarea: HTMLTextAreaElement;
  let autosize: CdkTextareaAutosize;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TextFieldModule,
        NoopAnimationsModule,
        AutosizeTextAreaWithContent,
        AutosizeTextAreaWithValue,
        AutosizeTextareaWithNgModel,
        AutosizeTextareaWithoutAutosize,
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    fixture.detectChanges();

    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement
      .query(By.directive(CdkTextareaAutosize))!
      .injector.get<CdkTextareaAutosize>(CdkTextareaAutosize);
  });

  it('should resize the textarea based on its content', () => {
    let previousHeight = textarea.clientHeight;

    textarea.value = `
    Once upon a midnight dreary, while I pondered, weak and weary,
    Over many a quaint and curious volume of forgotten lore—
        While I nodded, nearly napping, suddenly there came a tapping,
    As of some one gently rapping, rapping at my chamber door.
    “’Tis some visitor,” I muttered, “tapping at my chamber door—
                Only this and nothing more.”`;

    // Manually call resizeToFitContent instead of faking an `input` event.
    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to have grown with added content.')
      .toBeGreaterThan(previousHeight);
    expect(textarea.clientHeight)
      .withContext('Expected textarea height to match its scrollHeight')
      .toBe(textarea.scrollHeight);

    previousHeight = textarea.clientHeight;
    textarea.value += `
        Ah, distinctly I remember it was in the bleak December;
    And each separate dying ember wrought its ghost upon the floor.
        Eagerly I wished the morrow;—vainly I had sought to borrow
        From my books surcease of sorrow—sorrow for the lost Lenore—
    For the rare and radiant maiden whom the angels name Lenore—
                Nameless here for evermore.`;

    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to have grown with added content.')
      .toBeGreaterThan(previousHeight);
    expect(textarea.clientHeight)
      .withContext('Expected textarea height to match its scrollHeight')
      .toBe(textarea.scrollHeight);
  });

  it('should keep the placeholder size if the value is shorter than the placeholder', () => {
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);

    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement
      .query(By.css('textarea'))!
      .injector.get<CdkTextareaAutosize>(CdkTextareaAutosize);

    fixture.componentInstance.placeholder = `
    Once upon a midnight dreary, while I pondered, weak and weary,
    Over many a quaint and curious volume of forgotten lore—
        While I nodded, nearly napping, suddenly there came a tapping,
    As of some one gently rapping, rapping at my chamber door.
    “’Tis some visitor,” I muttered, “tapping at my chamber door—
                Only this and nothing more.”`;
    fixture.changeDetectorRef.markForCheck();

    fixture.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea height to match its scrollHeight')
      .toBe(textarea.scrollHeight);

    let previousHeight = textarea.clientHeight;

    textarea.value = 'a';

    // Manually call resizeToFitContent instead of faking an `input` event.
    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
      .withContext('Expected textarea height not to have changed')
      .toBe(previousHeight);
  });

  it('should set a min-height based on minRows', () => {
    expect(textarea.style.minHeight).toBeFalsy();

    fixture.componentInstance.minRows = 4;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.style.minHeight)
      .withContext('Expected a min-height to be set via minRows.')
      .toBeDefined();

    let previousMinHeight = parseInt(textarea.style.minHeight as string);
    fixture.componentInstance.minRows = 6;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(parseInt(textarea.style.minHeight as string))
      .withContext('Expected increased min-height with minRows increase.')
      .toBeGreaterThan(previousMinHeight);
  });

  it('should set a max-height based on maxRows', () => {
    expect(textarea.style.maxHeight).toBeFalsy();

    fixture.componentInstance.maxRows = 4;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.style.maxHeight)
      .withContext('Expected a max-height to be set via maxRows.')
      .toBeDefined();

    let previousMaxHeight = parseInt(textarea.style.maxHeight as string);
    fixture.componentInstance.maxRows = 6;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(parseInt(textarea.style.maxHeight as string))
      .withContext('Expected increased max-height with maxRows increase.')
      .toBeGreaterThan(previousMaxHeight);
  });

  it('should reduce textarea height when minHeight decreases', () => {
    expect(textarea.style.minHeight).toBeFalsy();

    fixture.componentInstance.minRows = 6;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.style.minHeight)
      .withContext('Expected a min-height to be set via minRows.')
      .toBeDefined();

    let previousHeight = parseInt(textarea.style.height!);
    fixture.componentInstance.minRows = 3;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(parseInt(textarea.style.height!))
      .withContext('Expected decreased height with minRows decrease.')
      .toBeLessThan(previousHeight);
  });

  it('should export the cdkAutosize reference', () => {
    expect(fixture.componentInstance.autosize).toBeTruthy();
    expect(fixture.componentInstance.autosize.resizeToFitContent).toBeTruthy();
  });

  it('should initially set the rows of a textarea to one', () => {
    expect(textarea.rows)
      .withContext('Expected the directive to initially set the rows property to one.')
      .toBe(1);

    fixture.componentInstance.minRows = 1;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.rows)
      .withContext('Expected the textarea to have the rows property set to one.')
      .toBe(1);

    const previousMinHeight = parseInt(textarea.style.minHeight as string);

    fixture.componentInstance.minRows = 2;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.rows)
      .withContext(
        'Expected the rows property to be set to one. ' +
          'The amount of rows will be specified using CSS.',
      )
      .toBe(1);

    expect(parseInt(textarea.style.minHeight as string))
      .withContext('Expected the textarea to grow to two rows.')
      .toBeGreaterThan(previousMinHeight);
  });

  it('should calculate the proper height based on the specified amount of max rows', () => {
    textarea.value = [1, 2, 3, 4, 5, 6, 7, 8].join('\n');
    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to not have a vertical scrollbar.')
      .toBe(textarea.scrollHeight);

    fixture.componentInstance.maxRows = 5;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to have a vertical scrollbar.')
      .toBeLessThan(textarea.scrollHeight);
  });

  it('should properly resize to content on init', () => {
    // Manually create the test component in this test, because in this test the first change
    // detection should be triggered after a multiline content is set.
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement
      .query(By.css('textarea'))!
      .injector.get<CdkTextareaAutosize>(CdkTextareaAutosize);

    fixture.componentInstance.content = `
      Line
      Line
      Line
      Line
      Line`;
    fixture.changeDetectorRef.markForCheck();

    fixture.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea height to match its scrollHeight')
      .toBe(textarea.scrollHeight);
  });

  it('should properly resize to placeholder on init', () => {
    // Manually create the test component in this test, because in this test the first change
    // detection should be triggered after a multiline placeholder is set.
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement
      .query(By.css('textarea'))!
      .injector.get<CdkTextareaAutosize>(CdkTextareaAutosize);

    fixture.componentInstance.placeholder = `
      Line
      Line
      Line
      Line
      Line`;
    fixture.changeDetectorRef.markForCheck();

    fixture.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea height to match its scrollHeight')
      .toBe(textarea.scrollHeight);
  });

  it('should resize when an associated form control value changes', fakeAsync(() => {
    const fixtureWithForms = TestBed.createComponent(AutosizeTextareaWithNgModel);
    textarea = fixtureWithForms.nativeElement.querySelector('textarea');
    fixtureWithForms.detectChanges();

    const previousHeight = textarea.clientHeight;

    fixtureWithForms.componentInstance.model = `
        And the silken, sad, uncertain rustling of each purple curtain
    Thrilled me—filled me with fantastic terrors never felt before;
        So that now, to still the beating of my heart, I stood repeating
        “’Tis some visitor entreating entrance at my chamber door—
    Some late visitor entreating entrance at my chamber door;—
                This it is and nothing more.” `;
    fixtureWithForms.changeDetectorRef.markForCheck();
    fixtureWithForms.detectChanges();
    flush();
    fixtureWithForms.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected increased height when ngModel is updated.')
      .toBeGreaterThan(previousHeight);
  }));

  it('should resize when the textarea value is changed programmatically', fakeAsync(() => {
    const previousHeight = textarea.clientHeight;

    textarea.value = `
      How much wood would a woodchuck chuck
      if a woodchuck could chuck wood?
    `;

    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected the textarea height to have increased.')
      .toBeGreaterThan(previousHeight);
  }));

  it('should trigger a resize when the window is resized', fakeAsync(() => {
    spyOn(autosize, 'resizeToFitContent');

    dispatchFakeEvent(window, 'resize');
    tick(16);

    expect(autosize.resizeToFitContent).toHaveBeenCalled();
  }));

  it('should not trigger a resize when it is disabled', fakeAsync(() => {
    const fixtureWithoutAutosize = TestBed.createComponent(AutosizeTextareaWithoutAutosize);
    textarea = fixtureWithoutAutosize.nativeElement.querySelector('textarea');
    autosize = fixtureWithoutAutosize.debugElement
      .query(By.css('textarea'))!
      .injector.get<CdkTextareaAutosize>(CdkTextareaAutosize);

    fixtureWithoutAutosize.detectChanges();

    const previousHeight = textarea.clientHeight;

    fixtureWithoutAutosize.componentInstance.content = `
    Line
    Line
    Line
    Line
    Line`;
    fixtureWithoutAutosize.changeDetectorRef.markForCheck();

    // Manually call resizeToFitContent instead of faking an `input` event.
    fixtureWithoutAutosize.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to still have the same size.')
      .toEqual(previousHeight);
    expect(textarea.clientHeight)
      .withContext('Expected textarea to a have scrollbar.')
      .toBeLessThan(textarea.scrollHeight);

    autosize.enabled = true;
    fixtureWithoutAutosize.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to have grown after enabling autosize.')
      .toBeGreaterThan(previousHeight);
    expect(textarea.clientHeight)
      .withContext('Expected textarea not to have a scrollbar')
      .toBe(textarea.scrollHeight);

    autosize.enabled = false;
    fixtureWithoutAutosize.detectChanges();

    expect(textarea.clientHeight)
      .withContext('Expected textarea to have the original size.')
      .toEqual(previousHeight);
    expect(textarea.clientHeight)
      .withContext('Expected textarea to have a scrollbar.')
      .toBeLessThan(textarea.scrollHeight);
  }));

  it('should handle an undefined placeholder', () => {
    fixture.componentInstance.placeholder = undefined!;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(textarea.hasAttribute('placeholder')).toBe(false);
  });
});

// Styles to reset padding and border to make measurement comparisons easier.
const textareaStyleReset = `
    textarea {
      padding: 0;
      border: none;
      overflow: auto;
    }`;

@Component({
  template: `
    <textarea cdkTextareaAutosize [cdkAutosizeMinRows]="minRows" [cdkAutosizeMaxRows]="maxRows"
        #autosize="cdkTextareaAutosize" [placeholder]="placeholder">{{content}}</textarea>`,
  styles: textareaStyleReset,
  imports: [FormsModule, TextFieldModule],
})
class AutosizeTextAreaWithContent {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  minRows: number | null = null;
  maxRows: number | null = null;
  content: string = '';
  placeholder: string = '';
}

@Component({
  template: `<textarea cdkTextareaAutosize [value]="value"></textarea>`,
  styles: textareaStyleReset,
  imports: [FormsModule, TextFieldModule],
})
class AutosizeTextAreaWithValue {
  value: string = '';
}

@Component({
  template: `<textarea cdkTextareaAutosize [(ngModel)]="model"></textarea>`,
  styles: textareaStyleReset,
  imports: [FormsModule, TextFieldModule],
})
class AutosizeTextareaWithNgModel {
  model = '';
}

@Component({
  template: `<textarea [cdkTextareaAutosize]="false">{{content}}</textarea>`,
  styles: textareaStyleReset,
  imports: [FormsModule, TextFieldModule],
})
class AutosizeTextareaWithoutAutosize {
  content: string = '';
}
