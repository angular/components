# MdDatePicker
Basic Date Picker Component.
> The `<md-date-picker>` component fully support two-way binding of `ngModel`.
#### Format
```js
export class DatePickerDemo {
  date: any = new Date(Date.now()+60*60*24*15*1000);
}
```

## Basic
```html
<md-date-picker [(ngModel)]="date">
  <md-input [value]="date | date: 'dd-MMM-y'"></md-input>
</md-date-picker>
```


## Two selection basic
```html
<md-date-picker #_date2 [(ngModel)]="date01" [(date2)]="date02">
  <md-input [value]="date01 | date: 'dd-MMM-y'"></md-input>
  <md-input [value]="date02 | date: 'dd-MMM-y'"></md-input>
</md-date-picker>
{{ _date2.Days }}
```


## Two selection complete

```html
<md-date-picker #_date3 [(ngModel)]="ini" [(date2)]="end" mode="dual">
  <md-input [value]="ini | date: 'dd-MMM-y'"></md-input>
  <md-input [value]="end | date: 'dd-MMM-y'"></md-input>
</md-date-picker>
{{ _date3.Days }}
```
