import {A11yModule} from './index';
import {AriaDescriber, MESSAGES_CONTAINER_ID} from './aria-describer';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';

describe('AriaDescriber', () => {
  let ariaDescriber: AriaDescriber;
  let component: TestApp;
  let fixture: ComponentFixture<TestApp>;

  describe('with component provider', () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [A11yModule],
        declarations: [TestApp]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      component = fixture.componentInstance;
      ariaDescriber = component.ariaDescriber;
    });

    afterEach(() => {
      ariaDescriber._unregisterAllMessages();
    });

    it('should initialize without the message container', () => {
      expect(getMessagesContainer()).toBeNull();
    });

    it('should be able to create a message element', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, 'My Message');
      expectMessages(['My Message']);
    });

    it('should not register empty strings', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, '');
      expect(getMessageElements()).toBe(null);
    });

    it('should de-dupe a message registered multiple times', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, 'My Message');
      ariaDescriber.addDescription(component.container2.nativeElement, 'My Message');
      ariaDescriber.addDescription(component.container3.nativeElement, 'My Message');
      expectMessages(['My Message']);
      expectMessage(component.container1.nativeElement, 'My Message');
    });

    it('should be able to register multiple messages', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, 'First Message');
      ariaDescriber.addDescription(component.container2.nativeElement, 'Second Message');
      expectMessages(['First Message', 'Second Message']);
      expectMessage(component.container1.nativeElement, 'First Message');
      expectMessage(component.container2.nativeElement, 'Second Message');
    });

    it('should be able to unregister messages', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, 'My Message');
      expectMessages(['My Message']);

      // Register again to check dedupe
      ariaDescriber.addDescription(component.container2.nativeElement, 'My Message');
      expectMessages(['My Message']);

      // Unregister one message and make sure the message is still present in the container
      ariaDescriber.removeDescription(component.container1.nativeElement, 'My Message');
      expectMessages(['My Message']);

      // Unregister the second message, message container should be gone
      ariaDescriber.removeDescription(component.container2.nativeElement, 'My Message');
      expect(getMessagesContainer()).toBeNull();
    });

    it('should be able to unregister messages while having others registered', () => {
      ariaDescriber.addDescription(component.container1.nativeElement, 'Persistent Message');
      ariaDescriber.addDescription(component.container2.nativeElement, 'My Message');
      expectMessages(['Persistent Message', 'My Message']);

      // Register again to check dedupe
      ariaDescriber.addDescription(component.container3.nativeElement, 'My Message');
      expectMessages(['Persistent Message', 'My Message']);

      // Unregister one message and make sure the message is still present in the container
      ariaDescriber.removeDescription(component.container2.nativeElement, 'My Message');
      expectMessages(['Persistent Message', 'My Message']);

      // Unregister the second message, message container should be gone
      ariaDescriber.removeDescription(component.container3.nativeElement, 'My Message');
      expectMessages(['Persistent Message']);
    });

    it('should be able to append to an existing list of aria describedby', () => {
      ariaDescriber.addDescription(component.container4.nativeElement, 'My Message');
      expectMessages(['My Message']);
      expectMessage(component.container4.nativeElement, 'My Message');
    });
  });

  describe('without provider', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [A11yModule],
        declarations: [TestAppWithoutProvider]
      }).compileComponents();
    }));

    it('should fail to instantiate due to not importing describer as part of component', () => {
      expect(() => {
        TestBed.createComponent(TestAppWithoutProvider);
      }).toThrow();
    });
  });
});

function getMessagesContainer() {
  return document.querySelector(`#${MESSAGES_CONTAINER_ID}`);
}

function getMessageElements(): Node[] | null {
  const messagesContainer = getMessagesContainer();
  if (!messagesContainer) { return null; }

  return messagesContainer ?  Array.prototype.slice.call(messagesContainer.children) : null;
}

/** Checks that the messages array matches the existing created message elements. */
function expectMessages(messages: string[]) {
  const messageElements = getMessageElements();
  if (!messageElements) {
    fail(`Expected messages ${messages} but there were no message elements`);
    return;
  }

  expect(messages.length).toBe(messageElements.length);
  messages.forEach((message, i) => {
    expect(messageElements[i].textContent).toBe(message);
  });
}

/** Checks that an element points to a message element that contains the message. */
function expectMessage(el: HTMLElement, message: string) {
  const ariaDescribedBy = el.getAttribute('aria-describedby');
  if (!ariaDescribedBy) {
    fail(`No aria-describedby for ${el}`);
    return;
  }

  const messages: string[] = [];
  ariaDescribedBy.split(' ').forEach(referenceId => {
    const messageElement = document.querySelector(`#${referenceId}`);
    if (messageElement) {
      messages.push(messageElement.textContent || '');
    }
  });

  expect(messages).toContain(message);
}

@Component({
  template: `
    <div #container1></div>
    <div #container2></div>
    <div #container3></div>
    <div #container4 aria-describedby="existing-aria-describedby1 existing-aria-describedby2"></div>
  `,
  providers: [AriaDescriber],
})
class TestApp {
  @ViewChild('container1') container1: ElementRef;
  @ViewChild('container2') container2: ElementRef;
  @ViewChild('container3') container3: ElementRef;
  @ViewChild('container4') container4: ElementRef;

  constructor(public ariaDescriber: AriaDescriber) { }
}

@Component({
  template: `<div #element1></div>`,
})
class TestAppWithoutProvider {
  constructor(public ariaDescriber: AriaDescriber) { }
}
