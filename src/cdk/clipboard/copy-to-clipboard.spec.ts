import {Component, ChangeDetectionStrategy} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {Clipboard} from './clipboard';
import {ClipboardModule} from './clipboard-module';
import {PendingCopy} from './pending-copy';

describe('CdkCopyToClipboard', () => {
  const COPY_CONTENT = 'copy content';
  let fixture: ComponentFixture<CopyToClipboardHost>;
  let clipboard: Clipboard;

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyToClipboardHost);

    const host = fixture.componentInstance;
    host.content = COPY_CONTENT;
    clipboard = TestBed.inject(Clipboard);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  });

  it('copies content to clipboard upon click', () => {
    spyOn(clipboard, 'copy');
    fixture.nativeElement.querySelector('button')!.click();
    expect(clipboard.copy).toHaveBeenCalledWith(COPY_CONTENT);
  });

  it('emits copied event true when copy succeeds', () => {
    spyOn(clipboard, 'copy').and.returnValue(true);
    fixture.nativeElement.querySelector('button')!.click();

    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(true);
  });

  it('emits copied event false when copy fails', async () => {
    spyOn(clipboard, 'copy').and.returnValue(false);
    fixture.nativeElement.querySelector('button')!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(false);
  });

  it('should be able to attempt multiple times before succeeding', async () => {
    const maxAttempts = 3;
    let attempts = 0;
    spyOn(clipboard, 'beginCopy').and.returnValue({
      copy: () => ++attempts >= maxAttempts,
      destroy: () => {},
    } as PendingCopy);
    fixture.componentInstance.attempts = maxAttempts;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    fixture.detectChanges();
    await wait(100);

    expect(attempts).toBe(maxAttempts);
    expect(fixture.componentInstance.copied).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(true);
  });

  it('should be able to attempt multiple times before failing', async () => {
    const maxAttempts = 3;
    let attempts = 0;
    spyOn(clipboard, 'beginCopy').and.returnValue({
      copy: () => {
        attempts++;
        return false;
      },
      destroy: () => {},
    } as PendingCopy);
    fixture.componentInstance.attempts = maxAttempts;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    fixture.detectChanges();
    await wait(100);

    expect(attempts).toBe(maxAttempts);
    expect(fixture.componentInstance.copied).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(false);
  });

  it('should destroy any pending copies when the directive is destroyed', async () => {
    const fakeCopy = {
      copy: jasmine.createSpy('copy spy').and.returnValue(false),
      destroy: jasmine.createSpy('destroy spy'),
    };

    fixture.componentInstance.attempts = 10;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    spyOn(clipboard, 'beginCopy').and.returnValue(fakeCopy as unknown as PendingCopy);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    fixture.detectChanges();
    await wait(5);

    const initialCallCount = fakeCopy.copy.calls.count();
    expect(initialCallCount).toBeGreaterThan(0);
    expect(fakeCopy.destroy).toHaveBeenCalledTimes(0);

    fixture.destroy();
    await wait(50);

    expect(fakeCopy.copy.calls.count()).toBe(initialCallCount);
    expect(fakeCopy.destroy).toHaveBeenCalledTimes(1);
  });
});

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

@Component({
  selector: 'copy-to-clipboard-host',
  template: `
    <button
    [cdkCopyToClipboard]="content"
    [cdkCopyToClipboardAttempts]="attempts"
    (cdkCopyToClipboardCopied)="copied($event)"></button>`,
  imports: [ClipboardModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class CopyToClipboardHost {
  content = '';
  attempts = 1;
  copied = jasmine.createSpy('copied spy');
}
