import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    flush,
    flushMicrotasks,
} from '@angular/core/testing';
import {FormControl, FormsModule, NgModel, ReactiveFormsModule} from '@angular/forms';
import {Component, DebugElement, ViewChild, Type, ChangeDetectionStrategy} from '@angular/core';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent} from '@angular/cdk/testing/private';
import {
  CdkOption,
  CdkListbox,
  CdkListboxModule
} from './index';
import {MutationObserverFactory} from '@angular/cdk/observers';

describe('CdkOption', () => {
  let fixture: ComponentFixture<any>;

  function createComponent<T>(componentType: Type<T>, extraDeclarations: Type<any>[] = []) {
    TestBed.configureTestingModule({
      imports: [CdkListboxModule],
      declarations: [componentType, ...extraDeclarations],
    }).compileComponents();

    return TestBed.createComponent<T>(componentType);
  }

  describe('basic behaviors', () => {
    let listboxInstance: CdkListbox;
    let optionInstance: CdkOption;
    let testComponent:

    // beforeEach(() => {
    //   fixture = createComponent(Cd)
    // });

  });

});
