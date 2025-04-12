import {Injectable} from '@angular/core';
import {SystemVariables} from '../../pages/system-variables';
import {ComponentType} from '@angular/cdk/portal';

export interface GuideItem {
  id: string;
  name: string;
  overview: string;
  document: string | ComponentType<any>;
}

const GUIDES: GuideItem[] = [
  {
    id: 'getting-started',
    name: 'Getting started',
    document: '/docs-content/guides/getting-started.md.html',
    overview: 'Add Angular Material to your project!',
  },
  {
    id: 'schematics',
    name: 'Schematics',
    document: '/docs-content/guides/schematics.md.html',
    overview: 'Use schematics to quickly generate views with Material Design components.',
  },
  {
    id: 'theming',
    name: 'Theming Angular Material',
    document: '/docs-content/guides/theming.md.html',
    overview: "Customize your application with Angular Material's theming system.",
  },
  {
    id: 'system-variables',
    name: 'System Variables',
    document: SystemVariables,
    overview: 'Understand the system variables available to use in your application.',
  },
  {
    id: 'creating-a-custom-form-field-control',
    name: 'Custom form field control',
    document: '/docs-content/guides/creating-a-custom-form-field-control.md.html',
    overview: 'Build a custom control that integrates with `<mat-form-field>`.',
  },
  {
    id: 'creating-a-custom-stepper-using-the-cdk-stepper',
    name: 'Custom stepper using the CdkStepper',
    document: '/docs-content/guides/creating-a-custom-stepper-using-the-cdk-stepper.md.html',
    overview: 'Create a custom stepper components using Angular CDK.',
  },
  {
    id: 'using-component-harnesses',
    name: 'Testing with component harnesses',
    document: '/docs-content/guides/using-component-harnesses.md.html',
    overview: 'Write tests with component harnesses for convenience and meaningful results.',
  },
  {
    id: 'material-2-theming',
    name: 'Theming Angular Material with Material 2',
    document: '/docs-content/guides/material-2.md.html',
    overview: "Customize your application with Angular Material's theming system.",
  },
];

@Injectable({providedIn: 'root'})
export class GuideItems {
  getAllItems(): GuideItem[] {
    return GUIDES;
  }

  getItemById(id: string): GuideItem | undefined {
    return GUIDES.find(i => i.id === id);
  }
}
