The datepicker CDK provides a foundation upon which more concrete Material datepicker 
implementations can be built. The datepicker CDK will be a generic datepicker with all of the
necessary basic datepicker functionality needed for the definition of a datepicker. Users will be
able to extend this datepicker CDK with all of the basic datepicker functionality as well as create
their own views of the calendar. In this way, the users will be able to customized the datepicker
to allow for more flexibility when utilizing the datepicker component in applications.

### Behavior captured by CdkDatepicker
The Datepicker CDK has a CalendarView component with five properties:
 * The date at which the datepicker will start at. The default value for this date is the current
 date.
 * The minimum date that the datepicker can access. The default value for this is NULL. The user can
 clamp the date values by adding an input to the calendar.
 * The maximum date that the datepicker can access. The default value for this is NULL. The user can
 clamp the date values by adding an input to the calendar.
 * The selected date of the datepicker. The default value for this is NULL. When the user provides
 input to the calendar, the selected date will change accordingly.
 * The selected change event that fires when the selected date of the datepicker has changed.

The material calendar that the user implements will then extend this CalendarView component and
implement all of its abstract fields. The different views that the user implements for the calendar
(ex. month, year, etc.) will also extend this CalendarView component and implement all of its
abstract fields.

The CalendarView component is a Child of the datepicker component. Whenever the date is changed,
the datepicker will notify the CalendarView component through the datepicker input component and
update all of the information within the datepicker accordingly.

The datepicker has several inputs: the date at which the datepicker will start at and whether or
not the datepicker is disabled. The user-defined material datepicker component will extend the 
CDK with the properties needed.

The datepicker input component provides all inputs and events needed for the datepicker. The
user-defined material datepicker input component will also extend the CDK with the properties
needed. It's up to the user to decide whether or not they would like to implement a
user-specified material datepicker input component or datepicker component, but it is not
neccessary for datepicker implementation. The user will only have to implement their own
calendar component as the bare minimum.
