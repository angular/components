The `datetime` package offers building blocks for custom date and time-based components.

### `DateAdapter`
The CDK `DateAdapter` facilitates use of any date data structure for date and time-based components and gives a
foundation for more concrete `DateAdapter` implementations.

#### Usages of `DateAdapter`
A `DateAdapter` provides a uniform way to deal with different date representations. Whenever a directive needs to read
any date information, it gets that information from the `DateAdapter`. The adapter then reads the information using the
appropriate API from the underlying date implementation.

#### Pre-made adapters

##### Native JavaScript Dates
The CDK includes one default `DateAdapter` implementation: `NativeDateAdapter`. This adapter uses the native JavaScript
`Date` object and native APIs in the `Intl` namespace. The native `Date` is used as the default implementation because
it has no additional dependencies; choosing a full date/time localization library is best left to
application-developers, so the CDK does not include or force any specific solution.

**Please note**: JavaScript's native date-parsing abilities are extremely limited. Parsing of date strings with the
`Date` constructor and `Date.parse` is strongly discouraged due to browser differences and inconsistencies. Support for
RFC 2822 format strings is by convention only. Support for ISO 8601 formats differs in that date-only strings
(e.g. "1970-01-01") are treated as UTC, not local. It is strongly recommended that developers use a full date/time
localization library to support a variety of locales and for browser consistency.

##### MomentJS
An adapter for [Moment.js](https://momentjs.com), `MomentDateAdapter`, is available from the npm package
`@angular/material-moment-adapter`.

#### Building a custom adapter
The user can create a custom adapter by extending from `DateAdapter` and implementing all of its abstract properties:

```ts
@Component({
  ...
})
export class MyDateAdapter<D> extends DateAdapter<D> {...}
```

### `CdkDatepicker` Component
The `CdkDatepicker` component provides a foundation upon which more concrete datepicker implementations can be built.
The `CdkDatepicker` will be a generic datepicker with all of the necessary basic datepicker functionality needed for the
definition of a datepicker. Users will be able to utilize the `CdkDatepicker` to custom create their own calendar. In
this way, the users will be able to customize the datepicker to allow for more flexibility when using the datepicker
component in applications.

#### Building a custom calendar on top of `CdkDatepicker`
 * Create a component that extends `CalendarView` and implement all abstract properties (min, max, selected, and active
 date).
 * Invoke `selectedChange` from the `CalendarView` when the date has changed.
 * Nest the newly created component within the `CdkDatepicker` selector in the HTML.

#### Connecting custom calendar to `CdkDatepicker` example

The user can create their own calendar extended from `CalendarView` with all of its abstract properties satisfied:

```ts
@Component({
  ...
})
export class MyCalendar<D> extends CalendarView<D> {
  activeDate = ...
  minDate = ...
  maxDate = ...
  selected = ...
  
  constructor(dateAdapter: DateAdapter<D>) {
    super();
}
```

Whenever the selected date has changed, the user can also use the `selectedChange` in `CalendarView` to emit when the
date has changed:

```ts
selectedChange.emit(newDate);
```

Finally, the user can use their newly-created `MyCalendar` component within the `CdkDatepicker`:

```html
<input [cdkDatepicker="picker">
<cdk-datepicker #picker><my-calendar (selectedChange)="..."></my-calendar></cdk-datepicker>
```

This is just one example of how `CdkDatepicker` can be used.
