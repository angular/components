import {Injectable} from '@angular/core';

export interface DocItem {
  id: string;
  name: string;
  examples?: string[];
}

export interface DocCategory {
  id: string;
  name: string;
  items: DocItem[];
}

const DOCS = [
  {
    id: 'forms',
    name: 'Form Controls',
    summary: 'Radio buttons, checkboxes, input fields, sliders, slide toggles, selects',
    items: [
      {id: 'radio', name: 'Radio button'},
      {id: 'checkbox', name: 'Checkbox'},
      {id: 'input', name: 'Input'},
      {id: 'textarea', name: 'Textarea'},
      {id: 'slider', name: 'Slider'},
      {id: 'slide-toggle', name: 'Slide toggle'},
      {id: 'select', name: 'Select'},
    ]
  },
  {
    id: 'nav',
    name: 'Navigation',
    summary: 'Sidenavs, toolbars, menus, lists',
    items: [
      {id: 'sidenav', name: 'Sidenav'},
      {id: 'toolbar', name: 'Toolbar'},
      {id: 'menu', name: 'Menu'},
      {id: 'list', name: 'List'},
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    summary: 'Grid lists, cards',
    items: [
      {id: 'grid-list', name: 'Grid list'},
      {id: 'card', name: 'Card'},
    ]
  },
  {
    id: 'buttons',
    name: 'Buttons, Actions & Icons',
    summary: 'buttons, button toggles, icons, progress spinners, progress bars',
    items: [
      {id: 'button', name: 'Button', examples: ['button-types']},
      {id: 'button-toggle', name: 'Button toggle'},
      {id: 'icon', name: 'Icon'},
      {id: 'progress-spinner', name: 'Progress spinner'},
      {id: 'progress-bar', name: 'Progress bar'},
    ]
  },
  {
    id: 'modals',
    name: 'Popups & Modals',
    summary: 'Dialogs, tooltips, snackbars',
    items: [
      {id: 'dialog', name: 'Dialog'},
      {id: 'tooltip', name: 'Tooltip'},
      {id: 'snackbar', name: 'Snackbar'},
    ]
  },
];

const ALL_ITEMS = DOCS.reduce((result, category) => result.concat(category.items), []);

@Injectable()
export class DocumentationItems {
  getItemsInCategories(): DocCategory[] {
    return DOCS;
  }

  getAllItems(): DocItem[] {
    return ALL_ITEMS;
  }

  getItemById(id: string): DocItem {
    return ALL_ITEMS.find(i => i.id === id);
  }

  getCategoryById(id: string): DocCategory {
    return DOCS.find(c => c.id == id);
  }
}
