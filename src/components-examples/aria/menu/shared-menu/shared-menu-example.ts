import {Component, inject, signal} from '@angular/core';
import {MenuTrigger, MenuContent} from '@angular/aria/menu';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

interface LoopItem {
  id: number;
  name: string;
}

/** @title Shared Menu Example. */
@Component({
  selector: 'shared-menu-example',
  templateUrl: 'shared-menu-example.html',
  styleUrls: ['../menu-example.css', 'shared-menu-example.css'],
  imports: [
    MenuContent,
    MenuTrigger,
    SimpleMenu,
    SimpleMenuItem,
    SimpleMenuItemIcon,
    SimpleMenuItemText,
    MatSnackBarModule,
  ],
})
export class SharedMenuExample {
  private readonly _snackBar = inject(MatSnackBar);

  items: LoopItem[] = [
    {id: 1, name: 'Document A'},
    {id: 2, name: 'Image B'},
    {id: 3, name: 'Spreadsheet C'},
  ];

  readonly activeItem = signal<LoopItem | null>(null);

  onExpandedChange(expanded: boolean, item: LoopItem) {
    if (expanded) {
      this.activeItem.set(item);
    }
  }

  onItemSelected(value: string) {
    const item = this.activeItem();
    if (!item) {
      return;
    }

    if (value === 'Delete') {
      this._snackBar.open(`Deleted: ${item.name}`, 'Dismiss', {duration: 3000});
    } else if (value === 'Archive') {
      this._snackBar.open(`Archived: ${item.name}`, 'Dismiss', {duration: 3000});
    }
  }
}
