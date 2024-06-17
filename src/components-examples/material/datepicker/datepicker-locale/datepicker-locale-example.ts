import {ChangeDetectionStrategy, Component, OnInit, computed, inject, signal} from '@angular/core';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {MatButtonModule} from '@angular/material/button';
import {DateAdapter, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import 'moment/locale/fr';
import 'moment/locale/ja';

/** @title Datepicker with different locale */
@Component({
  selector: 'datepicker-locale-example',
  templateUrl: 'datepicker-locale-example.html',
  styleUrl: 'datepicker-locale-example.css',
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'ja-JP'},

    // Moment can be provided globally to your app by adding `provideMomentDateAdapter`
    // to your app config. We provide it at the component level here, due to limitations
    // of our example generation script.
    provideMomentDateAdapter(),
  ],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerLocaleExample implements OnInit {
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    if (this._locale() === 'ja-JP') {
      return 'YYYY/MM/DD';
    } else if (this._locale() === 'fr') {
      return 'DD/MM/YYYY';
    }
    return '';
  });

  ngOnInit() {
    this.updateCloseButtonLabel('カレンダーを閉じる');
  }

  french() {
    this._locale.set('fr');
    this._adapter.setLocale(this._locale());
    this.updateCloseButtonLabel('Fermer le calendrier');
  }

  updateCloseButtonLabel(label: string) {
    this._intl.closeCalendarLabel = label;
    this._intl.changes.next();
  }
}
