The `testing` package provides infrastructure to help with testing Angular components.

### Component harnesses infrastructure

The primary piece of infrastructure in this package is a set of classes for building component
harnesses and using them in tests. Component harnesses give tests a way to interact with a
particular Angular component through an intentionally designed interface.

It can be especially helpful for authors of component libraries to create harnesses for their
components, as it gives users a way to avoid depending on implementation details of the library's
components, and makes it easier to roll out changes to the library.

If a component library provides component harnesses, users of the library should strongly consider
taking advantage of the harnesses in their tests. Using the harnesses can help make tests easier to
understand and more robust with respect to changes in the library.

The component harness system is designed to be able to support multiple testing environments.
Therefore it is possible to use the same harness object in both unit and end-to-end tests. This is
convenient for both users and authors of the harnesses. Users only need to learn one API, and
authors don't have to maintain separate unit and end-to-end test implementations.

The APIs provided in this package can be looked at through the lens of several different types of
users (each user type is described in more detail in its corresponding section):
1. [Test authors](#api-for-test-authors)
2. [Component harness authors](#api-for-component-harness-authors)
3. [Harness environment authors](#api-for-harness-environment-authors)
   
Since many users fall into only one of these categories, the relevant APIs are broken out by user
type in the sections below.

### API for test authors

Test authors are users that want to use existing component harnesses when testing their own
application. For example, this could be an app developer who uses Angular Material. Angular Material
offers component harnesses for this developer to use in their tests when interacting with Angular
Material components.

#### `TestbedHarnessEnvironment` and `ProtractorHarnessEnvironment`

These classes correspond to different implementations of the component harness system with bindings
for different test environments. Any given test should only import _one_ of these classes.
Karma-based unit tests should use the `TestbedHarnessEnvironment`, while Protractor-based end-to-end
tests should use the `ProtractorHarnessEnvironment`. Currently, any other environments will need
custom bindings (see [API for harness environment authors](#api-for-harness-environment-authors)).

These classes are primarily used to create a `HarnessLoader` instances, and in certain cases, to
create `ComponentHarness` instances directly.

`TestbedHarnessEnvironment` offers the following static methods:

| Method | Description |
| ------ | ----------- |
| `loader(fixture: ComponentFixture<unknown>): HarnessLoader` | Gets a `HarnessLoader` instance for the given fixture, rooted at the fixture's root element. Should be used to create harnesses for elements contained inside the fixture |
| `documentRootLoader(fixture: ComponentFixture<unknown>): HarnessLoader` | Gets a `HarnessLoader` instance for the given fixture, rooted at the HTML document's root element. Can be used to create harnesses for elements that fall outside of the fixture |
| `harnessForFixture<T extends ComponentHarness>(fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>): Promise<T>` | Used to create a `ComponentHarness` instance for the fixture's root element directly. This is necessary when bootstrapping the test with the component you plan to load a harness for, because Angular does not set the proper tag name when creating the fixture. |

In most cases, it is sufficient to just create a `HarnessLoader` in the `beforeEach` clause using
`TestbedHarnessEnvironment.loader(fixture)` and then use that `HarnessLoader` to create any
necessary `ComponentHarness` instances. The other methods can be used for special cases as shown in
this example:  

Consider a reusable dialog-button component that opens a dialog on button click, made up of the
following components, each with a corresponding harness:
- `MyDialogButton` (composes the `MyButton` and `MyDialog` with a convenient API)
- `MyButton` (a simple button component)
- `MyDialog` (a dialog appended to `document.body` by `MyButtonDialog` when the button is clicked)

The following code demonstrates loading harnesses for each of these components:

```ts
it('loads harnesses', async () => {
  const fixture = TestBed.createComponent(MyDialogButton);
  // We're loading a harness for the same component we bootstrapped to create our fixture,
  // so we need to use `harnessForFixture`
  const dialogButtonHarness =
      await TestbedHarnessEnvironment.harnessForFixture(fixture, MyDialogButtonHarness);
  // The button element is inside the fixture's root element so we use `loader()`.
  const buttonHarness =
      await TestbedHarnessEnvironment.loader().getHarness(MyButtonHarness);
  // Click the button to open the dialog
  await buttonHarness.click();
  // The dialog is appended to `document.body`, outside of the fixture's root element,
  // so we use `documentRootLoader()` in this case.
  const dialogHanress
      await TestbedHarnessEnvironment.documentRootLoader().getHarness(MyDialogHarness);

  // ... make some assertions
});
```

`ProtractorHarnessEnvironment` has an API that consists of a single static method:

| Method | Description |
| ------ | ----------- |
| `loader(): HarnessLoader` | Gets a `HarnessLoader` instance for the current HTML document, rooted at the document's root element. |

Since Protractor does not deal with fixtures, the API in this environment is simpler. The
`HarnessLoader` returned by the `loader()` method should be sufficient for loading all necessary
`ComponentHarness` instances.

#### `HarnessLoader`

Instances of this class correspond to a specific element (referred to as the "root element" of the
`HarnessLoader`) in the DOM and are used to create `ComponentHarness` instances for elements under
its root element.

`HarnessLoader` instances have the following methods:

| Method | Description |
| ------ | ----------- |
| `getChildLoader(selector: string): Promise<HarnessLoader>` | Searches for an element matching the given selector below the root element of this `HarnessLoader`, and returns a new `HarnessLoader` rooted at the first matching element |
| `getAllChildLoaders(selector: string): Promise<HarnessLoader[]>` | Acts like `getChildLoader`, but returns a list of new `HarnessLoader`, one for each matching element, rather than just the first matching element |
| `getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T>` | Searches for an instance of the given `ComponentHarness` class or `HarnessPredicate` below the root element of this `HarnessLoader` and returns an instance of the harness corresponding to the first matching element |
| `getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> \| HarnessPredicate<T>): Promise<T[]>` | Acts like `getHarness`, but returns a list of harness instances, one for each matching element, rather than just the first matching element  |

Calls to `getHarness` and `getAllHarnesses` can either take `ComponentHarness` subclass or a 
`HarnessPredicate`. `HarnessPredicate` applies additional restrictions to the search (e.g. searching
for a button that has some particular text, etc). The
[details of `HarnessPredicate`](#harnesspredicate) are discussed in the
[API for component harness authors](#api-for-component-harness-authors), as it is intended that
harness authors will provide convenience methods on their `ComponentHarness` subclass to facilitate
creation of `HarnessPredicate` instances. However, if the harness author's API is not sufficient,
they can be created manually.

#### `ComponentHarness`

This is the abstract base class for all component harnesses. All `ComponentHarness` subclasses have
a static property `hostSelector` that is used to match the harness class to instances of the
component in the DOM. Beyond that, the API of any particular harness is completely up to the harness
author, and it is therefore best to refer to the author's documentation.

#### Working with asynchronous component harness methods

In order to support both unit and end-to-end tests, and to insulate tests against changes in
asynchronous behavior, almost all harness methods are asynchronous and return a `Promise`;
therefore, it is strongly recommended to use the 
[ES2017 `async`/`await` syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
to improve the readability of tests.

It is important to remember that `await` statements block the execution of your test until the
associated `Promise` resolves. When reading multiple properties off a harness it may not be
necessary to block on the first before asking for the next, in these cases  use `Promise.all` to
parallelize.

For example, consider the following example of reading both the `checked` and `indeterminate` state
off of a checkbox harness:

```ts
it('reads properties in parallel', async () => {
  const checkboxHarness = loader.getHarness(MyCheckboxHarness);
  const [checked, indeterminate] = await Promise.all([
    checkboxHarness.isChecked(),
    checkboxHarness.isIndeterminate()
  ]);

  // ... make some assertions
});
```

### API for component harness authors

TODO(mmalerba): Fill in docs for harness authors

#### `HarnessPredicate`

TODO(mmalerba): Fill in docs for `HarnessPredicate`

### API for harness environment authors

TODO(mmalerba): Fill in docs for harness environment authors
