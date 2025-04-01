/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ANIMATION_MODULE_TYPE, ChangeDetectionStrategy, Component, Directive} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxModule} from '@angular/material/checkbox';
import {MatPseudoCheckboxModule, ThemePalette} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';

export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Directive({
  selector: '[clickActionNoop]',
  providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'noop'}}],
})
export class ClickActionNoop {}

@Directive({
  selector: '[clickActionCheck]',
  providers: [{provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: {clickAction: 'check'}}],
})
export class ClickActionCheck {}

@Directive({
  selector: '[animationsNoop]',
  providers: [{provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations'}],
})
export class AnimationsNoop {}

@Component({
  selector: 'mat-checkbox-demo-nested-checklist',
  styles: `
    li {
      margin-bottom: 4px;
    }
  `,
  templateUrl: 'nested-checklist.html',
  imports: [MatCheckboxModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckboxDemoNestedChecklist {
  tasks: Task[] = [
    {
      name: 'Reminders',
      completed: false,
      subtasks: [
        {name: 'Cook Dinner', completed: false},
        {name: 'Read the Material Design Spec', completed: false},
        {name: 'Upgrade Application to Angular', completed: false},
      ],
    },
    {
      name: 'Groceries',
      completed: false,
      subtasks: [
        {name: 'Organic Eggs', completed: false},
        {name: 'Protein Powder', completed: false},
        {name: 'Almond Meal Flour', completed: false},
      ],
    },
  ];

  allComplete(task: Task): boolean {
    const subtasks = task.subtasks;

    return task.completed || (subtasks != null && subtasks.every(t => t.completed));
  }

  someComplete(tasks: Task[] | undefined | null): boolean {
    if (tasks == null) {
      return false;
    }
    const numComplete = tasks.filter(t => t.completed).length;
    return numComplete > 0 && numComplete < tasks.length;
  }

  setAllCompleted(tasks: Task[] | undefined | null, completed: boolean): void {
    if (tasks == null) {
      return;
    }
    tasks.forEach(t => (t.completed = completed));
  }
}

@Component({
  selector: 'checkbox-demo',
  templateUrl: 'checkbox-demo.html',
  styleUrl: 'checkbox-demo.css',
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatPseudoCheckboxModule,
    ReactiveFormsModule,
    MatCheckboxDemoNestedChecklist,
    ClickActionNoop,
    ClickActionCheck,
    AnimationsNoop,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemo {
  isIndeterminate = false;
  isChecked = false;
  isDisabled = false;
  isDisabledInteractive = false;
  labelPosition: 'before' | 'after' = 'after';
  useAlternativeColor = false;

  demoRequired = false;
  demoLabelAfter = false;
  demoChecked = false;
  demoDisabled = false;
  demoIndeterminate = false;
  demoLabel: string;
  demoLabelledBy: string;
  demoId: string;
  demoName: string;
  demoValue: string;
  demoColor: ThemePalette = 'primary';
  demoDisableRipple = false;
  demoHideLabel = false;

  printResult() {
    if (this.isIndeterminate) {
      return 'Maybe!';
    }
    return this.isChecked ? 'Yes!' : 'No!';
  }

  checkboxColor() {
    return this.useAlternativeColor ? 'primary' : 'accent';
  }
}
