The `datetime` package offers building blocks for custom date and time-based components.

### `DateAdapter`
The CDK `DateAdapter` facilitates use of any date data structure for date and time-based components
and gives a foundation for more concrete `DateAdapter` implementations.

#### Using a `DateAdapter`
A `DateAdapter` provides a uniform way to deal with different date representations. Directives that
deal with dates use a `DateAdapter` to avoid coupling with any particular date representation 
model. Whenever the directive would access some information from a date model, it instead uses the
corresponding adapter API. For example, if you want to display the year from a datepicker's current
value, you would get that year from the adapter's `getYear` method.

#### Pre-made adapters

##### Native JavaScript Dates
The CDK includes one default `DateAdapter` implementation: `NativeDateAdapter`. This adapter uses
the native JavaScript `Date` object and native APIs in the `Intl` namespace. The native `Date` is
used as the default implementation because it has no additional dependencies; choosing a full
date/time localization library is best left to application-developers, so the CDK does not include
or force any specific solution.

**Please note**: JavaScript's native date-parsing abilities are extremely limited. Parsing of date
strings with the `Date` constructor and `Date.parse` is strongly discouraged due to browser
differences and inconsistencies. Support for RFC 2822 format strings is by convention only. Support
for ISO 8601 formats differs in that date-only strings (e.g. "1970-01-01") are treated as UTC, not
local. It is strongly recommended that developers use a full date/time localization library to
support a variety of locales and for browser consistency.

##### MomentJS
An adapter for [Moment.js](https://momentjs.com), `MomentDateAdapter`, is available from the npm
package `@angular/material-moment-adapter`.

#### Building a custom adapter
The user can create a custom adapter by extending from `DateAdapter` and implementing all of its
abstract methods and properties:

```ts
@Injectable()
export class MyDateAdapter extends DateAdapter<MyCustomDateRepresentation> {...}
```

### `CdkDatepicker` component
`CdkDatepicker` lets you create a custom datepicker by connecting a custom calendar implementation
and an associated text input. A custom calendar extends `CalendarView`, while the text input is
marked with the `CdkDatepickerInput` directive.

```html
<input [cdkDatepicker]="picker">
<cdk-datepicker #picker><my-calendar (selectedChange)="..."></my-calendar></cdk-datepicker>
```

#### Building a custom calendar that works with the `CdkDatepicker`
 * Create a custom calendar component that extends `CalendarView`, implementing all abstract members:
    * The minimum, maximum, selected, and active dates are initially set by the datepicker and
    will update the calendar accordingly.
    * The selected date can be set by the calendar. The selected date will emit on a stream when
    the date has changed, and the datepicker will subscribe to this stream and update accordingly.
    
 ```ts
 export class MyCalendar<D> extends CalendarView<D> {
   activeDate = ...
   minDate = ...
   maxDate = ...
   selected = ...
   
   constructor(dateAdapter: DateAdapter<D>) {
     super();
 }
 ```   
 
 * Emit on `selectedChange` from the `CalendarView` when the date has changed.
 
 ```ts
 selectedChange.emit(newDate);
 ```
 
 * Provide the newly created component as the `CalendarView` injection token in the component
 decorator.

 ```ts
 @Component({
   providers: [{provide: CalendarView, useExisting: MyCalendar}],
   ...
 })
 ```

 <!-- example(cdk-datepicker-overview) -->
