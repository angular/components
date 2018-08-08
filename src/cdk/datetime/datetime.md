The `datetime` package offers building blocks for custom date and time-based components.

### `DateAdapter`
The CDK `DateAdapter` facilitates use of any date data structure for date and time-based components and gives a
foundation for more concrete `DateAdapter` implementations.

#### Using a `DateAdapter`
A `DateAdapter` provides a uniform way to deal with different date representations. Directives that deal with dates use
a `DateAdapter` to avoid coupling with any particular date representation model. Whenever the directive would access
some information from a date model, it instead uses the corresponding adapter API. For example, if you want to display
the year from a datepicker's current value, you would get that year from the adapter's `getYear` method.

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
The user can create a custom adapter by extending from `DateAdapter` and implementing all of its abstract methods and
properties:

```ts
@Injectable()
export class MyDateAdapter extends DateAdapter<MyCustomDateRepresentation> {...}
```

### `CdkDatepicker` Component
The `CdkDatepicker` lets you create a datepicker with a custom calendar. The `CdkDatepicker` abstracts out 
communication between a custom calendar implementation and an input where the users can type dates.

#### Supported features for `CdkDatepicker`
A `CdkDatepicker` deals with providing a uniform datepicker amongst different datepicker implementations. Whenever a
directive needs to read datepicker information, the `CdkDatepicker` will provide the properties needed. Users will be
able to flexibly utilize the `CdkDatepicker` to custom create their own datepicker or calendar.

A `CdkDatepickerInput` is a directive that's used to decorate a native input so that it can work with a `CdkDatepicker`.
The `CdkDatepickerInput` provides optional input to the datepicker to provide for different datepicker implementations:
 * Minimum & maximum dates - The minimum and maximum dates can be set by the `CdkDatepickerInput` and will update the
 calendar accordingly to clamp the dates of the datepicker.
 * Date filter - Given a function set by the `CdkDatepickerInput`, the date filter will evaluate that function and
 update the calendar accordingly to filter out dates of the datepicker.
 * Disabled - This input provides the option to disable the `CdkDatepickerInput` directive from feeding inputs into the
 datepicker.

Each `CdkDatepicker` must be associated with a `CdkDatepickerInput` to work properly.

A reference material datepicker implementation is available from the npm package `@angular/material/datepicker`.

#### Building a custom calendar that works with the `CdkDatepicker`
 * Create a component that extends `CalendarView` and implement all abstract properties:
    * The minimum, maximum, selected, and active dates are initially set by the datepicker and will update the calendar
    accordingly.
    * The selected date can be set by the calendar. The selected date will emit on a stream when the date has changed,
    and the datepicker will subscribe to this stream and update accordingly.
 * Emit on `selectedChange` from the `CalendarView` when the date has changed.
 * Provide the newly created component as the `CalendarView` injection token in the component decorator.

```ts
@Component({
  providers: [{provide: CalendarView, useExisting: MyCalendar}],
  ...
})
```

 <!-- example(cdk-datepicker-overview) -->

#### Custom calendar on top of `CdkDatepicker` example
The user can create their own calendar extended from `CalendarView` with all of its abstract properties satisfied:

```ts
@Component({
  providers: [{provide: CalendarView, useExisting: MyCalendar}],
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

Finally, the user can use their custom `MyCalendar` component:

```html
<input [cdkDatepicker]="picker">
<cdk-datepicker #picker><my-calendar (selectedChange)="..."></my-calendar></cdk-datepicker>
```
