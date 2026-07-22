import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

/**
 * @title Basic checkboxes
 */
@Component({
  selector: 'checkbox-overview-example',
  templateUrl: 'checkbox-overview-example.html',
  styleUrl: 'checkbox-overview-example.css',
  imports: [MatCheckboxModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxOverviewExample {
  readonly task = signal<Task>({
    name: 'Parent task',
    completed: false,
    subtasks: [
      {name: 'Child task 1', completed: false},
      {name: 'Child task 2', completed: false},
      {name: 'Child task 3', completed: false},
    ],
  });

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) {
      return false;
    }
    return task.subtasks.some(t => t.completed) && !task.subtasks.every(t => t.completed);
  });

  update(completed: boolean, index?: number) {
    this.task.update(task => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach(t => (t.completed = completed));
      } else {
        task.subtasks![index].completed = completed;
        task.completed = task.subtasks?.every(t => t.completed) ?? true;
      }
      return {...task};
    });
  }
}
