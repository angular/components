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
@Injectable()
export class MyDateAdapter extends DateAdapter<Date> {...}
```

### `CdkDatepicker` Component
The `CdkDatepicker` component facilitates use of any datepicker structure for date and time-based components and
provides a foundation which more concrete datepicker implementations can be built upon.

#### Usages of `CdkDatepicker`
A `CdkDatepicker` deals with providing a uniform datepicker amongst different datepicker implementations. Whenever a
directive needs to read datepicker information, the `CdkDatepicker` will provide the properties needed. Users will be
able to flexibly utilize the `CdkDatepicker` to custom create their own datepicker or calendar.

A `CdkDatepickerInput` deals with providing optional input to the datepicker to provide for different datepicker
implementations. This includes:
 * Minimum date
 * Maximum date
 * Date filter
 * Disabled datepicker-input

A `CdkDatepickerInput` is required with the `CdkDatepicker` to register these uniform datepicker properties with their
associate implementation.

#### Pre-made datepicker

##### `MatDatepicker`
A material datepicker is available from the npm package `@angular/lib/datepicker`.

#### Building custom components on top of `CdkDatepicker`

##### Datepicker and datepicker input for `CdkDatepicker`
When implementing a custom datepicker on top of `CdkDatepicker, extend `CdkDatepicker` to use its uniform properties.
When implementing a custom datepicker input on top of `CdkDatepickerInput`, extend `CdkDatepickerInput` to use its
uniform properties.

##### Calendar on top of `CdkDatepicker`
 * Create a component that extends `CalendarView` and implement all abstract properties (`minDate`, `maxDate`,
 `selected`, and `activeDate`).
 * Invoke `selectedChange` from the `CalendarView` when the date has changed.
 * Nest the newly created component within the `CdkDatepicker` selector as its `ContentChild`.

#### Custom calendar on top of `CdkDatepicker` example

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

Finally, the user can use their newly-created `MyCalendar` component:

```html
<input [cdkDatepicker]="picker">
<cdk-datepicker #picker><my-calendar (selectedChange)="..."></my-calendar></cdk-datepicker>
```
