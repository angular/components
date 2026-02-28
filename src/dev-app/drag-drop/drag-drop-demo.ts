/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
  QueryList,
  AfterViewInit,
  ViewChildren,
} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
  Point,
  DragRef,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';
import {asapScheduler} from 'rxjs';
import {startWith} from 'rxjs/operators';

@Component({
  selector: 'drag-drop-demo',
  templateUrl: 'drag-drop-demo.html',
  styleUrl: 'drag-drop-demo.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DragDropModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckbox,
  ],
})
export class DragAndDropDemo implements AfterViewInit {
  axisLock!: 'x' | 'y';
  dragStartDelay = 0;
  todo = ['Go out for Lunch', 'Make a cool app', 'Watch TV', 'Eat a healthy dinner', 'Go to sleep'];
  done = ['Get up', 'Have breakfast', 'Brush teeth', 'Check reddit'];
  mixedTodo = this.todo.slice();
  mixedDone = this.done.slice();
  mixedWrap = true;

  ages = ['Stone age', 'Bronze age', 'Iron age', 'Middle ages'];
  preferredAges = ['Modern period', 'Renaissance'];
  dls: CdkDropList[] = [];

  todo2 = [
    'Get to work',
    ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'],
    ['Preare for work', 'Drive to office', 'Üark car'],
    'Pick up groceries',
    'Go home',
    'Fall asleep',
  ];
  @ViewChildren(CdkDropList) dlq: QueryList<CdkDropList> | undefined;

  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);

    iconRegistry.addSvgIconLiteral(
      'dnd-move',
      sanitizer.bypassSecurityTrustHtml(
        `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5` +
          `-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </svg>
    `,
      ),
    );
  }

  ngAfterViewInit() {
    this.dlq?.changes.pipe(startWith(this.dlq)).subscribe(() => {
      const ldls: CdkDropList[] = [];

      this.dlq?.forEach(dl => {
        ldls.push(dl);
      });

      asapScheduler.schedule(() => {
        this.dls = ldls;
      });
    });
  }

  // CdkDragDrop<string[]>
  drop(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  constrainPosition({x, y}: Point, _dragRef: DragRef, _dimensions: DOMRect, pickup: Point): Point {
    // Just returning the original top left corner to not modify position
    x -= pickup.x;
    y -= pickup.y;
    return {x, y};
  }

  isArray(item: any): boolean {
    return Array.isArray(item);
  }
}
