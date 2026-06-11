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
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
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
    MatButtonModule,
    MatMenuModule,
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

  findSummaryInput = (host: HTMLElement) =>
    host.querySelector<HTMLInputElement>('input.summary-input');

  startEdit(event: KeyboardEvent | FocusEvent | undefined, task: TaskRow): void {
    this.tempInput.set(task.summary());

    if (!(event instanceof KeyboardEvent)) return;

    // Start editing with a alphanumeric character.
    if (event.key.length === 1) {
      this.tempInput.set(event.key);
    }
  }

  completeEdit(event: KeyboardEvent | FocusEvent | undefined, task: TaskRow): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === 'Enter') {
      task.summary.set(this.tempInput());
    }
  }

  viewDetails(task: TaskRow) {
    alert(`Viewing details for task: ${task.summary()}`);
  }

  deleteTask(task: TaskRow) {
    this.tasks.update(tasks => tasks.filter(t => t !== task));
  }

  updateSelection(checked: boolean): void {
    this.tasks().forEach(t => t.selected.set(checked));
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
