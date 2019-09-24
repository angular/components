# Using Angular Material's component harnesses in your tests

The CDK component harness framework provides a system for creating test objects that correspond to
instances of a particular component on the page. Interactions with that component can be driven by
interacting with the harness rather than direct interaction with the component or its DOM. Angular
Material has started the process of creating harnesses for all of its components, and many of them
are now available to use.

<!-- TODO(mmalerba): add list of components that are ready -->

This guide discusses why using these harnesses in your tests is beneficial, and shows how to use
them.

## Why use component harnesses

There are a number of benefits to using component harnesses when your tests need to interact with
Angular Material components. 

1. It results in tests that are easier to read and understand
2. It results in tests that are more robust and are less likely to break when updating Angular 
   Material
3. It helps you avoid testing implementation details of Angular Material components and focus on 
   testing your own components

We'll come back and look at these benefits in a little more detail after seeing what test code that
uses the harnesses looks like.

## What tests can use the harnesses

The component harnesses are designed to be able to work in multiple different test environments.
Currently the Angular CDK includes support for Angular's Testbed environment (in Karma unit tests),
as well as the Protractor environment (for E2E tests). It is possible to create bindings for other
environments by extending CDK's `HarnessEnvironment` and `TestElement` classes.

## Getting started

The first step to get started using the harnesses is to import the appropriate `HarnessEnvironment`
class for your tests and use it to get a `HarnessLoader` instance. The `HarnessLoader` is what we
will use to load the Angular Material component harnesses. For example, if we're writing unit tests,
the code might look like this:

```ts
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

let loader: HarnessLoader;

describe('my-component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MyModule], declarations: [MyComponent]})
        .compileComponents();
    fixture = TestBed.createComponent(MyComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });
}
```

This code creates a fixture for `MyComponent` and then creates a `HarnessLoader` for that fixture
that we can use to  locate Angular Material components inside `MyComponent` and load harnesses for
them. As you can see above, `HarnessLoader` and `TestbedHarnessEnvironment` are loaded from
different paths. 

- `@angular/cdk/testing` contains symbols that are shared regardless of the environment your tests
  are in. 
- `@angular/cdk/testing/testbed` contains symbols that are used only in Karma tests.
- `@angular/cdk/testing/protractor` (not shown above) contains symbols that are used only in
  protractor tests.

## Loading an Angular Material harness

The `HarnessLoader` provides two methods that can be used to load harnesses, `getHarness` and
`getAllHarnesses`. As the names would suggest, `getHarness` returns a harness for the first instance
of the corresponding component that is found, and `getAllHarnesses` returns a list of harnesses, one
for each instance of the corresponding component. For example, suppose `MyComponent` contains three
`MatButton` instances. We could load harnesses for them as follows:

```ts
import {MatButtonHarness} from '@angular/material/button/testing';

...

it('should work', async () => {
  const buttons = await loader.getAllHarnesses(MatButtonHarness); // length: 3
  const firstButton = await loader.getHarness(MatButtonHarness); // === buttons[0]
});
```

Notice in the above code, the use of `async`/`await`. All of the component harness APIs are
asynchronous and return `Promise` objects. Because of this, the use of the ES8 `async`/`await`
syntax is strongly encouraged for tests that use component harnesses.

While the above snippet does allow use to get a `MatButtonHarness` instance for each `MatButton`, it
might be more  fragile than we would like, since we're relying on index order. There are a couple
ways we can be more specific about the `MatButton` we're looking for. The first is to get a
`HarnessLoader` that looks at a smaller subsection of the component's DOM. For example, say that we
know `MyComponent` has a div, `<div class="footer">`, and we want the button inside that div. We can
accomplish this with the following code:

```ts
it('should work', async () => {
  const footerLoader = await loader.getChildLoader('.footer');
  const footerButton = await footerLoader.getHarness(MatButtonHarness);
});
```

Another possibility is to use the static `with` method that all Angular Material component harnesses
have. This method allows us to to easily create a `HarnessPredicate` which is an object used to
search for a harness with certain constraints on it. The particular constraint options vary
depending on the harness class, but all of them support at least:
 
- `selector` - Additional requirements on the host selector of the the corresponding component
- `ancestor` - Selector for an element that must appear in the host element's ancestor chain
 
In addition to these standard options, `MatButtonHarness` also supports
 
- `text` - Search for a button whose text matches the given string or RegExp
 
Using this method we could locate buttons as follows in our test:
 
```ts
it('should work', async () => {
  // Harness for mat-button whose id is 'more-info'.
  const info = await loader.getHarness(MatButtonHarness.with({selector: '#more-info'}));
  // Harness for mat-button whose text is 'Cancel'.
  const cancel = await loader.getHarness(MatButtonHarness.with({text: 'Cancel'}));
  // Harness for mat-button with class 'confirm' and whose text is either 'Ok' or 'Okay'.
  const okButton = await loader.getHarness(
      MatButtonHarness.with({selector: '.confirm', text: /^(Ok|Okay)$/})
});
```

## Using a harness to interact with an Angular Material component

The Angular Material component harnesses generally expose methods to perform actions that an end
user might perform or inspect component properties and state that an end user might perceive. For
example, `MatButtonHarness` has methods to click, focus, and blur the `mat-button`, as well as
methods to get the text of the button and whether it's disabled. In the case of `MatButtonHarness`
which is a harness for a very simple component, these methods might not seem very different from
working directly with the DOM. However more complex harnesses like `MatSelectHarness` have methods
like `open` and `isOpen` which encapsulate more knowledge about the component.

