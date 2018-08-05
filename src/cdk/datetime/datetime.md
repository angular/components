#### Start at datepicker example

The datepicker also provides an input for the date the datepicker should start at.

```ts
<input [cdkDatepicker]="picker" placeholder="Choose a date">
<cdk-datepicker #picker [startAt]="startDate"></cdk-datepicker>
```

#### Views bound to `CdkDatepicker`

The datepicker also allows multiple `CalendarView`s to be bound to it. This example serves as an example for how views
could be bound to the datepicker. To create a more functional datepicker, the user may create a custom calendar
component with the custom views they wish to include.

```ts
<input [cdkDatepicker]="picker" placeholder="Choose a date">
<cdk-datepicker #picker>
  <mat-month-view
    [selected]="selected"
    [(activeDate)]="activeDate">
  </mat-month-view>
</cdk-datepicker>
```
