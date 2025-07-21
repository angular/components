import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'progress-bar-expression-fix-example',
  templateUrl: './progress-bar-expression-fix-example.html',
})
export class ProgressBarExpressionFixExample implements AfterViewInit {
  mode: 'determinate' | 'indeterminate' = 'determinate';
  value = 50;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mode = 'indeterminate';
      this.cdr.detectChanges(); // Fix Bug ExpressionChangedAfterItHasBeenCheckedError
    });
  }
}