A test using the `MatButtonHarness` to interact with a `mat-button` might look like the following:

```ts
it('should mark confirmed when ok button clicked', async () => {
  const okButton = await loader.getHarness(MatButtonHarness.with({selector: '.confirm'});
  expect(fixture.componentInstance.confirmed).toBe(false);
  expect(await okButton.isDisabled()).toBe(false);
  await okButton.click();
  expect(fixture.componentInstance.confirmed).toBe(true);
});
```

In the code above, there are no calls to `fixture.detectChanges()`, something you see a lot in
normal tests. This is because the harnesses automatically call it after performing actions and
before reading state. The harness also automatically waits for the fixture to be stable, which will
cause the test to wait for `setTimeout`, `Promise`, etc.

## Comparison with and without component harnesses

Consider an `issue-report-selector` component that we want to test. Its purpose is to simply allow
the user to select an issue type and display the necessary form to input a report for that issue
type. We need a test to verify that when the user chooses an issue type the proper report is
displayed. First let's consider what the test might look like without using Angular Material
component harnesses:

```ts
describe('issue-report-selector', () => {
  let fixture: ComponentFixture<IssueReportSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueReportSelectorModule],
      declarations: [IssueReportSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueReportSelector);
    fixture.detectChanges();
  });

  it('should switch to bug report template', async () => {
    expect(fixture.debugElement.query('bug-report-form')).toBeNull();
    const selectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    selectTrigger.triggerEventHandler('click', {});
    fixture.detectChanges();
    await fixture.whenStable();
    const options = document.querySelectorAll('.mat-select-panel mat-option');
    options[1].click(); // Click the second option, "Bug".
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.debugElement.query('bug-report-form')).not.toBeNull();
  });
});
```

The same test, using the Angular Material component harnesses might look like the following:

```ts
describe('issue-report-selector', () => {
  let fixture: ComponentFixture<IssueReportSelector>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueReportSelectorModule],
      declarations: [IssueReportSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueReportSelector);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should switch to bug report template', async () => {
    expect(fixture.debugElement.query('bug-report-form')).toBeNull();
    const select = await loader.getHarness(MatSelect);
    await select.open();
    const bugOption = await select.getOption({text: 'Bug'});
    await bugOption.click();
    expect(fixture.debugElement.query('bug-report-form')).not.toBeNull();
  });
});
```

### Tests that are easier to read and understand

As the code above shows, adopting the harnesses in tests can make them a lot easier to understand.
Specifically in this example, it makes the "open the mat-select" logic more obvious. An unfamiliar
reader may not know what clicking on `.mat-select-trigger` does, but `await select.open()` is
self-explanatory.

It has also made it much more clear what option is being selected. Without the
harness, we had to leave a comment explaining what `options[1]` means, but with the
`MatSelectHarness` we can use the `text` filter rather than the index and our code becomes
self-documenting.

Finally, having a lot of calls to `fixture.detectChanges()` and `await fixtrue.whenStable()` can be
distracting to a reader trying to follow the test. By using the harnesses we are able to eliminate
these calls, making our test more concise.

### Tests that are more robust

Using Angular Material's test harnesses helps you create tests that are more robust, especially with
respect to changes in Angular Material itself. 

One way that the harnesses accomplish this is by eliminating the need to access internal elements of
the Angular Material component's template directly. For example, notice that the test that doesn't
use harnesses makes queries involving internal elements of the `mat-select` such as
`.mat-select-trigger` and `.mat-select-panel`. If the internal DOM of `mat-select` is changed at
some point these queries may stop working. While the team tries to avoid changes that have the
potential to break tests, these kinds of changes are sometimes necessary, for example if a bug in
the component's accessibility model is discovered. By using the Angular Material harnesses, you can
avoid depending on these internal elements directly. It effectively lets the Angular Material team
update the tests for you, via changing the implementation of the harness under the hood.

Changes in asynchronous behavior are another class of changes in Angular Material that have often
been known to break tests. For example, there have been times when the team has needed to add a
`setTimeout` or `Promise.resolve()` to a method that had previously been synchronous. In this case,
tests using the method would need to be updated to wait for the async operation (e.g. via 
`await fixture.whenStable()`). As seen in the examples above, using the component harnesses
eliminates the need for test authors to call `fixture.detectChanges()` and
`await fixture.whenStable()` when interacting with theAngular Material component, and therefore
insulates tests from these changes in asynchronous behavior.

### Tests that don't depend on implementation details

As mentioned above, two common sources of test failures when updating to a new version of Angular
Material are changes in DOM structure of the component's template, and changes in asynchronous
behavior. That is because these things are, in a sense, implementation details of the component,
though they are incidentally exposed to users. They may need to change as the team adds new features
and fixes issues that are reported Using the component harnesses helps to avoid depending on these
details in your tests.

The harnesses can also help your tests avoid implementation dependencies that arise from depending
on the specific order of different elements. For example switching from "clicking the second option"
to "clicking the option called 'Bug'", as we see in the example above. Its pretty safe to assume the
order is not going to change due to a change in Angular Material. However, that may not always be
the case especially with more complex components. Consider the datepicker component which has three
buttons ("toggle between day, month, and year selection", "go to previous page", and
"go to next page"). It is conceivable that a future update the Material Design spec could, for
example, move the previous and next buttons before the selection toggle. Using the component harness
ensures that your test doesn't depend on the exact order of these buttons remaining the same.
