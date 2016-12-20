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
    name: 'Form controls',
    items: [
      {id: 'button', name: 'Button', examples: ['button-types']},
      {id: 'checkbox', name: 'Checkbox'},
      {id: 'radio', name: 'Radio button'},
      {id: 'button-toggle', name: 'Button toggle'},
      {id: 'input', name: 'Input'},
      {id: 'textarea', name: 'Textarea'},
      {id: 'select', name: 'Select'},
      {id: 'slide-toggle', name: 'Slide toggle'},
      {id: 'slider', name: 'Slider'},
    ]
  },
  {
    id: 'structure',
    name: 'Application structure',
    items: [
      {id: 'card', name: 'Card'},
      {id: 'list', name: 'List'},
      {id: 'grid-list', name: 'Grid list'},
      {id: 'sidenav', name: 'Sidenav'},
      {id: 'toolbar', name: 'Toolbar'},
    ]
  },
  {
    id: 'popups',
    name: 'Pop-ups and notifications',
    items: [

      {id: 'menu', name: 'Menu'},
      {id: 'dialog', name: 'Dialog'},
      {id: 'snackbar', name: 'Snackbar'},
      {id: 'tooltip', name: 'Tooltip'},
    ]
  },
  {
    id: 'progress',
    name: 'Progress indicators',
    items: [
      {id: 'progress-spinner', name: 'Progress spinner'},
      {id: 'progress-bar', name: 'Progress bar'},
    ]
  },
  {
    id: 'icons',
    name: 'Icons',
    items: [
      {id: 'icon', name: 'Icon'},
    ]
  }
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
}
