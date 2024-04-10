import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {A11yModule, FocusMonitor} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CdkListboxModule} from '@angular/cdk/listbox';
import {ScrollingModule, ViewportRuler} from '@angular/cdk/scrolling';
import {CdkTableModule, DataSource} from '@angular/cdk/table';
import {DOCUMENT} from '@angular/common';
import {CdkPopoverEditCdkTableExample} from '@angular/components-examples/cdk-experimental/popover-edit';
import {Component, ElementRef, InjectionToken, inject} from '@angular/core';
import {
  GoogleMap,
  MapBicyclingLayer,
  MapCircle,
  MapGroundOverlay,
  MapHeatmapLayer,
  MapInfoWindow,
  MapKmlLayer,
  MapMarker,
  MapMarkerClusterer,
  MapPolygon,
  MapPolyline,
  MapRectangle,
  MapTrafficLayer,
  MapTransitLayer,
} from '@angular/google-maps';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheet, MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatRippleModule, provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialog} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {YouTubePlayer} from '@angular/youtube-player';
import {Observable, of as observableOf} from 'rxjs';

export class TableDataSource extends DataSource<any> {
  connect(): Observable<any> {
    return observableOf([
      {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
      {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
      {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
      {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
      {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
      {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
      {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
      {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
      {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
      {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
    ]);
  }

  disconnect() {}
}

export const AUTOMATED_KITCHEN_SINK = new InjectionToken<boolean>('AUTOMATED_KITCHEN_SINK');

@Component({
  template: `<button>Do the thing</button>`,
  standalone: true,
})
export class TestEntryComponent {}

@Component({
  selector: 'kitchen-sink',
  templateUrl: './kitchen-sink.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  styles: `
    .universal-viewport {
      height: 100px;
      border: 1px solid black;
    }

    .test-cdk-listbox {
      display: block;
      width: 100%;

      > label {
        display: block;
        padding: 5px;
      }

      > ul {
        list-style: none;
        padding: 0;
        margin: 0;

        > li {
          position: relative;
          padding: 5px 5px 5px 25px;

          &:focus {
            background: rgba(0, 0, 0, 0.2);
          }

          &[aria-selected='true']::before {
            content: "✔";
            position: absolute;
            left: 2px;
          }
        }
      }
    }

    .test-cdk-table {
      display: table;
      width: 100%;
    }

    .test-cdk-table .cdk-row,
    .test-cdk-table .cdk-header-row {
      display: table-row;
    }

    .test-cdk-table .cdk-cell,
    .test-cdk-table .cdk-header-cell {
      display: table-cell;
    }
  `,
  imports: [
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatStepperModule,
    ScrollingModule,
    ExperimentalScrollingModule,

    // CDK Modules
    CdkListboxModule,
    CdkTableModule,
    DragDropModule,
    A11yModule,

    // Other modules
    YouTubePlayer,
    GoogleMap,
    MapBicyclingLayer,
    MapCircle,
    MapGroundOverlay,
    MapHeatmapLayer,
    MapInfoWindow,
    MapKmlLayer,
    MapMarker,
    MapMarkerClusterer,
    MapPolygon,
    MapPolyline,
    MapRectangle,
    MapTrafficLayer,
    MapTransitLayer,

    // Examples
    CdkPopoverEditCdkTableExample,
  ],
})
export class KitchenSink {
  /** List of columns for the CDK and Material table. */
  tableColumns = ['position', 'name', 'weight', 'symbol'];

  /** Data source for the CDK and Material table. */
  tableDataSource = new TableDataSource();

  /** Data used to render a virtual scrolling list. */
  virtualScrollData = Array(10000).fill(50);

  /** Whether the kitchen sink is running as a part of an automated test or for local debugging. */
  isAutomated: boolean;

  constructor(
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    viewportRuler: ViewportRuler,
    focusMonitor: FocusMonitor,
    elementRef: ElementRef<HTMLElement>,
    private _bottomSheet: MatBottomSheet,
  ) {
    this.isAutomated = inject(AUTOMATED_KITCHEN_SINK, {optional: true}) ?? true;
    focusMonitor.focusVia(elementRef, 'program');

    // Do a sanity check on the viewport ruler.
    viewportRuler.getViewportRect();
    viewportRuler.getViewportSize();
    viewportRuler.getViewportScrollPosition();

    // Only open overlays when automation is enabled since they can prevent debugging.
    if (this.isAutomated) {
      inject(DOCUMENT).body.classList.add('test-automated');
      this.openSnackbar();
      this.openDialog();
      this.openBottomSheet();
    }
  }

  openSnackbar() {
    this._snackBar.open('Hello there');
  }

  openDialog() {
    this._dialog.open(TestEntryComponent);
  }

  openBottomSheet() {
    this._bottomSheet.open(TestEntryComponent);
  }
}
