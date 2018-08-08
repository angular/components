#### Using Material Views bound to `CdkDatepicker`

You can also use material views inside the `CdkDatepicker` to show dates.

```ts
<input [cdkDatepicker]="picker" placeholder="Choose a date">
<cdk-datepicker #picker>
  <mat-month-view
    [selected]="selected"
    [(activeDate)]="activeDate">
  </mat-month-view>
</cdk-datepicker>
```
