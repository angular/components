The Angular Material Timepicker allows users to set the time portion of a date object either by
typing it in or by selecting it from a list of pre-defined options.

<!-- example(timepicker-overview) -->

### Connecting a timepicker to an input

A timepicker is composed of a text input and a dropdown menu, connected through the `matTimepicker`
binding on the input.

There is also an optional timepicker toggle button that gives the user an easy way to open the dropdown.

<!-- example({"example":"timepicker-overview",
              "file":"timepicker-overview-example.html",
              "region":"minimum-setup"}) -->

The timepicker input and toggle can be used either on their own or as a part of a `mat-form-field`:

<!-- example({"example":"timepicker-overview",
              "file":"timepicker-overview-example.html"}) -->

### Timepicker forms integration

The timepicker input integrates with the `@angular/forms` module by providing itself as a
`ControlValueAccessor` and a `Validator` (see [Input validation](#input-validation) below for more
information). When the user types in a new time or selects one from the dropdown, the
time will be set on the date object which is the current value of the form control. If the form
control doesn't have a value, the timepicker will create one with today's date and the selected
time.

<!-- example(timepicker-forms) -->


### Integration with `MatDatepicker`

Material's datepicker and timepicker components can operate over the same value, allowing for a
combined datetime picker to be implemented. When binding the two components to the same value, the
datepicker will set the entire date object while the timepicker will only modify the time portion
of it.

<!-- example(timepicker-datepicker-integration) -->

### Input validation

The timepicker input checks that the value typed in by the user is a valid time string and
whether it fits into the specified bounds.

If the user types in an invalid time string (for example `abc` or `24:67`), the timepicker input
will report the `matTimepickerParse` error. The string is parsed using the `parseTime` method of
the [the current date implementation](#choosing-a-date-implementation-and-format-settings).

The timepicker input also checks that the value typed in by the user fits within the minimum and
maximum bounds set through the `matTimepickerMin` and `matTimepickerMax` inputs. They accept either
a date object with a specific time or a time string. The inputs also control which times will be
shown inside of the dropdown menu. For example, setting `matTimepickerMin="12:30"` and
`matTimepickerMax="21:25"` will allow the user to only select a time between 12:30 in the afternoon
and 9:25 in the evening. If the value is outside of those bounds, either a `maxTimepickerMin` or
`matTimepickerMax` error will be reported to the value accessor.

<!-- example(timepicker-validation) -->


### Customizing the dropdown options

By default the `mat-timepicker` dropdown shows options at 30 minute intervals. You can customize the
list of options either by setting an interval or providing a custom set of options.

The easiest way is to change the options is to pass the `interval` input to `mat-timepicker` with
an interval string which will be used when generating the options. For example,
`<mat-timepicker interval="90m"/>` will show the options at 90 minute intervals, starting from the
minimum time and ending at the maximum. Valid interval strings include:
* A number which will be interpreted as minutes, e.g. `interval="50"` represents 50 minutes.
* A number with short units, for example `30m` represents 30 minutes while `5h` is 5 hours.
Supported short units include `h` or `H` for hours, `m` or `M` for minutes and `s` or `S` for seconds.
* A number with long units, for example `75 min` represents 75 minutes while `1.5 hours` is an hour
and a half. Supported long units include `min` or `minute` or `minutes` for minutes, `hour` or `hours` for
hours and `second` or `seconds` for seconds.

Furthermore, the default interval can be controlled for the entire application using the
`MAT_TIMEPICKER_CONFIG` injection token. For example, adding the following to your `providers` will
default all timepickers to a 90 minute interval:

```ts
import {MAT_TIMEPICKER_CONFIG} from '../timepicker';

{
  provide: MAT_TIMEPICKER_CONFIG,
  useValue: {interval: '90 minutes'},
}
```

If your app requires more fine-grained control over the options, you can pass in an array of
options into `mat-timepicker` instead. Note that the options need to match the `MatTimepickerOption`
interface.

<!-- example(timepicker-options) -->


### Customizing the toggle icon

`mat-timepicker-toggle` renders a clock icon by default. You can customize it by projecting in an
element with the `matTimepickerToggleIcon` attribute into the toggle:

<!-- example(timepicker-custom-icon) -->

### Internationalization

Internationalization of the timepicker uses the same date adapter as `mat-datepicker`. It is
configured via three aspects:

1.  The date locale.
2.  The date implementation that the timepicker accepts.
3.  The display and parse formats used by the timepicker.

#### Setting the locale code

By default, the `MAT_DATE_LOCALE` injection token will use the existing `LOCALE_ID` locale code
from `@angular/core`. If you want to override it, you can provide a new value for the
`MAT_DATE_LOCALE` token:

```ts
bootstapApplication(MyApp, {
  providers: [{provide: MAT_DATE_LOCALE, useValue: 'en-GB'}],
});
```

It's also possible to set the locale at runtime using the `setLocale` method of the `DateAdapter`.

**Note:** if you're using the `provideDateFnsAdapter`, you have to provide the data object for your
locale to `MAT_DATE_LOCALE` instead of the locale code, in addition to providing a configuration
compatible with `date-fns` to `MAT_DATE_FORMATS`. Locale data for `date-fns` can be imported
from `date-fns/locale`.

<!-- example(timepicker-locale) -->

#### Choosing a date implementation and format settings

The timepicker is built to be implementation-agnostic and to be interoperable with
`mat-datepicker`. This means that it can be made to work with a variety of different date
implementations. However it also means that developers need to make sure to provide the
appropriate pieces for the timepicker to work with their chosen implementation.

The easiest way to ensure this is to import one of the provided date adapters:

`provideNativeDateAdapter` or `MatNativeDateModule`

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Date</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td>Locales using either AM/PM or 24-hour formatting</td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td>None</td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material/core</code></td>
    </tr>
  </tbody>
</table>

`provideDateFnsAdapter` or `MatDateFnsModule` (installed via `ng add @angular/material-date-fns-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Date</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://github.com/date-fns/date-fns/tree/master/src/locale/">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://date-fns.org/">date-fns</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-date-fns-adapter</code></td>
    </tr>
  </tbody>
</table>

`provideLuxonDateAdapter` or `MatLuxonDateModule` (installed via `ng add @angular/material-luxon-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>DateTime</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://moment.github.io/luxon/">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://moment.github.io/luxon/">Luxon</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-luxon-adapter</code></td>
    </tr>
  </tbody>
</table>

`provideMomentDateAdapter` or `MatMomentDateModule` (installed via `ng add @angular/material-moment-adapter`)

<table>
  <tbody>
    <tr>
      <th align="left" scope="row">Date type</th>
      <td><code>Moment</code></td>
    </tr>
    <tr>
      <th align="left" scope="row">Supported locales</th>
      <td><a href="https://github.com/moment/moment/tree/develop/src/locale">See project for details</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Dependencies</th>
      <td><a href="https://momentjs.com/">Moment.js</a></td>
    </tr>
    <tr>
      <th align="left" scope="row">Import from</th>
      <td><code>@angular/material-moment-adapter</code></td>
    </tr>
  </tbody>
</table>

**Note**: `provideNativeDateAdapter` implements time parsing using a regex which means that it
only supports AM/PM time (e.g. `1:45 PM`) or 24-hour time (e.g. `22:45` or `22.45`). As such
it won't work on locales with different formatting. We recommend using one of the provided date
adapters mentioned above or creating your own adapter by extending the `DateAdapter` class from
`@angular/material/core`. For example, if you want to use the `date-fns` adapter, you can update
your `bootstrapApplication` format to the following:

```ts
import {provideDateFnsAdapter} from '@angular/material-date-fns-adapter';

bootstrapApplication(MyApp, {
  providers: [provideDateFnsAdapter()]
});
```

#### Customizing the parse and display formats

The `MAT_DATE_FORMATS` object is a collection of formats that the timepicker uses when parsing
and displaying date objects. These formats are passed through to the `DateAdapter` so you will want
to make sure that the format objects you're providing are compatible with the `DateAdapter` used in
your app.

`MAT_DATE_FORMATS` is the same object used by `mat-datepicker` so it's likely already
configured if your app is using the datepicker, but for the timepicker you need to ensure that the
`display.timeInput`, `display.timeOptionLabel` and `parse.timeInput` properties are set as well.

If you want use one of the `DateAdapters` that ships with Angular Material, but use your own
`MAT_DATE_FORMATS`, you can either pass the formats into the providers function, or provide the
`MAT_DATE_FORMATS` token yourself. For example:

```ts
bootstrapApplication(MyApp, {
  providers: [provideNativeDateAdapter(MY_NATIVE_DATE_FORMATS)],
});
```

### Accessibility

The timepicker implements the [ARIA combobox interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
The timepicker input specifies `role="combobox"` while the content of the dropdown applies
`role="listbox"` and the options within the dropdown apply `role="option"`. By default the listbox
is labelled from the `mat-form-field` it is placed in, but if you aren't using a form field or if
you want to customize the label, you can do so through the `ariaLabel` or `ariaLabelledby` inputs
on `mat-timepicker`.

### Troubleshooting

#### Error: MatTimepicker: No provider found for DateAdapter/MAT_DATE_FORMATS

This error is thrown if you haven't provided all of the injectables the timepicker needs in order to
work correctly. The easiest way to resolve this is to add `provideNativeDateAdapter` or
`provideMomentDateAdapter` to your app config. See
[_Choosing a date implementation_](#choosing-a-date-implementation-and-format-settings) for
more information.

#### Error: MatTimepicker: Incomplete `MAT_DATE_FORMATS` has been provided

The timepicker needs the `display.timeInput`, `display.timeOptionLabel` and `parse.timeInput` fields
in `MAT_DATE_FORMATS` in order to work correctly. You should update your date formats object to
include include these fields. See [_Customizing the parse and display formats_](#customizing-the-parse-and-display-formats)
for more information.

#### Error: Cannot specify both the `options` and `interval` inputs at the same time

A `mat-timepicker` cannot specifify both the `options` and `interval` inputs at the same time.
The template should be updated to remove one of them.

#### Error: Value of `options` input cannot be an empty array

The array passed into the `options` input of `mat-timepicker` cannot be empty, because the user
won't have any options to choose from.

#### Error: A MatTimepicker can only be associated with a single input

This error is thrown if more than one `<input>` tries to claim ownership over the same
`<mat-timepicker>` (via the `matTimepicker` attribute on the input). A timepicker can only be
associated with a single input.
