/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, computed, Signal, signal, WritableSignal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import {GridChips} from './grid-chips';

interface TaskRow {
  selected: WritableSignal<boolean>;
  summary: WritableSignal<string>;
  assignee: WritableSignal<string>;
  tags: WritableSignal<string[]>;
}

/** @title Table Grid. */
@Component({
  selector: 'grid-table-example',
  templateUrl: 'grid-table-example.html',
  styleUrls: ['../grid-common.css', 'grid-table-example.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    Grid,
    GridRow,
    GridCell,
    GridCellWidget,
    GridChips,
  ],
})
export class GridTableExample {
  readonly employees = [
    'Sudo Sloth',
    'Copy-Pasta Capybara',
    'Rubber Duck',
    'Caffeinated Owl',
    'Patch Monkey',
  ];

  readonly allSelected: Signal<boolean> = computed(() => this.tasks().every(t => t.selected()));

  readonly partiallySelected: Signal<boolean> = computed(
    () => this.tasks().some(t => t.selected()) && !this.allSelected(),
  );

  readonly tempInput: WritableSignal<string> = signal('');

  readonly tasks: WritableSignal<TaskRow[]> = signal(this._createRows());

  constructor() {}

  startEdit(
    event: KeyboardEvent | FocusEvent | undefined,
    task: TaskRow,
    inputEl: HTMLInputElement,
  ): void {
    this.tempInput.set(task.summary());
    inputEl.focus();

    if (!(event instanceof KeyboardEvent)) return;

    // Start editing with a alphanumeric character.
    if (event.key.length === 1) {
      this.tempInput.set(event.key);
    }
  }

  onClickEdit(widget: GridCellWidget, task: TaskRow, inputEl: HTMLInputElement) {
    if (widget.isActivated()) return;

    widget.activate();
    setTimeout(() => this.startEdit(undefined, task, inputEl));
  }

  completeEdit(event: KeyboardEvent | FocusEvent | undefined, task: TaskRow): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === 'Enter') {
      task.summary.set(this.tempInput());
    }
  }

  updateSelection(checked: boolean): void {
    this.tasks().forEach(t => t.selected.set(checked));
  }

  addTag(event: KeyboardEvent | FocusEvent | undefined, task: TaskRow, inputEl: HTMLInputElement) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      const value = inputEl.value;
      if (value.length > 0) {
        task.tags.set([...task.tags(), value]);
      }
    }
    inputEl.value = '';
  }

  private _createRows(): TaskRow[] {
    return [
      {
        selected: signal(false),
        summary: signal('Repairing the coffee machine'),
        assignee: signal('Caffeinated Owl'),
        tags: signal(['P0']),
      },
      {
        selected: signal(false),
        summary: signal('Burying technical debt in the backyard so no one finds it'),
        assignee: signal(''),
        tags: signal(['tech-debt', 'P3']),
      },
      {
        selected: signal(false),
        summary: signal('Hibernating under the standing desk until the outage is resolved'),
        assignee: signal(''),
        tags: signal([]),
      },
      {
        selected: signal(false),
        summary: signal('Hunting down the Uber Eats driver who got lost in the lobby'),
        assignee: signal('Sudo Sloth'),
        tags: signal(['lunch']),
      },
    ];
  }
}
